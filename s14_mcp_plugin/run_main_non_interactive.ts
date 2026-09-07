// 实现 run_s14.sh:3 的效果， 可以直接在webstorm debug
//
//   printf 'search the docs for "hooks" using an MCP tool.\nnow actually search for "hooks".\n' \
//     | pnpm dev s14_mcp_plugin/main.ts
//
// 两轮是本章的重点：第一轮工具池已经在请求前组装完，模型只能先 connect_mcp；
// 要到第二轮 mcp__docs__search 才真正出现在池子里。所以默认就跑这两轮，
// 断点打在 connectMcp 或 mcp 工具的分发处都能停。
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 传了 Program arguments 就只跑那一轮，例如
//   node --import tsx s14_mcp_plugin/run_main_non_interactive.ts "connect to the deploy server and check its status"

import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "../lib/logger";
import { print } from "../lib/terminal";

// 与 main.ts 同一个理由：静态 import 全部先于模块体执行，而 lib/model 的
// MODEL_ID 是 import 期求值的 const，所以 .env 必须赶在动态 import 之前读进来。
try {
  process.loadEnvFile(path.join(import.meta.dirname, "..", ".env"));
} catch {
  // 没有 .env 就直接用真实环境变量
}

const { createClient } = await import("../lib/model");
// main.ts 的 REPL 由 import.meta.main 守着，被 import 时不会启动。
const { agentLoop, createMcpState, loadMcpHooks } = await import("./main");
const { logPermission } = await import("../s03_permission/main");

const argvQuery = process.argv.slice(2).join(" ").trim();
// 默认两轮，对应 run_s14.sh 里管道喂的那两行。
const queries = argvQuery
  ? [argvQuery]
  : [
      'search the docs for "hooks" using an MCP tool.',
      'now actually search for "hooks".',
    ];

const logger = createLogger(import.meta.dirname);
const client = createClient();
const mcp = createMcpState();

// 宿主侧策略表里标 confirm 的外部工具（如 mcp__deploy__trigger）会走到这里。
// 没有终端可问：默认拒绝，S14_ALLOW=1 时一律放行。
const autoAnswer = process.env.S14_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S14_ALLOW=1）" : "拒绝（设 S14_ALLOW=1 可放行）"}`,
    autoAnswer ? "yellow" : "red",
  );
  logPermission(
    logger,
    call.name,
    call.input,
    warning,
    autoAnswer ? "allow" : "deny",
  );
  return autoAnswer;
};

// mcpPermissionHook 排在 s04 的 permissionHook 之后、logHook 之前。
const hooks = loadMcpHooks(logger, confirm, mcp);

const history: Anthropic.MessageParam[] = [];
for (const text of queries) {
  logger.userInput(text);
  print(`s14 >> ${text}`, "cyan");
  await hooks.trigger("UserPromptSubmit", text);
  history.push({ role: "user", content: text });
  print(await agentLoop(history, { client, logger, hooks, mcp }), "green");
}
