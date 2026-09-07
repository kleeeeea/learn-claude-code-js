#adapt to s15
# 跨轮状态留在磁盘上，先清干净（worktree 不动，需要时自己看 git worktree list）
rm -rf s15_integrated_harness/.tasks s15_integrated_harness/.mailboxes \
       s15_integrated_harness/.transcripts s15_integrated_harness/.task_outputs \
       s15_integrated_harness/.scheduled_tasks.json .tmp/s15-check
# s15 的提示符是常驻的（事件队列 + createPrompt），这一轮还没跑完 stdin 就 EOF，
# 输出会去重画一个已关闭的 readline 而崩掉。所以撑到这轮结束，再用 q 正常退出。
{ printf 'read README.md and tell me what this repo is.\n'
  sleep 60
  printf 'q\n'
} | pnpm dev s15_integrated_harness/main.ts
