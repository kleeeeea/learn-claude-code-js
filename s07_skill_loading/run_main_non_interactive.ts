// 实现 run_s7.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'load the code-review skill and tell me in one sentence what its workflow is\n' \
//     | pnpm dev s07_skill_loading/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop、scanSkills 或 load_skill 的 handler
// 里都不方便；这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 注意工作目录：SKILLS_DIR 跟着 process.cwd() 走，必须在仓库根跑，
// 否则技能目录是空的（SYSTEM 里会是 "(no skills found)"）。
// 生成的 run config 用的是 working-dir="$PROJECT_DIR$"，已经满足这一条。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s07_skill_loading/run_main_non_interactive.ts "load the skill called pdf-tools and tell me what it does"

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
const { agentLoop, buildSystem, loadSkills, SKILLS_DIR } = await import(
  "./main"
);
// hook 装配沿用 s05 的那份（s07 的 main.ts 也是从那里 import 的，不再复制一遍）。
const { loadHooks } = await import("../s05_todo_write/main");

const query =
  process.argv.slice(2).join(" ").trim() ||
  "load the code-review skill and tell me in one sentence what its workflow is";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s07 >> ${query}`, "cyan");

// 两级加载的第一级：扫 skills/*/SKILL.md 建 registry（顺带写 SKILL CATALOG 一节），
// 再把「名称 + 一行描述」拼进 SYSTEM。正文要等模型调 load_skill 才进上下文。
const skills = loadSkills(SKILLS_DIR, logger);
const system = buildSystem(skills);

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
  }),
  "green",
);
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
