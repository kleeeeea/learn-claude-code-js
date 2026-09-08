#!/usr/bin/env python3
import argparse
import csv
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
REF = BASE / "references"


def rows(name):
    with (REF / name).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def emit(value):
    print(json.dumps(value, ensure_ascii=False, indent=2))


def standard(identifier):
    match = next((r for r in rows("standards.csv") if r["standard_id"] == identifier), None)
    if not match:
        raise SystemExit(f"Unknown standard: {identifier}")
    emit(match)


def point(identifier):
    match = next((r for r in rows("knowledge_points.csv") if r["knowledge_id"] == identifier), None)
    if not match:
        raise SystemExit(f"Unknown knowledge point: {identifier}")
    emit(match)


def neighbors(identifier):
    points = {r["knowledge_id"]: r for r in rows("knowledge_points.csv")}
    if identifier not in points:
        raise SystemExit(f"Unknown knowledge point: {identifier}")
    edges = rows("relations.csv")
    emit({
        "knowledge_point": points[identifier],
        "prerequisites": [e for e in edges if e["target_id"] == identifier],
        "successors": [e for e in edges if e["source_id"] == identifier],
    })


def identify(text):
    lowered = text.lower()
    rules = {
        "KP-FR-02": ["异分母", "通分", "公分母", "equivalent fraction", "unlike denominator"],
        "KP-FR-03": ["异分母", "分数加", "分数减", "一共", "还剩", "difference"],
        "KP-FR-01": ["平均分", "商", "a/b", "除法结果", "division"],
        "KP-FR-04": ["分数乘", "乘以分数", "缩放", "面积", "fractional side"],
        "KP-FR-05": ["分数乘法应用", "乘法实际", "fraction multiplication problem"],
        "KP-FR-06": ["单位分数除", "整数除以单位分数", "unit fraction"],
        "KP-FR-07": ["单位分数除法应用", "division word problem"],
    }
    points = {r["knowledge_id"]: r for r in rows("knowledge_points.csv")}
    matches = []
    for identifier, terms in rules.items():
        hits = [term for term in terms if term.lower() in lowered]
        if hits:
            matches.append({"candidate": points[identifier], "matched_terms": hits})
    fractions = re.findall(r"(?<!\d)(\d+)\s*/\s*(\d+)(?!\d)", text)
    denominators = {denominator for _, denominator in fractions}
    additive = any(term in lowered for term in ("一共", "总共", "合计", "还剩", "相差", "+", "-"))
    existing = {m["candidate"]["knowledge_id"] for m in matches}
    if len(denominators) > 1 and additive:
        for identifier, evidence in (
            ("KP-FR-02", ["检测到不同分母的分数"]),
            ("KP-FR-03", ["检测到不同分母分数及加减情境"]),
        ):
            if identifier not in existing:
                matches.append({"candidate": points[identifier], "matched_terms": evidence})
    emit({"query": text, "candidates": matches, "note": "这里是关键词初筛结果，还需要结合题意判断。"})


def validate():
    standards = {r["standard_id"] for r in rows("standards.csv")}
    points = {r["knowledge_id"]: r for r in rows("knowledge_points.csv")}
    relations = rows("relations.csv")
    errors = []
    for identifier, row in points.items():
        for code in row["standard_ids"].split(";"):
            if code and code not in standards:
                errors.append(f"{identifier}: unknown standard {code}")
    for edge in relations:
        for key in ("source_id", "target_id"):
            if edge[key] not in points:
                errors.append(f"relation: unknown {key} {edge[key]}")
    emit({"standards": len(standards), "knowledge_points": len(points), "relations": len(relations), "errors": errors})
    if errors:
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser(description="Query the Grade 5 Common Core fractions skill data")
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("standard", "point", "neighbors", "identify"):
        command = sub.add_parser(name)
        command.add_argument("value")
    sub.add_parser("validate")
    args = parser.parse_args()
    functions = {"standard": standard, "point": point, "neighbors": neighbors, "identify": identify}
    if args.command == "validate":
        validate()
    else:
        functions[args.command](args.value)


if __name__ == "__main__":
    main()
