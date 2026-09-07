// 实现 run_s10.sh:3 的效果， 可以直接在webstorm debug
//
//   printf 'plan a small feature as tasks: … set up the dependencies.\n' \
//     | pnpm dev s10_task_system/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop、TaskStore 或 create_task /
// update_task 的 handler 里都不方便；这份入口把同一句话直接当成一轮 user 消息
// 交给 agentLoop，跑完就退出：没有 readline、没有管道，点 Debug 就能停在断点上。
//
// 任务图是有状态的：.tasks/ 留在磁盘上，重复跑会在上一次的图上继续加节点。
// 想从空图开始，先手动 rm -rf s10_task_system/.tasks（脚本不替你删）。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s10_task_system/run_main_non_interactive.ts "list the tasks and tell me which one is unblocked"

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
const { agentLoop, TaskStore, tasksDirFor } = await import("./main");
// hook 装配来自 s04：它的 loadHooks 收一个 confirm（关卡 3 的 y/N）。
const { loadHooks } = await import("../s04_hooks/main");
const { logPermission } = await import("../s03_permission/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "plan a small feature as tasks: design the DB schema, then build the API on top of it, then write tests for the API, and write docs that also depend on the schema. set up the dependencies.";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s10 >> ${query}`, "cyan");

// 没有终端可问 y/N：默认拒绝，S10_ALLOW=1 时一律放行。
const autoAnswer = process.env.S10_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S10_ALLOW=1）" : "拒绝（设 S10_ALLOW=1 可放行）"}`,
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

const hooks = loadHooks(logger, confirm);

// UserPromptSubmit 在 agent 循环之外触发，每轮用户输入只跑一次。
await hooks.trigger("UserPromptSubmit", query);

// 任务存储一个 session 一份，落在本章目录下的 .tasks/。
const tasks = new TaskStore(tasksDirFor(import.meta.dirname));

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, { client: createClient(), logger, hooks, tasks }),
  "green",
);
