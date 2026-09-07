// 实现 run_s2.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'use glob to list the *.ts files in s02_tool_use, then read s02_tool_use/main.ts with limit 5\n' \
//     | pnpm dev s02_tool_use/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop 或某个 tool handler 里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s02_tool_use/run_main_non_interactive.ts "write .tmp/a.txt with content hi"

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
  process.argv.slice(2).join(" ").trim() ||
  "use glob to list the *.ts files in s02_tool_use, then read s02_tool_use/main.ts with limit 5";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s02 >> ${query}`, "cyan");

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(await agentLoop(history, { client: createClient(), logger }), "green");
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
