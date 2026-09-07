#!/usr/bin/env bash
# 在远端机器上跑 piagent_opencode_space/install_run_opencode.sh。
#
# 原来那一行：
#   ssh likeqian@172.23.40.165 'cd /home/likeqian/learn-claude-code;bash piagent_opencode_space/install_run_opencode.sh'
# 有三个坑：
#   1. ssh 不带 -t 不分配 TTY，而不带参数的 runner 会进 opencode 的 TUI，
#      没有 TTY 时要么报错要么卡住。
#   2. ssh 执行的是非交互 shell，nvm 装的 node/npm 不在 PATH 上
#      （实测那台机器连 bash -lc 都看不到 node，得显式 source ~/.nvm/nvm.sh）。
#   3. 参数没法透传，想跑 `run "一句话"` 只能改脚本。
#
# 现在：
#   bash run_via_ssh.sh                      # 进远端 TUI（自动 -t）
#   bash run_via_ssh.sh run "hi"             # 一次性跑完就退出（不分配 TTY，方便重定向）
#   bash run_via_ssh.sh models               # 子命令原样透传
#   bash run_via_ssh.sh --push-env run "hi"  # 先把本地 .env 传过去（远端没有就必须来一次）
#   REMOTE_HOST=user@host REMOTE_DIR=/path bash run_via_ssh.sh …
#
# 说明：远端 piagent_opencode_space/node_modules 如果是从 Mac 同步过去的，
# .bin/opencode 会是 Mach-O 二进制、在 Linux 上跑不了；runner 已改成按平台包挑
# （node_modules/opencode-linux-x64/bin/opencode）并用 --version 验证，这里不用管。

set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-likeqian@172.23.40.165}"
REMOTE_DIR="${REMOTE_DIR:-/home/likeqian/learn-claude-code}"
RUNNER="${REMOTE_RUNNER:-piagent_opencode_space/install_run_opencode.sh}"
LOCAL_ENV="${LOCAL_ENV:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.env}"

PUSH_ENV=""
if [ "${1:-}" = "--push-env" ]; then
	PUSH_ENV=1
	shift
fi

say() { printf '\033[36m[ssh]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[ssh] %s\033[0m\n' "$*" >&2; exit 1; }

# ── 可选：把本地 .env 传过去 ───────────────────────
# .env 在 .gitignore 里，git pull 带不过去；远端没有它就配不出 provider。
if [ -n "$PUSH_ENV" ]; then
	[ -f "$LOCAL_ENV" ] || die "本地没有 $LOCAL_ENV"
	say "scp $LOCAL_ENV -> $REMOTE_HOST:$REMOTE_DIR/.env（含 API key）"
	scp -q "$LOCAL_ENV" "$REMOTE_HOST:$REMOTE_DIR/.env"
	ssh "$REMOTE_HOST" "chmod 600 $(printf %q "$REMOTE_DIR/.env")"
fi

# ── 拼远端命令 ─────────────────────────────────────
# nvm 的 node 只有 source 过 nvm.sh 才在 PATH 上；opencode 用平台二进制时其实不需要
# node，但 npm install 那条路要用，所以先尽力载入。
REMOTE_CMD='export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1'
REMOTE_CMD="$REMOTE_CMD; cd $(printf %q "$REMOTE_DIR") || exit 1"
REMOTE_CMD="$REMOTE_CMD; bash $(printf %q "$RUNNER")"
for arg in "$@"; do
	REMOTE_CMD="$REMOTE_CMD $(printf %q "$arg")"
done

# 不带参数 = 进 TUI，需要 TTY；带参数 = 一次性输出，不要 TTY（免得混进控制字符）
SSH_OPTS=()
if [ "$#" -eq 0 ]; then
	SSH_OPTS+=(-t)
	say "远端 TUI：$REMOTE_HOST:$REMOTE_DIR"
else
	say "远端一次性运行：$REMOTE_HOST:$REMOTE_DIR -- $*"
fi

exec ssh "${SSH_OPTS[@]+"${SSH_OPTS[@]}"}" "$REMOTE_HOST" "bash -lc $(printf %q "$REMOTE_CMD")"
