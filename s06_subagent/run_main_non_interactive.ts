// 实现 run_s6.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'use a subtask to find what testing framework this project uses\n' \
//     | pnpm dev s06_subagent/main.ts
//
// 那条命令靠管道喂 stdin，断点打在父 agentLoop 或子循环（task handler）里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
// 想看父子两路的分界，断点打在 task 的 handler 上，子 agent 的日志带 [sub] 前缀。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s06_subagent/run_main_non_interactive.ts "use two separate subtasks: one to count the .ts files in lib/, another to read the name field in package.json"

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
const { agentLoop } = await import("./main");
// hook 装配沿用 s05 的那份（s06 的 main.ts 也是从那里 import 的，不再复制一遍）。
const { loadHooks } = await import("../s05_todo_write/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "use a subtask to find what testing framework this project uses";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s06 >> ${query}`, "cyan");

// 父 agent 和子 agent 共用这一份 hook 实例（子循环自己派生 child("sub") logger，
// 所以 [HOOK] 行不带 [sub] 前缀，见 README 第 2 节）。
const hooks = loadHooks(logger);

// UserPromptSubmit 在 agent 循环之外触发，每轮用户输入只跑一次 —— 与 main.ts 的
// REPL 保持一致，否则 contextInjectHook 那行不会出现。
await hooks.trigger("UserPromptSubmit", query);

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, { client: createClient(), logger, hooks }),
  "green",
);
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
