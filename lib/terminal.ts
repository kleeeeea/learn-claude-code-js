// lib/terminal.ts - 终端输出：ANSI 上色、彩色打印、可与异步输出共存的提示符

import path from "node:path";
import { clearLine, cursorTo } from "node:readline";

// 全项目配色约定（各 sNN 的 print/colorize 都按这套走）：
//   cyan    — 会话标题/横幅、输入提示符 >>、进行中标记 ▸
//   green   — 助手正式回复/最终输出、欢迎语、tool_use 前的铺垫文字、完成标记 ✓
//   blue    — thinking 推理独白
//   magenta — 子 agent 事件（spawned/done）
//   yellow  — 警告 ⚠、命令回显、任务清单标题
//   red     — 错误 / 权限拦截 ⛔
//   gray    — console 日志输出（hook 调试信息等次要文本）
//   white   — 暂未使用
export type Color =
  | "gray"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white";

const ANSI: Record<Color, string> = {
  gray: "\x1b[38;5;245m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const RESET = "\x1b[0m";

// Wrap text in an ANSI color code, resetting at the end.
export function colorize(text: string, color: Color): string {
  return `${ANSI[color]}${text}${RESET}`;
}

// 调用点回溯：项目里所有输出都走 print，所以 IDE console 的行号链接永远指向
// print 里的那句 console.log，看不出是谁打的。这里从 stack 里取调用方，
// 作为灰色前缀打在每行前面（形如 s01_agent_loop/main.ts:153）。
// 层数由 PRINT_CALL_SITE 控制，默认开一层：
//   PRINT_CALL_SITE=0  关掉，输出回到纯净的课程原样
//   PRINT_CALL_SITE=3  显示最近三层，用 ← 连接，看得到完整调用链
// 写在 .env 里对所有章节和 WebStorm run config 都生效。
const CALL_SITE_DEPTH = Number.parseInt(process.env.PRINT_CALL_SITE ?? "", 10);
// 没设或设了非数字都按默认的一层走。
const CALL_SITE_DEFAULT_DEPTH = 3;
const callSiteDepth = Number.isNaN(CALL_SITE_DEPTH)
  ? CALL_SITE_DEFAULT_DEPTH
  : CALL_SITE_DEPTH;

// V8 stack 的一行：`    at fn (/abs/path/file.ts:12:34)` 或 `    at /abs/path/file.ts:12:34`。
// 路径必须紧跟在 `(`、空白或行首之后，`node:internal/process/task_queues:103:5`
// 这类 node 内部帧才不会被从中间截出一个假路径来。
const STACK_FRAME = /(?:\(|\s|^)(?:file:\/\/)?(\/[^\s()]+):(\d+):\d+\)?$/;
const REPO_ROOT = path.join(import.meta.dirname, "..");

// 取调用方的前 depth 层，格式化成相对仓库根的 file:line（IDE 里可点）。
// tsx 会装 source-map 支持，所以 stack 字符串里已经是 .ts 的真实行号。
function callSite(depth: number): string {
  // 第一行是 "Error"，从第二行开始才是帧；本文件内的帧（print / printError /
  // printFinal）和 node_modules 都跳过，剩下的才是真正发起打印的业务代码。
  const frames = new Error().stack?.split("\n").slice(1) ?? [];
  const sites: string[] = [];
  for (const frame of frames) {
    const match = STACK_FRAME.exec(frame.trim());
    if (!match) continue;
    const [, file, line] = match;
    if (file === import.meta.filename || file.includes("/node_modules/")) {
      continue;
    }
    sites.push(`${path.relative(REPO_ROOT, file)}:${line}`);
    if (sites.length >= depth) break;
  }
  return sites.join(" \u2190 ");
}

// console.log with an optional color.
export function print(message = "", color?: Color): void {
  // 这里的代码位置永远是 lib/terminal.ts:44， 能不能把具体调用 （就是stacktrace前面几层） 位置也打出来？
  const text = color ? colorize(message, color) : message;
  const site = callSiteDepth > 0 ? callSite(callSiteDepth) : "";
  console.log(site ? `${colorize(site, "gray")} ${text}` : text);
}

// readline（promises 版）接口里提示符所需的方法。
export interface PromptTarget {
  setPrompt(prompt: string): void;
  prompt(preserveCursor?: boolean): void;
  question(query: string): Promise<string>;
}

// 提示符句柄：ask 问一行，show 把提示符挂到屏幕底部，hide 擦掉，
// detach 还原 console.log。
export interface PromptHandle {
  ask(): Promise<string>;
  show(): void;
  hide(): void;
  detach(): void;
}

// 让提示符与异步输出共存：接管 console.log，输出前擦掉提示符行，输出后把提示符
// 和已输入的内容重画到底部。项目里所有终端输出都走 print / logger.console，
// 也就都走 console.log，所以只需在这一个点上包一层。
// text 传纯文本（如 "s15 >> "），按配色约定统一上 cyan。
export function createPrompt(rl: PromptTarget, text: string): PromptHandle {
  const prompt = colorize(text, "cyan");
  rl.setPrompt(prompt);
  const write = console.log;
  const tty = process.stdout.isTTY === true;
  let visible = false;

  function erase(): void {
    if (!tty) return;
    cursorTo(process.stdout, 0);
    clearLine(process.stdout, 0);
  }

  console.log = (...args: unknown[]): void => {
    if (!visible) {
      write(...args);
      return;
    }
    erase();
    write(...args);
    rl.prompt(true);
  };

  return {
    // 顺序循环用：画出提示符 → 等一行输入 → 收起（等待期间的异步输出走重画）。
    async ask(): Promise<string> {
      visible = true;
      try {
        return await rl.question(prompt);
      } finally {
        visible = false;
      }
    },
    show(): void {
      visible = true;
      rl.prompt(true);
    },
    hide(): void {
      if (!visible) return;
      visible = false;
      erase();
    },
    detach(): void {
      visible = false;
      console.log = write;
    },
  };
}

// Print an error (or any thrown value) in red, with an optional context prefix.
export function printError(error: unknown, context?: string): void {
  const message = error instanceof Error ? error.message : String(error);
  print(context ? `${context}: ${message}` : message, "red");
}

export function printFinal(message: string): void {
  print(`🤖 ${message}`, "green");
}
