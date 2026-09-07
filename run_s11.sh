#adapt to s11
# 两轮：第一轮派发后台任务，等它跑完再喂第二轮，才看得到 <task_notification> 被收走
{ printf 'run "sleep 20 && echo slept" in the background with run_in_background true, and while it runs, list all Markdown files at the top level\n'
  sleep 25
  printf 'did the background command finish?\n'
} | pnpm dev s11_background_tasks/main.ts
