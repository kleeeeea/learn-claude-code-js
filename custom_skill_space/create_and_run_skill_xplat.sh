#!/usr/bin/env bash
#根据 /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/source/数学课标整理表格.xlsx 来制作一个skill 放到当前文件夹下面
#然后参考/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/piagent_space 运行一个简单的prompt 测试是否skill 能够加载
#
# 做两件事：
#   1. 读 source/数学课标整理表格.xlsx（385 条 Common Core 数学课标，K-8 + 高中五个
#      概念类别），生成 math-standards/ 这个 skill：
#        math-standards/SKILL.md              —— 只放「怎么查」，名字+描述进系统提示
#        math-standards/references/standards.csv —— 全量数据，按需 grep，不进上下文
#        math-standards/references/index.md   —— 年级/领域/编号前缀总览，先看这个再定位
#      合并单元格在 xlsx 里只在首行有值，这里向下填充补齐。
#   2. 起一个 agent（pi 或 opencode），把上面这个目录当 skill 挂上去，
#      跑一条只有查表才答得出的 prompt，看 skill 是不是真被加载了。
#
# 跨平台（xplat）要点：
#   - python 不写死路径：SKILL_PYTHON > mac 上的 conda > python3 > python，
#     只用来读 xlsx（需要 openpyxl，缺了会给出安装命令）。
#   - agent 后端可选：SKILL_AGENT=auto|pi|opencode，默认 auto——
#     本机有 pi 就用 pi（--skill 直接指目录），否则退到 opencode
#     （写进 opencode.json 的 skills.paths，再 opencode run）。
#     远端 Linux 上通常只有 opencode，auto 会自己选中它。
#
# 用法：
#   bash custom_skill_space/create_and_run_skill_xplat.sh              # 生成 + 测试
#   bash custom_skill_space/create_and_run_skill_xplat.sh --build-only # 只生成，不跑模型
#   SKILL_PROMPT='...' bash custom_skill_space/create_and_run_skill_xplat.sh   # 换测试 prompt
#   SKILL_AGENT=opencode bash custom_skill_space/create_and_run_skill_xplat.sh # 强制用 opencode
#   SKILL_PYTHON=/path/to/python bash custom_skill_space/create_and_run_skill_xplat.sh
#
# 说明：变量一律写 ${VAR}（macOS 自带 bash 3.2 下 $VAR 紧跟中文标点会把首字节吃进变量名）。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "${SCRIPT_DIR}")"
XLSX="${SKILL_XLSX:-${SCRIPT_DIR}/source/数学课标整理表格.xlsx}"
SKILL_NAME="math-standards"
SKILL_DIR="${SCRIPT_DIR}/${SKILL_NAME}"
PI_RUNNER="${REPO_DIR}/piagent_space/install_run_piagent.sh"
OPENCODE_RUNNER="${REPO_DIR}/piagent_opencode_space/install_run_opencode.sh"
SKILL_AGENT="${SKILL_AGENT:-auto}"
# 只有查表才答得出：要求给出编号对应的原文和 PDF 页码
DEFAULT_PROMPT="用 math-standards 技能查一下课标编号 8.G.7 和 K.CC.4：分别给出课标要求原文、所属年级与领域、以及 PDF 页码。"
SKILL_PROMPT="${SKILL_PROMPT:-${DEFAULT_PROMPT}}"

say() { printf '\033[36m[skill]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[skill] %s\033[0m\n' "$*" >&2; exit 1; }

# ── python：不写死路径 ─────────────────────────────
# 显式指定 > mac 上的 conda（本机习惯）> python3 > python
find_python() {
	if [ -n "${SKILL_PYTHON:-}" ]; then printf '%s' "${SKILL_PYTHON}"; return; fi
	[ -x /Users/l/miniconda3/envs/base124/bin/python ] && { printf '%s' /Users/l/miniconda3/envs/base124/bin/python; return; }
	for cand in python3 python; do
		command -v "${cand}" >/dev/null 2>&1 && { command -v "${cand}"; return; }
	done
}
PYTHON="$(find_python)"
[ -n "${PYTHON}" ] || die "找不到 python（试过 SKILL_PYTHON / python3 / python），用 SKILL_PYTHON=/path/to/python 指定"
"${PYTHON}" -c 'import openpyxl' 2>/dev/null || die "${PYTHON} 缺 openpyxl，装一下：${PYTHON} -m pip install openpyxl"
say "python：${PYTHON}"

[ -f "${XLSX}" ] || die "找不到源表格：${XLSX}"

# ── 1. xlsx -> skill ───────────────────────────────
mkdir -p "${SKILL_DIR}/references"
XLSX="${XLSX}" SKILL_DIR="${SKILL_DIR}" SKILL_NAME="${SKILL_NAME}" "${PYTHON}" - <<'PYEOF'
import csv, os, pathlib, collections
import openpyxl

xlsx = pathlib.Path(os.environ["XLSX"])
skill_dir = pathlib.Path(os.environ["SKILL_DIR"])
refs = skill_dir / "references"

ws = openpyxl.load_workbook(xlsx, data_only=True).worksheets[0]
rows = list(ws.iter_rows(values_only=True))

# 表头：年级 | 领域 | 知识点 | 课标要求 | 课标编号 | PDF来源
# 合并单元格只有首行有值，向下填充。
grade = domain = cluster = None
records = []
for r in rows[1:]:
	if not any(r):
		continue
	g, d, c, req, code, src = (r[0], r[1], r[2], r[3], r[4], r[5])
	grade = g if g not in (None, "") else grade
	domain = d if d not in (None, "") else domain
	cluster = c if c not in (None, "") else cluster
	if req in (None, ""):
		continue
	records.append({
		"grade": str(grade).strip(),
		"domain": str(domain).strip(),
		"cluster": str(cluster).strip(),
		"code": str(code).strip() if code else "",
		"requirement": " ".join(str(req).split()),
		"pdf_page": str(src).strip() if src else "",
	})

# 全量数据：一行一条，方便 grep / 少量列读取
csv_path = refs / "standards.csv"
with csv_path.open("w", newline="", encoding="utf-8") as fh:
	w = csv.DictWriter(fh, fieldnames=["code", "grade", "domain", "cluster", "requirement", "pdf_page"])
	w.writeheader()
	for rec in records:
		w.writerow({k: rec[k] for k in w.fieldnames})

# 总览：年级 -> 领域 -> 编号范围，让模型先定位再去 grep 全量表
by_grade = collections.OrderedDict()
for rec in records:
	by_grade.setdefault(rec["grade"], collections.OrderedDict()).setdefault(rec["domain"], []).append(rec)

lines = [
	"# Common Core 数学课标 · 总览",
	"",
	f"共 {len(records)} 条，来自 {xlsx.name}。全量数据在 `standards.csv`（列：code, grade, domain, cluster, requirement, pdf_page）。",
	"",
	"| 年级 | 领域 | 条数 | 编号示例 |",
	"| --- | --- | --- | --- |",
]
for g, domains in by_grade.items():
	for d, recs in domains.items():
		codes = [r["code"] for r in recs if r["code"]]
		sample = f"{codes[0]} … {codes[-1]}" if len(codes) > 1 else (codes[0] if codes else "")
		lines.append(f"| {g} | {d} | {len(recs)} | {sample} |")
lines.append("")
(refs / "index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

# SKILL.md：只写「是什么 + 怎么查」，正文保持短，数据靠上面两个文件按需读
grades = list(by_grade.keys())
skill_md = f"""---
name: {os.environ["SKILL_NAME"]}
description: 查询美国 Common Core 数学课程标准（K-8 与高中五个概念类别，共 {len(records)} 条）。按课标编号（如 K.CC.4、8.G.7、S-MD.5）、年级或领域查出课标要求原文、所属领域/知识点与 PDF 页码。需要核对某条课标怎么说、某年级某领域包含哪些要求、或把教学内容对齐到课标编号时使用。
---

# Common Core 数学课标查询

数据来自 `{xlsx.name}`，已整理成两个文件：

- `references/index.md` —— 年级 × 领域的总览表（条数、编号示例）。先看它定位范围。
- `references/standards.csv` —— 全量 {len(records)} 条，列为
  `code, grade, domain, cluster, requirement, pdf_page`。

年级取值：{", ".join(grades)}。

## 怎么查

编号已知时直接按编号取行（编号在第一列，行首匹配最准）：

```bash
grep -m1 '^8.G.7,' references/standards.csv
```

按年级或领域筛选，只看编号和要求两列：

```bash
awk -F',' '$2=="5"' references/standards.csv | cut -d',' -f1,5
grep ',Geometry,' references/standards.csv | cut -d',' -f1,5
```

按关键词找（例如勾股定理相关）：

```bash
grep -i 'pythagorean' references/standards.csv | cut -d',' -f1,2,5
```

`requirement` 字段里含逗号，所以取整行文本时用 `grep` 原样输出，别用 `cut` 切到第 5 列以后。

## 回答约定

- 引用课标要求时给出**原文**（英文）加编号，必要时再翻译。
- 一并给出 `grade` / `domain` 和 `pdf_page`，方便回到 PDF 核对。
- 表里没有的条目直说没有，不要照编号规律臆造。
"""
(skill_dir / "SKILL.md").write_text(skill_md, encoding="utf-8")

print(f"[skill] {len(records)} 条 -> {csv_path}")
print(f"[skill] 总览 -> {refs / 'index.md'}")
print(f"[skill] SKILL.md -> {skill_dir / 'SKILL.md'}")
PYEOF

say "skill 目录：${SKILL_DIR}"
ls -1 "${SKILL_DIR}" "${SKILL_DIR}/references" | sed 's/^/    /'

[ "${1:-}" = "--build-only" ] && { say "--build-only，跳过模型测试"; exit 0; }

# ── 2. 起 agent 测试 skill 能不能被加载 ────────────
# 本机有没有 pi 可执行文件（nvm 下可能装在别的 node 版本里，PATH 上看不见）
have_pi() {
	[ -n "${PIAGENT_PI:-}" ] && [ -x "${PIAGENT_PI}" ] && return 0
	command -v pi >/dev/null 2>&1 && [ -x "$(command -v pi)" ] && return 0
	ls -1 "${HOME}"/.nvm/versions/node/*/bin/pi >/dev/null 2>&1 && return 0
	return 1
}

AGENT="${SKILL_AGENT}"
if [ "${AGENT}" = "auto" ]; then
	if [ -f "${PI_RUNNER}" ] && have_pi; then
		AGENT="pi"
	elif [ -f "${OPENCODE_RUNNER}" ]; then
		AGENT="opencode"
	else
		die "既没有可用的 pi，也没有 ${OPENCODE_RUNNER}；用 SKILL_AGENT= 指定后端"
	fi
fi

say "测试 prompt：${SKILL_PROMPT}"
case "${AGENT}" in
	pi)
		[ -f "${PI_RUNNER}" ] || die "找不到 pi 启动脚本：${PI_RUNNER}"
		say "后端 pi：--skill ${SKILL_DIR} -p …（provider/credential 走 piagent_space 那套）"
		OUT="$(PIAGENT_SKIP_INSTALL=1 bash "${PI_RUNNER}" --skill "${SKILL_DIR}" -p "${SKILL_PROMPT}" 2>&1)" || true
		;;
	opencode)
		[ -f "${OPENCODE_RUNNER}" ] || die "找不到 opencode 启动脚本：${OPENCODE_RUNNER}"
		# opencode 没有 --skill，走配置：skills.paths 收的是「skill 根目录」，
		# 它扫根目录下一层的 <skill>/SKILL.md，所以这里传 SKILL_DIR 的父目录。
		say "后端 opencode：skills.paths += ${SCRIPT_DIR}，然后 opencode run …"
		OUT="$(OPENCODE_SKILL_PATHS="${SCRIPT_DIR}" bash "${OPENCODE_RUNNER}" run "${SKILL_PROMPT}" 2>&1)" || true
		;;
	*)
		die "未知后端：${AGENT}（可选 auto / pi / opencode）"
		;;
esac
printf '%s\n' "${OUT}"

say "验证 skill 是否真的被加载"
BAD=""

# 先看有没有直接失败（比如 pi 没找到、provider 不对）
if printf '%s' "${OUT}" | grep -qE "not found|command not found|Error:|error:"; then
	echo "    ！  输出里有报错行"
	BAD=1
fi

if [ "${SKILL_PROMPT}" = "${DEFAULT_PROMPT}" ]; then
	# 默认 prompt：答案里必须出现只有查表才知道的东西
	# 8.G.7 -> Pythagorean / P56，K.CC.4 -> P11
	for needle in "Pythagorean" "P56" "P11"; do
		if printf '%s' "${OUT}" | grep -qi -- "${needle}"; then
			echo "    ok  命中「${needle}」"
		else
			echo "    ！  没出现「${needle}」"
			BAD=1
		fi
	done
else
	# 自定义 prompt：标记因人而异，改成通用判据——回答里至少出现一个本表里的课标编号，
	# 且那个编号确实能在 standards.csv 里查到（编造的编号不算）。
	HITS=0
	for code in $(printf '%s' "${OUT}" | grep -oE '\b([K1-8]|HS)[.-][A-Z]{1,3}[.-][0-9]+[a-z]?\b' | sort -u | head -20); do
		grep -q "^${code}," "${SKILL_DIR}/references/standards.csv" && HITS=$((HITS + 1))
	done
	if [ "${HITS}" -gt 0 ]; then
		echo "    ok  回答里有 ${HITS} 个能在 standards.csv 里对上的课标编号"
	else
		echo "    ！  回答里没有能对上表的课标编号"
		BAD=1
	fi
fi

[ -n "${BAD}" ] && die "输出里缺少查表才有的内容，skill 可能没被加载（后端 ${AGENT}，手动跑一次看看）"
say "skill 加载成功（后端 ${AGENT}）"
