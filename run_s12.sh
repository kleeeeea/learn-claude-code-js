#adapt to s12
# durable 任务会在启动时重新加载，上次验证的残留会混进这次的触发，所以先清掉
rm -f s12_cron_scheduler/.scheduled_tasks.json
# 注册完不要退出：撑过下一个整分钟，才等得到入队 -> 交付 -> 注入这三行
{ printf 'schedule "use bash to print the current date" every minute, recurring, and keep it after restart\n'
  sleep 75
  printf 'q\n'
} | pnpm dev s12_cron_scheduler/main.ts
