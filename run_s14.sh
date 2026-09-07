#adapt to s14
# 两轮：第一轮只连上 server，工具池已经组装完；第二轮才调得到 mcp__docs__search
printf 'search the docs for "hooks" using an MCP tool.\nnow actually search for "hooks".\n' | pnpm dev s14_mcp_plugin/main.ts
