// 实现 run_s4.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'what files are in the current directory?\n' | pnpm dev s04_hooks/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop 或某个 hook 里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s04_hooks/run_main_non_interactive.ts "read the file package.json"

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
// s03 的 logPermission：让自动决定也进 transcript 的 PERMISSION 一节。
const { logPermission } = await import("../s03_permission/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "what files are in the current directory?";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s04 >> ${query}`, "cyan");

// permissionHook 在关卡 3 会 await confirm 等人输 y/N。这里没有终端可问，
// 注入一个不问人的实现：默认拒绝，S04_ALLOW=1 时一律放行。
// 关卡 1（deny list）和关卡 2 不经过它，短路发生在 permissionHook 内部。
const autoAnswer = process.env.S04_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S04_ALLOW=1）" : "拒绝（设 S04_ALLOW=1 可放行）"}`,
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

// hook 注册表：loadHooks 顺带把 HOOK REGISTER 写进 transcript。
const hooks = loadHooks(logger, confirm);

// UserPromptSubmit 在 agent 循环之外触发，每轮用户输入只跑一次 —— 与 main.ts 的
// REPL 保持一致，否则 contextInjectHook 那行不会出现。
await hooks.trigger("UserPromptSubmit", query);

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, { client: createClient(), logger, hooks }),
  "green",
);
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
