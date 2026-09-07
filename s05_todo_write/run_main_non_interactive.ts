// 实现 run_s5.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'create .tmp/slug.ts with a slugify(text) function, write 3 vitest cases\n' \
//     | pnpm dev s05_todo_write/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop、TodoManager 或 nag 计数器里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 默认那句是个多步任务（写文件 + 跑 vitest），要跑好几轮、几分钟。想看得快一点，
// 用 WebStorm 的 Program arguments（或命令行）换一句短的，例如
//   node --import tsx s05_todo_write/run_main_non_interactive.ts "use todo_write to plan 3 steps for adding a health check endpoint, do not execute them"

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
const { agentLoop, loadHooks } = await import("./main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "create .tmp/slug.ts with a slugify(text) function, write 3 vitest cases in .tmp/slug.test.ts, run the tests, and fix any failures";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s05 >> ${query}`, "cyan");

// s05 的 loadHooks 只要 logger：这一章的 hook 里没有要等人输 y/N 的确认，
// 所以不像 s03/s04 那样需要注入 confirm。
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
