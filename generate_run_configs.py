#!/usr/bin/env python3
"""generate_run_configs.py - 为 s01..s17 每章的 main.ts 生成 WebStorm run config

每章目录形如 sXX_some_name/main.ts，对应生成一份
.idea/runConfigurations/sXX_some_name__tsx_.xml，格式跟着 s01 那份手写的走：
tsx + --env-file-if-exists=.env，working dir 用 $PROJECT_DIR$。

幂等：重复跑会用同样内容覆盖已有文件，不会重复累加。
用法：
    python3 generate_run_configs.py
"""

from pathlib import Path
import re

REPO_ROOT = Path(__file__).resolve().parent
RUN_CONFIG_DIR = REPO_ROOT / ".idea" / "runConfigurations"

TEMPLATE = """<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="{display_name}" type="NodeJSConfigurationType"
                 application-parameters=""
                 path-to-js-file="{main_ts_rel}"
                 working-dir="$PROJECT_DIR$"
                 node-parameters="--import tsx --env-file-if-exists=.env">
    <method v="2" />
  </configuration>
</component>
"""


def display_name(dirname: str) -> str:
    # s01_agent_loop -> "s01 agent loop (tsx)"
    return f"{dirname.replace('_', ' ')} (tsx)"


def config_filename(dirname: str) -> str:
    # s01_agent_loop -> s01_agent_loop__tsx_.xml（跟 s01 现有文件名对齐）
    return f"{dirname}__tsx_.xml"


def entry_files(chapter_dir: Path) -> list[Path]:
    # main.ts 是每章的主入口；run_*.ts 是额外的可运行入口
    # （如 s01 的 run_main_non_interactive.ts：不用管道就能在 IDE 里 Debug）。
    extras = sorted(p for p in chapter_dir.glob("run_*.ts") if not p.name.endswith(".test.ts"))
    return [chapter_dir / "main.ts", *extras]


def main() -> None:
    RUN_CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    chapter_dirs = sorted(
        p for p in REPO_ROOT.glob("s[0-9][0-9]_*")
        if p.is_dir() and (p / "main.ts").exists()
    )

    if not chapter_dirs:
        print("没找到任何 sXX_*/main.ts，什么都没生成。")
        return

    written = []
    for chapter_dir in chapter_dirs:
        dirname = chapter_dir.name
        for entry in entry_files(chapter_dir):
            # main.ts 用章节名；run_xxx.ts 再缀上文件名，避免撞车
            stem = dirname if entry.name == "main.ts" else f"{dirname}_{entry.stem}"
            xml = TEMPLATE.format(
                display_name=display_name(stem),
                main_ts_rel=f"{dirname}/{entry.name}",
            )
            out_path = RUN_CONFIG_DIR / config_filename(stem)
            out_path.write_text(xml)
            written.append(out_path.relative_to(REPO_ROOT))

    print(f"生成/覆盖了 {len(written)} 份 run config：")
    for p in written:
        print(f"  {p}")
    print("\nWebStorm 里 File → Reload All from Disk 后即可在 Run Configurations 下拉里看到。")


if __name__ == "__main__":
    main()
