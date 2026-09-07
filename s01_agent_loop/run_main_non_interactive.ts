// 实现 run_s1.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'run node --version and report it\n' | pnpm dev s01_agent_loop/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop 里也不方便；这份入口把同一句话
// 直接当成一轮 user 消息交给 agentLoop，跑完就退出：没有 readline、没有管道，
// WebStorm 里点 Debug 就能停在断点上。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s01_agent_loop/run_main_non_interactive.ts "list the files here"

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
const { agentLoop } = await import("./main");

const query =
  process.argv.slice(2).join(" ").trim() || "run node --version and report it";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s01 >> ${query}`, "cyan");

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(await agentLoop(history, { client: createClient(), logger }), "green");
//https://chatgpt.com/c/6a99720e-6924-83ea-9d9f-c070770c7d69
