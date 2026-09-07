// 实现 run_s13.sh:5-11 的效果， 可以直接在webstorm debug
//
//   { printf '<三任务的分工 prompt>\n'; sleep 45; printf 'go ahead.\n'; sleep 150;
//     printf 'q\n'; } | pnpm dev s13_agent_teams/main.ts
//
// 那个脚本要靠 sleep 掐时间；这里直接在代码里排：第一轮 Lead 只建任务并提方案
// （SYSTEM 里写死了「用户确认前不许 spawn」），第二轮说 go ahead 才真正派人，
// 之后轮询 Lead 收件箱，把队友事件当成新一轮喂回去 —— 这就是 main.ts 里
// 250ms 轮询干的事，只是这里不带 readline。点 Debug 就能停在断点上。
//
// 团队状态跨会话留在磁盘上，想干净起步先手动清（脚本不替你删）：
//   rm -rf s13_agent_teams/.tasks s13_agent_teams/.mailboxes .tmp/s13-check
//
// 传了 Program arguments 就只跑那一轮（不追 go ahead、不等队友），例如
//   node --import tsx s13_agent_teams/run_main_non_interactive.ts "list the teammates and the task board"

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
const { agentLoop, consumeLeadInbox, createTeamState, formatTeamEvents } =
  await import("./main");
// hook 装配来自 s04：它的 loadHooks 收一个 confirm（关卡 3 的 y/N）。
const { loadHooks } = await import("../s04_hooks/main");
const { logPermission } = await import("../s03_permission/main");

const argvQuery = process.argv.slice(2).join(" ").trim();
const query =
  argvQuery ||
  'set up a scratch area under .tmp/s13-check as three tasks. task A: write .tmp/s13-check/config.json containing exactly {"name": "s13-check", "version": "1.0.0"}. task B: write .tmp/s13-check/README.md whose first line is "# s13-check". task C: use bash to verify config.json parses as JSON with name "s13-check", and that README.md first line is "# s13-check". A and B are independent; C depends on both. do the independent work in parallel.';

const logger = createLogger(import.meta.dirname);
const client = createClient();

// 没有终端可问 y/N：默认拒绝，S13_ALLOW=1 时一律放行。
// 队友那侧本来就不读终端，这里管的是 Lead 自己的工具调用。
const autoAnswer = process.env.S13_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S13_ALLOW=1）" : "拒绝（设 S13_ALLOW=1 可放行）"}`,
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
// 团队状态（邮箱 + 任务板 + 队友注册表）落在本章 session 目录，跨轮复用。
const team = createTeamState(import.meta.dirname, logger);
const history: Anthropic.MessageParam[] = [];

async function turn(text?: string): Promise<void> {
  if (text !== undefined) {
    logger.userInput(text);
    print(`s13 >> ${text}`, "cyan");
    await hooks.trigger("UserPromptSubmit", text);
    history.push({ role: "user", content: text });
  }
  print(await agentLoop(history, { client, logger, hooks, team }), "green");
}

await turn(query);

if (!argvQuery) {
  // 确认之后才 spawn —— 这一步就是 README 第 1 节的「先提方案再派人」。
  await turn("go ahead.");

  // 队友是游离的 async 循环，结果经文件邮箱回流。轮询 Lead 收件箱，
  // 有事件就当成新一轮喂回去；连续 60s 没有新事件就收工。
  const quietLimitMs = 60_000;
  const hardDeadline = Date.now() + 300_000;
  let lastEventAt = Date.now();
  while (Date.now() - lastEventAt < quietLimitMs && Date.now() < hardDeadline) {
    const inbox = consumeLeadInbox(team, logger);
    if (!inbox.length) {
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }
    lastEventAt = Date.now();
    history.push({ role: "user", content: formatTeamEvents(inbox) });
    logger.console(`  [team auto] ${inbox.length} event(s)`, "yellow");
    await turn();
  }
}
