/**
 * s01_agent_loop/main.ts - Agent 循环
 *
 * AI 编程 agent 的全部秘密就在这一个模式里：
 *
 *     while true:
 *         result = LLM(messages, tools)
 *         if result 里没有 tool_use block:
 *             break
 *         execute tools
 *         append results
 *
 *     +----------+      +-------+      +---------+
 *     |   User   | ---> |  LLM  | ---> |  Tool   |
 *     |  prompt  |      |       |      | execute |
 *     +----------+      +---+---+      +----+----+
 *                           ^               |
 *                           |   tool result |
 *                           +---------------+
 *                           (loop continues)
 *
 * 这就是核心循环：把工具执行结果喂回给模型，
 * 直到模型自己决定停止。后面的章节会围绕它
 * 加上策略、hooks 和生命周期控制。
 *
 * Anthropic SDK 的 messages.create 本来就只返回 tool_use 块、不执行工具，
 * 循环控制权天然在这份代码里——这就是 s01 要讲的道理。
 *
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import * as readline from "node:readline/promises";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createLogger, type SessionLogger } from "../lib/logger";
import type { ModelClient } from "../lib/model";
import { colorize, print } from "../lib/terminal";
import { hasToolUse, preview, printProse, textOf, zodTool } from "../lib/tools";

// ── .env 自带加载 ──────────────────────────────────
// 直接运行这份文件时先把仓库根的 .env 读进 process.env，
// 于是 run config / pnpm dev 不必再传 --env-file-if-exists=.env。
// loadEnvFile 与那个参数同语义：已有的环境变量优先，.env 只补空缺。
// 顺序是关键：lib/model 的 MODEL_ID 是 import 时求值的 const，而静态 import
// 全部先于模块体执行，所以这里用动态 import 把 lib/model 推到 .env 之后。
// 被 main.test.ts import 时 import.meta.main 为 false，测试照旧不碰 .env。
if (import.meta.main) {
  try {
    process.loadEnvFile(path.join(import.meta.dirname, "..", ".env"));
  } catch {
    // 没有 .env 就直接用真实环境变量，跟 -if-exists 一样不报错
  }
}
const { createClient, MODEL_ID } = await import("../lib/model");

const SYSTEM = `You are a coding agent at ${process.cwd()}. Use bash to solve tasks. Act, don't explain.`;

// ── 工具定义：只有 bash ────────────────────────────
export const bashSchema = z.object({ command: z.string() });
const tools: Anthropic.Tool[] = [
  zodTool("bash", "Run a shell command.", bashSchema),
];

// ── 工具执行 ────────────────────────────────────────
export function runBash(command: string, timeoutMs = 120_000): string {
  if (isDangerous(command)) {
    return "Error: Dangerous command blocked";
  }
  const r = spawnSync(command, {
    shell: true,
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: timeoutMs,
  });
  if (r.error) {
    const code = (r.error as NodeJS.ErrnoException).code;
    if (code === "ETIMEDOUT")
      return `Error: Timeout (${Math.round(timeoutMs / 1000)}s)`;
    return `Error: ${r.error.message}`;
  }
  const out = ((r.stdout ?? "") + (r.stderr ?? "")).trim();
  return out ? out.slice(0, 50_000) : "(no output)";
}
// 在执行前拦截几个明显有破坏性的 command
export function isDangerous(command: string): boolean {
  const dangerous = [
    "rm -rf /",
    "sudo",
    "shutdown",
    "reboot",
    "> /dev/",
    "osascript",
  ];
  return dangerous.some((d) => command.includes(d));
}

export type Deps = { client: ModelClient; logger: SessionLogger };
// ── 核心模式：一个 while loop，不断调用 tool 直到 model 停止 ──
export async function agentLoop(
  messages: Anthropic.MessageParam[],
  deps: Deps,
): Promise<string> {
  const { client, logger } = deps;
  while (true) {
    logger.request(messages);
    const response = await client.messages.create({
      model: MODEL_ID,
      system: SYSTEM,
      messages,
      tools,
      max_tokens: 8000,
    });
    logger.response(response);

    // 追加 assistant 这一轮（包含所有 tool-call block）
    messages.push({ role: "assistant", content: response.content });

    // 如果 model 没有调用 tool，就结束
    if (!hasToolUse(response)) {
      return textOf(response);
    }

    // 逐个执行 tool call，收集结果
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      // 一轮响应里 text / thinking / tool_use 可能同时出现
      printProse(block);
      if (block.type !== "tool_use") continue;

      /*
        block 结构
        {
          "type": "tool_use",
          "id": "call_00_e3IosLtwiBk4IpGPy0QC7370",
          "name": "bash",
          "input": {
            "command": "node --version"
          }
        }
      */
      const input = bashSchema.parse(block.input);

      // 执行 command，并记录 output 的简短预览
      const output = runBash(input.command);
      print(preview(output), "gray");
      logger.toolResult(input.command, output);

      // 用 tool_use_id 把结果配对，让 model 能对应上
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: output,
      });
    }

    // 把 tool 结果喂回去，loop 继续
    messages.push({ role: "user", content: results });
  }
}

// ── 入口 ──────────────────────────────────────────
// import.meta.main 只在文件被直接运行时为 true。
if (import.meta.main) {
  // configure this based on /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/credential
  const client = createClient();
  const logger = createLogger(import.meta.dirname);
  logger.config({ model: MODEL_ID, system: SYSTEM, tools });

  print("s01: Agent Loop", "cyan");
  print("输入问题，回车发送。输入 q 退出。\n", "green");

  // 从 terminal 逐行读取用户输入
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // Ctrl+C 时干净退出
  rl.on("SIGINT", () => {
    rl.close();
    process.exit(0);
  });

  const history: Anthropic.MessageParam[] = [];
  while (true) {
    let query: string;
    try {
      // 提示输入下一个问题（cyan 颜色的提示文字）
      query = await rl.question(colorize("s01 >> ", "cyan"));
    } catch {
      break; // stdin 关闭（Ctrl+D）
    }
    const q = query.trim().toLowerCase();
    if (q === "" || q === "q" || q === "exit") break;
    logger.userInput(query);

    // 保留完整对话，让每一轮都有之前的 context
    history.push({ role: "user", content: query });
    // 运行 agent loop，直到 model 不再调用 tool
    const finalText = await agentLoop(history, { client, logger });
    print(finalText, "green");
    print();
  }

  rl.close();
}
