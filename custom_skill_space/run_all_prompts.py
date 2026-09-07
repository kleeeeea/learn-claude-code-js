#!/usr/bin/env python3
"""run_all_prompts.py - 跑遍 技能图谱应用.md 附录里的全部 prompt。

prompt 来源是那份 markdown 末尾的机器可读 YAML 清单（```yaml 块），
所以文档改了、这里自动跟着变，不用两头维护。

跑法：每条 prompt 起一次 pi（--mode json），把事件流实时解析出来，
thinking / 正文 / 工具调用都是**逐 token 打印**的，看得到模型在想什么。
默认串行（一条跑完再跑下一条）；--jobs N 可以并行，但并行时输出会攒到
每条结束再整段打出来——token 级实时和多路交错没法兼得。

用法：
    python run_all_prompts.py                 # 串行跑全部，实时流式输出
    python run_all_prompts.py --list          # 只列清单，不跑
    python run_all_prompts.py --only A3       # 只跑 A3 这个一级分类
    python run_all_prompts.py --only A2-P1 A5-P3
    python run_all_prompts.py --status draft  # 只跑还没验证过的
    python run_all_prompts.py --no-thinking   # 不打印 thinking，只看正文
    python run_all_prompts.py --jobs 3        # 并行 3 条（输出改为整段）
    python run_all_prompts.py --no-save       # 不落盘，只看屏幕
    python run_all_prompts.py --no-cache      # 忽略历史结果，全部重跑

缓存：key = .env 里的 MODEL_ID + prompt 原文。历史 result/ 里跑过且 PASS 的直接复用
（整目录搬进本次运行目录并标 cached_from），改了 prompt 文本或换了模型才会重跑。

结果默认写到 custom_skill_space/result/<时间戳>/，每条 prompt 一个子目录：
    metadata.json  元数据（分类/状态/模型/usage/stopReason/耗时/工具调用/编号核对/session id）
    prompt.md      原始 prompt
    response.md    模型最终回答
    session.jsonl  pi 的完整 session history（含 thinking 与工具往返）
    session.md     同上，渲染成能读的对话记录
    events.jsonl   本次运行的原始事件流

判定：从回答正文里抽出课标编号（5.NF.1 / 8.G.7 / S-MD.5 这种形态），
逐个回 standards.csv 核对，至少一条对得上才算 PASS——跟
create_and_run_skill.sh 的自检口径一致。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import threading
import time

SCRIPT_DIR = pathlib.Path(__file__).resolve().parent
REPO_DIR = SCRIPT_DIR.parent
DEFAULT_MD = SCRIPT_DIR / "技能图谱应用.md"
SKILL_DIR = SCRIPT_DIR / "math-standards"
STANDARDS_CSV = SKILL_DIR / "references" / "standards.csv"
PI_RUNNER = REPO_DIR / "piagent_space" / "install_run_piagent.sh"
# pi 的会话落盘目录（piagent_space 的 settings.json sessionDir 指到这里）
SESSION_DIR = pathlib.Path(os.environ.get("PIAGENT_SESSION_DIR", REPO_DIR / "piagent_space" / "sessions"))
DEFAULT_RESULT_DIR = SCRIPT_DIR / "result"

# K.CC.4 / 5.NF.1 / 8.G.7 这种，以及高中的 A-SSE.1 / S-MD.5 / N-RN.2
CODE_RE = re.compile(r"\b(?:K|[1-8])\.[A-Z]{1,4}\.\d+[a-z]?\b|\b[AFGNS]-[A-Z]{1,4}\.\d+[a-z]?\b")


class Color:
	def __init__(self, enabled: bool) -> None:
		self.on = enabled

	def _wrap(self, code: str, text: str) -> str:
		return f"\033[{code}m{text}\033[0m" if self.on else text

	def dim(self, t: str) -> str:
		return self._wrap("38;5;245", t)

	def cyan(self, t: str) -> str:
		return self._wrap("36", t)

	def green(self, t: str) -> str:
		return self._wrap("32", t)

	def red(self, t: str) -> str:
		return self._wrap("31", t)

	def yellow(self, t: str) -> str:
		return self._wrap("33", t)

	def blue(self, t: str) -> str:
		return self._wrap("34", t)


# ── 缓存 ───────────────────────────────────────────
# key 只认「跑的是哪个模型 + prompt 原文」：文档里改了 prompt 就自动失效重跑，
# 没改就直接复用历史结果，不再打模型。
def model_hint() -> str:
	"""从 .env 读 MODEL_ID，作为 cache key 的一部分（换模型结果就该重跑）。"""
	env_file = REPO_DIR / ".env"
	if env_file.exists():
		for line in env_file.read_text(encoding="utf-8").splitlines():
			line = line.strip()
			if line.startswith("MODEL_ID="):
				return line.split("=", 1)[1].strip().strip('"')
	return "unknown-model"


def cache_key(prompt: str, model: str) -> str:
	return hashlib.sha256(f"{model}\n{prompt}".encode("utf-8")).hexdigest()[:16]


def build_cache(result_root: pathlib.Path, model: str) -> dict[str, pathlib.Path]:
	"""扫历史 result/*/<id>/metadata.json，建 key -> 结果目录。只收 PASS 的。"""
	cache: dict[str, pathlib.Path] = {}
	if not result_root.is_dir():
		return cache
	for meta_path in sorted(result_root.glob("*/*/metadata.json")):
		try:
			meta = json.loads(meta_path.read_text(encoding="utf-8"))
		except (json.JSONDecodeError, OSError):
			continue
		if not meta.get("passed"):
			continue
		# 老结果没存 prompt_sha，就用里面的 prompt 原文现算
		key = meta.get("prompt_sha") or cache_key(meta.get("prompt", ""), meta.get("model") or model)
		cache[key] = meta_path.parent   # 同 key 后来的覆盖先前的，取最新
	return cache


def reuse_cached(src: pathlib.Path, item: dict, run_dir: pathlib.Path, c: Color) -> dict:
	"""把历史结果整目录搬进本次运行目录，标上 cached_from。"""
	dst = run_dir / item["id"]
	if dst.exists():
		shutil.rmtree(dst)
	shutil.copytree(src, dst)
	meta = json.loads((dst / "metadata.json").read_text(encoding="utf-8"))
	meta["cached"] = True
	meta["cached_from"] = str(src)
	(dst / "metadata.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
	print(c.dim(f"  ↻ 命中缓存：{src.parent.name}/{src.name}（{meta.get('elapsed_s')}s 那次），跳过不跑"))
	return meta


# ── 解析 markdown 里的 prompt 清单 ─────────────────
def load_prompts(md_path: pathlib.Path) -> list[dict]:
	"""取 markdown 最后一个 ```yaml 块里的 categories -> prompts。"""
	text = md_path.read_text(encoding="utf-8")
	blocks = re.findall(r"```yaml\n(.*?)```", text, re.S)
	if not blocks:
		raise SystemExit(f"{md_path} 里没有 ```yaml 清单块")
	try:
		import yaml
	except ImportError:
		raise SystemExit("需要 pyyaml：pip install pyyaml")
	data = yaml.safe_load(blocks[-1])
	items = []
	for cat in data.get("categories", []):
		for p in cat.get("prompts", []):
			items.append({
				"id": p["id"],
				"category": cat["id"],
				"category_name": cat.get("name", ""),
				"status": p.get("status", "draft"),
				"prompt": p["prompt"],
			})
	return items


def known_codes() -> set[str]:
	if not STANDARDS_CSV.exists():
		raise SystemExit(f"找不到 {STANDARDS_CSV}，先跑一次 create_and_run_skill.sh --build-only")
	codes = set()
	with STANDARDS_CSV.open(encoding="utf-8") as fh:
		next(fh, None)
		for line in fh:
			codes.add(line.split(",", 1)[0].strip())
	return codes


# ── 跑一条 prompt ──────────────────────────────────
def build_command(prompt: str) -> list[str]:
	return [
		"bash", str(PI_RUNNER),
		"--skill", str(SKILL_DIR),
		"--mode", "json",
		"-p", prompt,
	]


def run_prompt(item: dict, c: Color, *, stream: bool, show_thinking: bool,
               timeout: int, out=sys.stdout) -> dict:
	"""起一次 pi，边读边渲染事件流。stream=False 时先攒着，结束再整段打。"""
	buf: list[str] = []

	def emit(s: str, end: str = "") -> None:
		if stream:
			out.write(s + end)
			out.flush()
		else:
			buf.append(s + end)

	env = dict(os.environ)
	env.setdefault("PIAGENT_SKIP_INSTALL", "1")   # 每条都查一遍安装太慢
	env.setdefault("PIAGENT_MAX_TOKENS", "32000")  # 8000 会让 thinking 把额度吃光

	started = time.time()
	answer_parts: list[str] = []
	thinking_chars = 0
	tool_calls: list[str] = []
	usage: dict = {}
	stop_reason = ""
	raw_lines: list[str] = []
	in_thinking = False
	session_id = ""
	provider = model = api = ""
	tool_detail: list[dict] = []

	proc = subprocess.Popen(
		build_command(item["prompt"]),
		cwd=str(REPO_DIR),
		stdout=subprocess.PIPE,
		stderr=subprocess.STDOUT,
		text=True,
		bufsize=1,
		env=env,
	)

	def kill_on_timeout() -> None:
		if proc.poll() is None:
			proc.kill()

	timer = threading.Timer(timeout, kill_on_timeout)
	timer.start()
	try:
		assert proc.stdout is not None
		# 注意：不能写 for line in proc.stdout —— 文件对象迭代器有自己的预读缓冲，
		# 管道场景下会攒够一大块才吐出来，thinking 就变成「一段一段」而不是逐 token。
		for line in iter(proc.stdout.readline, ""):
			raw_lines.append(line)
			line = line.strip()
			if not line:
				continue
			if not line.startswith("{"):
				# runner 自己的 [piagent] 日志
				emit(c.dim(f"  {line}"), "\n")
				continue
			try:
				ev = json.loads(line)
			except json.JSONDecodeError:
				continue

			etype = ev.get("type")
			if etype == "session":
				# 流的第一条：拿到本次会话 id，跑完据此把 session 文件精确捞出来
				session_id = ev.get("id", "")
			elif etype == "message_start":
				msg = ev.get("message", {})
				if msg.get("role") == "assistant":
					provider = msg.get("provider", provider) or provider
					model = msg.get("model", model) or model
					api = msg.get("api", api) or api
			elif etype == "message_update":
				e = ev.get("assistantMessageEvent", {})
				sub = e.get("type")
				if sub == "thinking_start" and show_thinking:
					in_thinking = True
					emit(c.dim("\n  💭 "))
				elif sub == "thinking_delta":
					thinking_chars += len(e.get("delta", ""))
					if show_thinking:
						emit(c.dim(e.get("delta", "")))
				elif sub == "thinking_end":
					if show_thinking and in_thinking:
						emit("\n")
					in_thinking = False
				elif sub == "text_start":
					emit("\n")
				elif sub == "text_delta":
					delta = e.get("delta", "")
					answer_parts.append(delta)
					emit(c.green(delta) if c.on else delta)
				elif sub == "toolcall_end":
					call = e.get("toolCall", {})
					name = call.get("name", "?")
					args = json.dumps(call.get("arguments", {}), ensure_ascii=False)
					tool_calls.append(name)
					tool_detail.append({"name": name, "arguments": call.get("arguments", {})})
					emit(c.cyan(f"\n  🔧 {name}({args[:160]})"), "\n")
			elif etype == "tool_execution_end":
				result = ev.get("result", {})
				texts = [b.get("text", "") for b in result.get("content", []) if b.get("type") == "text"]
				preview = " ".join(texts)[:160].replace("\n", " ")
				emit(c.dim(f"  ← {preview}"), "\n")
			elif etype == "turn_end":
				msg = ev.get("message", {})
				usage = msg.get("usage", usage) or usage
				stop_reason = msg.get("stopReason", stop_reason) or stop_reason
	finally:
		timer.cancel()
		proc.wait()

	answer = "".join(answer_parts)
	codes = sorted(set(CODE_RE.findall(answer)))
	valid = [x for x in codes if x in KNOWN]
	bogus = [x for x in codes if x not in KNOWN]

	result = {
		**item,
		"exit_code": proc.returncode,
		"elapsed_s": round(time.time() - started, 1),
		"answer": answer,
		"answer_chars": len(answer),
		"thinking_chars": thinking_chars,
		"tool_calls": tool_calls,
		"codes_valid": valid,
		"codes_bogus": bogus,
		"usage": usage,
		"stop_reason": stop_reason,
		"session_id": session_id,
		"provider": provider,
		"model": model,
		"api": api,
		"tool_detail": tool_detail,
		"raw": "".join(raw_lines),
	}
	# PASS 判据跟 create_and_run_skill.sh 一致：至少一个编号能回表对上
	result["passed"] = bool(valid) and proc.returncode == 0
	if not stream:
		result["buffered"] = "".join(buf)
	return result


# ── 落盘 ───────────────────────────────────────────
def find_session_file(session_id: str) -> pathlib.Path | None:
	"""按 session id 在 pi 的会话目录里找那份 jsonl（文件名是 <时间戳>_<uuid>.jsonl）。"""
	if not session_id or not SESSION_DIR.is_dir():
		return None
	hits = sorted(SESSION_DIR.glob(f"*{session_id}*.jsonl"))
	return hits[-1] if hits else None


def render_session_md(session_path: pathlib.Path) -> str:
	"""把 session jsonl 渲染成能读的对话记录：user / thinking / 工具调用 / 工具结果 / 回答。"""
	lines = ["# session history", "", f"来源：`{session_path.name}`", ""]
	for raw in session_path.read_text(encoding="utf-8").splitlines():
		raw = raw.strip()
		if not raw:
			continue
		try:
			row = json.loads(raw)
		except json.JSONDecodeError:
			continue
		msg = row.get("message")
		if not isinstance(msg, dict):
			continue
		role = msg.get("role", "?")
		ts = row.get("timestamp", "")
		if role == "toolResult":
			texts = [b.get("text", "") for b in msg.get("content", []) if b.get("type") == "text"]
			body = "\n".join(texts)
			if len(body) > 2000:
				body = body[:2000] + f"\n…（省略 {len(body) - 2000} 字）"
			lines += [f"## toolResult · {msg.get('toolName', '?')}  <sub>{ts}</sub>", "", "```", body, "```", ""]
			continue
		blocks = msg.get("content", [])
		if isinstance(blocks, str):
			blocks = [{"type": "text", "text": blocks}]
		lines.append(f"## {role}  <sub>{ts}</sub>")
		lines.append("")
		for b in blocks:
			btype = b.get("type")
			if btype == "text":
				lines += [b.get("text", ""), ""]
			elif btype == "thinking":
				lines += ["<details><summary>thinking</summary>", "", "```", b.get("thinking", ""), "```", "", "</details>", ""]
			elif btype == "toolCall":
				args = json.dumps(b.get("arguments", {}), ensure_ascii=False)
				lines += [f"🔧 `{b.get('name', '?')}({args[:400]})`", ""]
			else:
				lines += [f"<!-- {btype} -->", ""]
	return "\n".join(lines) + "\n"


def save_result(r: dict, run_dir: pathlib.Path, c: Color) -> dict:
	"""每条 prompt 一个子目录：metadata.json / prompt.md / response.md / session.jsonl+md / events.jsonl"""
	d = run_dir / r["id"]
	d.mkdir(parents=True, exist_ok=True)

	session_src = find_session_file(r.get("session_id", ""))
	session_note = ""
	if session_src:
		(d / "session.jsonl").write_text(session_src.read_text(encoding="utf-8"), encoding="utf-8")
		try:
			(d / "session.md").write_text(render_session_md(session_src), encoding="utf-8")
		except Exception as exc:  # 渲染失败不影响原始记录
			session_note = f"session.md 渲染失败：{exc}"
	else:
		session_note = f"没找到 session 文件（id={r.get('session_id') or '空'}，目录 {SESSION_DIR}）"

	meta = {
		"id": r["id"],
		"category": r["category"],
		"category_name": r["category_name"],
		"status": r["status"],
		"prompt": r["prompt"],
		"passed": r["passed"],
		"exit_code": r["exit_code"],
		"elapsed_s": r["elapsed_s"],
		"provider": r.get("provider", ""),
		"model": r.get("model", ""),
		"api": r.get("api", ""),
		"usage": r.get("usage", {}),
		"stop_reason": r.get("stop_reason", ""),
		"answer_chars": r["answer_chars"],
		"thinking_chars": r["thinking_chars"],
		"tool_calls": r["tool_calls"],
		"tool_detail": r.get("tool_detail", []),
		"codes_valid": r["codes_valid"],
		"codes_bogus": r["codes_bogus"],
		"session_id": r.get("session_id", ""),
		"session_file": str(session_src) if session_src else "",
		"session_note": session_note,
		"ran_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
		"prompt_sha": cache_key(r["prompt"], r.get("model") or ""),
		"cached": False,
	}
	(d / "metadata.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
	(d / "prompt.md").write_text(f"# {r['id']} · {r['category_name']}\n\n{r['prompt']}\n", encoding="utf-8")
	(d / "response.md").write_text(
		f"# {r['id']} · {r['category_name']}\n\n"
		f"> {r.get('provider','')}/{r.get('model','')} · {r['elapsed_s']}s · "
		f"{'PASS' if r['passed'] else 'FAIL'} · 编号 {', '.join(r['codes_valid']) or '无'}\n\n"
		f"{r['answer']}\n",
		encoding="utf-8",
	)
	(d / "events.jsonl").write_text(r.get("raw", ""), encoding="utf-8")
	if session_note:
		print(c.yellow(f"  ⚠ {r['id']}: {session_note}"))
	return meta


def write_index(metas: list[dict], run_dir: pathlib.Path) -> None:
	rows = ["| id | 分类 | 结果 | 耗时 | 正文 | thinking | 工具 | 有效编号 | 文件 |",
	        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
	for m in metas:
		rows.append(
			f"| {m['id']} | {m['category_name']} | {'PASS' if m['passed'] else 'FAIL'} | "
			f"{m['elapsed_s']}s | {m['answer_chars']} | {m['thinking_chars']} | {len(m['tool_calls'])} | "
			f"{len(m['codes_valid'])} | [{m['id']}/]({m['id']}/) |"
		)
	passed = sum(1 for m in metas if m["passed"])
	head = [
		f"# 运行结果 {run_dir.name}",
		"",
		f"- 时间：{time.strftime('%Y-%m-%d %H:%M:%S')}",
		f"- 模型：{metas[0].get('provider','')}/{metas[0].get('model','')}" if metas else "",
		f"- 通过：{passed}/{len(metas)}",
		"",
		"每个子目录里：`metadata.json`（元数据）、`prompt.md`、`response.md`（模型最终回答）、",
		"`session.jsonl` + `session.md`（完整 session history）、`events.jsonl`（原始事件流）。",
		"",
	]
	(run_dir / "index.md").write_text("\n".join(head + rows) + "\n", encoding="utf-8")
	(run_dir / "summary.json").write_text(json.dumps(metas, ensure_ascii=False, indent=2), encoding="utf-8")


def verdict_line(r: dict, c: Color) -> str:
	tag = c.green(" PASS ") if r["passed"] else c.red(" FAIL ")
	bits = [
		f"{r['elapsed_s']}s",
		f"正文 {r['answer_chars']} 字",
		f"thinking {r['thinking_chars']} 字",
		f"工具 {len(r['tool_calls'])} 次",
		f"编号 {len(r['codes_valid'])} 对",
	]
	if r["codes_bogus"]:
		bits.append(c.yellow(f"表外编号 {','.join(r['codes_bogus'][:3])}"))
	if r["stop_reason"] and r["stop_reason"] != "stop":
		bits.append(c.yellow(f"stopReason={r['stop_reason']}"))
	if r["exit_code"] != 0:
		bits.append(c.red(f"exit={r['exit_code']}"))
	return f"[{tag}] {r['id']}  " + "  ".join(bits)


def main() -> int:
	ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	ap.add_argument("--md", type=pathlib.Path, default=DEFAULT_MD, help="prompt 清单所在的 markdown")
	ap.add_argument("--only", nargs="*", default=None, help="只跑这些 id 或分类前缀（A3 / A3-P1）")
	ap.add_argument("--status", choices=["draft", "verified"], help="只跑某种状态的")
	ap.add_argument("--jobs", type=int, default=1, help="并行条数，默认 1（串行 + 实时流式）")
	ap.add_argument("--timeout", type=int, default=900, help="单条超时秒数")
	ap.add_argument("--no-thinking", action="store_true", help="不打印 thinking")
	ap.add_argument("--no-color", action="store_true")
	ap.add_argument("--list", action="store_true", help="只列清单")
	ap.add_argument("--result-dir", type=pathlib.Path, default=DEFAULT_RESULT_DIR,
	                help="结果根目录，默认 custom_skill_space/result（每次运行一个时间戳子目录）")
	ap.add_argument("--no-save", action="store_true", help="只看屏幕输出，不落盘")
	ap.add_argument("--no-cache", "--force", dest="no_cache", action="store_true",
	                help="忽略历史结果，全部重跑（默认命中缓存就跳过）")
	args = ap.parse_args()

	# 默认开颜色：管道到 head/less 也保留（要纯文本用 --no-color 或 NO_COLOR=1）
	c = Color(enabled=not args.no_color and os.environ.get("NO_COLOR") is None)
	items = load_prompts(args.md)

	if args.only:
		want = set(args.only)
		items = [i for i in items if i["id"] in want or i["category"] in want]
	if args.status:
		items = [i for i in items if i["status"] == args.status]
	if not items:
		print("筛选后没有 prompt 可跑")
		return 1

	if args.list:
		for i in items:
			print(f"{i['id']:<7} {i['status']:<8} [{i['category']}] {i['category_name']}")
			print(f"        {i['prompt'][:100]}…")
		return 0

	global KNOWN
	KNOWN = known_codes()
	print(c.cyan(f"共 {len(items)} 条 prompt，{'串行' if args.jobs == 1 else f'{args.jobs} 路并行'}，"
	             f"编号库 {len(KNOWN)} 条"))

	run_dir = None
	if not args.no_save:
		run_dir = args.result_dir / time.strftime("%Y%m%dT%H%M%S")
		run_dir.mkdir(parents=True, exist_ok=True)
		print(c.dim(f"结果目录：{run_dir}"))

	model = model_hint()
	cache: dict[str, pathlib.Path] = {}
	if not args.no_cache:
		cache = build_cache(args.result_dir, model)
		if cache:
			print(c.dim(f"缓存索引：{len(cache)} 条历史 PASS 结果（key = {model} + prompt 原文）"))

	metas: list[dict] = []
	results: list[dict] = []
	cached_ids: list[str] = []
	if args.jobs == 1:
		for n, item in enumerate(items, 1):
			print(c.cyan(f"\n{'━' * 70}\n[{n}/{len(items)}] {item['id']} · {item['category_name']} ({item['status']})"))
			print(c.dim(f"  prompt: {item['prompt'][:120]}…\n"))
			hit = cache.get(cache_key(item["prompt"], model))
			if hit and run_dir:
				metas.append(reuse_cached(hit, item, run_dir, c))
				write_index(metas, run_dir)
				cached_ids.append(item["id"])
				continue
			r = run_prompt(item, c, stream=True, show_thinking=not args.no_thinking,
			               timeout=args.timeout)
			print("\n" + verdict_line(r, c))
			results.append(r)
			if run_dir:
				# 每条跑完就落盘，中途 Ctrl+C 也留得下已完成的
				metas.append(save_result(r, run_dir, c))
				write_index(metas, run_dir)
				cache[cache_key(item["prompt"], model)] = run_dir / item["id"]
	else:
		from concurrent.futures import ThreadPoolExecutor
		print(c.yellow("并行模式：输出攒到每条结束再整段打印（token 级实时只在串行下可用）"))
		todo = []
		for item in items:
			hit = cache.get(cache_key(item["prompt"], model))
			if hit and run_dir:
				metas.append(reuse_cached(hit, item, run_dir, c))
				cached_ids.append(item["id"])
			else:
				todo.append(item)
		if metas:
			write_index(metas, run_dir)
		with ThreadPoolExecutor(max_workers=args.jobs) as pool:
			futures = {
				pool.submit(run_prompt, item, c, stream=False,
				            show_thinking=not args.no_thinking, timeout=args.timeout): item
				for item in todo
			}
			for fut in futures:
				pass
			for fut, item in futures.items():
				r = fut.result()
				print(c.cyan(f"\n{'━' * 70}\n{item['id']} · {item['category_name']}"))
				print(r.get("buffered", ""))
				print(verdict_line(r, c))
				results.append(r)
				if run_dir:
					metas.append(save_result(r, run_dir, c))
					write_index(metas, run_dir)

	# ── 汇总 ──
	passed = [r for r in results if r["passed"]]
	total_pass = len(passed) + len(cached_ids)
	total = len(results) + len(cached_ids)
	summary_line = f"汇总：{total_pass}/{total} PASS"
	if cached_ids:
		summary_line += f"（其中 {len(cached_ids)} 条走缓存：{', '.join(cached_ids)}）"
	print(c.cyan(f"\n{'━' * 70}\n{summary_line}"))
	for r in results:
		print("  " + verdict_line(r, c))
	if run_dir:
		print(c.dim(f"结果已落盘：{run_dir}（index.md / summary.json / 每条一个子目录）"))
	bogus = {x for r in results for x in r["codes_bogus"]}
	if bogus:
		print(c.yellow(f"\n出现过表里没有的编号（模型臆造）：{', '.join(sorted(bogus))}"))
	return 0 if total_pass == total else 1


KNOWN: set[str] = set()

if __name__ == "__main__":
	sys.exit(main())
