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
#   bash serve.sh --sudo          # sudo 起在 80 端口（部署用，见下）
#   bash serve.sh --sudo --dry-run  # 只打印最终命令，不真的起（不需要密码）
#   bash serve.sh --strict-port 9000  # 端口被占就报错，不自动往后找
#   PYTHON=/path/to/python bash serve.sh
#
# 关于 --sudo：1024 以下是特权端口，非 root 绑不上，所以这个选项做三件事——
#   1. 端口默认改成 80（显式给了端口就用你给的）
#   2. 端口探测和最终的 http.server 都通过 sudo 跑
#   3. 不再自动往后找端口：部署时 80 被占就该报错停下，而不是悄悄换到 81
# 一键部署用 deploy.sh，它就是封装了这个选项（还带后台运行/日志/停止）。
#
# 说明：变量一律写 ${VAR}（macOS 自带 bash 3.2 下 $VAR 紧跟中文标点会把首字节吃进变量名）。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-3389}"
HOST="${HOST:-127.0.0.1}"
OPEN_BROWSER=""
USE_SUDO=""
STRICT_PORT=""
DRY_RUN=""
PORT_GIVEN=""

while [ "$#" -gt 0 ]; do
	case "$1" in
		--open) OPEN_BROWSER=1; shift ;;
		--host) HOST="${2:-127.0.0.1}"; shift 2 ;;
		--port) PORT="${2:-3389}"; PORT_GIVEN=1; shift 2 ;;
		--sudo|--sudo80) USE_SUDO=1; shift ;;
		--strict-port) STRICT_PORT=1; shift ;;
		--dry-run) DRY_RUN=1; shift ;;
		-h|--help) sed -n '2,38p' "${BASH_SOURCE[0]}"; exit 0 ;;
		[0-9]*) PORT="$1"; PORT_GIVEN=1; shift ;;
		*) echo "未知参数：$1（用 --help 看用法）" >&2; exit 2 ;;
	esac
done

# --sudo 默认落到 80（除非显式指定了端口）
if [ -n "${USE_SUDO}" ] && [ -z "${PORT_GIVEN}" ]; then
	PORT=80
fi
# 特权端口下的探测与启动都得带 sudo，否则绑定必然失败
SUDO_PREFIX=""
[ -n "${USE_SUDO}" ] && SUDO_PREFIX="sudo"

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

# ── 端口探测 ───────────────────────────────────────
# 普通模式：被占就往后找；--sudo 模式：不换端口，占了直接报错（部署要的是确定性）
port_free() {
	${SUDO_PREFIX} "${PY}" - "$1" "${HOST}" <<'PYEOF'
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

if [ -n "${DRY_RUN}" ]; then
	say "--dry-run：跳过端口探测"
elif [ -n "${USE_SUDO}" ] || [ -n "${STRICT_PORT}" ]; then
	# 部署场景：端口必须是说好的那个。占了就报错，绝不悄悄换到下一个——
	# 否则调用方（deploy.sh）会对着旧端口做健康检查，把别人的服务当成自己的。
	[ -n "${USE_SUDO}" ] && say "sudo 模式：探测 ${HOST}:${PORT}（可能要输密码）"
	port_free "${PORT}" || die "${HOST}:${PORT} 已被占用；先停掉占用者（lsof -i :${PORT}）或换 --port"
else
	TRY="${PORT}"
	LIMIT=$((PORT + 20))
	while [ "${TRY}" -lt "${LIMIT}" ]; do
		if port_free "${TRY}"; then break; fi
		say "端口 ${TRY} 被占用，试 $((TRY + 1))"
		TRY=$((TRY + 1))
	done
	[ "${TRY}" -lt "${LIMIT}" ] || die "从 ${PORT} 起连续 20 个端口都被占用"
	PORT="${TRY}"
fi

URL="http://${HOST}:${PORT}/index.html"
[ "${HOST}" = "0.0.0.0" ] && URL="http://127.0.0.1:${PORT}/index.html"
[ "${PORT}" = "80" ] && URL="${URL%:80/index.html}/index.html"

say "python：${PY}"
say "目录：  ${SCRIPT_DIR}"
say "地址：  ${URL}"
[ -n "${USE_SUDO}" ] && say "模式：  sudo（特权端口 ${PORT}）"
say "停止：  Ctrl+C"

if [ -n "${OPEN_BROWSER}" ]; then
	# Linux 用 xdg-open，macOS 用 open，都没有就算了
	( sleep 1
	  if command -v xdg-open >/dev/null 2>&1; then xdg-open "${URL}" >/dev/null 2>&1
	  elif command -v open >/dev/null 2>&1; then open "${URL}" >/dev/null 2>&1
	  fi ) &
fi

# exec 让 Ctrl+C 直接落到 python 上，不留孤儿进程
if [ -n "${DRY_RUN}" ]; then
	say "--dry-run，最终命令是："
	printf '  %s\n' "${SUDO_PREFIX} ${PY} -m http.server ${PORT} --bind ${HOST} --directory ${SCRIPT_DIR}"
	exit 0
fi
exec ${SUDO_PREFIX} "${PY}" -m http.server "${PORT}" --bind "${HOST}" --directory "${SCRIPT_DIR}"
