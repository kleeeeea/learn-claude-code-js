#!/usr/bin/env bash

# Package managers
# npm i -g opencode-ai@latest        # or bun/pnpm/yarn   ← 规格里的原话，见下面「装法」
# https://github.com/anomalyco/opencode
#
# 装上 opencode 并用本仓库的 credential 跑起来。文档 https://opencode.ai/docs/
#
# 装法：默认不用上面那条 -g，改成装进本目录（npm install --prefix piagent_opencode_space），
# 二进制在 node_modules/.bin/opencode，跟 piagent_tau_space 一样「不污染全局」。
# 想按规格全局装就 OPENCODE_GLOBAL=1，那条 -g 命令原样在下面。
#
# 三件事：
#   1. 本地装 opencode-ai@latest（已装则跳过；OPENCODE_SKIP_INSTALL=1 只配置+跑）
#   2. 把 ../credential 里的 ark key / base URL / model 写成本目录下 opencode.json 的
#      一个自定义 provider（npm: @ai-sdk/openai-compatible），并设成默认 model。
#      ark 的 /api/plan/v1 同时提供 /messages 和 /chat/completions，这里走 OpenAI 那套。
#      key 只写成 {env:OPENCODE_ARK_API_KEY} 引用，不落明文；配置文件用 OPENCODE_CONFIG
#      指过去，不碰 ~/.config/opencode。
#   3. 跑：session / auth 等数据落在本目录的 data/（XDG_DATA_HOME），
#      带一句话就 opencode run 一次性跑完退回 shell，不带参数进 TUI。
#
# 用法：
#   bash piagent_opencode_space/install_run_opencode.sh                # 装 + 进 TUI
#   bash piagent_opencode_space/install_run_opencode.sh hi             # 一次性跑完就退出
#   bash piagent_opencode_space/install_run_opencode.sh models         # 子命令原样透传
#   OPENCODE_WORKDIR=/some/project bash …/install_run_opencode.sh
#   OPENCODE_TUI=1 bash …/install_run_opencode.sh hi                   # 带 prompt 进 TUI

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
CREDENTIAL_FILE="${OPENCODE_CREDENTIAL:-$REPO_DIR/credential}"
WORKDIR="${OPENCODE_WORKDIR:-$REPO_DIR}"
# 配置和数据都留在 space 里：OPENCODE_CONFIG 指配置文件，XDG_DATA_HOME 兜住
# session / auth.json（默认在 ~/.local/share/opencode）。
CONFIG_FILE="${OPENCODE_CONFIG_FILE:-$SCRIPT_DIR/opencode.json}"
DATA_DIR="${OPENCODE_DATA_DIR:-$SCRIPT_DIR/data}"
PROVIDER_NAME="${OPENCODE_PROVIDER:-ark-plan}"
# opencode.json 里只放这个变量名，真实 key 由本脚本在运行时 export
API_KEY_ENV="OPENCODE_ARK_API_KEY"
PYTHON="${OPENCODE_PYTHON:-/Users/l/miniconda3/envs/base124/bin/python}"

LOCAL_BIN="$SCRIPT_DIR/node_modules/.bin/opencode"

# ── 1. 安装 ────────────────────────────────────────
if [ -n "${OPENCODE_SKIP_INSTALL:-}" ]; then
	echo "[opencode] 跳过安装（OPENCODE_SKIP_INSTALL）"
elif [ -n "${OPENCODE_GLOBAL:-}" ]; then
	command -v opencode >/dev/null 2>&1 || npm i -g opencode-ai@latest
	echo "[opencode] 全局安装：$(command -v opencode)"
elif [ -x "$LOCAL_BIN" ]; then
	echo "[opencode] 已装在本目录：$LOCAL_BIN ($("$LOCAL_BIN" --version 2>&1 | head -1))"
else
	echo "[opencode] npm install --prefix $SCRIPT_DIR opencode-ai@latest"
	npm install --prefix "$SCRIPT_DIR" opencode-ai@latest
fi

if [ -x "$LOCAL_BIN" ]; then
	OPENCODE=("$LOCAL_BIN")
else
	OPENCODE=(opencode)
fi

# ── 2. credential / .env -> opencode.json ──────────
# 两种来源都认：
#   credential —— 一条能直接跑的 curl 示例（LLM_API_KEY=... 加 ark 的 URL 和 model 名）
#   .env       —— 仓库跑各章用的那份（ANTHROPIC_API_KEY / ANTHROPIC_BASE_URL / MODEL_ID）
# credential 优先；它不在（比如为了推 GitHub 已经删掉）就退回 .env。
ENV_FILE="${OPENCODE_ENV_FILE:-$REPO_DIR/.env}"
API_KEY=""; BASE_URL=""; MODEL_ID=""; CRED_SOURCE=""
env_get() { grep -Eo "^[[:space:]]*(export[[:space:]]+)?$1[[:space:]]*=[[:space:]]*\"?[^\"[:space:]]+" "$ENV_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//'; }

if [ -f "$CREDENTIAL_FILE" ]; then
	CRED_SOURCE="$CREDENTIAL_FILE"
	API_KEY="$(grep -Eo '^[[:space:]]*(export[[:space:]]+)?(LLM_API_KEY|ANTHROPIC_API_KEY)[[:space:]]*=[[:space:]]*"?[^"[:space:]]+' "$CREDENTIAL_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//')"
	# baseURL 要指到 /v1（SDK 自己拼 /chat/completions），跟 Anthropic SDK「不带 /v1」相反
	BASE_URL="$(grep -o 'https\{0,1\}://[^[:space:]"'"'"'\\]*' "$CREDENTIAL_FILE" | head -1 | sed -e 's#/messages/\{0,1\}$##' -e 's#/*$##')"
	MODEL_ID="$(sed -n 's/.*"model"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$CREDENTIAL_FILE" | head -1)"
elif [ -f "$ENV_FILE" ]; then
	CRED_SOURCE="$ENV_FILE"
	API_KEY="$(env_get '(LLM_API_KEY|ANTHROPIC_API_KEY)')"
	BASE_URL="$(env_get 'ANTHROPIC_BASE_URL' | sed -e 's#/messages/\{0,1\}$##' -e 's#/*$##')"
	MODEL_ID="$(env_get 'MODEL_ID')"
	# .env 里那个是给 Anthropic SDK 用的、不带 /v1；这里要 OpenAI 那套端点，缺了就补上
	case "$BASE_URL" in */v[0-9]|*/v[0-9][0-9]) ;; *) [ -n "$BASE_URL" ] && BASE_URL="$BASE_URL/v1";; esac
else
	echo "[opencode] 既没有 $CREDENTIAL_FILE 也没有 $ENV_FILE" >&2
	echo "[opencode] 只能自己 opencode auth login，直接起 opencode。" >&2
fi

if [ -n "$CRED_SOURCE" ]; then
	echo "[opencode] 配置来源：$CRED_SOURCE"
	if [ -z "$API_KEY" ] || [ -z "$BASE_URL" ] || [ -z "$MODEL_ID" ]; then
		echo "[opencode] $CRED_SOURCE 解析不全（key/baseUrl/model 缺一），不动 opencode.json" >&2
	else
		# 合并而不是覆盖：只增改本 provider 和 model 这两项，别人的键留着。
		PROVIDER_NAME="$PROVIDER_NAME" BASE_URL="$BASE_URL" MODEL_ID="$MODEL_ID" \
		API_KEY_ENV="$API_KEY_ENV" CONFIG_FILE="$CONFIG_FILE" "$PYTHON" - <<'PYEOF'
import json, os, pathlib

path = pathlib.Path(os.environ["CONFIG_FILE"])
name = os.environ["PROVIDER_NAME"]
model = os.environ["MODEL_ID"]

config = {}
if path.exists() and path.stat().st_size:
	try:
		config = json.loads(path.read_text())
	except json.JSONDecodeError:
		backup = path.with_suffix(".json.bak")
		path.replace(backup)
		print(f"[opencode] 原 opencode.json 不是合法 JSON，备份到 {backup}")
		config = {}

config.setdefault("$schema", "https://opencode.ai/config.json")
config.setdefault("provider", {})[name] = {
	"npm": "@ai-sdk/openai-compatible",
	"name": f"Ark plan ({model})",
	"options": {
		"baseURL": os.environ["BASE_URL"],
		"apiKey": "{env:%s}" % os.environ["API_KEY_ENV"],
	},
	"models": {
		model: {
			"name": model,
			"limit": {"context": 200000, "output": 8000},
		}
	},
}
config["model"] = f"{name}/{model}"
path.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n")
print(f"[opencode] provider {name} -> {os.environ['BASE_URL']} ({model}) 写入 {path}")
PYEOF
		export "$API_KEY_ENV=$API_KEY"
	fi
fi

# 本仓库的 .env / shell 里可能有别家的 ANTHROPIC_*，会干扰 provider 选择，摘掉。
unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN

export OPENCODE_CONFIG="$CONFIG_FILE"
export XDG_DATA_HOME="$DATA_DIR"
mkdir -p "$DATA_DIR"

# ── 3. 跑起来 ──────────────────────────────────────
# 带一句话就走 `opencode run <prompt>`：一次性输出后退回 shell。
# 不带参数进 TUI；显式 flag 和子命令原样透传；带 prompt 又想进 TUI 就 OPENCODE_TUI=1。
RUN_ARGS=()
if [ "$#" -gt 0 ] && [ -z "${OPENCODE_TUI:-}" ]; then
	case "$1" in
		-*|run|auth|agent|models|session|stats|serve|web|export|import|github|mcp|upgrade|inspect) ;;
		*) RUN_ARGS=(run) ;;
	esac
fi

echo "[opencode] 工作目录：$WORKDIR  配置：$CONFIG_FILE  数据：$DATA_DIR"
cd "$WORKDIR"
exec "${OPENCODE[@]}" ${RUN_ARGS[@]+"${RUN_ARGS[@]}"} "$@"
