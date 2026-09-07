// 实现 run_s12.sh:4-8 的效果， 可以直接在webstorm debug
//
//   { printf 'schedule "use bash to print the current date" every minute …\n'; sleep 75;
//     printf 'q\n'; } | pnpm dev s12_cron_scheduler/main.ts
//
// 那个脚本要靠 sleep 撑过整分钟边界；这里直接在代码里等：第一轮注册任务，
// 轮询到 1 秒定时器把它推进 cronQueue，再跑第二轮 —— 队列是在 agentLoop 开头
// 被消费的（[inject cron]），所以第二轮不需要新的用户输入。
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// durable 任务会在启动时重新加载：上次验证的残留会混进这次的触发，
// 想干净起步先手动 rm -f s12_cron_scheduler/.scheduled_tasks.json（脚本不替你删）。
//
// 传了 Program arguments 就只跑那一轮（不等整分钟、不追第二轮），例如
//   node --import tsx s12_cron_scheduler/run_main_non_interactive.ts "list the scheduled jobs"

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
const {
  agentLoop,
  createCronState,
  hasCronQueue,
  loadDurableJobs,
  startCronScheduler,
} = await import("./main");
// hook 装配来自 s04：它的 loadHooks 收一个 confirm（关卡 3 的 y/N）。
const { loadHooks } = await import("../s04_hooks/main");
const { logPermission } = await import("../s03_permission/main");

const argvQuery = process.argv.slice(2).join(" ").trim();
const query =
  argvQuery ||
  'schedule "use bash to print the current date" every minute, recurring, and keep it after restart';

const logger = createLogger(import.meta.dirname);
const client = createClient();

// 定时回合不能占用主终端问 y/N —— 这里干脆整个进程都没有终端：
// 默认拒绝，S12_ALLOW=1 时一律放行。
const autoAnswer = process.env.S12_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S12_ALLOW=1）" : "拒绝（设 S12_ALLOW=1 可放行）"}`,
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

// cron 状态落在本章 session 目录；durable 任务重启后由 loadDurableJobs 恢复。
const cron = createCronState(import.meta.dirname);
loadDurableJobs(cron, logger);
startCronScheduler(cron, logger);

const history: Anthropic.MessageParam[] = [];

async function turn(text?: string): Promise<void> {
  if (text !== undefined) {
    logger.userInput(text);
    print(`s12 >> ${text}`, "cyan");
    await hooks.trigger("UserPromptSubmit", text);
    history.push({ role: "user", content: text });
  }
  print(await agentLoop(history, { client, logger, hooks, cron }), "green");
}

await turn(query);

// 只有默认那句才等交付：cron 按整分钟触发，最坏要等满 60 秒。
// 队列非空后再跑一轮，[inject cron] 会把 [Scheduled] 消息注入进去。
if (!argvQuery) {
  const deadline = Date.now() + 75_000;
  while (!hasCronQueue(cron) && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (hasCronQueue(cron)) await turn();
  else print("等了 75s 没等到 cron 触发（检查表达式是不是 5 段）", "yellow");
}

// 调度器的 setInterval 是 unref 过的，不会拖住退出。
