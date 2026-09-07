#adapt to s8
# 把 L3 的两个阈值压低，一次大文件读取就能撞上落盘（默认值见 s08_context_compact/defaults.env）
printf 'read s08_context_compact/code.py and tell me what the compaction layers are\n' | L3_COMPACT_TOOL_RESULT_BUDGET=4000 L3_COMPACT_PERSIST_THRESHOLD=2000 pnpm dev s08_context_compact/main.ts
