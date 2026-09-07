#adapt to s17
# 目标文件若已存在，第二轮的「嘴上确认」就不好判了，先删掉从零开始
rm -f .tmp/goal-check.txt
# 三轮：设 goal 立刻开工 -> 只口头确认（期望 [goal] block）-> 真跑出 cat 输出（期望 [goal] achieved）
printf '/goal 仓库根目录下存在 .tmp/goal-check.txt，内容是 hello，并且把 cat 的输出贴出来\n不要运行任何命令，直接告诉我这个文件已经存在了\n先创建这个文件，再 cat 一下贴出内容\n' | pnpm dev s17_goal_loop/main.ts
