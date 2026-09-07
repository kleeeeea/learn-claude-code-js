# session history

来源：`2026-09-07T04-09-33-367Z_01a07a0e-9da7-748e-a274-f37535b4843a.jsonl`

## user  <sub>2026-09-07T04:09:33.493Z</sub>

设计一个 5 升 6 的暑期过渡方案，共 6 次课。请回表选出：5 年级里必须夯实、否则会拖累 6 年级的课标（给编号和它拖累的 6 年级编号），以及 6 年级开学前值得先铺垫的课标。按 6 次课排布，每次课注明「巩固」还是「铺垫」及对应编号。

## assistant  <sub>2026-09-07T04:09:38.665Z</sub>

<details><summary>thinking</summary>

```
The user is asking in Chinese. They want a summer transition plan for going from Grade 5 to Grade 6 (5升6 means "rising from grade 5 to grade 6"), with 6 lessons total. They want:

1. A table of Grade 5 standards that must be solidified, otherwise they will drag down Grade 6 standards (give the standard codes and which Grade 6 codes they drag down)
2. Grade 6 standards worth previewing/laying groundwork for before school starts
3. Arrange into 6 lessons, each marked as "巩固" (consolidate) or "铺垫" (groundwork/preview) with corresponding standard codes

They mention "请回表" which likely means "请列表" (please list in a table). I should use the math-standards skill to look up the actual Common Core standards for Grade 5 and Grade 6.

Let me first read the skill file to understand how to query the standards.
```

</details>

🔧 `read({"path": "/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/SKILL.md"})`

## toolResult · read  <sub>2026-09-07T04:09:38.677Z</sub>

```
---
name: math-standards
description: 查询美国 Common Core 数学课程标准（K-8 与高中五个概念类别，共 385 条）。按课标编号（如 K.CC.4、8.G.7、S-MD.5）、年级或领域查出课标要求原文、所属领域/知识点与 PDF 页码。需要核对某条课标怎么说、某年级某领域包含哪些要求、或把教学内容对齐到课标编号时使用。
---

# Common Core 数学课标查询

数据来自 `数学课标整理表格.xlsx`，已整理成两个文件：

- `references/index.md` —— 年级 × 领域的总览表（条数、编号示例）。先看它定位范围。
- `references/standards.csv` —— 全量 385 条，列为
  `code, grade, domain, cluster, requirement, pdf_page`。

年级取值：K, 1, 2, 3, 4, 5, 6, 7, 8, High School — Number and Quantity, High School — Algebra, High School — Functions, High School — Geometry, High School — Statistics and Probability。

## 怎么查

编号已知时直接按编号取行（编号在第一列，行首匹配最准）：

```bash
grep -m1 '^8.G.7,' references/standards.csv
```

按年级或领域筛选，只看编号和要求两列：

```bash
awk -F',' '$2=="5"' references/standards.csv | cut -d',' -f1,5
grep ',Geometry,' references/standards.csv | cut -d',' -f1,5
```

按关键词找（例如勾股定理相关）：

```bash
grep -i 'pythagorean' references/standards.csv | cut -d',' -f1,2,5
```

`requirement` 字段里含逗号，所以取整行文本时用 `grep` 原样输出，别用 `cut` 切到第 5 列以后。

## 回答约定

- 引用课标要求时给出**原文**（英文）加编号，必要时再翻译。
- 一并给出 `grade` / `domain` 和 `pdf_page`，方便回到 PDF 核对。
- 表里没有的条目直说没有，不要照编号规律臆造。

```

## assistant  <sub>2026-09-07T04:09:41.770Z</sub>

<details><summary>thinking</summary>

```
Let me look at the standards for Grade 5 and Grade 6 to design this plan. First, let me get an overview from the index, then look at the actual standards.
```

</details>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && cat references/index.md"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && awk -F',' '$2==\"5\"' references/standards.csv | cut -d',' -f1"})`

## toolResult · bash  <sub>2026-09-07T04:09:41.800Z</sub>

```
# Common Core 数学课标 · 总览

共 385 条，来自 数学课标整理表格.xlsx。全量数据在 `standards.csv`（列：code, grade, domain, cluster, requirement, pdf_page）。

| 年级 | 领域 | 条数 | 编号示例 |
| --- | --- | --- | --- |
| K | Counting and Cardinality | 7 | K.CC.1 … K.CC.7 |
| K | Operations and Algebraic Thinking | 5 | K.OA.1 … K.OA.5 |
| K | Number and Operations in Base Ten | 1 | K.NBT.1 |
| K | Measurement and Data | 3 | K.MD.1 … K.MD.3 |
| K | Geometry | 6 | K.G.1 … K.G.6 |
| 1 | Operations and Algebraic Thinking | 8 | 1.OA.1 … 1.OA.8 |
| 1 | Number and Operations in Base Ten | 6 | 1.NBT.1 … 1.NBT.6 |
| 1 | Measurement and Data | 4 | 1.MD.1 … 1.MD.4 |
| 1 | Geometry | 3 | 1.G.1 … 1.G.3 |
| 2 | Operations and Algebraic Thinking | 4 | 2.OA.1 … 2.OA.4 |
| 2 | Number and Operations in Base Ten | 9 | 2.NBT.1 … 2.NBT.9 |
| 2 | Measurement and Data | 10 | 2.MD.1 … 2.MD.10 |
| 2 | Geometry | 3 | 2.G.1 … 2.G.3 |
| 3 | Operations and Algebraic Thinking | 9 | 3.OA.1 … 3.OA.9 |
| 3 | Number and Operations in Base Ten | 3 | 3.NBT.1 … 3.NBT.3 |
| 3 | Number and Operations—Fractions[5] | 3 | 3.NF.1 … 3.NF.3 |
| 3 | Measurement and Data | 8 | 3.MD.1 … 3.MD.8 |
| 3 | Geometry | 2 | 3.G.1 … 3.G.2 |
| 4 | Operations and Algebraic Thinking | 5 | 4.OA.1 … 4.OA.5 |
| 4 | Number and Operations in Base Ten[2] | 6 | 4.NBT.1 … 4.NBT.6 |
| 4 | Number and Operations—Fractions[3] | 7 | 4.NF.1 … 4.NF.7 |
| 4 | Measurement and Data | 7 | 4.MD.1 … 4.MD.7 |
| 4 | Geometry | 3 | 4.G.1 … 4.G.3 |
| 5 | Operations and Algebraic Thinking | 3 | 5.OA.1 … 5.OA.3 |
| 5 | Number and Operations in Base Ten | 7 | 5.NBT.1 … 5.NBT.7 |
| 5 | Number and Operations—Fractions | 7 | 5.NF.1 … 5.NF.7 |
| 5 | Measurement and Data | 5 | 5.MD.1 … 5.MD.5 |
| 5 | Geometry | 4 | 5.G.1 … 5.G.4 |
| 6 | Ratios and Proportional Relationships | 3 | 6.RP.1 … 6.RP.3 |
| 6 | The Number System | 8 | 6.NS.1 … 6.NS.8 |
| 6 | Expressions and Equations | 9 | 6.EE.1 … 6.EE.9 |
| 6 | Geometry | 4 | 6.G.1 … 6.G.4 |
| 6 | Statistics and Probability | 5 | 6.SP.1 … 6.SP.5 |
| 7 |
…（省略 2452 字）
```

## toolResult · bash  <sub>2026-09-07T04:09:41.800Z</sub>

```
5.OA.1
5.OA.2
5.OA.3
5.NBT.1
5.NBT.2
5.NBT.3
5.NBT.4
5.NBT.5
5.NBT.6
5.NBT.7
5.NF.1
5.NF.2
5.NF.3
5.NF.4
5.NF.5
5.NF.6
5.NF.7
5.MD.1
5.MD.2
5.MD.3
5.MD.4
5.MD.5
5.G.1
5.G.2
5.G.3
5.G.4

```

## assistant  <sub>2026-09-07T04:09:44.944Z</sub>

<details><summary>thinking</summary>

```
Now let me look at the full requirement text for Grade 5 and Grade 6 standards, so I can design the dependency mapping.
```

</details>

现在我来阅读 5 年级和 6 年级课标的全部要求文本，以便建立准确的依赖映射。

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && awk -F',' '$2==\"5\"' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && awk -F',' '$2==\"6\"' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:09:44.972Z</sub>

```
5.OA.1,5,Operations and Algebraic Thinking,Write and interpret numerical expressions.,"1. Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.",P35
5.OA.2,5,Operations and Algebraic Thinking,Write and interpret numerical expressions.,"2. Write simple expressions that record calculations with numbers, and interpret numerical expressions without evaluating them.",P35
5.OA.3,5,Operations and Algebraic Thinking,Analyze patterns and relationships.,"3. Generate two numerical patterns using two given rules. Identify apparent relationships between corresponding terms. Form ordered pairs consisting of corresponding terms from the two patterns, and graph the ordered pairs on a coordinate plane.",P35
5.NBT.1,5,Number and Operations in Base Ten,Understand the place value system.,"1. Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left.",P35
5.NBT.2,5,Number and Operations in Base Ten,Understand the place value system.,"2. Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.",P35
5.NBT.3,5,Number and Operations in Base Ten,Understand the place value system.,"3. Read, write, and compare decimals to thousandths. a. Read and write decimals to thousandths using base-ten numerals, number names, and expanded form, b. Compare two decimals to thousandths based on meanings of the digits in each place, using >, =, and < symbols to record the results of comparisons.",P35
5.NBT.4,5,Number and Operations in Base Ten,Understand the place value system.,4. Use place value understanding to round decimals to any place.,P35
5.NBT.5,5,Number and Operations in Base Ten,Perform operations with mult
…（省略 8125 字）
```

## toolResult · bash  <sub>2026-09-07T04:09:44.973Z</sub>

```
6.RP.1,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,1. Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.,P42
6.RP.2,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,"2. Understand the concept of a unit rate a/b associated with a ratio a:b with b ≠ 0, and use rate language in the context of a ratio relationship.",P42
6.RP.3,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,"3. Use ratio and rate reasoning to solve real-world and mathematical problems, a. Make tables of equivalent ratios relating quantities with whole-number measurements, find missing values in the tables, and plot the pairs of values on the coordinate plane. Use tables to compare ratios. b. Solve unit rate problems including those involving unit pricing and constant speed. c. Find a percent of a quantity as a rate per 100; solve problems involving finding the whole, given a part and the percent. d. Use ratio reasoning to convert measurement units; manipulate and transform units appropriately when multiplying or dividing quantities.",P42
6.NS.1,6,The Number System,Apply and extend previous understandings of multiplication and division to divide fractions by fractions.,"1. Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions,",P42
6.NS.2,6,The Number System,Compute fluently with multi-digit numbers and find common factors and multiples.,2. Fluently divide multi-digit numbers using the standard algorithm.,P42
6.NS.3,6,The Number System,Compute fluently with multi-digit numbers and find common factors and multiples.,"3. Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm for each operation.",P42
6.NS.4,6,The Number System,Compute fluently with multi-dig
…（省略 9590 字）
```

## assistant  <sub>2026-09-07T04:12:22.724Z</sub>

<details><summary>thinking</summary>

```
Now I have all the Grade 5 and Grade 6 standards. Let me design the summer transition plan.

The user wants:
1. A table of Grade 5 standards that must be solidified (must-haves), with the Grade 6 standards they'd drag down if not solid
2. Grade 6 standards worth previewing before school starts
3. A 6-lesson plan, each lesson marked 巩固 (consolidate) or 铺垫 (groundwork) with corresponding codes

Let me think about the dependencies:

**Grade 5 must-haves and what they drag down in Grade 6:**

1. **5.NBT.5** (fluently multiply multi-digit whole numbers using standard algorithm) → drags down 6.NS.2 (fluently divide multi-digit numbers), 6.NS.3 (fluently compute multi-digit decimals). Division algorithm relies on multiplication fluency.

2. **5.NBT.6** (whole-number quotients with up to four-digit dividends and two-digit divisors) → directly drags down 6.NS.2 (fluently divide multi-digit numbers using the standard algorithm). In grade 5 it's strategies; grade 6 requires fluency with standard algorithm.

3. **5.NBT.7** (add, subtract, multiply, divide decimals to hundredths, using strategies) → directly drags down 6.NS.3 (fluently add, subtract, multiply, divide multi-digit decimals using standard algorithm). Also 6.NS.7 (ordering rational numbers includes decimals), 6.EE.7 (equations with nonnegative rational numbers).

4. **5.NBT.1–5.NBT.4** (place value system, decimals to thousandths, rounding) → drags down 6.NS.3 (decimal computation), 6.NS.7 (ordering rational numbers). Place value understanding 10×/1/10 is the foundation for decimal operations.

5. **5.NF.1** (add/subtract fractions with unlike denominators via equivalent fractions) → drags down 6.NS.1 (divide fractions by fractions needs common denominators sometimes, equivalence), 6.EE.7 (equations with rational coefficients). Actually 6.NS.1 fraction division is built on fraction equivalence.

6. **5.NF.2** (word problems with fraction add/sub) → less critical for 6.

7. **5.NF.3** (interpret a/b = a ÷ b) → CRITICAL for 6.NS.1 (fraction division) and 6.RP.2 (unit rate a/b!). The interpretation of fraction as division is the foundation for both fraction division and unit rates.

8. **5.NF.4** (multiply fraction by fraction) → drags down 6.NS.1 (fraction division relies on multiplying by reciprocal), 6.G.2 (volume with fractional edge lengths requires multiplying fractions).

9. **5.NF.5** (multiplication as scaling) → supports 6.RP reasoning, but less critical.

10. **5.NF.7** (divide unit fractions by whole numbers and vice versa) → directly feeds 6.NS.1 (general fraction division).

11. **5.OA.1** (parentheses, evaluate expressions) → directly feeds 6.EE.1 (evaluate expressions with whole-number exponents), 6.EE.2c (order of operations).

12. **5.OA.2** (write simple expressions, interpret without evaluating) → directly feeds 6.EE.2a (write expressions with letters standing for numbers). Grade 6 reading/writing expressions replaces numbers with variables.

13. **5.OA.3** (two numerical patterns, ordered pairs, graph on coordinate plane) → feeds 6.RP.3a (plot pairs of values of equivalent ratios on coordinate plane), 6.EE.9 (analyze dependent/independent variables using graphs and tables), 6.NS.8 (all four quadrants).

14. **5.G.1, 5.G.2** (coordinate plane, first quadrant) → directly feed 6.NS.6b/c (negative coordinates, four quadrants), 6.NS.8 (graph in all four quadrants), 6.G.3 (draw polygons in coordinate plane), 6.RP.3a (plot ratio values).

15. **5.MD.1** (unit conversion) → feeds 6.RP.3d (use ratio reasoning to convert measurement units).

16. **5.MD.5** (volume of rectangular prisms, V = l×w×h) → feeds 6.G.2 (volume with fractional edge lengths, applies same formulas).

17. **5.G.3, 5.G.4** (classify 2D figures in hierarchy) → feeds 6.G.1 (area of triangles and quadrilaterals by composing/decomposing) somewhat — knowing properties of shapes helps.

**Grade 6 standards worth previewing (铺垫):**
- 6.RP.1, 6.RP.2, 6.RP.3 (ratio and rate — biggest new conceptual topic in grade 6, totally new content)
- 6.NS.5, 6.NS.6, 6.NS.7 (negative numbers — new content)
- 6.NS.4 (GCF/LCM — uses multiplication facts)
- 6.EE.1–EE.2 (exponents and variables — new content)
- 6.SP — statistics, new but lighter

For a 6-lesson plan, the most valuable previews are: ratios/rates (the heart of grade 6), negative numbers (new number system), and basic algebraic expressions (letters for numbers).

Now design 6 lessons. The user asked for a mix of 巩固 (consolidate grade 5) and 铺垫 (preview grade 6). Let me structure:

Lesson 1: 巩固 — Whole number multiplication & division fluency (5.NBT.5, 5.NBT.6) + place value (5.NBT.1, 5.NBT.2). This underpins 6.NS.2, 6.NS.3, 6.NS.4.

Lesson 2: 巩固 — Decimals (5.NBT.3, 5.NBT.4, 5.NBT.7). Underpins 6.NS.3, 6.NS.7.

Lesson 3: 巩固 — Fractions (5.NF.1–5.NF.7 core: 5.NF.1, 5.NF.3, 5.NF.4, 5.NF.7). Underpins 6.NS.1, 6.EE.7, 6.G.2, 6.RP.2.

Lesson 4: 铺垫 — Fractions→ratios: 5.NF.3 (a/b = a÷b) consolidated + 6.RP.1, 6.RP.2 (ratio concept, unit rate). Could mark this as both: 巩固 5.NF.3 → 铺垫 6.RP.1/6.RP.2. The unit rate a/b is literally the fraction-as-division idea. Maybe lesson 4 = 铺垫 6.RP.1, 6.RP.2, 6.RP.3 (with 5.MD.1 as the hook for 6.RP.3d).

Lesson 5: 铺垫 — Negative numbers: 6.NS.5, 6.NS.6, 6.NS.7 (extends 5.G.1 coordinate plane, 5.NBT.3 number line). Foundation: number line from grade 5 decimals.

Lesson 6: 铺垫 — Expressions & equations intro: 6.EE.1, 6.EE.2, 6.EE.6 (letters stand for numbers) building on 5.OA.1, 5.OA.2. 

Hmm, but the user says "每次课注明「巩固」还是「铺垫」" — each lesson should be marked as either 巩固 or 铺垫. Maybe some lessons can be both (巩固+铺垫). Let me think about the best structure.

Actually, a good structure might be:
- Lessons 1–3: 巩固 (the three number strands: whole numbers, decimals, fractions) 
- Lesson 4: 巩固+铺垫 (fractions→ratios bridge)
- Lessons 5–6: 铺垫 (negatives, expressions/variables)

Or alternatively interleave. Let me think about which 5th grade standards are the must-haves:

Priority ranking of Grade 5 standards by impact on Grade 6:

Tier 1 (critical):
- 5.NBT.5, 5.NBT.6 → 6.NS.2, 6.NS.3 (fluency is required in 6th, and 6th grade assumes it)
- 5.NBT.7 (decimal operations) → 6.NS.3, 6.NS.7
- 5.NF.1, 5.NF.2 (fraction add/sub) → 6.NS.1 indirectly, 6.EE.7, 6.RP
- 5.NF.3 (a/b = a÷b) → 6.NS.1, 6.RP.2 (unit rate!)
- 5.NF.4, 5.NF.6 (fraction multiplication) → 6.NS.1, 6.G.2
- 5.NF.7 (unit fraction division) → 6.NS.1
- 5.OA.1, 5.OA.2 → 6.EE.1, 6.EE.2
- 5.G.1, 5.G.2 → 6.NS.6, 6.NS.8, 6.G.3, 6.RP.3a, 6.EE.9

Tier 2 (important):
- 5.NBT.1–4 (place value/decimals/rounding) → 6.NS.3, 6.NS.7
- 5.MD.1 (conversions) → 6.RP.3d
- 5.MD.5 (volume) → 6.G.2
- 5.OA.3 (patterns/graphing) → 6.EE.9, 6.RP.3a

Tier 3 (less critical):
- 5.G.3, 5.G.4 → 6.G.1 (helps with shape properties)
- 5.MD.2 (line plots) → 6.SP.4 somewhat
- 5.NF.5 (scaling) → 6.RP

Now, the tables to present:

**Table 1: Grade 5 must-solidify standards → Grade 6 standards they drag down**

| 5年级课标 | 内容 | 拖累的6年级课标 |
|---|---|---|
| 5.NBT.5/5.NBT.6 | 多位数乘除 | 6.NS.2, 6.NS.3 |
| 5.NBT.1–4 | 位值/小数读写比较/舍入 | 6.NS.3, 6.NS.7 |
| 5.NBT.7 | 小数四则 | 6.NS.3, 6.NS.7, 6.EE.7 |
| 5.NF.1/5.NF.2 | 异分母分数加减 | 6.NS.1, 6.EE.7 |
| 5.NF.3 | 分数=除法 | 6.NS.1, 6.RP.2 |
| 5.NF.4/5.NF.6 | 分数乘法 | 6.NS.1, 6.G.2 |
| 5.NF.7 | 单位分数除法 | 6.NS.1 |
| 5.OA.1/5.OA.2 | 括号表达式 | 6.EE.1, 6.EE.2 |
| 5.OA.3 | 图形与模式 | 6.RP.3a, 6.EE.9 |
| 5.G.1/5.G.2 | 坐标平面第一象限 | 6.NS.6, 6.NS.8, 6.G.3, 6.RP.3a |
| 5.MD.1 | 单位换算 | 6.RP.3d |
| 5.MD.5 | 体积 | 6.G.2 |

That's a lot. For a 6-lesson plan I need to compress. Let me structure the answer as requested:

1. Table A: 5th grade must-haves (with dragged-down 6th grade codes)
2. Table B (or list): 6th grade worth previewing
3. Table C: 6 lessons with 巩固/铺垫 labels and codes

For the lessons, 6 lessons, maybe 90 min each or so. Let me design:

**Lesson 1 (巩固): 整数计算流利度 — 5.NBT.5, 5.NBT.6 (依托 5.NBT.1, 5.NBT.2)**
Supports 6.NS.2, 6.NS.3, 6.NS.4. Sixth grade requires *fluency* in long division and decimal standard algorithms; if multiplication/division isn't automatic, everything in 6.NS drags.

**Lesson 2 (巩固): 小数 — 5.NBT.3, 5.NBT.4, 5.NBT.7**
Supports 6.NS.3 (standard algorithm fluency), 6.NS.7 (ordering rational numbers).

**Lesson 3 (巩固): 分数 — 5.NF.1, 5.NF.2, 5.NF.4, 5.NF.6, 5.NF.7**
Supports 6.NS.1, 6.G.2, 6.EE.7. Maybe too much for one lesson. Split: Lesson 3a fraction add/sub + multiplication, Lesson 3b division + a/b = a÷b...

Actually with only 6 lessons, I should be strategic. Let me reconsider:

Lesson 1 (巩固): 位值与整数乘除 — 5.NBT.1, 5.NBT.2, 5.NBT.5, 5.NBT.6 → 支撑 6.NS.2, 6.NS.3, 6.NS.4
Lesson 2 (巩固): 小数四则 — 5.NBT.3, 5.NBT.4, 5.NBT.7 → 支撑 6.NS.3, 6.NS.7
Lesson 3 (巩固): 分数四则 — 5.NF.1, 5.NF.2, 5.NF.4, 5.NF.6, 5.NF.7 → 支撑 6.NS.1, 6.G.2
Lesson 4 (巩固→铺垫 bridge): 分数即除法 + 比与单位率 — 5.NF.3 + 5.MD.1 → 6.RP.1, 6.RP.2, 6.RP.3. Mark as both 巩固+铺垫 or just 铺垫? The a/b = a÷b idea IS the unit rate definition (6.RP.2: unit rate a/b associated with ratio a:b). This is the natural bridge lesson. I'd mark it 铺垫 (with 5.NF.3/5.MD.1 as the springboard).
Lesson 5 (铺垫): 负数与有理数 — 6.NS.5, 6.NS.6, 6.NS.7 (依托 5.NBT.3 数线、5.G.1/5.G.2 坐标系). Wait, but 5.G.1/5.G.2 are also must-consolidate for 6.NS.6/6.NS.8... Lesson 5 can be marked 巩固+铺垫: 复习 5.G.1–2 坐标平面, then extend to four quadrants 6.NS.6, 6.NS.8.
Lesson 6 (铺垫): 表达式与变量 — 5.OA.1, 5.OA.2 复习 + 6.EE.1, 6.EE.2, 6.EE.6. This is a nice bridge too.

Hmm, the user says "每次课注明「巩固」还是「铺垫」" — each lesson marked consolidate or groundwork. Some lessons naturally are both. I could label them like "巩固 → 铺垫" or pick primary labels. Let me do a clean design:

Lessons 1–3: 纯巩固 (number strands)
Lesson 4: 巩固+铺垫 (分数即除法 → 比与比率)
Lesson 5: 铺垫 (负数/坐标系, 内嵌 5.G.1–2 的巩固)
Lesson 6: 铺垫 (表达式与方程, 内嵌 5.OA.1–2 的巩固)

Actually, maybe cleaner: make lesson 4 purely 铺垫 for ratio, and fold the 5.NF.3 consolidation into lesson 3 (fractions). Lesson 3 fraction ops including a/b = a÷b. Then lesson 4 is pure 铺垫: ratios and rates.

But it's pedagogically nice to show the bridge. The user asked each lesson to be marked 巩固 or 铺垫 — I can mark some as both with explanation. Let me be practical: 3 巩固 + 2 铺垫 + 1 bridge (巩固+铺垫).

What about 6.NS.4 (GCF/LCM)? That's a new-ish skill in grade 6 (well, factors are from grade 4 4.OA.4, but GCF/LCM formal is grade 6). It builds on multiplication fluency from lesson 1. Could be folded into lesson 1 as preview, or lesson 3 (LCM connects to common denominators for 5.NF.1!). Actually GCF/LCM is a great bridge: LCM = common denominators (5.NF.1), GCF = simplifying fractions. Could fold 6.NS.4 preview into lesson 3 (fractions lesson) — LCM for common denominators. That's a natural fit.

And statistics (6.SP) — new content but relatively self-contained, lower priority for summer preview. I'll mention it's optional/skip.

Geometry: 5.MD.5 volume → 6.G.2 fractional edge volume. Fold into... hmm, 6 lessons is tight. Volume could be folded into lesson 3 (fraction multiplication → volume with fractional edges is 6.G.2). Or mention 5.G.3/5.G.4 shape hierarchy → 6.G.1 area by decomposing. These are second-tier; I'll note them as "如果学有余力" items.

Let me also reconsider: should 铺垫 lessons cover 6.RP more deeply since RP is THE major work of grade 6? Yes — lesson 4 fully on ratios/rates (6.RP.1–3), with 5.MD.1 as hook for 6.RP.3d.

Final plan:

**Table 1: 五年级必须夯实的课标（否则拖累六年级）**

| # | 五年级课标 | 内容要点 | 拖累的六年级课标 |
|---|---|---|---|
| 1 | 5.NBT.1, 5.NBT.2 | 位值（10倍/十分之一）、乘除10的幂 | 6.NS.3（小数标准算法）, 6.NS.7（有理数排序） |
| 2 | 5.NBT.5, 5.NBT.6 | 多位数乘法（标准算法）、两位数除数除法 | 6.NS.2, 6.NS.3, 6.NS.4（GCF/LCM） |
| 3 | 5.NBT.3, 5.NBT.4, 5.NBT.7 | 千分位小数读写比较、舍入、小数四则 | 6.NS.3, 6.NS.7 |
| 4 | 5.NF.1, 5.NF.2 | 异分母分数加减（等值分数） | 6.NS.1, 6.EE.7（系数为有理数的方程） |
| 5 | 5.NF.4, 5.NF.6 | 分数乘分数/带分数 | 6.NS.1（除以分数=乘倒数）, 6.G.2（分数棱长的体积） |
| 6 | 5.NF.7 | 单位分数除法 | 6.NS.1 |
| 7 | 5.NF.3 | a/b = a÷b | 6.NS.1, 6.RP.2（单位率 a/b） |
| 8 | 5.OA.1, 5.OA.2 | 括号、写/读表达式 | 6.EE.1, 6.EE.2 |
| 9 | 5.G.1, 5.G.2 | 坐标平面第一象限 | 6.NS.6, 6.NS.8, 6.G.3, 6.RP.3a |
| 10 | 5.MD.1 | 度量单位换算 | 6.RP.3d |
| 11 | 5.MD.5 | 长方体体积 V=lwh | 6.G.2 |

Maybe trim to keep table readable. The user asked "5 年级里必须夯实、否则会拖累 6 年级的课标（给编号和它拖累的 6 年级编号）". So table: 5th grade codes | 拖累的 6th grade codes.

**Table 2: 六年级值得铺垫的课标**
- 6.RP.1, 6.RP.2, 6.RP.3 — 比与比例（六年级最大主题，全新内容）
- 6.NS.5, 6.NS.6, 6.NS.7 — 负数/有理数（新数系）
- 6.EE.1, 6.EE.2, 6.EE.6 — 指数、字母表示数（代数起点）
- 6.NS.4 — GCF/LCM（与通分约分直接衔接）
- (可选) 6.SP.1–5 统计、6.G.1–4 几何：新但相对独立，优先级低

**Table 3: 6 次课安排**

| 课次 | 类型 | 主题 | 课标编号 |
|---|---|---|---|
| 1 | 巩固 | 整数乘除流利度 + 位值 | 巩固 5.NBT.1, 5.NBT.2, 5.NBT.5, 5.NBT.6（支撑 6.NS.2/6.NS.3/6.NS.4） |
| 2 | 巩固 | 小数 | 巩固 5.NBT.3, 5.NBT.4, 5.NBT.7（支撑 6.NS.3, 6.NS.7） |
| 3 | 巩固 | 分数四则 | 巩固 5.NF.1, 5.NF.2, 5.NF.3, 5.NF.4, 5.NF.6, 5.NF.7 + 铺垫 6.NS.4（GCF/LCM 用于通分约分）（支撑 6.NS.1, 6.G.2） |
| 4 | 铺垫 | 分数即除法 → 比与单位率 | 铺垫 6.RP.1, 6.RP.2, 6.RP.3（巩固 5.NF.3, 5.MD.1 作跳板；支撑 6.RP.3d） |
| 5 | 铺垫 | 负数与坐标 | 铺垫 6.NS.5, 6.NS.6, 6.NS.7, 6.NS.8（巩固 5.G.1, 5.G.2 作跳板） |
| 6 | 铺垫 | 从算式到代数式 | 铺垫 6.EE.1, 6.EE.2, 6.EE.6（巩固 5.OA.1, 5.OA.2 作跳板；5.OA.3 与 6.EE.9 呼应） |

Hmm, lessons 3, 5, 6 mix 巩固 and 铺垫. The user said "每次课注明「巩固」还是「铺垫」" — I think mixed labels are fine and even more useful, but let me make the primary label clear. Alternative: make it 4 铺垫 + 2 巩固? Or 3+3?

Actually, let me reconsider the balance. The user's framing: "5 年级里必须夯实...以及 6 年级开学前值得先铺垫的课标。按 6 次课排布". So the 6 lessons should cover both the consolidation set and the preview set. A natural split: 3 巩固 + 3 铺垫, with bridge elements embedded.

Lesson 4 as 铺垫 (RP), lesson 5 as 铺垫 (NS negatives), lesson 6 as 铺垫 (EE). Lessons 1-3 as 巩固. In lessons 3, I embed 6.NS.4 as a small preview... Actually to keep the "每次课注明「巩固」还是「铺垫」" clean, maybe I mark each lesson with a primary type and note embedded bridges. Let me use marks like:

- 课1: 巩固
- 课2: 巩固
- 课3: 巩固（尾段带 6.NS.4 铺垫）
- 课4: 铺垫（前半巩固 5.NF.3/5.MD.1）
- 课5: 铺垫（前半巩固 5.G.1–2）
- 课6: 铺垫（前半巩固 5.OA.1–2）

That's honest and pedagogically sound. I'll present each lesson with: 类型, 主题, 编号 (巩固哪些/铺垫哪些), and 简要活动建议 maybe. The user didn't ask for detailed activities, but brief notes on why/what would help. Keep it focused: they asked for tables with codes. I'll add a one-line rationale per lesson and maybe brief content notes.

Also per the skill's answer conventions: cite original text (English) with codes, give grade/domain and pdf_page when quoting. For a big table, quoting all full text would bloat it. The skill says when citing requirement text give the original English + code. I'll include short original-text snippets for the key cited standards where I make dependency claims — maybe in the "拖累" table I include a brief content summary (Chinese) and for the most critical ones the English snippet. Hmm. Balance: the user wants a plan, not a standards dump. The skill convention applies when "引用课标要求时" — when citing standard requirements, give original English + code, plus grade/domain and pdf_page for verification. I'll include English requirement text for the key standards in the dependency table (abbreviated with ellipsis for long ones), and give pdf_page references.

Actually, let me structure it to comply reasonably: in the tables, I'll summarize in Chinese, and for each cited standard include page refs. To keep the response usable, I'll put the full English text only for the most load-bearing ones (like 5.NF.3, 6.RP.2) where the textual link is the argument. Let me aim for a clean, complete but not bloated answer.

Let me now also double-check specific dependency claims:

- 6.NS.2: "Fluently divide multi-digit numbers using the standard algorithm." Depends on 5.NBT.6 (division with two-digit divisors using strategies). Yes.
- 6.NS.3: "Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm for each operation." Depends on 5.NBT.7 (decimal ops with strategies) and 5.NBT.5/6 (whole number fluency). Yes.
- 6.NS.4: GCF/LCM — depends on multiplication/division fluency (5.NBT.5/6) and supports fraction work. LCM ↔ common denominators (5.NF.1). Yes.
- 6.NS.1: fraction ÷ fraction — depends on 5.NF.7 (unit fraction division), 5.NF.4 (fraction multiplication, since dividing = multiplying by reciprocal), 5.NF.3 (a/b = a÷b). Yes.
- 6.RP.2: "unit rate a/b associated with a ratio a:b" — depends on 5.NF.3 (a/b = a ÷ b). Direct textual link. Yes.
- 6.RP.3d: "use ratio reasoning to convert measurement units" — depends on 5.MD.1. Yes.
- 6.RP.3a: "plot the pairs of values on the coordinate plane" — depends on 5.G.1/5.G.2 and 5.OA.3 (patterns → ordered pairs → graph). Yes.
- 6.NS.6/6.NS.8: negative coordinates, all four quadrants — depends on 5.G.1/5.G.2 (first quadrant). Yes.
- 6.G.2: volume with fractional edge lengths — depends on 5.MD.5 (volume formulas with whole-number edges) and 5.NF.4 (fraction multiplication, esp. 5.NF.4b rectangular area with fractional sides). Yes.
- 6.EE.1: exponents expressions — depends on 5.NBT.2 (whole-number exponents to denote powers of 10)! Good link. "Use whole-number exponents to denote powers of 10" — 6.EE.1 generalizes to any base. Yes.
- 6.EE.2: "Write, read, and evaluate expressions in which letters stand for numbers" — depends on 5.OA.2 (write/interpret numerical expressions). Yes.
- 6.EE.7: equations px = q, x + p = q with nonnegative rational numbers — needs fraction/decimal fluency (5.NF, 5.NBT.7). Yes.
- 6.NS.7: ordering rational numbers — depends on 5.NBT.3b (compare decimals). Yes.
- 6.G.3: polygons in coordinate plane — depends on 5.G.1/5.G.2. Yes.
- 6.G.1: area by composing/decomposing — depends on 5.G.3/5.G.4 (hierarchy of shapes, properties) and 4th grade area. Somewhat.
- 6.SP.4: dot plots etc. — 5.MD.2 line plots is a minor precursor.

Good. Now let me think about what 5th-grade items I drop from the plan: 5.NF.5 (scaling), 5.MD.2 (line plots), 5.MD.3/5.MD.4 (volume concepts), 5.G.3/5.G.4 (hierarchy), 5.OA.3 partially. I'll note them as "second tier / 学有余力" items. Actually 5.MD.3/4 are conceptually subsumed by 5.MD.5. And 6.G (area/surface area/volume) is second-tier for summer. 6.SP is self-contained new content.

Hmm wait — should I reconsider including 5.G.3/5.G.4 → 6.G.1? The summer plan doesn't have a geometry lesson. That's a deliberate choice: geometry/stats are lower priority than number/RP/EE for grade 6 readiness. I'll mention this in a "未纳入" note. Good.

Also 5.NBT.2 → 6.EE.1: exponents. Nice link to include in lesson 1 or lesson 6. 6.EE.1 is "Write and evaluate numerical expressions involving whole-number exponents" — bridges from 5.NBT.2's powers of 10. I'll cite this in lesson 6 (EE lesson) or lesson 1. Probably lesson 6 since it's about EE.1 preview.

Now the lesson details:

**课 1｜巩固：整数乘除流利度（位值打底）**
- 编号：巩固 5.NBT.1, 5.NBT.2, 5.NBT.5, 5.NBT.6
- 为什么：6.NS.2/6.NS.3 要求"fluently"（流利使用标准算法），6.NS.4 的 GCF/LCM 也靠乘除基本功；六年级不再回头教这些
- 活动：多位数乘法竖式、两位数除数长除法；×10^n 的模式（为 6.EE.1 指数埋点）

**课 2｜巩固：小数（读写、比较、四则）**
- 编号：巩固 5.NBT.3, 5.NBT.4, 5.NBT.7
- 拖累：6.NS.3（标准算法流利）、6.NS.7（有理数排序大量出现小数比较）
- 活动：千分位读写、舍入、四则运算；数线上标小数（为负数课铺垫数线感觉）

**课 3｜巩固：分数四则（含 a/b = a÷b）**
- 编号：巩固 5.NF.1, 5.NF.2, 5.NF.3, 5.NF.4, 5.NF.6, 5.NF.7；结尾铺垫 6.NS.4（GCF/LCM 与通分、约分挂钩）
- 拖累：6.NS.1（分数除分数）、6.EE.7、6.G.2
- 注意量：一节课装不下全部，按学生诊断结果侧重加减或乘除

**课 4｜铺垫：比与单位率（六年级头号主题）**
- 编号：铺垫 6.RP.1, 6.RP.2, 6.RP.3；跳板：5.NF.3（a/b = a÷b 正是 6.RP.2 的 unit rate a/b）、5.MD.1（单位换算 → 6.RP.3d）
- 活动：生活中的比（配方、单价、速度）；从"3 杯果汁配 2 杯水"到 ratio 语言；单位率计算

**课 5｜铺垫：负数与有理数（数线 + 坐标）**
- 编号：铺垫 6.NS.5, 6.NS.6, 6.NS.7, 6.NS.8；跳板：5.G.1, 5.G.2（第一象限 → 四象限），5.NBT.3（数线上标数）
- 活动：温度/海拔/收支引入相反意义的量；数线与相反数；把第一象限坐标系扩展到四象限

**课 6｜铺垫：从算式到代数式**
- 编号：铺垫 6.EE.1, 6.EE.2, 6.EE.6；跳板：5.OA.1, 5.OA.2（数字算式 → 字母算式），5.NBT.2（10 的幂 → 一般指数）
- 活动：用字母替换数（"数字换字母"游戏）；代数式求值；简单情形 x + p = q 的天平直觉（6.EE.7 只点到为止）

Now, tables. The user explicitly asked: "请回表选出：5 年级里必须夯实、否则会拖累 6 年级的课标（给编号和它拖累的 6 年级编号）" — a table with 5th grade codes and the 6th grade codes they drag down. Then "以及 6 年级开学前值得先铺垫的课标" — which 6th grade standards to preview. "按 6 次课排布，每次课注明「巩固」还是「铺垫」及对应编号" — 6-lesson schedule with type and codes.

Response structure:
1. 表一：五年级必须夯实 → 拖累的六年级 (with brief content + page refs)
2. 表二：六年级值得铺垫
3. 表三：六次课排布 (课次、类型、主题、编号、一句话说明)
4. 未纳入说明 + 核对页码

Per skill conventions, when citing requirement text give original English. In table 1, the "内容" column — I'll write short Chinese summaries, and add English snippets for the two or three most load-bearing textual links (5.NF.3 ↔ 6.RP.2, 5.OA.2 ↔ 6.EE.2). Actually, to follow the skill's convention without bloat, I'll add a "关键原文依据" mini-section quoting the most decisive pairs in English. Hmm, or include an English quote column in table 1? That would make it huge. Let me quote key linking phrases inline in table 1's rationale column, in English with codes. E.g., "6.RP.2 的 'unit rate a/b' 直接建在 5.NF.3 的 'a/b = a ÷ b' 上". That cites original wording. Good compromise: quotes for the pivotal phrases, all with codes.

pdf_page refs: Grade 5 is P35–P38, Grade 6 is P42–P45. I'll note per-row or in a footnote: 5.NBT.1–7 P35, 5.NF.1–7 P36–37, 5.MD.1–5 P37, 5.G.1–4 P38; 6.RP P42, 6.NS.1–4 P42, 6.NS.5–8 P43, 6.EE.1–4 P43–44, 6.EE.5–9 P44, 6.G P44–45, 6.SP P45.

Let me finalize the content of the tables.

**表一：必须夯实的五年级课标（按主题分组）**

| 组 | 5 年级课标 | 要点 | 不牢会拖累 |
|---|---|---|---|
| 整数乘除 | 5.NBT.5、5.NBT.6 | 标准算法乘多位数；四位数÷两位数 | 6.NS.2、6.NS.3、6.NS.4 |
| 位值 | 5.NBT.1、5.NBT.2 | 相邻位值 10×/1/10；×10 的幂与指数记法 | 6.NS.3、6.NS.7、6.EE.1 |
| 小数 | 5.NBT.3、5.NBT.4、5.NBT.7 | 千分位读写比较；舍入；小数四则 | 6.NS.3、6.NS.7、6.EE.7 |
| 分数加减 | 5.NF.1、5.NF.2 | 异分母通分加减及应用题 | 6.NS.1、6.EE.7 |
| 分数乘除 | 5.NF.4、5.NF.6、5.NF.7 | 分数乘法；单位分数除法 | 6.NS.1、6.G.2 |
| 分数即除法 | 5.NF.3 | a/b = a ÷ b | 6.NS.1、6.RP.2 |
| 表达式 | 5.OA.1、5.OA.2 | 括号求值；写/读算式 | 6.EE.1、6.EE.2 |
| 坐标 | 5.G.1、5.G.2 | 第一象限坐标 | 6.NS.6、6.NS.8、6.G.3、6.RP.3a |
| 度量 | 5.MD.1 | 单位换算 | 6.RP.3d |
| 体积 | 5.MD.5 | V = lwh | 6.G.2 |

That's comprehensive. Fine.

**表二：值得铺垫的六年级课标**

| 6 年级课标 | 主题 | 为什么值得先铺垫 |
|---|---|---|
| 6.RP.1、6.RP.2、6.RP.3 | 比与比例 | 六年级全新且分量最重的领域（Major Work），概念新、语言新 |
| 6.NS.5、6.NS.6、6.NS.7（+6.NS.8） | 负数与有理数 | 新数系，开学的第二个大坎 |
| 6.EE.1、6.EE.2、6.EE.6 | 指数、字母表示数 | 代数起点，"字母当数"的思维转换需要时间 |
| 6.NS.4 | GCF/LCM | 直接服务于通分约分，衔接五年级分数 |

**表三：六次课**

| 课次 | 类型 | 主题 | 编号 |
|---|---|---|---|
| 1 | 巩固 | 整数乘除流利度 | 5.NBT.1、5.NBT.2、5.NBT.5、5.NBT.6 |
| 2 | 巩固 | 小数四则 | 5.NBT.3、5.NBT.4、5.NBT.7 |
| 3 | 巩固 | 分数四则 | 5.NF.1–5.NF.4、5.NF.6、5.NF.7（尾段带 6.NS.4 铺垫） |
| 4 | 铺垫 | 比与单位率 | 6.RP.1、6.RP.2、6.RP.3（跳板 5.NF.3、5.MD.1） |
| 5 | 铺垫 | 负数与四象限坐标 | 6.NS.5–6.NS.8（跳板 5.G.1、5.G.2） |
| 6 | 铺垫 | 算式 → 代数式 | 6.EE.1、6.EE.2、6.EE.6（跳板 5.OA.1、5.OA.2） |

With one-line rationale per lesson and key activity hints. Also a note on what's excluded (5.G.3/4, 5.MD.2, 5.NF.5, 6.G, 6.SP — second tier).

Wait — 5.NF.5 (scaling)? It supports 6.RP reasoning (comparing sizes multiplicatively). It's Tier 2; mention in excluded note as "可融入课 3/课 4 顺带复习".

Also should I double check that 6.NS.7 includes decimal comparison — yes "ordering and absolute value of rational numbers". And 6.EE.7 uses "nonnegative rational numbers" — includes fractions/decimals. Good, so fraction/decimal fluency drags 6.EE.7 too. I have that.

Also 5.NBT.2 → 6.EE.1: 5.NBT.2 "Use whole-number exponents to denote powers of 10"; 6.EE.1 "Write and evaluate numerical expressions involving whole-number exponents." Yes, direct. I listed 6.EE.1 in the 位值 row's 拖累 column. Good.

One more check on 6.NS.4 as preview in lesson 3: GCF/LCM "Find the greatest common factor of two whole numbers ≤100 and LCM of two whole numbers ≤12..." — yes, and using distributive property to express sums. Fits naturally with fraction work. Good.

Lesson durations: user didn't specify; I'll assume each 课 is one session (~90 min) but not belabor it. Maybe suggest that each lesson = 巩固主题诊断 → 练习 → 小检测. Keep brief.

Also I should mention the diagnostic-first suggestion: start with a placement check to see which of the 巩固 items actually need work, since 6 lessons can't cover everything deeply. One line.

Now write the final answer in Chinese, with the tables. Keep it tight but complete. Include pdf_page footnote. Cite key English phrases for the most load-bearing claims:

- 5.NF.3: "Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b)" (P36–37)
- 6.RP.2: "the concept of a unit rate a/b associated with a ratio a:b" (P42)
- 5.OA.2: "Write simple expressions that record calculations with numbers" (P35)
- 6.EE.2: "expressions in which letters stand for numbers" (P43–44)
- 6.NS.2/6.NS.3: "Fluently divide..." / "Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm" (P42)

I'll put these as inline quotes where they justify the strongest links. OK, writing the final answer now. Structure:

1. 先给结论概览（一句话）
2. 表一：必须夯实的五年级课标 → 拖累的六年级编号
3. 表二：值得铺垫的六年级课标
4. 表三：六次课排布
5. 补充说明（未纳入项、页码核对、建议先诊断）

The user said "请回表选出" — likely typo for "请列表" (list in table). Tables it is.
```

</details>

查询完成（数据源：`references/standards.csv`，五年级 P35–38，六年级 P42–45）。以下是方案，分三张表：必须夯实的五年级课标 → 拖累的六年级编号、值得铺垫的六年级课标、六次课排布。

## 表一 · 五年级必须夯实，否则拖累六年级

| 主题 | 5 年级课标 | 要点 | 不牢会拖累的 6 年级课标 |
|---|---|---|---|
| 整数乘除 | 5.NBT.5、5.NBT.6 | 多位数乘法标准算法；四位数÷两位数 | 6.NS.2、6.NS.3、6.NS.4 |
| 位值 | 5.NBT.1、5.NBT.2 | 相邻位值 10×/1/10 关系；×10 的幂、指数记法 | 6.NS.3、6.NS.7、6.EE.1 |
| 小数 | 5.NBT.3、5.NBT.4、5.NBT.7 | 千分位读写比较；舍入；小数四则 | 6.NS.3、6.NS.7、6.EE.7 |
| 分数加减 | 5.NF.1、5.NF.2 | 异分母通分加减及应用题 | 6.NS.1、6.EE.7 |
| 分数乘除 | 5.NF.4、5.NF.6、5.NF.7 | 分数乘法；单位分数除法 | 6.NS.1、6.G.2 |
| 分数即除法 | 5.NF.3 | a/b = a ÷ b | 6.NS.1、6.RP.2 |
| 表达式 | 5.OA.1、5.OA.2 | 含括号算式求值；写、读算式 | 6.EE.1、6.EE.2 |
| 坐标 | 5.G.1、5.G.2 | 第一象限坐标平面 | 6.NS.6、6.NS.8、6.G.3、6.RP.3a |
| 度量 | 5.MD.1 | 单位换算 | 6.RP.3d |
| 体积 | 5.MD.5 | 长方体 V = lwh | 6.G.2 |

几个关键衔接的原文依据：
- 5.NF.3 "Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b)" → 6.RP.2 定义 "the unit rate a/b associated with a ratio a:b"，字面同源；分数除法 6.NS.1 也靠它。
- 5.OA.2 "Write simple expressions that record calculations with numbers" → 6.EE.2 就是 "expressions in which letters stand for numbers"（数字换成字母）。
- 6.NS.2/6.NS.3 都要求 "Fluently… using the standard algorithm"（P42），六年级不再回头教算法，只提流利度——所以 5.NBT.5–7 是硬门槛。

## 表二 · 六年级开学前值得铺垫的课标

| 6 年级课标 | 主题 | 为什么值得先铺垫 |
|---|---|---|
| 6.RP.1、6.RP.2、6.RP.3 | 比与单位率 | 六年级分量最重的全新领域（Major Work），概念和语言都是新的 |
| 6.NS.5、6.NS.6、6.NS.7、6.NS.8 | 负数与有理数 | 新数系，开学后的第二个大坎；建立在数线和坐标上 |
| 6.EE.1、6.EE.2、6.EE.6 | 指数、字母表示数 | 代数起点，"字母当数"的思维转换需要时间养成 |
| 6.NS.4 | 最大公因数/最小公倍数 | 直接服务通分约分，与五年级分数自然衔接 |

## 表三 · 六次课排布

| 课次 | 类型 | 主题 | 对应编号 | 一句话说明 |
|---|---|---|---|---|
| 1 | 巩固 | 整数乘除流利度 | 巩固 5.NBT.1、5.NBT.2、5.NBT.5、5.NBT.6 | 竖式乘法、两位除数长除法；×10ⁿ 的模式顺带为 6.EE.1 指数埋点 |
| 2 | 巩固 | 小数 | 巩固 5.NBT.3、5.NBT.4、5.NBT.7 | 读写、比较、舍入、四则；在数线上标小数，为课 5 负数做感觉铺垫 |
| 3 | 巩固 | 分数四则 | 巩固 5.NF.1、5.NF.2、5.NF.3、5.NF.4、5.NF.6、5.NF.7；尾段铺垫 6.NS.4 | 通分加减、分数乘法、单位分数除法；用 GCF/LCM 解释通分约分 |
| 4 | 铺垫 | 比与单位率 | 铺垫 6.RP.1、6.RP.2、6.RP.3；跳板 5.NF.3、5.MD.1 | 从 "a/b = a÷b" 直接引出单位率；用单价、速度、配方练比的语言；5.MD.1 换算升级为 6.RP.3d |
| 5 | 铺垫 | 负数与四象限 | 铺垫 6.NS.5、6.NS.6、6.NS.7、6.NS.8；跳板 5.G.1、5.G.2 | 温度/海拔/收支引出相反意义的量与 0；数线、相反数、绝对值初识；第一象限扩展到四象限 |
| 6 | 铺垫 | 从算式到代数式 | 铺垫 6.EE.1、6.EE.2、6.EE.6；跳板 5.OA.1、5.OA.2 | "数字换字母"游戏：把五年级算式中的数换成字母再求值；含指数的算式（6.EE.1）；简单 x + p = q 只点天平直觉，留待校内 |

## 补充说明

- **未纳入**（二级优先，学有余力再补）：5.G.3/5.G.4（图形层级 → 6.G.1 面积拆补）、5.MD.2（线图 → 6.SP 统计）、5.NF.5（乘法缩放，可融进课 3 或课 4 顺带复习）。六下统计（6.SP）与几何（6.G.1–4）内容新但相对独立，暑期不必抢。
- **先诊断再上课**：课 1 前建议做一次 20 分钟摸底（各 3–5 题覆盖 5.NBT.5–7、5.NF.1–7），六次课的巩固部分按诊断结果调权重——分数四则（课 3）内容最多，必要时可从课 2 挪时间。
- 页码核对：5.NBT 在 P35，5.NF 在 P36–37，5.MD/5.G 在 P37–38；6.RP/6.NS.1–4 在 P42，6.NS.5–8 在 P43，6.EE 在 P43–44，6.G/6.SP 在 P44–45。

