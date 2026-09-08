---
name: common-core-fractions
description: 查询五年级分数知识点及其对应的 Common Core 课标，也可根据题目识别知识点并查看前置、后继关系。适用于课标对齐、教学设计、学情诊断和命题。
license: MIT
metadata:
  audience: mathematics-education
  standard: CCSS-M-5.NF
---

# 五年级分数知识点

本项目把 Common Core 五年级 `5.NF` 课标整理成了 8 个知识点。知识点和前后关系以这两份表为准：

- `references/index.md`
- `references/knowledge_points.csv`
- `references/relations.csv`

课标原文在 `references/standards.csv`。

## 使用方法

查课标：

```bash
python scripts/query_fractions.py standard 5.NF.1
```

根据题目初步匹配知识点：

```bash
python scripts/query_fractions.py identify "<题目>"
```

查看一个知识点的前置和后继：

```bash
python scripts/query_fractions.py neighbors KP-FR-03
```

关键词匹配只是初筛，最后还要结合题意判断。

## 回答时注意

- 写清知识点 ID、名称和对应课标 ID。
- 引用课标时带上英文原文、年级、领域和 PDF 页码。
- 前置知识、核心知识和后继知识分开写。
- 表中没有的编号和关系不要补写。
- 关系表是本项目整理的教学关系，不是 Common Core 原文自带的关系。

## 数据口径

`KP-FR-01` 的名称是“分数的意义与表示”，对应 `5.NF.3`。`KP-FR-03`、`KP-FR-04` 和 `KP-FR-08` 各自对应多条课标，这些划分沿用 Sheet2。

如果发现课标原文和当前划分不太一致，先把问题列出来，确认后再改表。
