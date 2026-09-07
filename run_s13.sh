#adapt to s13
# 团队状态跨会话留在磁盘上，先清干净（worktree 不动，需要时自己看 git worktree list）
rm -rf s13_agent_teams/.tasks s13_agent_teams/.mailboxes .tmp/s13-check
# 三轮：先要方案（Lead 只建任务不派人），确认后才 spawn，最后撑一段时间等队友事件回流
{ printf 'set up a scratch area under .tmp/s13-check as three tasks. task A: write .tmp/s13-check/config.json containing exactly {"name": "s13-check", "version": "1.0.0"}. task B: write .tmp/s13-check/README.md whose first line is "# s13-check". task C: use bash to verify config.json parses as JSON with name "s13-check", and that README.md first line is "# s13-check". A and B are independent; C depends on both. do the independent work in parallel.\n'
  sleep 45
  printf 'go ahead.\n'
  sleep 150
  printf 'q\n'
} | pnpm dev s13_agent_teams/main.ts
