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

# ── 1. 安装 ────────────────────────────────────────
if [ -n "${PIAGENT_SKIP_INSTALL:-}" ]; then
	echo "[piagent] 跳过安装（PIAGENT_SKIP_INSTALL）"
elif command -v pi >/dev/null 2>&1; then
	echo "[piagent] pi 已安装：$(command -v pi)"
else
	echo "[piagent] 安装 @earendil-works/pi-coding-agent（npm -g）"
	npm install -g --ignore-scripts @earendil-works/pi-coding-agent
fi

# ── 2. credential -> models.json ───────────────────
# credential 是一条能直接跑的 curl 示例：LLM_API_KEY=... 加 ark 的 URL 和 model 名。
if [ ! -f "$CREDENTIAL_FILE" ]; then
	echo "[piagent] 找不到 credential：$CREDENTIAL_FILE" >&2
	echo "[piagent] 没有它就只能靠 pi 自己的 /login 或 ANTHROPIC_API_KEY，直接起 pi。" >&2
else
	API_KEY="$(grep -Eo '^[[:space:]]*(export[[:space:]]+)?(LLM_API_KEY|ANTHROPIC_API_KEY)[[:space:]]*=[[:space:]]*"?[^"[:space:]]+' "$CREDENTIAL_FILE" | head -1 | sed -E 's/^.*=[[:space:]]*"?//')"
	# baseUrl 不带 /v1：pi 自己拼 /v1/messages（带上就变成 …/v1/v1/messages，ark 回 401）
	BASE_URL="$(grep -o 'https\{0,1\}://[^[:space:]"'"'"'\\]*' "$CREDENTIAL_FILE" | head -1 | sed -E -e 's#/(v[0-9]+/)?messages/?$##' -e 's#/+$##')"
	MODEL_ID="$(sed -n 's/.*"model"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$CREDENTIAL_FILE" | head -1)"

	if [ -z "$API_KEY" ] || [ -z "$BASE_URL" ] || [ -z "$MODEL_ID" ]; then
		echo "[piagent] credential 解析不全（key/baseUrl/model 缺一），不动 models.json" >&2
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
echo "[piagent] 工作目录：$WORKDIR"
cd "$WORKDIR"
exec pi "$@"
