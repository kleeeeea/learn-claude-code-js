// 实现 run_s3.sh:2 的效果， 可以直接在webstorm debug
//
//   printf 'run this exact command: sudo ls\n' | pnpm dev s03_permission/main.ts
//
// 那条命令靠管道喂 stdin，断点打在 agentLoop 或 checkPermission 里都不方便；
// 这份入口把同一句话直接当成一轮 user 消息交给 agentLoop，跑完就退出：
// 没有 readline、没有管道，WebStorm 里点 Debug 就能停在断点上。
//
// 换一句话问：WebStorm 的 Program arguments（或命令行）传参即可，例如
//   node --import tsx s03_permission/run_main_non_interactive.ts "delete the file .tmp/note.txt"

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
const { agentLoop, logPermission } = await import("./main");

const query =
  process.argv.slice(2).join(" ").trim() || "run this exact command: sudo ls";

const logger = createLogger(import.meta.dirname);
logger.userInput(query);
print(`s03 >> ${query}`, "cyan");

// s03 的 Deps 比 s01 多一个 confirm（关卡 3）。这里没有终端可问，
// 所以注入一个不问人的实现：默认拒绝，S03_ALLOW=1 时一律放行。
// 关卡 1（deny list）和关卡 2 不经过它，run_s3.sh 那句 sudo ls 走的就是关卡 1。
const autoAnswer = process.env.S03_ALLOW === "1";
const confirm = async (
  call: Anthropic.ToolUseBlock,
  warning: string,
): Promise<boolean> => {
  print(`\n[permission] ${warning}`, "yellow");
  print(`   Tool: ${call.name}(${JSON.stringify(call.input)})`);
  print(
    `   非交互模式，自动${autoAnswer ? "放行（S03_ALLOW=1）" : "拒绝（设 S03_ALLOW=1 可放行）"}`,
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

const history: Anthropic.MessageParam[] = [{ role: "user", content: query }];
print(
  await agentLoop(history, { client: createClient(), logger, confirm }),
  "green",
);
//https://chatgpt.com/s/t_6a9aabd1c8a881918cbeba22beffe840
// https://chatgpt.com/s/t_6a9ab1c67a5881918ca586dde02ba7ec
