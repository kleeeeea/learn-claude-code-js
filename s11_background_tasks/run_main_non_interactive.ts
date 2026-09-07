// 实现 run_s11.sh:3-7 的效果， 可以直接在webstorm debug
//
//   { printf 'run "sleep 20 && echo slept" in the background …\n'; sleep 25;
//     printf 'did the background command finish?\n'; } | pnpm dev s11_background_tasks/main.ts
//
// 那个脚本要靠 sleep 掐时间才能等到通知被收走；这里直接在代码里等：
// 第一轮派发后台任务，轮询到它跑完，再跑第二轮 —— 通知在下一轮开头才被收走，
// 这正是本章要看的「后台任务不会主动唤醒 agent」。
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 传了 Program arguments 就只跑那一轮（不会自动追第二轮），例如
//   node --import tsx s11_background_tasks/run_main_non_interactive.ts "run ls in the background"

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
const { agentLoop, BackgroundManager, stopBackgroundProcesses } = await import(
  "./main"
);
// hook 装配来自 s04：它的 loadHooks 收一个 confirm（关卡 3 的 y/N）。
const { loadHooks } = await import("../s04_hooks/main");
const { logPermission } = await import("../s03_permission/main");

const argvQuery = process.argv.slice(2).join(" ").trim();
const query =
  argvQuery ||
  'run "sleep 20 && echo slept" in the background with run_in_background true, and while it runs, list all Markdown files at the top level';

const logger = createLogger(import.meta.dirname);
const client = createClient();

// 没有终端可问 y/N：默认拒绝，S11_ALLOW=1 时一律放行。
const autoAnswer = process.env.S11_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S11_ALLOW=1）" : "拒绝（设 S11_ALLOW=1 可放行）"}`,
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
// 后台登记簿一个 session 一份，跨轮复用。
const background = new BackgroundManager();
const history: Anthropic.MessageParam[] = [];

async function turn(text: string): Promise<void> {
  logger.userInput(text);
  print(`s11 >> ${text}`, "cyan");
  await hooks.trigger("UserPromptSubmit", text);
  history.push({ role: "user", content: text });
  print(
    await agentLoop(history, { client, logger, hooks, background }),
    "green",
  );
}

const stillRunning = (): boolean =>
  Object.values(background.tasks).some((t) => t.status === "running");

await turn(query);

// 只有默认那句才追第二轮：等后台任务跑完（上限 60s），再问一句，
// 让 <task_notification> 在这一轮开头被收走。
if (!argvQuery) {
  const deadline = Date.now() + 60_000;
  while (stillRunning() && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
  }
  await turn("did the background command finish?");
}

// 还在跑的后台命令会 ref 住事件循环，退出前主动停掉（同 main.ts 的 REPL）。
stopBackgroundProcesses();
