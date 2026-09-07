// 实现 `pnpm dev s16_workflow_runtime/main.ts demo` 的效果， 可以直接在webstorm debug
//
// s16 没有自己的 agentLoop：交互模式整套复用 s15 的 runHostCli，只多传一个
// extraPool 把 Workflow 叠进工具池。所以这份入口分两档：
//
//   不传参数        → runDemo：确定性 runner，不打真实 API，几秒跑完，
//                     断点打在 WorkflowRuntime / journal / 快照那几处最合适。
//   传了参数        → 走 s15 的 agentLoop，工具池里带上 workflow，
//                     由模型自己决定要不要发那一次 tool_use（要真实 API key）。
//
// 想看断点续跑：先跑一次默认的 demo，再传 "resume" 跑第二次。
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 例：node --import tsx s16_workflow_runtime/run_main_non_interactive.ts resume
//     node --import tsx s16_workflow_runtime/run_main_non_interactive.ts "review the recent changes with the workflow tool"

import fs from "node:fs";
import path from "node:path";
import type Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "../lib/logger";
import { print, printError } from "../lib/terminal";

// 与 main.ts 同一个理由：静态 import 全部先于模块体执行，而 lib/model 的
// MODEL_ID 是 import 期求值的 const，所以 .env 必须赶在动态 import 之前读进来。
try {
  process.loadEnvFile(path.join(import.meta.dirname, "..", ".env"));
} catch {
  // 没有 .env 就直接用真实环境变量
}

const { createClient, MODEL_ID } = await import("../lib/model");
// main.ts 的入口由 import.meta.main 守着，被 import 时不会启动。
const {
  AnthropicAgentRunner,
  createWorkflowRuntime,
  readLastRun,
  runDemo,
  workflowToolPool,
} = await import("./main");

const argv = process.argv.slice(2).join(" ").trim();
const sessionDir = import.meta.dirname;
const logger = createLogger(sessionDir);

// ── 档位 1：确定性 demo（默认），不需要 API key ──────
if (!argv || argv === "demo" || argv === "resume") {
  const runtime = createWorkflowRuntime(sessionDir, { logger });
  let resumeId: string | undefined;
  if (argv === "resume") {
    resumeId = readLastRun(runtime.store) ?? undefined;
    if (!resumeId) {
      print("nothing to resume; 先跑一次默认的 demo。", "yellow");
      process.exit(0);
    }
  }
  try {
    await runDemo(runtime, resumeId);
  } catch (e) {
    // 快照 / journal / 锁的问题收成一行，不甩一整段 Node 栈。
    printError(e);
    process.exitCode = 1;
  }
} else {
  // ── 档位 2：真实一轮，workflow 作为一个工具挂在 s15 的工具池后面 ──
  const { agentLoop } = await import("../s15_integrated_harness/main");
  const { loadSkills, SKILLS_DIR } = await import("../s07_skill_loading/main");
  const { MEMORY_DIR } = await import("../s09_memory/main");
  const { BackgroundManager, stopBackgroundProcesses } = await import(
    "../s11_background_tasks/main"
  );
  const { createCronState } = await import("../s12_cron_scheduler/main");
  const { createTeamState } = await import("../s13_agent_teams/main");
  const { createMcpState, loadMcpHooks } = await import(
    "../s14_mcp_plugin/main"
  );
  const { logPermission } = await import("../s03_permission/main");

  const client = createClient();

  // 没有终端可问 y/N：默认拒绝，S16_ALLOW=1 时一律放行。
  const autoAnswer = process.env.S16_ALLOW === "1";
  const confirm = async (
    call: Anthropic.ToolUseBlock,
    warning: string,
  ): Promise<boolean> => {
    print(`\n[permission] ${warning}`, "yellow");
    print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
    print(
      `   非交互模式，自动${autoAnswer ? "放行（S16_ALLOW=1）" : "拒绝（设 S16_ALLOW=1 可放行）"}`,
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
  const hooks = loadMcpHooks(logger, confirm, mcp);
  fs.mkdirSync(MEMORY_DIR, { recursive: true });

  // workflow 的子 agent 与宿主用同一个真实 client 和同一份日志。
  const extraPool = workflowToolPool(
    createWorkflowRuntime(sessionDir, {
      logger,
      createRunner: () => new AnthropicAgentRunner(client, MODEL_ID),
    }),
  );

  logger.userInput(argv);
  print(`s16 >> ${argv}`, "cyan");
  await hooks.trigger("UserPromptSubmit", argv);

  const history: Anthropic.MessageParam[] = [{ role: "user", content: argv }];
  print(
    await agentLoop(history, {
      client,
      logger,
      hooks,
      skills: loadSkills(SKILLS_DIR, logger),
      team: createTeamState(sessionDir, logger),
      cron: createCronState(sessionDir),
      mcp,
      background: new BackgroundManager(),
      memoryDir: MEMORY_DIR,
      sessionDir,
      activeRequest: argv,
      extraPool,
    }),
    "green",
  );

  stopBackgroundProcesses();
}
