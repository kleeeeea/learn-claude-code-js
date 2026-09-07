// 实现 `pnpm dev s17_goal_loop/main.ts "<goal>"` 的效果， 可以直接在webstorm debug
//
// s17 的 main.ts 本来就有一次性模式（命令行给 goal，跑完退出），但它仍然会建
// readline（confirm 要用），管道/EOF 的时机不好控；这份入口不建 readline：
// 自己拼 GoalController + GoalSession，submit 一次就退出。
// 断点打在 GoalController.decide、PromptGoalEvaluator 或 GoalSession.submit 上最合适。
//
// 两个环境变量沿用 main.ts 的语义：
//   MAX_TURNS                          主循环全局出口，0 或非法值表示不限
//   CLAUDE_CODE_STOP_HOOK_BLOCK_CAP    Stop 位置最多被判断器拦几次
//
// 换一个目标：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s17_goal_loop/run_main_non_interactive.ts "count the .ts files in lib/ and report the number"

import path from "node:path";
import { createLogger } from "../lib/logger";
import { print, printError, printFinal } from "../lib/terminal";

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
  DEFAULT_STOP_HOOK_BLOCK_CAP,
  EVALUATOR_MAX_TOKENS,
  evaluatorModelId,
  GoalController,
  GoalSession,
  PromptGoalEvaluator,
} = await import("./main");
// hook 装配来自 s04：它的 loadHooks 收一个 confirm（关卡 3 的 y/N）。
const { loadHooks } = await import("../s04_hooks/main");
const { logPermission } = await import("../s03_permission/main");

const goalText =
  process.argv.slice(2).join(" ").trim() ||
  "count the .ts files in lib/ and report the number";

const logger = createLogger(import.meta.dirname);
const client = createClient();

// 没有终端可问 y/N：默认拒绝，S17_ALLOW=1 时一律放行。
const autoAnswer = process.env.S17_ALLOW === "1";
const hooks = loadHooks(logger, async (call, warning) => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S17_ALLOW=1）" : "拒绝（设 S17_ALLOW=1 可放行）"}`,
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
});

// 同 main.ts：0 或非法值表示不限。
function positiveEnv(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isInteger(raw) && raw > 0 ? raw : fallback;
}

// 判断器单独用一路 logger 与模型，收发和花费在 transcript 里和主循环分开看。
const goal = new GoalController(
  new PromptGoalEvaluator(
    client,
    evaluatorModelId(),
    EVALUATOR_MAX_TOKENS,
    logger.child("evaluator"),
  ),
  positiveEnv("CLAUDE_CODE_STOP_HOOK_BLOCK_CAP", DEFAULT_STOP_HOOK_BLOCK_CAP),
  [],
  logger,
);

const session = new GoalSession({
  client,
  logger,
  hooks,
  goal,
  maxTurns: positiveEnv("MAX_TURNS", 0) || null,
});

logger.userInput(goalText);
print(`s17 >> ${goalText}`, "cyan");

try {
  const result = await session.submit(goalText);
  // 「这次为什么停」由 runQuery 在做决定时就写进 transcript，这里补一行看得见的。
  print(`[${result.status}] ${result.reason}`, "yellow");
  if (result.text) printFinal(result.text);
} catch (e) {
  printError(e);
  process.exitCode = 1;
}
