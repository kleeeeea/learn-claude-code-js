#adapt to s10
# 任务图有状态、各节会互相干扰，所以每次从空图开始（只删本章自己的 .tasks）
rm -rf s10_task_system/.tasks
printf 'plan a small feature as tasks: design the DB schema, then build the API on top of it, then write tests for the API, and write docs that also depend on the schema. set up the dependencies.\n' | pnpm dev s10_task_system/main.ts
