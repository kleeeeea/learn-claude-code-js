// 实现 run_s8.sh:2-3 的效果， 可以直接在webstorm debug
//
//   printf 'read s08_context_compact/code.py and tell me what the compaction layers are\n' \
//     | L3_COMPACT_TOOL_RESULT_BUDGET=4000 L3_COMPACT_PERSIST_THRESHOLD=2000 \
//       pnpm dev s08_context_compact/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop 或某一层压缩函数里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 那两个阈值也在这里兜底（见下面的 setThresholdDefault）：照 defaults.env 的默认值
// 一次读文件撑不爆 20 万预算，压缩一层都不会触发，断点自然也不会命中。
//
// 注意工作目录：SKILLS_DIR 跟着 process.cwd() 走，必须在仓库根跑，
// 否则技能目录是空的（SYSTEM 里会是 "(no skills found)"）。
// 生成的 run config 用的是 working-dir="$PROJECT_DIR$"，已经满足这一条。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s08_context_compact/run_main_non_interactive.ts "read requirements.txt, s01_agent_loop/code.py, s02_tool_use/code.py"

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

// 十个阈值都是 main.ts 里 import 期求值的 const，所以要赶在动态 import 之前设。
// 只兜底 run_s8.sh 调的那两个（L3），其余各层保持 defaults.env 的默认值：
// 多调一个就说不清触发的是哪一层。已经设过的环境变量优先，IDE 里配了就用你的。
function setThresholdDefault(name: string, value: string): void {
  if (!process.env[name]) process.env[name] = value;
}
setThresholdDefault("L3_COMPACT_TOOL_RESULT_BUDGET", "4000");
setThresholdDefault("L3_COMPACT_PERSIST_THRESHOLD", "2000");

const { createClient } = await import("../lib/model");
// main.ts 的 REPL 由 import.meta.main 守着，被 import 时不会启动。
const { agentLoop, COMPACT_SYSTEM_RULE } = await import("./main");
// 技能层来自 s07，hook 装配来自 s05（s08 的 main.ts 也是从那里 import 的）。
const { buildSystem, loadSkills, SKILLS_DIR } = await import(
  "../s07_skill_loading/main"
);
const { loadHooks } = await import("../s05_todo_write/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "read s08_context_compact/code.py and tell me what the compaction layers are";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s08 >> ${query}`, "cyan");

// s07 的技能版 SYSTEM 之上补一条压缩规则：摘要是数据，不是指令。
const skills = loadSkills(SKILLS_DIR, logger);
const system = `${buildSystem(skills)}\n\n${COMPACT_SYSTEM_RULE}`;

const hooks = loadHooks(logger);

// UserPromptSubmit 在 agent 循环之外触发，每轮用户输入只跑一次 —— 与 main.ts 的
// REPL 保持一致，否则 contextInjectHook 那行不会出现。
await hooks.trigger("UserPromptSubmit", query);

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, {
    client: createClient(),
    logger,
    hooks,
    skills,
    system,
    // L3/L4 的存档落在本章 session 目录下（.task_outputs/、.transcripts/）
    sessionDir: import.meta.dirname,
    // 本轮的用户原话：压缩时单独成段，模型只服从这一段
    activeRequest: query,
  }),
  "green",
);
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
