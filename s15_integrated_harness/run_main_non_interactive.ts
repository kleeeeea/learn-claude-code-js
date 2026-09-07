// 实现 run_s15.sh:8-11 的效果， 可以直接在webstorm debug
//
//   { printf 'read README.md and tell me what this repo is.\n'; sleep 60;
//     printf 'q\n'; } | pnpm dev s15_integrated_harness/main.ts
//
// 那个脚本必须让 stdin 一直开着：s15 的提示符是常驻的（事件队列 + createPrompt），
// 这一轮还没跑完 stdin 就 EOF 的话，输出会去重画一个已关闭的 readline 而崩。
// 这份入口干脆不建 readline —— 自己拼一份 runHostCli 里那套依赖，跑一轮就退出。
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 跨轮状态（.tasks / .mailboxes / .transcripts / .task_outputs / .scheduled_tasks.json）
// 会留在本章目录，想干净起步先手动删（脚本不替你删）。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s15_integrated_harness/run_main_non_interactive.ts "run pwd in the background"

import fs from "node:fs";
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
// main.ts 的 runHostCli 由 import.meta.main 守着，被 import 时不会启动。
const { agentLoop } = await import("./main");
// 这一章是集大成：各层依赖都从它们各自的源头拿（跟 runHostCli 里一模一样）。
const { loadSkills, SKILLS_DIR } = await import("../s07_skill_loading/main");
const { MEMORY_DIR } = await import("../s09_memory/main");
const { BackgroundManager, stopBackgroundProcesses } = await import(
  "../s11_background_tasks/main"
);
const { createCronState, loadDurableJobs, startCronScheduler } = await import(
  "../s12_cron_scheduler/main"
);
const { createTeamState } = await import("../s13_agent_teams/main");
const { createMcpState, loadMcpHooks } = await import("../s14_mcp_plugin/main");
const { logPermission } = await import("../s03_permission/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "read README.md and tell me what this repo is.";

const sessionDir = import.meta.dirname;
const logger = createLogger(sessionDir);
const client = createClient();

// 没有终端可问 y/N：默认拒绝，S15_ALLOW=1 时一律放行
//（对应 runHostCli 里「异步轮不能占用主终端」的 denyInteractive）。
const autoAnswer = process.env.S15_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S15_ALLOW=1）" : "拒绝（设 S15_ALLOW=1 可放行）"}`,
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

const mcp = createMcpState();
const skills = loadSkills(SKILLS_DIR, logger);
const team = createTeamState(sessionDir, logger);
const cron = createCronState(sessionDir);
const background = new BackgroundManager();
fs.mkdirSync(MEMORY_DIR, { recursive: true });

const hooks = loadMcpHooks(logger, confirm, mcp);

loadDurableJobs(cron, logger);
startCronScheduler(cron, logger);

logger.userInput(query);
print(`s15 >> ${query}`, "cyan");
await hooks.trigger("UserPromptSubmit", query);

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, {
    client,
    logger,
    hooks,
    skills,
    team,
    cron,
    mcp,
    background,
    memoryDir: MEMORY_DIR,
    sessionDir,
    // 本轮的用户原话：压缩时单独成段，模型只服从这一段。
    activeRequest: query,
  }),
  "green",
);

// 还在跑的后台命令会 ref 住事件循环，退出前主动停掉（同 runHostCli 收尾）。
stopBackgroundProcesses();
