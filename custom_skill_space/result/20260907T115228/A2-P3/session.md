# session history

来源：`2026-09-07T03-55-09-535Z_01a07a01-6f5e-7fb0-ad35-a08fa9bdb27c.jsonl`

## user  <sub>2026-09-07T03:55:09.596Z</sub>

一位老师想在 4 年级课上讲「用字母表示未知数并解一元一次方程」。请回表判断：这个内容在课标里落在哪个年级的哪条编号上，4 年级本身有哪些相关课标，二者差距在哪。结论明确说是否越级，并给出 4 年级可以做的铺垫（只能引用表里真实存在的编号）。

## assistant  <sub>2026-09-07T03:55:14.639Z</sub>

<details><summary>thinking</summary>

```
The user asks about Common Core math standards: "using letters to represent unknowns and solving one-variable linear equations" — which grade/band this falls under, what Grade 4 has that's related, and the gap. They want a table-like answer ("请回表判断" — respond with a table), and conclusion whether this is beyond grade level, plus what Grade 4 can do as scaffolding, citing only real standard codes.

I should use the math-standards skill to look up the actual standards. Let me read the skill file first.
```

</details>

🔧 `read({"path": "/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/SKILL.md"})`

## toolResult · read  <sub>2026-09-07T03:55:14.704Z</sub>

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

## assistant  <sub>2026-09-07T03:55:32.932Z</sub>

<details><summary>thinking</summary>

```
The user wants:
1. Where does "using letters to represent unknowns and solving one-variable linear equations" fall in the standards (which grade, which code)?
2. What relevant standards does Grade 4 itself have?
3. What's the gap between the two?
4. Clear conclusion on whether this is beyond grade level (越级).
5. Grade 4 scaffoldings that can be done (citing only real codes from the table).

Let me look at the references. First check the index.md to locate relevant grades/domains, then query the CSV for:
- 6.EE (Expressions and Equations) — using variables, solving one-variable equations: 6.EE.5, 6.EE.6, 6.EE.7, 6.EE.8
- 7.EE.4 (solving one-variable equations/inequalities)
- 8.EE.7 (solving linear equations in one variable)
- 6.EE.2 (write expressions using letters)
- Also OA domain (Operations and Algebraic Thinking) — the K-5 progression leading to equations: 1.OA, 2.OA, 3.OA, 4.OA, 5.OA.

Grade 4 relevant: 4.OA standards — 4.OA.1 (multiplicative comparison), 4.OA.2, 4.OA.3 (multistep word problems), 4.OA.4, 4.OA.5. Also 4.NBT computation. The gap: unknowns in Grade 4 appear as blanks/boxes in equations? Actually the Common Core has 1.OA.8 (determine unknown whole number in addition/subtraction equations with symbols for unknown), 2.OA.1? Let me check: 1.OA.8 — "Determine the unknown whole number in an addition or subtraction equation relating three whole numbers." Also 3.OA.4 — determine unknown number in multiplication/division equations. So Grade 4's "unknown" experience is via OA but Grade 4 itself... let me check 4.OA.3 "Solve multistep word problems posed with whole numbers... Assess reasonableness". Hmm, is there something like "represent problems using equations with a letter standing for the unknown quantity" — that's 4.OA.3? Let me check. Actually, in Common Core, 4.OA.3 says "Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted..." — no letter. Wait, but 3.OA.8 says "represent these problems using equations with a letter standing for the unknown quantity"! Yes, 3.OA.8: "Solve two-step word problems using the four operations. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers..." That's Grade 3! Interesting — letters for unknowns appear in Grade 3 (3.OA.8) in word problems, but writing/solving equations formally is 6.EE.

Let me actually query the CSV to get the exact rows. I need to run the skill's commands from the skill directory: /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards.

Let me run several greps:
- 6.EE rows
- 7.EE.4, 8.EE.7
- 4.OA rows, 4.NBT maybe, 4.MD? (measurement equations?)
- 1.OA.8, 3.OA.4, 3.OA.8, 5.OA rows

The user asks "回表判断" — respond with a table. So my answer should be in table form.

Let me run the queries.
```

</details>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(6\\.EE|7\\.EE|8\\.EE)' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && awk -F',' '$2==\"4\"' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T03:55:32.955Z</sub>

```
6.EE.1,6,Expressions and Equations,Apply and extend previous understandings of arithmetic to algebraic expressions.,1. Write and evaluate numerical expressions involving whole-number exponents.,"P43, 44"
6.EE.2,6,Expressions and Equations,Apply and extend previous understandings of arithmetic to algebraic expressions.,"2. Write, read, and evaluate expressions in which letters stand for numbers. a. Write expressions that record operations with numbers and with letters standing for numbers. b. Identify parts of an expression using mathematical terms (sum, term, product, factor, quotient, coefficient); view one or more parts of an expression as a single entity. c. Evaluate expressions at specific values of their variables. Include expressions that arise from formulas used in real-world problems. Perform arithmetic operations, including those involving whole-number exponents, in the conventional order when there are no parentheses to specify a particular order (Order of Operations).","P43, 44"
6.EE.3,6,Expressions and Equations,Apply and extend previous understandings of arithmetic to algebraic expressions.,3. Apply the properties of operations to generate equivalent expressions.,"P43, 44"
6.EE.4,6,Expressions and Equations,Apply and extend previous understandings of arithmetic to algebraic expressions.,"4. Identify when two expressions are equivalent (i.e., when the two expressions name the same number regardless of which value is substituted into them).","P43, 44"
6.EE.5,6,Expressions and Equations,Reason about and solve one-variable equations and inequalities.,"5. Understand solving an equation or inequality as a process of answering a question: which values from a specified set, if any, make the equation or inequality true? Use substitution to determine whether a given number in a specified set makes an equation or inequality true.",P44
6.EE.6,6,Expressions and Equations,Reason about and solve one-variable equations and inequalities.,"6. Use variables to repres
…（省略 6579 字）
```

## toolResult · bash  <sub>2026-09-07T03:55:32.956Z</sub>

```
4.OA.1,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"1. Interpret a multiplication equation as a comparison,",P29
4.OA.2,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"2. Multiply or divide to solve word problems involving multiplicative comparison,",P29
4.OA.3,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"3. Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding.",P29
4.OA.4,4,Operations and Algebraic Thinking,Gain familiarity with factors and multiples.,4. Find all factor pairs for a whole number in the range 1–100. Recognize that a whole number is a multiple of each of its factors. Determine whether a given whole number in the range 1–100 is a multiple of a given one-digit number. Determine whether a given whole number in the range 1–100 is prime or composite.,P29
4.OA.5,4,Operations and Algebraic Thinking,Generate and analyze patterns.,5. Generate a number or shape pattern that follows a given rule. Identify apparent features of the pattern that were not explicit in the rule itself.,P29
4.NBT.1,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.,"1. Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right.",P29
4.NBT.2,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.,"2. Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form. Compare two multi-digit numbers based 
…（省略 7938 字）
```

## assistant  <sub>2026-09-07T03:56:25.699Z</sub>

<details><summary>thinking</summary>

```
I have the Grade 4 standards and the 6-8 EE standards. Now I want to also check the earlier grades' "unknown" related standards to be thorough about the progression and also to support the scaffolding discussion:

- 1.OA.8 — determine unknown whole number in addition/subtraction equations (uses symbols like ? or box)
- 3.OA.4 — determine unknown number in multiplication/division equations
- 3.OA.8 — two-step word problems with letter standing for unknown quantity
- 5.OA.1-3 — parentheses/brackets, numerical expressions, patterns as rules
- 6.EE.5-7 (already got)

Wait — interesting: 4.OA.3 in this table includes "Represent these problems using equations with a letter standing for the unknown quantity." Let me double check the actual Common Core 4.OA.3 text: "Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding."

Hmm, actually in the official Common Core, 3.OA.8 says "Represent these problems using equations with a letter standing for the unknown quantity." Let me verify what the official standards say. The official CCSS:

- 3.OA.8: "Solve two-step word problems using the four operations. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding."
- 4.OA.3: "Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding."

Actually both 3.OA.8 and 4.OA.3 include the "letter standing for the unknown quantity" phrase in the official CCSS. Let me check 3.OA.8 in this CSV to confirm.

So the interesting nuance: Grade 4 DOES have "equations with a letter standing for the unknown quantity" in 4.OA.3 — but it's within the Operations and Algebraic Thinking domain, for representing word problems, and solving them presumably with arithmetic reasoning, NOT the formal EE domain "solve one-variable linear equations" which begins at 6.EE (6.EE.5-7: substitution, x+p=q, px=q), deepens at 7.EE.4 (px+q=r, p(x+q)=r), and full "solve linear equations in one variable" including coefficient manipulation at 8.EE.7.

So the answer: the "solving one-variable linear equations" as a formal algebra topic lands at 6.EE (6.EE.7 being the core, also 6.EE.5, 6.EE.6), with 7.EE.4 and 8.EE.7 as the continuation. Grade 4's relevant standards: 4.OA.1, 4.OA.2, 4.OA.3 (letter for unknown in word problems), plus 4.NBT.4-6 computation, 4.MD.3 (area/perimeter formulas — P = 2(l+w) type reasoning with unknowns in real problems?), and the earlier-grade foundations (1.OA.8, 3.OA.4, 3.OA.8).

Let me check the earlier grades to confirm 1.OA.8, 2.OA?, 3.OA.4, 3.OA.8, 5.OA.1-3 exist in the table. Also maybe 5.OA.3 (generate two numerical patterns).

The user's question: 「用字母表示未知数并解一元一次方程」— "using letters to represent unknowns and solving one-variable linear equations". Where does it fall? Answer: 6.EE.6 (variables to represent numbers) + 6.EE.7 (solve x+p=q, px=q). Also 6.EE.5. The full "linear equations in one variable" with rational coefficients is 8.EE.7; 7.EE.4 in between.

Is teaching this in Grade 4 越级 (skipping ahead)? Partially:
- "Letter standing for unknown quantity" in word problems: actually present in Grade 3 (3.OA.8) and Grade 4 (4.OA.3)! So using a letter to represent an unknown in a word problem is NOT beyond grade level — it's explicitly in 4.OA.3.
- But "solving one-variable linear equations" as a formal process (equation-solving techniques, equivalent equations, negative/rational coefficients) starts at 6.EE — that IS two grades ahead. Note 6.EE.7 restricts to x + p = q and px = q with nonnegative rational numbers; 7.EE.4 adds px + q = r and p(x + q) = r with rational numbers; 8.EE.7 is the general "solve linear equations in one variable" with rational coefficients, distributive property, like terms.

Gap between Grade 4 and the target:
1. Domain gap: Grade 4 has no EE domain; "Algebra" in K-5 lives inside OA (Operations and Algebraic Thinking). The EE domain starts in Grade 6.
2. Number range gap: Grade 4 works with whole numbers (and unit fractions/decimals), 6.EE.7 requires nonnegative rational numbers.
3. Process gap: 6.EE.5 defines what "solving" means (substitution to check truth), 6.EE.6 defines variable meaning; Grade 4's "equation with a letter" is just a representation/recording tool, solved via arithmetic reasoning, not equation transformations.
4. Grade 5 bridge: 5.OA.1 (parentheses/brackets/order of operations), 5.OA.2 (write simple expressions, e.g., "add 8 and 7 then multiply by 2" → 2 × (8+7)), 5.OA.3 (patterns/rules). These are the true on-pathway scaffolds between Grade 4 and Grade 6.

Grade 4 scaffolding (citing only real codes):
- 4.OA.3: represent multistep word problems with equations with a letter standing for the unknown — this is the legitimate Grade 4 entry: use letters to RECORD problems, solve with arithmetic reasoning, assess reasonableness. So "用字母表示未知数" is fine in Grade 4 within 4.OA.3.
- 4.OA.1/4.OA.2: interpret multiplication equations as comparisons; multiplicative comparison word problems (e.g., "x is 3 times as many as y") — the structure later becomes px = q.
- 4.NBT.4/5/6: fluency in computation, and illustrating with equations/arrays/area models — the arithmetic needed.
- 4.MD.3: apply area and perimeter formulas for rectangles in real-world problems — a natural context for unknowns (e.g., P = 2(l+w), find l given P and w) — hmm, but is that allowed? The standard says "Apply the area and perimeter formulas" — yes, using formulas with an unknown side is a common Grade 4 application. It's legitimate to cite.
- 4.MD.7: angle measure additive — solve addition/subtraction problems to find unknown angles on a diagram. This is literally "unknown angle problems" — a classic early-algebraic reasoning context in Grade 4! "Solve addition and subtraction problems to find unknown angles on a diagram in real world and mathematical problems." Yes! That's a real Grade 4 standard that involves finding unknowns. 
- 4.OA.5: generate patterns, identify features — precursor to 5.OA.3 and variable rules.

What should be avoided in Grade 4 (i.e., what's 越级): formal equation-solving procedures (equivalent transformations, solving ax+b=c with negative coefficients), which land in 6.EE.5–7 / 7.EE.4 / 8.EE.7. If the teacher wants, a light extension: "guess and check" / substitution reasoning that 6.EE.5 describes is the conceptual heart — but formally it's Grade 6. Actually, careful: I should say the lesson as titled ("解一元一次方程") goes beyond Grade 4; the letter-for-unknown part is fine per 4.OA.3.

Also should check earlier-grade unknowns for the table (1.OA.8, 3.OA.4, 3.OA.8) and 5.OA. Let me grep those to quote accurately.

Also let me check the index.md for EE domain overview (P43-44 for 6.EE).

Let me grep:
- 1.OA.8, 3.OA.4, 3.OA.8
- 5.OA rows

Then compose the answer with tables:

Table 1: where the content falls — rows for 6.EE.5, 6.EE.6, 6.EE.7, (7.EE.4, 8.EE.7 as continuation), with grade/domain/pdf_page and the key original text (quoted). Maybe abbreviated quotes since they're long; the skill says quote the original English + code. I'll quote key sentences.

Table 2: Grade 4 relevant standards — 4.OA.1, 4.OA.2, 4.OA.3, 4.OA.5, 4.NBT.4-6 (maybe just cite), 4.MD.3, 4.MD.7. With original text excerpts.

Table 3: gap analysis — dimension by dimension.

Conclusion: 
- 「用字母表示未知数」本身在 4 年级就有落点（4.OA.3 原文明确写 "Represent these problems using equations with a letter standing for the unknown quantity"，且 3.OA.8 在 3 年级已出现同样表述）——不算越级。
- 「解一元一次方程」作为正式代数技能：6.EE.5–7（起步，x+p=q、px=q，非负有理数）→ 7.EE.4（px+q=r、p(x+q)=r）→ 8.EE.7（一般一元一次方程、含分配律与合并同类项）。4 年级直接教属越级，超前约两个年级。
- 越级的具体点：EE 域 6 年级才开始；方程求解概念（6.EE.5）与变量概念（6.EE.6）未铺垫；数域（4 年级整数的四则运算 + 同分母分数/两位小数，6.EE.7 要非负有理数）。

铺垫建议 (Grade 4, only real codes):
1. 4.OA.3 — 用带字母的方程记录多步应用题（整数字母未知数），用算术推理求值并检验合理性。
2. 4.OA.1 / 4.OA.2 — 乘法比较方程（x 是 y 的 3 倍 → 3x 结构的雏形，即 6.EE.7 的 px = q 的算术前身）。
3. 4.MD.3 — 长方形周长/面积公式中求未知边（公式的早期体验）。
4. 4.MD.7 — 未知角问题（加法/减法找未知量），正式的"由关系求未知数"训练。
5. 4.OA.5 — 按规则生成模式，为 5.OA.3 / 变量规则做铺垫。
6. 4.NBT.4–6 — 计算熟练度与用等式/阵列/面积模型解释计算（等式作为记录工具）。

Also mention the bridge to Grade 5: 5.OA.1/5.OA.2 (write simple expressions, order of operations) — maybe useful in the gap table. Let me check the 5.OA text to cite accurately.

Also check 1.OA.8 and 3.OA.4/3.OA.8 for the "symbols for unknown" progression — good for showing the trajectory: 1.OA.8 (symbol ?/box), 3.OA.4, 3.OA.8 (letter), 4.OA.3 (letter), 6.EE (variable + solve). This trajectory is valuable for the gap analysis.

Let me run these greps now.
```

</details>

已核对技能数据。再查几个衔接年级（1、3、5 年级）里与"未知数"相关的真实条目，把来龙去脉对齐：

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(1\\.OA\\.8|3\\.OA\\.4|3\\.OA\\.8)' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^5\\.OA' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T03:56:25.726Z</sub>

```
1.OA.8,1,Operations and Algebraic Thinking,Work with addition and subtraction equations.,8. Determine the unknown whole number in an addition or subtraction equation relating three whole numbers.,P15
3.OA.4,3,Operations and Algebraic Thinking,Represent and solve problems involving multiplication and division.,4. Determine the unknown whole number in a multiplication or division equation relating three whole numbers.,P23
3.OA.8,3,Operations and Algebraic Thinking,"Solve problems involving the four operations, and identify and explain patterns in arithmetic.",8. Solve two-step word problems using the four operations. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding.,P23

```

## toolResult · bash  <sub>2026-09-07T03:56:25.727Z</sub>

```
5.OA.1,5,Operations and Algebraic Thinking,Write and interpret numerical expressions.,"1. Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.",P35
5.OA.2,5,Operations and Algebraic Thinking,Write and interpret numerical expressions.,"2. Write simple expressions that record calculations with numbers, and interpret numerical expressions without evaluating them.",P35
5.OA.3,5,Operations and Algebraic Thinking,Analyze patterns and relationships.,"3. Generate two numerical patterns using two given rules. Identify apparent relationships between corresponding terms. Form ordered pairs consisting of corresponding terms from the two patterns, and graph the ordered pairs on a coordinate plane.",P35

```

## assistant  <sub>2026-09-07T03:57:12.420Z</sub>

<details><summary>thinking</summary>

```
All data confirmed. Now compose the answer with tables, quoting original English text with codes, grades, domains, PDF pages. Answer in Chinese (user wrote in Chinese). Structure:

1. 定位表：这个内容落在哪条编号（6.EE.5/6/7 为起点，7.EE.4、8.EE.7 为后续）
2. 4 年级相关课标表
3. 差距分析表
4. 结论：是否越级 — 拆成两半回答："用字母表示未知数"不越级（4.OA.3 原文就有）；"解一元一次方程"正式技能越级（6 年级起步，超前两年）
5. 4 年级可做的铺垫（只引用真实编号）

Note the trajectory: 1.OA.8 (symbol, 3 whole numbers, +/-) → 3.OA.4 (×/÷) → 3.OA.8 (letter in two-step word problems) → 4.OA.3 (letter in multistep) → 5.OA.1-3 (expressions/patterns) → 6.EE.5-9.

For quotes, keep them accurate. Include pdf_page columns.

Gap dimensions:
- 领域：4 年级没有 EE 域，代数内容在 OA 域内；EE 域 6 年级才出现
- 概念：6.EE.5 定义"解方程"（代入检验哪个值使等式为真）；6.EE.6 定义变量。4.OA.3 的字母只是记录工具，靠算术推理求值
- 结构：6.EE.7 只限 x+p=q、px=q（非负有理数）；7.EE.4 扩到 px+q=r、p(x+q)=r；8.EE.7 才是一般一元一次方程（有理数系数、分配律、合并同类项、解的个数讨论）
- 数域：4 年级是整数四则 + 同分母分数 + 两位小数；6.EE.7 要求非负有理数
- 解法：等价变形/移项没出现在 K-5

铺垫（4 年级真实编号）：
1. 4.OA.3 — 多步应用题"用带字母的等式表示"，算术推理求解 + 检验合理性（这是表里 4 年级唯一涉及字母的条目，也是最贴题的落点）
2. 4.OA.1 / 4.OA.2 — 乘法比较方程（倍数关系），是 px = q 的算术原型
3. 4.MD.3 — 周长/面积公式应用题（在公式里求未知量）
4. 4.MD.7 — 图上求未知角（可加性 → 加减求未知量）
5. 4.OA.5 — 按规则生成数/形模式（规则的雏形 → 5.OA.3 → 变量规则）
6. 4.NBT.4/5/6 — 计算熟练度，且 4.NBT.5/6 要求用等式、阵列、面积模型解释计算（等式作为记录与说理工具）

避免在 4 年级做的：正式的方程变形解法、含负数/任意有理数系数的一元一次方程（6.EE.7/7.EE.4/8.EE.7 的内容）。可以做的"非正式"延伸：在 4.OA.3 的框架内用代入/猜算检验（这正是 6.EE.5 的概念内核，但正式条目在 6 年级）——要小心表述：只说这是 6.EE.5 的方向，不是 4 年级课标要求。

Also the trajectory table: 1.OA.8 → 3.OA.4 → 3.OA.8 → 4.OA.3 → 5.OA.2 → 6.EE.6/7.

Keep answer well organized with tables in markdown. Use original English quotes (skill convention) plus brief Chinese gloss where helpful. Include pdf_page. Be careful not to fabricate any codes — all codes I cite: 1.OA.8, 3.OA.4, 3.OA.8, 4.OA.1, 4.OA.2, 4.OA.3, 4.OA.5, 4.NBT.4, 4.NBT.5, 4.NBT.6, 4.MD.3, 4.MD.7, 5.OA.1, 5.OA.2, 5.OA.3, 6.EE.5, 6.EE.6, 6.EE.7, 6.EE.8, 7.EE.4, 8.EE.7 — all verified in CSV above. Good.

Note 6.EE.8 is inequality — not needed; skip. Keep 7.EE.4 and 8.EE.7 as "后续进阶" rows.

Now write the final answer.
```

</details>

数据已核对完毕（来源：`references/standards.csv`，Common Core 数学课标）。下面回表判断。

## 一、这个内容落在哪：6 年级 EE 域起步，7、8 年级深化

「用字母表示未知数并解一元一次方程」不是一个编号，是一串编号，**正式起点在 6 年级 Expressions and Equations 域**：

| 编号 | 年级 / 域 | 课标原文（节选） | PDF 页 |
|---|---|---|---|
| 6.EE.6 | 6 / EE | "Use variables to represent numbers and write expressions when solving a real-world or mathematical problem; understand that a variable can represent an unknown number..." | P44 |
| 6.EE.7 | 6 / EE | "Solve real-world and mathematical problems by writing and solving equations of the form **x + p = q and px = q** for cases in which p, q and x are all nonnegative rational numbers." | P44 |
| 6.EE.5 | 6 / EE | "Understand solving an equation or inequality as a process of answering the question: which values… make the equation or inequality true? Use substitution to determine…" | P44 |
| 7.EE.4 | 7 / EE | "…Solve word problems leading to equations of the form **px + q = r and p(x + q) = r**…" | P49 |
| 8.EE.7 | 8 / EE | "Solve linear equations in one variable. …b. Solve linear equations with rational number coefficients, including equations whose solutions require expanding expressions using the distributive property and collecting like terms." | P54, 55 |

即：完整意义上的「一元一次方程」要到 **8.EE.7** 才收口；它的入门形态（x + p = q、px = q，非负有理数）是 **6.EE.7**。

## 二、4 年级本身的相关课标

| 编号 | 年级 / 域 | 课标原文（节选） | PDF 页 | 与本题的关系 |
|---|---|---|---|---|
| **4.OA.3** | 4 / OA | "Solve multistep word problems… **Represent these problems using equations with a letter standing for the unknown quantity.** Assess the reasonableness of answers…" | P29 | **表里 4 年级唯一涉及"字母表示未知数"的条目**，但限于用等式**记录**多步应用题，靠算术推理求解 |
| 4.OA.1 | 4 / OA | "Interpret a multiplication equation as a comparison" | P29 | 乘法比较关系（3 倍、4 倍），是 px = q 的算术原型 |
| 4.OA.2 | 4 / OA | "Multiply or divide to solve word problems involving multiplicative comparison" | P29 | 同上，倍数关系应用题 |
| 4.MD.3 | 4 / MD | "Apply the area and perimeter formulas for rectangles in real world and mathematical problems." | P31 | 公式里求未知边长，公式使用的早期体验 |
| 4.MD.7 | 4 / MD | "Recognize angle measure as additive. …Solve addition and subtraction problems to find **unknown angles** on a diagram…" | P31, 32 | "由关系式求未知量"的训练场 |
| 4.OA.5 | 4 / OA | "Generate a number or shape pattern that follows a given rule…" | P29 | 规则与模式的雏形 |
| 4.NBT.5 / 4.NBT.6 | 4 / NBT | "…Illustrate and explain the calculation by using **equations**, rectangular arrays, and/or area models." | P29, 30 | 等式作为记录与说理工具 |

（4.NBT.4 提供计算熟练度，非"等式"相关，列为背景即可。）

## 三、差距在哪

| 维度 | 4 年级现状 | 目标要求 | 差距 |
|---|---|---|---|
| 领域 | 无 EE 域，代数内容藏在 OA 域内 | EE 域 6 年级才设立 | **跨域跳级** |
| 字母的角色 | 4.OA.3：字母只是应用题的**记录符号**，解法是算术推理 | 6.EE.6：变量可以代表未知数或指定集合中的任意数 | 概念层级不同 |
| "解方程"的定义 | 课标未定义，只要求"求出答案并检验合理性" | 6.EE.5：代入检验哪个值使等式为真——"解"是一个**使等式成立的值** | 解方程概念未建 |
| 方程结构 | 无结构要求 | 6.EE.7 限 x+p=q、px=q；7.EE.4 到 px+q=r、p(x+q)=r；8.EE.7 才含分配律、合并同类项、解的个数讨论 | 形式化程度逐级递增，4 年级一步都没有 |
| 数域 | 整数四则为主（另有同分母分数、两位小数） | 6.EE.7 要求非负**有理数**；8.EE.7 有理数系数 | 数域未到位 |
| 中间衔接 | — | 5.OA.1（括号/运算顺序）、5.OA.2（写简单式子）、5.OA.3（两条规则生成数列） | 4→6 之间还有一个 5 年级台阶没走 |

## 四、结论：是否越级

**拆成两半看，结论不同：**

- **「用字母表示未知数」——不越级。** 4.OA.3 原文明确写了 "equations with a letter standing for the unknown quantity"（此表述在 3 年级 3.OA.8 已首次出现）。4 年级用字母记录应用题完全在课标内。
- **「解一元一次方程」——越级。** 作为正式技能（等式变形、移项、按 6.EE.5 的定义理解"解"），课标起点是 6 年级（6.EE.5–7），超前约 **两个年级**；完整形态要到 8.EE.7。若直接教含负系数、需合并同类项的一元一次方程，越级更严重。例外：在 4.OA.3 框架内用"算一算、代回去验一验"的方式求未知数，属于算术推理，不算越级——但要明白这是 6.EE.5 概念内核的提前渗透，而非 4 年级课标要求。

## 五、4 年级可以做的铺垫（全部为表内真实编号）

1. **4.OA.3**：主阵地。多步整数应用题，要求学生"用带字母的等式表示"再算术求解，并检验答案合理性——字母先当记录工具用熟。
2. **4.OA.1 / 4.OA.2**：乘法比较应用题（"A 是 B 的 3 倍"），写成形如 3×?=? 的等式，为将来 px = q 打算术底。
3. **4.MD.3**：在长方形周长/面积公式中求未知边长，体会"公式 + 未知量"。
4. **4.MD.7**：图上求未知角（角的可加性 → 加减法找未知量），是低门槛的"关系式求未知数"训练。
5. **4.OA.5**：按给定规则生成数/形模式并发现隐含特征，为 5 年级 5.OA.3、再到变量规则做铺垫。
6. **4.NBT.5 / 4.NBT.6**：用等式、阵列、面积模型解释计算——继续强化"等式是说理工具"的意识。

一句话：4 年级把"字母入等式"（4.OA.3）做扎实就够了；"解方程"这件事，留给 6 年级（6.EE.5–7）正式开始，5 年级的 5.OA.1–3 是中间那一级台阶。

