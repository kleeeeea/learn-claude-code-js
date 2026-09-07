#!/usr/bin/env bash
# 本地装 Tau（huggingface/tau）并用本仓库的 credential 跑起来。
# 上游 README 见本文件末尾（原样注释保留），文档 https://twotimespi.dev/
#
# 只做 local install：git clone 到本目录下的 tau/，用 uv sync --dev 建一个隔离的
# .venv，全程 uv run 调用。不装 PyPI 上的 tau-ai，不碰全局 python / conda 环境，
# 也不往 ~/.local/bin 放东西。卸载就是 rm -rf piagent_tau_space/tau。
#
# 按 README「For local development」+ providers 指南做三件事：
#   1. clone + uv sync --dev + uv run tau --version（已 clone 就只 sync；
#      TAUAGENT_PULL=1 顺带 git pull）
#   2. 把 ../credential 里的 ark key / base URL / model 注册成 ~/.tau/catalog.toml 里的
#      一个自定义 provider。Tau 的自定义 provider 只认 kind = "openai-compatible"，
#      而 ark 的 /api/plan/v1 同时提供 /messages 和 /chat/completions 两套接口，
#      所以这里用同一个 base URL 走 OpenAI 那套；key 只写成 api_key_env 引用，不落明文。
#   2.5 把本项目的 session 目录挪到 piagent_tau_space/sessions（TAUAGENT_SESSION_DIR 可换）。
#      Tau 没有 pi 那种 sessionDir 设置：TauPaths.home 写死 Path.home()/".tau"，
#      session 按 cwd 分子目录存在它下面（paths.py 的 project_session_dir）。所以这里
#      只把「本项目那一个子目录」软链过来，别的项目的 session 仍留在 ~/.tau/sessions。
#   3. uv run --project tau/ tau …，工作目录默认本仓库根（TAUAGENT_WORKDIR 可换），
#      显式带上 --provider/-m，省掉交互里再 /login、/model 的一步。
#
# 用法：
#   bash piagent_tau_space/install_run_tauagent.sh                         # 装 + 进 TUI
#   bash piagent_tau_space/install_run_tauagent.sh -p "explain this repo"  # 一次性 print 模式
#   TAUAGENT_WORKDIR=/some/project bash …/install_run_tauagent.sh
#   TAUAGENT_SKIP_INSTALL=1 bash …/install_run_tauagent.sh                 # 只配置 + 跑

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
CREDENTIAL_FILE="${TAUAGENT_CREDENTIAL:-$REPO_DIR/credential}"
WORKDIR="${TAUAGENT_WORKDIR:-$REPO_DIR}"
TAU_DIR="${TAUAGENT_CHECKOUT:-$SCRIPT_DIR/tau}"
TAU_REPO="${TAUAGENT_REPO_URL:-https://github.com/huggingface/tau.git}"
TAU_CONFIG_DIR="$HOME/.tau"
CATALOG_TOML="$TAU_CONFIG_DIR/catalog.toml"
PROVIDER_NAME="${TAUAGENT_PROVIDER:-ark-plan}"
# 对话记录落到本目录下的 sessions/（做法见下面第 2.5 步）
SESSION_DIR="${TAUAGENT_SESSION_DIR:-$SCRIPT_DIR/sessions}"
# catalog.toml 里只放这个变量名，真实 key 由本脚本在运行时 export
API_KEY_ENV="TAUAGENT_API_KEY"
PYTHON="${TAUAGENT_PYTHON:-/Users/l/miniconda3/envs/base124/bin/python}"

# 全程走 uv run --project，解释器和依赖都在 $TAU_DIR/.venv 里，出了这个目录不留痕迹。
TAU=(uv run --project "$TAU_DIR" tau)

# ── 1. 本地安装（clone + uv sync）──────────────────
if [ -n "${TAUAGENT_SKIP_INSTALL:-}" ]; then
	echo "[tau] 跳过安装（TAUAGENT_SKIP_INSTALL）"
else
	command -v uv >/dev/null 2>&1 || {
		echo "[tau] 需要 uv：https://docs.astral.sh/uv/getting-started/installation/" >&2
		exit 1
	}
	if [ -d "$TAU_DIR/.git" ]; then
		echo "[tau] 已 clone：$TAU_DIR"
		[ -n "${TAUAGENT_PULL:-}" ] && git -C "$TAU_DIR" pull --ff-only
	else
		echo "[tau] git clone $TAU_REPO -> $TAU_DIR"
		git clone --depth 1 "$TAU_REPO" "$TAU_DIR"
	fi
	# --dev 跟 README 一致（带上 pytest/ruff/mypy，方便直接读源码改着玩）
	echo "[tau] uv sync --dev（venv 建在 $TAU_DIR/.venv）"
	uv sync --dev --project "$TAU_DIR"
	echo "[tau] $("${TAU[@]}" --version 2>&1 | head -1)"
fi

# ── 2. credential -> catalog.toml ──────────────────
# credential 是一条能直接跑的 curl 示例：LLM_API_KEY=... 加 ark 的 URL 和 model 名。
if [ ! -f "$CREDENTIAL_FILE" ]; then
	echo "[tau] 找不到 credential：$CREDENTIAL_FILE" >&2
	echo "[tau] 没有它就只能在 tau 里 /login 自己接 provider，直接起 tau。" >&2
	PROVIDER_ARGS=()
else
	API_KEY="$(grep -Eo '^[[:space:]]*(export[[:space:]]+)?(LLM_API_KEY|ANTHROPIC_API_KEY)[[:space:]]*=[[:space:]]*"?[^"[:space:]]+' "$CREDENTIAL_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//')"
	# catalog.toml 的 base_url 要指到 /v1（Tau 自己拼 /chat/completions），
	# 跟 Anthropic SDK 那边「不带 /v1」的约定相反。
	BASE_URL="$(grep -o 'https\{0,1\}://[^[:space:]"'"'"'\\]*' "$CREDENTIAL_FILE" | head -1 | sed -e 's#/messages/\{0,1\}$##' -e 's#/*$##')"
	MODEL_ID="$(sed -n 's/.*"model"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$CREDENTIAL_FILE" | head -1)"

	if [ -z "$API_KEY" ] || [ -z "$BASE_URL" ] || [ -z "$MODEL_ID" ]; then
		echo "[tau] credential 解析不全（key/baseUrl/model 缺一），不动 catalog.toml" >&2
		PROVIDER_ARGS=()
	else
		mkdir -p "$TAU_CONFIG_DIR"
		# 追加而不是覆盖：同名 provider 已在就原样留着，别人的条目也不动。
		PROVIDER_NAME="$PROVIDER_NAME" BASE_URL="$BASE_URL" MODEL_ID="$MODEL_ID" \
		API_KEY_ENV="$API_KEY_ENV" CATALOG_TOML="$CATALOG_TOML" "$PYTHON" - <<'PY'
import os, pathlib, tomllib

path = pathlib.Path(os.environ["CATALOG_TOML"])
name = os.environ["PROVIDER_NAME"]
text = path.read_text() if path.exists() else ""

existing = {}
if text.strip():
	try:
		existing = tomllib.loads(text)
	except tomllib.TOMLDecodeError:
		backup = path.with_suffix(".toml.bak")
		path.replace(backup)
		print(f"[tau] 原 catalog.toml 不是合法 TOML，备份到 {backup}")
		text, existing = "", {}

if any(p.get("name") == name for p in existing.get("providers", [])):
	print(f"[tau] provider {name} 已在 {path}，不改动")
else:
	model = os.environ["MODEL_ID"]
	base_url = os.environ["BASE_URL"]
	# 字段照 tau_coding/catalog_loader.py 的 _CatalogProvider 来：docs_url 是必填的，
	# api 不写会默认成 openai-responses，而 ark 的 /api/plan/v1 提供的是 chat/completions。
	block = f'''
[[providers]]
name = "{name}"
display_name = "Ark plan ({model})"
kind = "openai-compatible"
base_url = "{base_url}"
api_key_env = "{os.environ["API_KEY_ENV"]}"
credential_name = "{name}"
models = ["{model}"]
default_model = "{model}"
docs_url = "{base_url}"
api = "openai-completions"

[providers.context_windows]
"{model}" = 200000

[providers.model_metadata."{model}"]
name = "{model}"
reasoning = true
input = ["text"]
'''
	if not text.strip():
		text = "schema_version = 1\n"
	elif "schema_version" not in existing:
		text = "schema_version = 1\n" + text
	path.write_text(text.rstrip("\n") + "\n" + block)
	print(f"[tau] provider {name} -> {os.environ['BASE_URL']} ({os.environ['MODEL_ID']}) 写入 {path}")
PY
		export "$API_KEY_ENV=$API_KEY"
		PROVIDER_ARGS=(--provider "$PROVIDER_NAME" -m "$MODEL_ID")
	fi
fi

# ── 2.5 session 目录搬到 space 下 ──────────────────
# 用 tau 自己的 paths 算出本项目的 session 目录（slug + cwd 摘要），再软链到 SESSION_DIR。
if [ -d "$TAU_DIR/.venv" ]; then
	SESSION_DIR="$SESSION_DIR" WORKDIR="$WORKDIR" \
	uv run --project "$TAU_DIR" python - <<'PY'
import os, pathlib
from tau_coding.paths import TauPaths

target = pathlib.Path(os.environ["SESSION_DIR"])
link = TauPaths().project_session_dir(pathlib.Path(os.environ["WORKDIR"]))
target.mkdir(parents=True, exist_ok=True)

if link.is_symlink():
	if link.resolve() == target.resolve():
		print(f"[tau] session 目录已指向 {target}")
	else:
		print(f"[tau] {link} 已是软链但指向 {link.resolve()}，不动它")
elif link.is_dir():
	# 之前跑出来的记录先搬过去，再把原目录换成软链（同名的不覆盖）
	moved = 0
	for entry in link.iterdir():
		dest = target / entry.name
		if dest.exists():
			continue
		entry.rename(dest)
		moved += 1
	try:
		link.rmdir()
	except OSError:
		print(f"[tau] {link} 非空，保留原样（已搬 {moved} 项）")
	else:
		link.symlink_to(target, target_is_directory=True)
		print(f"[tau] session 目录 -> {target}（搬了 {moved} 项旧记录）")
else:
	link.parent.mkdir(parents=True, exist_ok=True)
	link.symlink_to(target, target_is_directory=True)
	print(f"[tau] session 目录 -> {target}")
PY
fi

# 本仓库的 .env / shell 里可能有别家的 ANTHROPIC_*，会干扰 provider 选择，摘掉。
unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN

# ── 3. 跑起来 ──────────────────────────────────────
# 带一句话就一次性跑完退回 shell：tau 的裸位置参数是「TUI 里预填这句 prompt」，
# 会停在界面里；一次性输出得显式 -p/--print，所以这里替你补上。
# 不带参数进 TUI；显式 flag（-p / --session 等）和子命令原样透传；
# 想带着 prompt 直接进 TUI 就 TAUAGENT_TUI=1。
PRINT_ARGS=()
if [ "$#" -gt 0 ] && [ -z "${TAUAGENT_TUI:-}" ]; then
	case "$1" in
		-*|export|install|providers|sessions|setup|update) ;;
		*) PRINT_ARGS=(-p) ;;
	esac
fi

echo "[tau] 工作目录：$WORKDIR"
exec "${TAU[@]}" --cwd "$WORKDIR" ${PROVIDER_ARGS[@]+"${PROVIDER_ARGS[@]}"} ${PRINT_ARGS[@]+"${PRINT_ARGS[@]}"} "$@"
