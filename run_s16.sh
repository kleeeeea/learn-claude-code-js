#adapt to s16
# demo 走 MockAgentRunner：不需要 API key，同样的输入给同样的结果
# 跨次运行的状态全在 .runtime/，先清干净（想验续跑就别删，改跑 resume）
rm -rf s16_workflow_runtime/.runtime
pnpm dev s16_workflow_runtime/main.ts demo
