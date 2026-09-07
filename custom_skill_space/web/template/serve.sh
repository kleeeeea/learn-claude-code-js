#!/usr/bin/env bash
# should work under Linux, e.g. with /home/likeqian/miniconda3/envs/base124/bin/python and source code in /home/likeqian/learn-claude-code/custom_skill_space/web/template
#
# 起一个静态服务把本目录（web/template）伺候出来。
#
# 为什么必须走 HTTP 而不是双击 index.html：三个页面都用 fetch 读
# assets/data/*.json，file:// 协议下会被 CORS 挡掉，页面会一片空白。
#
# 可移植性（macOS 与 Linux 同一份脚本）：
#   - 目录：全部从脚本自身位置推导，不写死 /Users/l 或 /home/likeqian
#   - python：按 ${PYTHON} -> $HOME/miniconda3/envs/base124/bin/python -> 常见 conda 路径
#             -> python3 -> python 的顺序找，找不到就报错退出
#   - 端口：默认 3389，被占用就自动往后找（最多 20 个）
#   - 浏览器：--open 时 Linux 用 xdg-open、macOS 用 open，其余平台只打印地址
#
# 用法：
#   bash serve.sh                 # http://127.0.0.1:3389
#   bash serve.sh 9000            # 换端口
#   bash serve.sh --open          # 起完顺便打开浏览器
#   bash serve.sh --host 0.0.0.0  # 允许同网段其它机器访问（远程开发机常用）
#   PYTHON=/path/to/python bash serve.sh
#
# 说明：变量一律写 ${VAR}（macOS 自带 bash 3.2 下 $VAR 紧跟中文标点会把首字节吃进变量名）。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3389}"
HOST="${HOST:-127.0.0.1}"
OPEN_BROWSER=""

while [ "$#" -gt 0 ]; do
	case "$1" in
		--open) OPEN_BROWSER=1; shift ;;
		--host) HOST="${2:-127.0.0.1}"; shift 2 ;;
		--port) PORT="${2:-3389}"; shift 2 ;;
		-h|--help) sed -n '2,30p' "${BASH_SOURCE[0]}"; exit 0 ;;
		[0-9]*) PORT="$1"; shift ;;
		*) echo "未知参数：$1（用 --help 看用法）" >&2; exit 2 ;;
	esac
done

say() { printf '\033[36m[serve]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[serve] %s\033[0m\n' "$*" >&2; exit 1; }

# ── 找 python ──────────────────────────────────────
find_python() {
	if [ -n "${PYTHON:-}" ] && [ -x "${PYTHON}" ]; then printf '%s' "${PYTHON}"; return; fi
	# 优先本机 conda 环境（两台机器都是 base124），路径按 $HOME 推导，不写死用户名
	for c in \
		"${HOME}/miniconda3/envs/base124/bin/python" \
		"${HOME}/anaconda3/envs/base124/bin/python" \
		"${HOME}/miniforge3/envs/base124/bin/python" \
		"${CONDA_PREFIX:-/nonexistent}/bin/python"; do
		[ -x "${c}" ] && { printf '%s' "${c}"; return; }
	done
	for c in python3 python; do
		command -v "${c}" >/dev/null 2>&1 && { command -v "${c}"; return; }
	done
}
PY="$(find_python)"
[ -n "${PY}" ] || die "找不到 python（设 PYTHON=/path/to/python 再试）"

# http.server 的 --directory 需要 3.7+
"${PY}" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 7) else 1)' \
	|| die "${PY} 版本低于 3.7，http.server 不支持 --directory"

# ── 数据不在就先生成 ───────────────────────────────
if [ ! -f "${SCRIPT_DIR}/assets/data/standards.json" ] || [ ! -f "${SCRIPT_DIR}/assets/data/apps.json" ]; then
	say "assets/data 里缺数据，先跑 build_data.py"
	( cd "${SCRIPT_DIR}" && "${PY}" build_data.py ) || die "build_data.py 失败，先看它的报错"
fi

# ── 端口被占就往后找 ───────────────────────────────
port_free() {
	"${PY}" - "$1" "${HOST}" <<'PYEOF'
import socket, sys
port, host = int(sys.argv[1]), sys.argv[2]
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
	s.bind((host, port))
except OSError:
	sys.exit(1)
finally:
	s.close()
PYEOF
}

TRY="${PORT}"
LIMIT=$((PORT + 20))
while [ "${TRY}" -lt "${LIMIT}" ]; do
	if port_free "${TRY}"; then break; fi
	say "端口 ${TRY} 被占用，试 $((TRY + 1))"
	TRY=$((TRY + 1))
done
[ "${TRY}" -lt "${LIMIT}" ] || die "从 ${PORT} 起连续 20 个端口都被占用"
PORT="${TRY}"

URL="http://${HOST}:${PORT}/index.html"
[ "${HOST}" = "0.0.0.0" ] && URL="http://127.0.0.1:${PORT}/index.html"

say "python：${PY}"
say "目录：  ${SCRIPT_DIR}"
say "地址：  ${URL}"
say "停止：  Ctrl+C"

if [ -n "${OPEN_BROWSER}" ]; then
	# Linux 用 xdg-open，macOS 用 open，都没有就算了
	( sleep 1
	  if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1
	  elif command -v open >/dev/null 2>&1; then open "${URL}" >/dev/null 2>&1
	  fi ) &
fi

# exec 让 Ctrl+C 直接落到 python 上，不留孤儿进程
exec "${PY}" -m http.server "${PORT}" --bind "${HOST}" --directory "${SCRIPT_DIR}"
