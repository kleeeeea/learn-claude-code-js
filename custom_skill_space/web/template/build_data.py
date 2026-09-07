#!/usr/bin/env python3
"""build_data.py - 给 web/template 生成两份数据。

    assets/data/standards.json  课标图谱：385 个节点 + 结构推导出的演化边
    assets/data/apps.json       下游应用：5 个 L1 分类 / 15 个 L2 用例及其真实运行结果

来源：
    ../../math-standards/references/standards.csv       课标全量
    ../../result/<run>/<id>/{metadata.json,response.md} 运行结果（默认取最新一次 run）

边是**结构推导**的，不是课标文件里本来就有的（原始表格只有六列、没有关系）：
    progression  同一 domain、相邻年级之间 —— 纵向进阶
    cluster      同一 cluster 内相邻编号 —— 同簇并列
    bridge       8 年级 -> 高中概念类别，按 domain 映射表连接
这一点在页面上明确标注，避免让人以为课标原文里有这些边。

用法：
    python build_data.py                 # 用最新一次 result run
    python build_data.py --run 20260907T115228
"""

from __future__ import annotations

import argparse
import csv
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
SPACE_DIR = HERE.parent.parent                     # custom_skill_space/
STANDARDS_CSV = SPACE_DIR / "math-standards" / "references" / "standards.csv"
RESULT_ROOT = SPACE_DIR / "result"
OUT_DIR = HERE / "assets" / "data"

# 8 年级 -> 高中概念类别的桥接：按编号前缀里的 domain 缩写映射
BRIDGE = {
	"EE": "High School — Algebra",
	"F": "High School — Functions",
	"G": "High School — Geometry",
	"NS": "High School — Number and Quantity",
	"SP": "High School — Statistics and Probability",
}

GRADE_ORDER = ["K", "1", "2", "3", "4", "5", "6", "7", "8"]


def grade_rank(grade: str) -> int:
	"""把年级映射成可比较的序号，高中统一排在 9。"""
	if grade in GRADE_ORDER:
		return GRADE_ORDER.index(grade)
	return len(GRADE_ORDER)


def code_domain_abbr(code: str) -> str:
	"""8.EE.7 -> EE；A-SSE.1 -> SSE。"""
	m = re.match(r"^(?:K|[1-8])\.([A-Z]+)\.", code)
	if m:
		return m.group(1)
	m = re.match(r"^[AFGNS]-([A-Z]+)\.", code)
	return m.group(1) if m else ""


def load_standards() -> list[dict]:
	if not STANDARDS_CSV.exists():
		raise SystemExit(f"找不到 {STANDARDS_CSV}，先跑 create_and_run_skill.sh --build-only")
	rows = []
	with STANDARDS_CSV.open(encoding="utf-8") as fh:
		for row in csv.DictReader(fh):
			row["grade_rank"] = grade_rank(row["grade"])
			row["abbr"] = code_domain_abbr(row["code"])
			rows.append(row)
	return rows


def build_edges(rows: list[dict]) -> list[dict]:
	"""三类结构边。每条都带 kind，前端按类型上色、可筛选。"""
	edges: list[dict] = []
	seen: set[tuple[str, str, str]] = set()

	def add(src: str, dst: str, kind: str, note: str) -> None:
		key = (src, dst, kind)
		if src == dst or key in seen:
			return
		seen.add(key)
		edges.append({"source": src, "target": dst, "kind": kind, "note": note})

	# 1) cluster：同一年级同一 cluster 内，按出现顺序串成链
	by_cluster: dict[tuple[str, str], list[dict]] = {}
	for r in rows:
		by_cluster.setdefault((r["grade"], r["cluster"]), []).append(r)
	for (grade, cluster), items in by_cluster.items():
		for a, b in zip(items, items[1:]):
			add(a["code"], b["code"], "cluster", f"{grade} 年级 · 同一 cluster：{cluster}")

	# 2) progression：同 domain、相邻年级，全连（前端按度数采样，不怕多）
	by_domain: dict[str, list[dict]] = {}
	for r in rows:
		by_domain.setdefault(r["domain"], []).append(r)
	for domain, items in by_domain.items():
		by_grade: dict[str, list[dict]] = {}
		for r in items:
			by_grade.setdefault(r["grade"], []).append(r)
		grades = sorted(by_grade, key=grade_rank)
		for lower, upper in zip(grades, grades[1:]):
			if grade_rank(upper) - grade_rank(lower) != 1:
				continue
			for a in by_grade[lower]:
				for b in by_grade[upper]:
					add(a["code"], b["code"], "progression", f"{domain}：{lower} → {upper}")

	# 3) bridge：8 年级 -> 高中概念类别
	hs_by_category: dict[str, list[dict]] = {}
	for r in rows:
		if r["grade"].startswith("High School"):
			hs_by_category.setdefault(r["grade"], []).append(r)
	for r in rows:
		if r["grade"] != "8":
			continue
		target_cat = BRIDGE.get(r["abbr"])
		if not target_cat:
			continue
		for hs in hs_by_category.get(target_cat, [])[:6]:   # 只连前几条，避免过密
			add(r["code"], hs["code"], "bridge", f"8 年级 {r['abbr']} → {target_cat}")
	return edges


def latest_run(explicit: str | None) -> pathlib.Path | None:
	if explicit:
		p = RESULT_ROOT / explicit
		return p if p.is_dir() else None
	runs = sorted([p for p in RESULT_ROOT.glob("*") if p.is_dir()])
	return runs[-1] if runs else None


def load_apps(run_dir: pathlib.Path | None, known: set[str]) -> dict:
	"""把一次 run 的 15 条结果整理成 L1/L2 两层。

	顺手把老结果里的 codes_bogus 重新分类：5.NF.4b / 6.RP.3c 这种是**子项引用**
	（a/b/c 子条目写在 requirement 正文里、表里不单独成行，但父编号在表里），
	属于正确且更细的引用，不该跟真正臆造的编号混在一起。
	"""
	if not run_dir:
		return {"run": "", "categories": []}
	cats: dict[str, dict] = {}
	for meta_path in sorted(run_dir.glob("*/metadata.json")):
		meta = json.loads(meta_path.read_text(encoding="utf-8"))
		resp = meta_path.parent / "response.md"
		answer = resp.read_text(encoding="utf-8") if resp.exists() else ""
		# 去掉 response.md 开头我们自己加的标题和引用行，只留模型正文
		answer = re.sub(r"^# .*?\n+> .*?\n+", "", answer, count=1, flags=re.S)
		cat = cats.setdefault(meta["category"], {
			"id": meta["category"],
			"name": meta["category_name"],
			"cases": [],
		})
		raw_bogus = meta.get("codes_bogus", [])
		subitem = meta.get("codes_subitem") or [
			x for x in raw_bogus if x and x[-1].isalpha() and x[:-1] in known
		]
		bogus = [x for x in raw_bogus if x not in subitem]
		cat["cases"].append({
			"id": meta["id"],
			"prompt": meta["prompt"],
			"answer": answer,
			"passed": meta["passed"],
			"codes_subitem": subitem,
			"codes_bogus": bogus,
			"elapsed_s": meta["elapsed_s"],
			"model": meta.get("model", ""),
			"provider": meta.get("provider", ""),
			"tool_calls": meta.get("tool_calls", []),
			"codes_valid": meta.get("codes_valid", []),
			"answer_chars": meta.get("answer_chars", 0),
			"thinking_chars": meta.get("thinking_chars", 0),
			"usage": meta.get("usage", {}),
			"session_id": meta.get("session_id", ""),
		})
	return {"run": run_dir.name, "categories": [cats[k] for k in sorted(cats)]}


def main() -> None:
	ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
	ap.add_argument("--run", help="用哪一次 result run，默认最新")
	args = ap.parse_args()

	rows = load_standards()
	edges = build_edges(rows)
	OUT_DIR.mkdir(parents=True, exist_ok=True)

	grades = sorted({r["grade"] for r in rows}, key=grade_rank)
	domains = sorted({r["domain"] for r in rows})
	standards = {
		"stats": {
			"standards": len(rows),
			"domains": len(domains),
			"grades": len(grades),
			"edges": len(edges),
			"clusters": len({(r["grade"], r["cluster"]) for r in rows}),
		},
		"grades": grades,
		"domains": domains,
		"nodes": [
			{
				"code": r["code"],
				"grade": r["grade"],
				"grade_rank": r["grade_rank"],
				"domain": r["domain"],
				"cluster": r["cluster"],
				"requirement": r["requirement"],
				"pdf_page": r["pdf_page"],
			}
			for r in rows
		],
		"edges": edges,
	}
	(OUT_DIR / "standards.json").write_text(
		json.dumps(standards, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

	run_dir = latest_run(args.run)
	apps = load_apps(run_dir, {r["code"] for r in rows})
	(OUT_DIR / "apps.json").write_text(
		json.dumps(apps, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

	print(f"standards.json: {len(rows)} 节点 / {len(edges)} 边 "
	      f"（cluster {sum(1 for e in edges if e['kind'] == 'cluster')}、"
	      f"progression {sum(1 for e in edges if e['kind'] == 'progression')}、"
	      f"bridge {sum(1 for e in edges if e['kind'] == 'bridge')}）")
	if run_dir:
		n_cases = sum(len(c["cases"]) for c in apps["categories"])
		print(f"apps.json: run {apps['run']} · {len(apps['categories'])} 个 L1 / {n_cases} 个 L2")
	else:
		print("apps.json: 没找到 result run，下游应用页会是空的")


if __name__ == "__main__":
	main()
