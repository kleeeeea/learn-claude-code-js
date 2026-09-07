#https://pi.dev/docs/latest
#
# 装上 pi（Earendil 的极简终端 coding harness）并用本仓库的 credential 跑起来。
#
# 按官方文档做三件事：
#   1. npm install -g --ignore-scripts @earendil-works/pi-coding-agent   （已装则跳过）
#   2. 把 ../credential 里的 ark key / base URL / model 注册成 ~/.pi/agent/models.json
#      里的一个自定义 provider（api 类型 anthropic-messages），key 只写成 $ENV 引用，
#      不落明文；已有的其它 provider 原样保留。同时把 settings.json 的
#      defaultProvider / defaultModel 指过去，启动就是这个模型，不用手动 /model；
#      sessionDir 指到 piagent_space/sessions，对话记录跟着这个目录走
#   3. exec pi，工作目录默认是本仓库根（可用 PIAGENT_WORKDIR 覆盖）
#
# 用法：
#   bash piagent_space/install_run_piagent.sh              # 装 + 跑
#   PIAGENT_WORKDIR=/some/project bash …/install_run_piagent.sh
#   PIAGENT_SKIP_INSTALL=1 bash …/install_run_piagent.sh   # 只配置 + 跑
#
# 启动后模型已经是 credential 里那个（settings.json 的 defaultProvider/defaultModel）。
# 想临时换：/model（或 Ctrl+L）；想跑一次别的：… install_run_piagent.sh --model anthropic/claude-sonnet-4-6

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
CREDENTIAL_FILE="${PIAGENT_CREDENTIAL:-$REPO_DIR/credential}"
WORKDIR="${PIAGENT_WORKDIR:-$REPO_DIR}"
PI_CONFIG_DIR="$HOME/.pi/agent"
MODELS_JSON="$PI_CONFIG_DIR/models.json"
SETTINGS_JSON="$PI_CONFIG_DIR/settings.json"
PROVIDER_NAME="${PIAGENT_PROVIDER:-ark-plan}"
# 对话记录默认存到本目录下的 sessions/（settings.json 的 sessionDir）
SESSION_DIR="${PIAGENT_SESSION_DIR:-$SCRIPT_DIR/sessions}"
# models.json 里只放这个变量名，真实 key 由本脚本在运行时 export
API_KEY_ENV="PIAGENT_API_KEY"
PYTHON="${PIAGENT_PYTHON:-/Users/l/miniconda3/envs/base124/bin/python}"

# pi 的绝对路径：nvm 切了 node 版本后 pi 装在哪个版本下就只在哪个版本的 bin 里，
# 当前 PATH 上不一定有；zsh 里 `pi` 还可能是别的同名函数。所以自己找一遍。
find_pi() {
	if [ -n "${PIAGENT_PI:-}" ]; then printf '%s' "${PIAGENT_PI}"; return; fi
	if command -v pi >/dev/null 2>&1 && [ -x "$(command -v pi)" ]; then
		printf '%s' "$(command -v pi)"; return
	fi
	for c in "$(npm prefix -g 2>/dev/null)/bin/pi" \
		"$HOME/.local/bin/pi" /opt/homebrew/bin/pi /usr/local/bin/pi; do
		[ -x "$c" ] && { printf '%s' "$c"; return; }
	done
	# nvm 下各 node 版本，取最新的一个
	ls -1 "$HOME"/.nvm/versions/node/*/bin/pi 2>/dev/null | sort -V | tail -1
}
PI_BIN="$(find_pi)"

# ── 1. 安装 ────────────────────────────────────────
if [ -n "${PIAGENT_SKIP_INSTALL:-}" ]; then
	echo "[piagent] 跳过安装（PIAGENT_SKIP_INSTALL）"
elif [ -n "$PI_BIN" ] && [ -x "$PI_BIN" ]; then
	echo "[piagent] pi 已安装：$PI_BIN"
else
	echo "[piagent] 安装 @earendil-works/pi-coding-agent（npm -g）"
	npm install -g --ignore-scripts @earendil-works/pi-coding-agent
	PI_BIN="$(find_pi)"
fi
[ -n "$PI_BIN" ] && [ -x "$PI_BIN" ] || { echo "[piagent] 找不到 pi 可执行文件，装一下或用 PIAGENT_PI=/path/to/pi 指定" >&2; exit 127; }

# ── 2. credential / .env -> models.json ────────────
# 两种来源都认：
#   credential —— 一条能直接跑的 curl 示例（LLM_API_KEY=... 加 ark 的 URL 和 model 名）
#   .env       —— 仓库跑各章用的那份（ANTHROPIC_API_KEY / ANTHROPIC_BASE_URL / MODEL_ID）
# credential 优先；它不在（比如为了推 GitHub 已经删掉）就退回 .env。
ENV_FILE="${PIAGENT_ENV_FILE:-$REPO_DIR/.env}"
API_KEY=""; BASE_URL=""; MODEL_ID=""
env_get() { grep -Eo "^[[:space:]]*(export[[:space:]]+)?$1[[:space:]]*=[[:space:]]*\"?[^\"[:space:]]+" "$ENV_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//'; }

if [ -f "$CREDENTIAL_FILE" ]; then
	CRED_SOURCE="$CREDENTIAL_FILE"
	API_KEY="$(grep -Eo '^[[:space:]]*(export[[:space:]]+)?(LLM_API_KEY|ANTHROPIC_API_KEY)[[:space:]]*=[[:space:]]*"?[^"[:space:]]+' "$CREDENTIAL_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//')"
	# baseUrl 不带 /v1：pi 自己拼 /v1/messages（带上就变成 …/v1/v1/messages，ark 回 401）
	BASE_URL="$(grep -o 'https\{0,1\}://[^[:space:]"'"'"'\\]*' "$CREDENTIAL_FILE" | head -1 | sed -E -e 's#/(v[0-9]+/)?messages/?$##' -e 's#/+$##')"
	MODEL_ID="$(sed -n 's/.*"model"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$CREDENTIAL_FILE" | head -1)"
elif [ -f "$ENV_FILE" ]; then
	CRED_SOURCE="$ENV_FILE"
	API_KEY="$(env_get '(LLM_API_KEY|ANTHROPIC_API_KEY)')"
	# .env 里的 ANTHROPIC_BASE_URL 本来就不带 /v1，保险起见再剥一次
	BASE_URL="$(env_get 'ANTHROPIC_BASE_URL' | sed -E -e 's#/(v[0-9]+/)?messages/?$##' -e 's#/+$##')"
	MODEL_ID="$(env_get 'MODEL_ID')"
else
	CRED_SOURCE=""
	echo "[piagent] 既没有 $CREDENTIAL_FILE 也没有 $ENV_FILE" >&2
	echo "[piagent] 只能靠 pi 自己的 /login 或环境里的 ANTHROPIC_API_KEY，直接起 pi。" >&2
fi

if [ -n "$CRED_SOURCE" ]; then
	echo "[piagent] 配置来源：$CRED_SOURCE"
	if [ -z "$API_KEY" ] || [ -z "$BASE_URL" ] || [ -z "$MODEL_ID" ]; then
		echo "[piagent] ${CRED_SOURCE} 解析不全（key/baseUrl/model 缺一），不动 models.json" >&2
	else
		mkdir -p "$PI_CONFIG_DIR"
		# 合并而不是覆盖：只增改 $PROVIDER_NAME 这一个 key，别人的 provider 留着。
		PROVIDER_NAME="$PROVIDER_NAME" BASE_URL="$BASE_URL" MODEL_ID="$MODEL_ID" \
		API_KEY_ENV="$API_KEY_ENV" MODELS_JSON="$MODELS_JSON" \
		SETTINGS_JSON="$SETTINGS_JSON" SESSION_DIR="$SESSION_DIR" "$PYTHON" - <<'PY'
import json, os, pathlib

path = pathlib.Path(os.environ["MODELS_JSON"])
config = {}
if path.exists() and path.stat().st_size:
	try:
		config = json.loads(path.read_text())
	except json.JSONDecodeError:
		backup = path.with_suffix(".json.bak")
		path.replace(backup)
		print(f"[piagent] 原 models.json 不是合法 JSON，备份到 {backup}")
		config = {}

providers = config.setdefault("providers", {})
providers[os.environ["PROVIDER_NAME"]] = {
	"baseUrl": os.environ["BASE_URL"],
	"api": "anthropic-messages",
	"apiKey": f"${os.environ['API_KEY_ENV']}",
	"models": [
		{
			"id": os.environ["MODEL_ID"],
			"name": os.environ["MODEL_ID"],
			"reasoning": True,
			"input": ["text"],
			"contextWindow": 200000,
			"maxTokens": 8000,
		}
	],
}
path.write_text(json.dumps(config, indent=2, ensure_ascii=False) + "\n")
print(f"[piagent] provider {os.environ['PROVIDER_NAME']} -> {os.environ['BASE_URL']} ({os.environ['MODEL_ID']}) 写入 {path}")

# 启动默认模型：pi 读 settings.json 的 defaultProvider / defaultModel
# （等价于在 /model 里按 Ctrl+S）。同样是合并，theme 之类的设置留着。
settings_path = pathlib.Path(os.environ["SETTINGS_JSON"])
settings = {}
if settings_path.exists() and settings_path.stat().st_size:
	try:
		settings = json.loads(settings_path.read_text())
	except json.JSONDecodeError:
		backup = settings_path.with_suffix(".json.bak")
		settings_path.replace(backup)
		print(f"[piagent] 原 settings.json 不是合法 JSON，备份到 {backup}")
		settings = {}
settings["defaultProvider"] = os.environ["PROVIDER_NAME"]
settings["defaultModel"] = os.environ["MODEL_ID"]
# 会话落盘目录（优先级：--session-dir > PI_CODING_AGENT_SESSION_DIR > 这里）
settings["sessionDir"] = os.environ["SESSION_DIR"]
settings_path.write_text(json.dumps(settings, indent=2, ensure_ascii=False) + "\n")
print(f"[piagent] 启动默认模型 -> {os.environ['PROVIDER_NAME']}/{os.environ['MODEL_ID']}（{settings_path}）")
print(f"[piagent] 会话目录 -> {os.environ['SESSION_DIR']}")
PY
		export "$API_KEY_ENV=$API_KEY"
	fi
fi

# 本仓库的 .env / shell 里可能有别家的 ANTHROPIC_* ，会干扰 pi 选 provider，摘掉。
unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN

# ── 3. 跑起来 ──────────────────────────────────────
# pi 的 shebang 是 #!/usr/bin/env node：nvm 下 pi 装在哪个 node 版本里，就得让那个版本的
# node 在 PATH 上（当前激活的可能是另一个版本，env 会找不到 node）。把 pi 同目录挂到最前。
PI_DIR="$(cd "$(dirname "$PI_BIN")" && pwd)"
case ":$PATH:" in *":$PI_DIR:"*) ;; *) PATH="$PI_DIR:$PATH"; export PATH;; esac
command -v node >/dev/null 2>&1 || {
	echo "[piagent] PATH 上没有 node（pi 需要它），检查 $PI_DIR 或用 nvm use" >&2
	exit 127
}
echo "[piagent] pi=$PI_BIN  node=$(command -v node)"

echo "[piagent] 工作目录：$WORKDIR"
cd "$WORKDIR"
exec "$PI_BIN" "$@"
