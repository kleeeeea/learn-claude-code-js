// 实现 run_s9.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'I prefer tabs over spaces for indentation in all my projects. Remember that.\n' \
//     | pnpm dev s09_memory/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop、recallMemories 或 extractMemories
// 里都不方便；这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 默认这句换成了「本项目的测试用 vitest」，不是 run_s9.sh 里那句「所有项目都用 tab」：
// 后者会引着模型去改 ~/.claude/CLAUDE.md 这类仓库外的全局配置（真发生过）。
// 提取记忆这条路径两句都能走通，这句的副作用小。
//
// 注意工作目录：MEMORY_DIR 是 process.cwd()/.memory，必须在仓库根跑；
// 想要 catalog 是 (none) 的干净起点，先手动 rm -rf .memory（脚本不替你删）。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s09_memory/run_main_non_interactive.ts "what do you remember about this project?"

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
// main.ts 的 REPL 由 import.meta.main 守着，被 import 时不会启动。
const { agentLoop, MEMORY_DIR } = await import("./main");
// 技能层来自 s07，hook 装配来自 s05（s09 的 main.ts 也是从那里 import 的）。
const { loadSkills, SKILLS_DIR } = await import("../s07_skill_loading/main");
const { loadHooks } = await import("../s05_todo_write/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "this project runs its tests with vitest, not jest. Remember that.";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s09 >> ${query}`, "cyan");

const skills = loadSkills(SKILLS_DIR, logger);
// 记忆目录不存在时先建出来，跟 main.ts 的入口一致。
fs.mkdirSync(MEMORY_DIR, { recursive: true });

const hooks = loadHooks(logger);

// UserPromptSubmit 在 agent 循环之外触发，每轮用户输入只跑一次 —— 与 main.ts 的
// REPL 保持一致，否则 contextInjectHook 那行不会出现。
await hooks.trigger("UserPromptSubmit", query);

// s09 的 SYSTEM 由 agentLoop 自己按「技能目录 + 召回的记忆」每轮重拼，
// 所以 Deps 里没有 system，只给 skills / memoryDir / sessionDir。
const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, {
    client: createClient(),
    logger,
    hooks,
    skills,
    memoryDir: MEMORY_DIR,
    sessionDir: import.meta.dirname,
  }),
  "green",
);
