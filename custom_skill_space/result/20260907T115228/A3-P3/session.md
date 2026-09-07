# session history

来源：`2026-09-07T04-03-44-404Z_01a07a09-4a93-7777-9d23-07076ae56a17.jsonl`

## user  <sub>2026-09-07T04:03:44.531Z</sub>

沿年级追踪「分数与比例推理」这条主线：从 K 到高中，逐年级列出该主线上的关键课标编号与一句话要求，画出一条演进链，并标出其中三个最容易断档的衔接点（说明断在哪两条编号之间、为什么）。只用表里存在的编号。

## assistant  <sub>2026-09-07T04:03:50.567Z</sub>

<details><summary>thinking</summary>

```
The user wants me to trace the "fractions and proportional reasoning" thread from K to high school, listing key standard codes per grade, drawing an evolution chain, and marking three most likely break points. They mention using only codes that exist in the table — this suggests I should use the math-standards skill.

Let me first read the skill file to understand how to query the standards.
```

</details>

🔧 `read({"path": "/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/SKILL.md"})`

## toolResult · read  <sub>2026-09-07T04:03:50.579Z</sub>

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

## assistant  <sub>2026-09-07T04:03:54.539Z</sub>

<details><summary>thinking</summary>

```
Let me look at the index.md first to get an overview, then query the standards related to fractions and proportional reasoning across grades.
```

</details>

🔧 `read({"path": "/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/index.md"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -iE 'fraction' references/standards.csv | cut -d',' -f1,2"})`

## toolResult · read  <sub>2026-09-07T04:03:54.572Z</sub>

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

## toolResult · bash  <sub>2026-09-07T04:03:54.572Z</sub>

```
3.NF.1,3
3.NF.2,3
3.NF.3,3
3.G.2,3
4.NF.1,4
4.NF.2,4
4.NF.3,4
4.NF.4,4
4.NF.5,4
4.NF.6,4
4.NF.7,4
4.MD.2,4
4.MD.4,4
4.MD.5,4
5.NF.1,5
5.NF.2,5
5.NF.3,5
5.NF.4,5
5.NF.5,5
5.NF.6,5
5.NF.7,5
5.MD.2,5
6.NS.1,6
6.G.2,6
7.RP.1,7
7.NS.1,7
7.NS.2,7
7.NS.3,7
7.EE.3,7
7.SP.8,7
S-CP.6,High School — Statistics and Probability

```

## assistant  <sub>2026-09-07T04:04:06.243Z</sub>

<details><summary>thinking</summary>

```
Let me get the actual requirements for the fraction-related standards, plus proportional reasoning ones (6.RP, 7.RP), and relevant earlier grades (K-2 halves/quarters in geometry, partitioning), and high school ones that continue the thread (N-RN for rational exponents, A-APR for rational expressions, F-LE for linear/exponential models).

Let me query the key ones. First, let me look at:
- K.G.6? Actually K geometry doesn't have halves. 1.G.3 (partition circles/rectangles into halves and fourths), 2.G.3 (halves, thirds, fourths).
- 3.NF.1-3, 3.G.2
- 4.NF.1-7, 4.MD.4 maybe
- 5.NF.1-7
- 6.RP.1-3, 6.NS.1
- 7.RP.1-3, 7.NS.2 (rational numbers), 7.EE.3?
- 8.EE.5? (proportional relationships, unit rate, slope), 8.F? 
- High school: N-RN.1-3? A-APR.6-7 (rational expressions), F-LE.1-5 (linear/exponential), A-CED.2 (create equations), G-SRT (similarity)?

Let me fetch the actual text of the key standards.
```

</details>

Now let me pull the full text of the key standards on this thread. First the early grades (K–2 geometry partitioning, which is where halves/quarters begin), then the fraction domains:

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(1\\.G\\.3|2\\.G\\.3|3\\.G\\.2),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(3\\.NF\\.[1-3]),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:04:06.318Z</sub>

```
1.G.3,1,Geometry,Reason with shapes and their attributes.,"3. Partition circles and rectangles into two and four equal shares, describe the shares using the words halves, fourths, and quarters, and use the phrases half of, fourth of, and quarter of. Describe the whole as two of, or four of the shares. Understand for these examples that decomposing into more equal shares creates smaller shares.",P16
2.G.3,2,Geometry,Reason with shapes and their attributes.,"3. Partition circles and rectangles into two, three, or four equal shares, describe the shares using the words halves, thirds, half of, a third of, etc., and describe the whole as two halves, three thirds, four fourths. Recognize that equal shares of identical wholes need not have the same shape.",P20
3.G.2,3,Geometry,Reason with shapes and their attributes.,2. Partition shapes into parts with equal areas. Express the area of each part as a unit fraction of the whole.,P26

```

## toolResult · bash  <sub>2026-09-07T04:04:06.319Z</sub>

```
3.NF.1,3,Number and Operations—Fractions[5],Develop understanding of fractions as numbers.,1. Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b.,P24
3.NF.2,3,Number and Operations—Fractions[5],Develop understanding of fractions as numbers.,2. Understand a fraction as a number on the number line; represent fractions on a number line diagram. a. Represent a fraction 1/b on a number line diagram by defining the interval from 0 to 1 as the whole and partitioning it into b equal parts. Recognize that each part has size 1/b and that the endpoint of the part based at 0 locates the number 1/b on the number line. b. Represent a fraction a/b on a number line diagram by marking off a lengths 1/b from 0. Recognize that the resulting interval has size a/b and that its endpoint locates the number a/b on the number line.,P24
3.NF.3,3,Number and Operations—Fractions[5],Develop understanding of fractions as numbers.,"3. Explain equivalence of fractions in special cases, and compare fractions by reasoning about their size. a. Understand two fractions as equivalent (equal) if they are the same size, or the same point on a number line. b. Recognize and generate simple equivalent fractions, c. Express whole numbers as fractions, and recognize fractions that are equivalent to whole numbers. d. Compare two fractions with the same numerator or the same denominator by reasoning about their size. Recognize that comparisons are valid only when the two fractions refer to the same whole. Record the results of comparisons with the symbols >, =, or <, and justify the conclusions,",P24

```

## assistant  <sub>2026-09-07T04:04:10.391Z</sub>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(4\\.NF\\.[1-7]),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(5\\.NF\\.[1-7]),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:04:10.560Z</sub>

```
4.NF.1,4,Number and Operations—Fractions[3],Extend understanding of fraction equivalence and ordering.,"1. Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size. Use this principle to recognize and generate equivalent fractions.",P30
4.NF.2,4,Number and Operations—Fractions[3],Extend understanding of fraction equivalence and ordering.,"2. Compare two fractions with different numerators and different denominators,",P30
4.NF.3,4,Number and Operations—Fractions[3],Build fractions from unit fractions by applying and extending previous understandings of operations on whole numbers.,"3. Understand a fraction a/b with a > 1 as a sum of fractions 1/b. a. Understand addition and subtraction of fractions as joining and separating parts referring to the same whole. b. Decompose a fraction into a sum of fractions with the same denominator in more than one way, recording each decomposition by an equation. Justify decompositions, c. Add and subtract mixed numbers with like denominators, d. Solve word problems involving addition and subtraction of fractions referring to the same whole and having like denominators,",P30
4.NF.4,4,Number and Operations—Fractions[3],Build fractions from unit fractions by applying and extending previous understandings of operations on whole numbers.,"4. Apply and extend previous understandings of multiplication to multiply a fraction by a whole number. a. Understand a fraction a/b as a multiple of 1/b. b. Understand a multiple of a/b as a multiple of 1/b, and use this understanding to multiply a fraction by a whole number. c. Solve word problems involving multiplication of a fraction by a whole number,",P30
4.NF.5,4,Number and Operations—Fractions[3],"Understand decimal notation for fractions, and compare decimal fractions.","5. Express a fraction with denominator 10 as an equival
…（省略 696 字）
```

## toolResult · bash  <sub>2026-09-07T04:04:10.561Z</sub>

```
5.NF.1,5,Number and Operations—Fractions,Use equivalent fractions as a strategy to add and subtract fractions.,1. Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions in such a way as to produce an equivalent sum or difference of fractions with like denominators.,P36
5.NF.2,5,Number and Operations—Fractions,Use equivalent fractions as a strategy to add and subtract fractions.,"2. Solve word problems involving addition and subtraction of fractions referring to the same whole, including cases of unlike denominators,",P36
5.NF.3,5,Number and Operations—Fractions,Apply and extend previous understandings of multiplication and division to multiply and divide fractions.,"3. Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b). Solve word problems involving division of whole numbers leading to answers in the form of fractions or mixed numbers,","P36, 37"
5.NF.4,5,Number and Operations—Fractions,Apply and extend previous understandings of multiplication and division to multiply and divide fractions.,"4. Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction. a. Interpret the product (a/b) × q as a parts of a partition of q into b equal parts; equivalently, as the result of a sequence of operations a × q ÷ b. b. Find the area of a rectangle with fractional side lengths by tiling it with unit squares of the appropriate unit fraction side lengths, and show that the area is the same as would be found by multiplying the side lengths. Multiply fractional side lengths to find areas of rectangles, and represent fraction products as rectangular areas.","P36, 37"
5.NF.5,5,Number and Operations—Fractions,Apply and extend previous understandings of multiplication and division to multiply and divide fractions.,"5. Interpret multiplication as scaling (resizing), by: a. Comparing the size of a product to the size of one f
…（省略 1414 字）
```

## assistant  <sub>2026-09-07T04:04:16.812Z</sub>

<details><summary>thinking</summary>

```
Now let me get 6.RP.1-3, 6.NS.1, 7.RP.1-3, and 8th grade ones (8.EE.5, 8.EE.6, 8.F.2, 8.F.4?), plus high school (N-RN.1, A-APR.6/7, F-LE.1-5, A-CED.2, G-SRT, N-Q). Let me query those.
```

</details>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(6\\.RP\\.[1-3]|6\\.NS\\.1),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(7\\.RP\\.[1-3]),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:04:16.831Z</sub>

```
6.RP.1,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,1. Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.,P42
6.RP.2,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,"2. Understand the concept of a unit rate a/b associated with a ratio a:b with b ≠ 0, and use rate language in the context of a ratio relationship.",P42
6.RP.3,6,Ratios and Proportional Relationships,Understand ratio concepts and use ratio reasoning to solve problems.,"3. Use ratio and rate reasoning to solve real-world and mathematical problems, a. Make tables of equivalent ratios relating quantities with whole-number measurements, find missing values in the tables, and plot the pairs of values on the coordinate plane. Use tables to compare ratios. b. Solve unit rate problems including those involving unit pricing and constant speed. c. Find a percent of a quantity as a rate per 100; solve problems involving finding the whole, given a part and the percent. d. Use ratio reasoning to convert measurement units; manipulate and transform units appropriately when multiplying or dividing quantities.",P42
6.NS.1,6,The Number System,Apply and extend previous understandings of multiplication and division to divide fractions by fractions.,"1. Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions,",P42

```

## toolResult · bash  <sub>2026-09-07T04:04:16.832Z</sub>

```
7.RP.1,7,Ratios and Proportional Relationships,Analyze proportional relationships and use them to solve real-world and mathematical problems.,"1. Compute unit rates associated with ratios of fractions, including ratios of lengths, areas and other quantities measured in like or different units.",P48
7.RP.2,7,Ratios and Proportional Relationships,Analyze proportional relationships and use them to solve real-world and mathematical problems.,"2. Recognize and represent proportional relationships between quantities. a. Decide whether two quantities are in a proportional relationship, b. Identify the constant of proportionality (unit rate) in tables, graphs, equations, diagrams, and verbal descriptions of proportional relationships. c. Represent proportional relationships by equations. d. Explain what a point (x, y) on the graph of a proportional relationship means in terms of the situation, with special attention to the points (0, 0) and (1, r) where r is the unit rate.",P48
7.RP.3,7,Ratios and Proportional Relationships,Analyze proportional relationships and use them to solve real-world and mathematical problems.,3. Use proportional relationships to solve multistep ratio and percent problems.,P48

```

## assistant  <sub>2026-09-07T04:04:21.062Z</sub>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(8\\.EE\\.5|8\\.EE\\.6|8\\.F\\.2|8\\.F\\.3|8\\.F\\.4),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(N-RN\\.1|N-RN\\.2|N-RN\\.3|N-Q\\.1|N-Q\\.2|N-Q\\.3),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:04:21.082Z</sub>

```
8.EE.5,8,Expressions and Equations,"Understand the connections between proportional relationships, lines, and linear equations.","5. Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways.",P54
8.EE.6,8,Expressions and Equations,"Understand the connections between proportional relationships, lines, and linear equations.",6. Use similar triangles to explain why the slope m is the same between any two distinct points on a non-vertical line in the coordinate plane; derive the equation y = mx for a line through the origin and the equation y = mx + b for a line intercepting the vertical axis at b.,P54
8.F.2,8,Functions,"Define, evaluate, and compare functions.","2. Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions).",P55
8.F.3,8,Functions,"Define, evaluate, and compare functions.","3. Interpret the equation y = mx + b as defining a linear function, whose graph is a straight line; give examples of functions that are not linear.",P55
8.F.4,8,Functions,Use functions to model relationships between quantities.,"4. Construct a function to model a linear relationship between two quantities. Determine the rate of change and initial value of the function from a description of a relationship or from two (x, y) values, including reading these from a table or from a graph. Interpret the rate of change and initial value of a linear function in terms of the situation it models, and in terms of its graph or a table of values.",P55

```

## toolResult · bash  <sub>2026-09-07T04:04:21.083Z</sub>

```
N-RN.1,High School — Number and Quantity,The Real Number System,Extend the properties of exponents to rational exponents.,"1. Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents to those values, allowing for a notation for radicals in terms of rational exponents.",P60
N-RN.2,High School — Number and Quantity,The Real Number System,Extend the properties of exponents to rational exponents.,2. Rewrite expressions involving radicals and rational exponents using the properties of exponents.,P60
N-RN.3,High School — Number and Quantity,The Real Number System,Use properties of rational and irrational numbers.,3. Explain why the sum or product of two rational numbers is rational; that the sum of a rational number and an irrational number is irrational; and that the product of a nonzero rational number and an irrational number is irrational.,P60
N-Q.1,High School — Number and Quantity,Quantities★,Reason quantitatively and use units to solve problems.,1. Use units as a way to understand problems and to guide the solution of multi-step problems; choose and interpret units consistently in formulas; choose and interpret the scale and the origin in graphs and data displays.,P60
N-Q.2,High School — Number and Quantity,Quantities★,Reason quantitatively and use units to solve problems.,2. Define appropriate quantities for the purpose of descriptive modeling.,P60
N-Q.3,High School — Number and Quantity,Quantities★,Reason quantitatively and use units to solve problems.,3. Choose a level of accuracy appropriate to limitations on measurement when reporting quantities.,P60

```

## assistant  <sub>2026-09-07T04:04:28.567Z</sub>

<details><summary>thinking</summary>

```
Let me also check A-APR.6, A-APR.7 (rational expressions), F-LE.1-5, A-CED.2, G-SRT.1 (dilation/scale factor). Also 7.NS.2 (rational numbers division), 7.EE.3. Let me query those.
```

</details>

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(A-APR\\.6|A-APR\\.7|F-LE\\.1|F-LE\\.2|F-LE\\.3|G-SRT\\.1|G-SRT\\.2),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(7\\.NS\\.2|7\\.NS\\.3|7\\.EE\\.3),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:04:28.610Z</sub>

```
A-APR.6,High School — Algebra,Arithmetic with Polynomials and Rational Expressions,Rewrite rational expressions,"6. Rewrite simple rational expressions in different forms; write a(x)/b(x) in the form q(x) + r(x)/b(x), where a(x), b(x), q(x), and r(x) are polynomials with the degree of r(x) less than the degree of b(x), using inspection, long division, or, for the more complicated",P65
A-APR.7,High School — Algebra,Arithmetic with Polynomials and Rational Expressions,Rewrite rational expressions,"7. (+) Understand that rational expressions form a system analogous to the rational numbers, closed under addition, subtraction, multiplication, and division by a nonzero rational expression; add, subtract, multiply, and divide rational expressions.",P65
F-LE.1,High School — Functions,"Linear, Quadratic, and Exponential Models★","Construct and compare linear, quadratic, and exponential models and solve problems","1. Distinguish between situations that can be modeled with linear functions and with exponential functions. a. Prove that linear functions grow by equal differences over equal intervals, and that exponential functions grow by equal factors over equal intervals. b. Recognize situations in which one quantity changes at a constant rate per unit interval relative to another. c. Recognize situations in which a quantity grows or decays by a constant percent rate per unit interval relative to another.","P70, 71"
F-LE.2,High School — Functions,"Linear, Quadratic, and Exponential Models★","Construct and compare linear, quadratic, and exponential models and solve problems","2. Construct linear and exponential functions, including arithmetic and geometric sequences, given a graph, a description of a relationship, or two input-output pairs (include reading these from a table).","P70, 71"
F-LE.3,High School — Functions,"Linear, Quadratic, and Exponential Models★","Construct and compare linear, quadratic, and exponential models and solve problems","3. Observe using graphs and
…（省略 1123 字）
```

## toolResult · bash  <sub>2026-09-07T04:04:28.611Z</sub>

```
7.NS.2,7,The Number System,"Apply and extend previous understandings of operations with fractions to add, subtract, multiply, and divide rational numbers.","2. Apply and extend previous understandings of multiplication and division and of fractions to multiply and divide rational numbers. a. Understand that multiplication is extended from fractions to rational numbers by requiring that operations continue to satisfy the properties of operations, particularly the distributive property, leading to products such as (–1)(–1) = 1 and the rules for multiplying signed numbers. Interpret products of rational numbers by describing real-world contexts. b. Understand that integers can be divided, provided that the divisor is not zero, and every quotient of integers (with non-zero divisor) is a rational number. If p and q are integers, then –(p/q) = (–p)/q = p/(–q). Interpret quotients of rational numbers by describing real-world contexts. c. Apply properties of operations as strategies to multiply and divide rational numbers. d. Convert a rational number to a decimal using long division; know that the decimal form of a rational number terminates in 0s or eventually repeats.","P48, 49"
7.NS.3,7,The Number System,"Apply and extend previous understandings of operations with fractions to add, subtract, multiply, and divide rational numbers.",3. Solve real-world and mathematical problems involving the four operations with rational numbers.,"P48, 49"
7.EE.3,7,Expressions and Equations,Solve real-life and mathematical problems using numerical and algebraic expressions and equations.,"3. Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers in any form (whole numbers, fractions, and decimals), using tools strategically. Apply properties of operations to calculate with numbers in any form; convert between forms as appropriate; and assess the reasonableness of answers using mental computation and estimation strategies.",P49

```

## assistant  <sub>2026-09-07T04:05:46.313Z</sub>

<details><summary>thinking</summary>

```
Now let me also check 8.NS.1 (rational vs irrational, decimal expansion) and 6.NS.6/6.NS.7 (negative numbers on number line)? For the fraction/proportional reasoning thread, the main chain is:

K-2: geometry partitioning (1.G.3, 2.G.3) — shares, not numbers
3: 3.NF.1-3 (fractions as numbers, number line, equivalence)
4: 4.NF.1-7 (equivalence general principle, ordering, unit fraction ops, decimals)
5: 5.NF.1-7 (unlike denominators, fraction as division, multiplication as scaling, division)
6: 6.RP.1-3 + 6.NS.1 (ratios, unit rate, dividing fractions by fractions)
7: 7.RP.1-3 + 7.NS.2-3 (proportional relationships, constant of proportionality, rational numbers)
8: 8.EE.5-6, 8.F.3-4 (slope as unit rate, y=mx+b, linear functions)
HS: F-LE.1-3 (linear vs exponential models), A-CED.2?, N-Q (rates/units), A-APR.6-7 (rational expressions), N-RN (rational exponents), G-SRT.1-2 (similarity, scale factor)

Let me check 8.NS.1 too for rational number decimal expansion. Also F-IF? Probably not needed. Also, maybe check F-IF.6 (average rate of change)? Let me quickly check that, and A-CED.2.

Actually, I have enough. Let me think about what the key chain is and where the three biggest gaps are.

The evolution chain (only using codes that exist in the table):

1. 1.G.3 — partition circles/rectangles into 2 or 4 equal shares, "half of", "fourth of" (shares, not numbers)
2. 2.G.3 — partition into 2, 3, 4 shares; halves, thirds, fourths; equal shares need not have same shape
3. 3.G.2 — partition shapes into equal areas; area of each part as unit fraction of the whole (bridge from geometry to fraction)
4. 3.NF.1 — fraction 1/b as quantity formed by 1 part when whole partitioned into b equal parts; a/b as a parts of size 1/b
5. 3.NF.2 — fraction as number on the number line
6. 3.NF.3 — equivalence in special cases, comparing by size
7. 4.NF.1 — general equivalence principle a/b = (n×a)/(n×b)
8. 4.NF.2 — compare fractions with different numerators and denominators
9. 4.NF.3 — a/b as sum of unit fractions; add/subtract like denominators
10. 4.NF.4 — multiply fraction by whole number (a/b as multiple of 1/b)
11. 4.NF.5-7 — decimal notation for fractions (denominators 10/100), compare decimals
12. 5.NF.1-2 — add/subtract unlike denominators via equivalence
13. 5.NF.3 — a/b = a ÷ b (fraction as division!)
14. 5.NF.4 — multiply fraction by fraction; area of rectangle with fractional sides
15. 5.NF.5 — multiplication as scaling (resizing)
16. 5.NF.6-7 — real world multiplication, division of unit fractions
17. 6.NS.1 — divide fractions by fractions
18. 6.RP.1 — ratio concept, ratio language
19. 6.RP.2 — unit rate a/b associated with ratio a:b
20. 6.RP.3 — ratio/rate reasoning: tables of equivalent ratios, percent, unit conversion
21. 7.RP.1 — compute unit rates of ratios of fractions
22. 7.RP.2 — proportional relationships: constant of proportionality, y = kx... "Represent proportional relationships by equations", point (1, r)
23. 7.RP.3 — multistep ratio and percent problems
24. 7.NS.2 — rational numbers: multiply/divide rational numbers, p/q form, terminating/repeating decimals
25. 8.NS.1 — (need to check) rational numbers have terminating/repeating decimal expansions; irrational...
26. 8.EE.5 — graph proportional relationships, unit rate as slope
27. 8.EE.6 — similar triangles → slope, y = mx, y = mx + b
28. 8.F.3 — y = mx + b as linear function
29. 8.F.4 — construct linear function, rate of change and initial value
30. HS F-LE.1 — distinguish linear vs exponential (constant rate per unit interval vs constant percent)
31. F-LE.2 — construct linear and exponential functions
32. A-APR.6-7 — rational expressions (system analogous to rational numbers)
33. N-RN.1-2 — rational exponents (fractional exponents)
34. G-SRT.1-2 — dilations, scale factor, similarity → proportional sides
35. N-Q.1-2 — units, rates in modeling

That's the full chain. Now the three most likely break points (断档/衔接点):

Candidate break points:

1. **2.G.3 → 3.NF.1-2 (grade 2 → grade 3)**: In K-2, "half" is a share of a shape (geometry, non-numeric). In grade 3, a fraction suddenly becomes a *number* located on the number line. This is a conceptual leap: from "half of the pizza" to "1/2 is a point between 0 and 1 on the number line". Research (e.g., Lamon, the "share vs number" distinction) shows this is a well-known difficult transition. However, note there's 3.G.2 as a bridge. Still, the shift from area/partition model to number-line/measurement model is a known break.

2. **4.NF.4 → 5.NF.4 / 5.NF.3 (grade 4 → grade 5)**: multiplication goes from fraction × whole number to fraction × fraction, and 5.NF.3 introduces fraction as division (a/b = a ÷ b). The "multiplication as scaling" (5.NF.5) idea is genuinely new. But is this the biggest gap? Grade 4→5 fraction ops is a classic stumbling block but the standards sequence it pretty deliberately.

3. **5.NF/6.NS.1 → 6.RP.1 (fractions → ratios)**: The classic "fraction-to-ratio" gap. Students think 2/3 as a number (part-whole), then ratio language a:b is about a *relationship between two quantities*, not a single number. The part-whole fraction concept and the ratio concept are distinct: a ratio 2:3 isn't automatically a fraction 2/3 (part-to-part vs part-to-whole). 6.RP.1 introduces ratio language, 6.RP.2 unit rate a/b. This is a documented conceptual discontinuity — many students treat ratios as fractions blindly (adding ratios like fractions etc.).

4. **6.RP.3 → 7.RP.2**: from ratio reasoning (tables, percents) to formal proportional relationships with constant of proportionality and equations y=kx... Actually 7.RP.2 says "Represent proportional relationships by equations" without literally saying y=kx, but "constant of proportionality (unit rate)". This is a step but reasonably bridged.

5. **8.EE.5-6 / 8.F.4 → F-LE.1 (grade 8 → HS)**: linear function y=mx+b → distinguishing linear vs exponential models. The rate-of-change concept moves from "slope/unit rate" (difference-based) to "constant percent rate" (factor-based). The multiplicative reasoning resurfaces. This is a well-documented gap: students who conflate additive and multiplicative growth. Also the thread from proportional reasoning to function modeling is where the "unit rate" idea becomes "average rate of change" / parameter interpretation.

6. **8.NS.1 / 7.NS.2 → N-RN / A-APR.6-7**: rational numbers → rational exponents and rational expressions. In HS, the fraction thread nearly disappears as a domain; it resurfaces in specialized clusters (A-APR "Rewrite rational expressions" is a (+) optional standard, N-RN rational exponents). The break: between 8th grade and HS, fraction/proportional reasoning is no longer a named strand; it dissolves into "quantities" (N-Q) and modeling. The A-APR.7 is a (+) standard (beyond college/career-ready), meaning many students never reconnect.

Which three are the "most likely to break"? Let me think about which are most defensible with the table:

The user asks for three break points, specifying between which two codes, and why. I should pick:

**断档 1: 2.G.3 → 3.NF.2** (or 3.NF.1): from "equal shares of shapes" (geometry language) to "fraction as a number on the number line". Why: in K-2 the halves/thirds live in the Geometry domain as sharing language, never as numbers; grade 3 demands the re-conceptualization of a/b as a number with magnitude and position. The domain switch (Geometry → Number and Operations—Fractions) is visible in the table. 3.G.2 partially bridges (area as unit fraction), but the number-line model (3.NF.2) has no precursor in the table — nothing in K-2 Measurement and Data prepares locating fractions on number lines. Actually let me check if there's anything about number lines in MD... 2.MD.x? Let me search for "number line" in the CSV.

**断档 2: 6.NS.1/6.RP.1 (fraction → ratio)**: between 5.NF.7/6.NS.1 and 6.RP.1. The part-whole number concept vs. two-quantity relationship. The table shows the thread switches domains from NF/NS to RP. Why it breaks: a ratio is not inherently a single number; students must coordinate two quantities and their covariation, then unit rate a/b (6.RP.2) re-fractionalizes it. 5.NF.5's "multiplication as scaling" is the closest precursor but nothing teaches part-part vs part-whole distinction.

**断档 3: 8.F.4/8.EE.6 → F-LE.1**: slope/unit rate → linear vs exponential models. Why: unit rate becomes "constant rate per unit interval" but now competes with "constant percent rate per unit interval" (F-LE.1c); multiplicative growth. The additive/multiplicative confusion traces all the way back to 4.NF.4 (repeated addition view of multiplication) vs 5.NF.5 (scaling view). Also after grade 8 the RP domain disappears entirely; in HS the thread has no home domain — it scatters into F-LE, N-Q, G-SRT, A-APR.

Alternatively, 断档 3 could be **7.RP.3 → 8.EE.5**? No wait, that's fairly continuous (unit rate as slope is explicit in 8.EE.5).

Hmm, but also worth considering the "gap" between grades where NOTHING on the thread appears. Looking at the table:
- K: nothing on fractions (no halves at all — 1.G.3 is the first). So K→1: the thread doesn't start until grade 1. The user said "从 K 到高中" but in K there's nothing on this thread in the table. I should be honest: K has no fraction-related standard; the thread starts at 1.G.3. Let me verify K.G.1-6 and K.MD don't mention halves... The grep for "fraction" showed nothing in K. Let me also grep "half" and "shares".

Also check: is there anything in grade 8 on the fraction thread besides 8.EE.5-6, 8.F? 8.NS.1-2 (rational/irrational). Let me check 8.NS.1.

Also for HS: A-CED.2 (create equations), F-IF.6 (rate of change)? Let me check F-IF.6 and A-CED.2 quickly. And also check "similar" in 8.G (8.G.4 similar figures?). 8.G.4 — "Understand that a two-dimensional figure is similar..." — that's also on the proportional thread (scale factor). Let me check.

Let me run a few more greps: "half", "number line", 8.NS.1, 8.G.4, F-IF.6, A-CED.2.

Then I'll compose the final answer:
- Table per grade with key codes + one-sentence requirements (in Chinese, quoting the essence of the English; the skill says give original English when citing. Hmm, "引用课标要求时给出原文（英文）加编号，必要时再翻译" — the answer will be long if I quote everything in English. The user asked for "一句话要求" (one-sentence requirement). I'll give a concise Chinese one-liner, maybe with brief English key phrases where it matters. To balance the skill convention, I could include the original English for the pivotal standards at the three break points. Actually, the skill convention says when citing requirement text, give the original English. For a per-grade one-liner chain, I'll write the one-liner in Chinese but grounded in the original text, and at the three break points quote the exact English phrases that show the discontinuity. That's a reasonable interpretation: 关键处引原文. Let me be pragmatic — include short English quotes for key evidence.

Actually, to be safe and compliant, I can give each row's one-sentence requirement in Chinese (condensed translation of the original), and at the break-point analysis quote English originals. The skill says "必要时再翻译" — implying English original + translation when needed. For a table with ~20 rows, full English would bloat it. I'll do: table with Chinese one-liners (faithful summaries), plus English quotes in the break-point section. I think that satisfies the spirit. Also give grade/domain and pdf_page per the convention — I can add pdf_page in the table. That's nice: code | grade | one-liner | pdf_page? That might be too wide. I could include pdf pages in parentheses. Let me include a compact column.

The evolution chain: draw as ASCII arrow chain.

Three break points:
1. 2.G.3 → 3.NF.1/3.NF.2 (grade 2→3): share-language in Geometry → fraction-as-number on number line in a new domain. Why: conceptual leap from "parts of a whole shape" to "a number with position/magnitude"; number line model appears for the first time with no precursor; also 3.G.2 shows the curriculum itself tries to bridge (area as unit fraction) but the table has no K-2 standard on number lines with measurement... wait, 2.MD.6? Let me check 2.MD.6 — "Represent whole numbers as lengths from 0 on a number line" — that's about whole numbers, still a precursor for number line. Let me check it.

2. 6.NS.1 → 6.RP.1 (grade 5→6 or within 6): fraction as a number vs ratio as a relationship between two quantities. Actually the chain within grade 6 goes 6.NS.1 (divide fractions) and 6.RP.1-3. The break is conceptually between 5.NF.7/6.NS.1 (fraction as number/quotient) and 6.RP.1 (ratio between two quantities). Why it breaks: part-whole vs part-part; ratio is covariational; nothing in 3-5NF teaches part-part or ratio-as-relationship (except maybe 4.OA.2? "multiplicative comparison" — 4.OA.1/4.OA.2 are actually precursors of ratio reasoning! Let me check 4.OA.1-2. "Interpret a multiplication equation as a comparison" — yes that's relevant.)

Hmm, but 4.OA.1-2 (multiplicative comparison) is arguably part of the proportional reasoning thread. Let me check its text. If I include it, the chain is richer and the gap analysis more precise: 4.OA.1 (multiply as comparison "times as many") → 6.RP.1.

3. 8.EE.6/8.F.4 → F-LE.1 (grade 8 → HS): the RP domain vanishes; unit rate/slope must re-emerge as "constant rate per unit interval" vs "constant percent rate per unit interval". Why: additive vs multiplicative change; the thread's home domain disappears after 7th grade and it's fully dissolved by HS (scattered across F-LE, N-Q, G-SRT, A-APR with the (+) marker on A-APR.7).

Alternatively, break point 3 could be 5.NF.3 → 6.NS.1? Not really, 6.NS.1 is a natural extension.

Or 4.NF.4 → 5.NF.4? The leap from "fraction × whole number" to "fraction × fraction" plus 5.NF.3's "fraction as division". Hmm. Many researchers point to grade 4→5 fraction operations as the biggest cliff, but the standards sequence it OK. The most commonly cited conceptual gaps in the literature for this thread: (a) whole number → fraction (share vs number), (b) fraction → ratio (part-whole vs relationship), (c) arithmetic ratio → algebraic function/slope, (d) additive vs multiplicative thinking (linear vs exponential). I'll pick (a), (b), and (d) with the domain disappearance as evidence for (d). Actually let me reconsider (c) 8.EE.5→8.EE.6 is fine, 7.RP.2→8.EE.5 is fine ("unit rate as slope" explicitly). So (c) is bridged well by the table. (d) 8.F.4 → F-LE.1 is the real cliff.

Let me double check a few more standards to make sure I'm not missing precursors: 2.MD.6 (number line), 4.OA.1/4.OA.2 (multiplicative comparison), 8.G.4 (similar figures), F-IF.6 (average rate of change), A-CED.2, 8.NS.1. Let me grep those.
```

</details>

在最终确定之前，让我再检查一下该主线链条中几个可能的先修标准（数轴引入、倍数关系、相似图形、变化率）。

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(2\\.MD\\.6|4\\.OA\\.1|4\\.OA\\.2|8\\.G\\.4|8\\.NS\\.1),' references/standards.csv"})`

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(F-IF\\.6|A-CED\\.2|F-LE\\.5),' references/standards.csv && grep -iE 'ratio|proportional|unit rate|slope' references/standards.csv | cut -d',' -f1 | sort -u"})`

## toolResult · bash  <sub>2026-09-07T04:05:46.347Z</sub>

```
2.MD.6,2,Measurement and Data,Relate addition and subtraction to length.,"6. Represent whole numbers as lengths from 0 on a number line diagram with equally spaced points corresponding to the numbers 0, 1, 2,..., and represent whole-number sums and differences within 100 on a number line diagram.",P20
4.OA.1,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"1. Interpret a multiplication equation as a comparison,",P29
4.OA.2,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"2. Multiply or divide to solve word problems involving multiplicative comparison,",P29
8.NS.1,8,The Number System,"Know that there are numbers that are not rational, and approximate them by rational numbers.","1. Know that numbers that are not rational are called irrational. Understand informally that every number has a decimal expansion; for rational numbers show that the decimal expansion repeats eventually, and convert a decimal expansion which repeats eventually into a rational number.",P54
8.G.4,8,Geometry,"Understand congruence and similarity using physical models, transparencies, or geometry software.","4. Understand that a two-dimensional figure is similar to another if the second can be obtained from the first by a sequence of rotations, reflections, translations, and dilations; given two similar two-dimensional figures, describe a sequence that exhibits the similarity between them.","P55, 56"

```

## toolResult · bash  <sub>2026-09-07T04:05:46.348Z</sub>

```
A-CED.2,High School — Algebra,Creating Equations★,Create equations that describe numbers or relationships,2. Create equations in two or more variables to represent relationships between quantities; graph equations on coordinate axes with labels and scales.,P65
F-IF.6,High School — Functions,Interpreting Functions,Interpret functions that arise in applications in terms of the context,6. Calculate and interpret the average rate of change of a function (presented symbolically or as a table) over a specified interval. Estimate the rate of change from a graph.★,P69
F-LE.5,High School — Functions,"Linear, Quadratic, and Exponential Models★",Interpret expressions for functions in terms of the situation they model,5. Interpret the parameters in a linear or exponential function in terms of a context.,P71
1.NBT.1
1.NBT.2
1.NBT.3
1.NBT.4
1.NBT.5
1.NBT.6
1.OA.1
1.OA.2
1.OA.3
1.OA.4
1.OA.5
1.OA.6
1.OA.7
1.OA.8
2.NBT.1
2.NBT.2
2.NBT.3
2.NBT.4
2.NBT.5
2.NBT.6
2.NBT.7
2.NBT.8
2.NBT.9
2.OA.1
2.OA.2
2.OA.3
2.OA.4
3.MD.7
3.NBT.1
3.NBT.2
3.NBT.3
3.NF.1
3.NF.2
3.NF.3
3.OA.1
3.OA.2
3.OA.3
3.OA.4
3.OA.5
3.OA.6
3.OA.7
3.OA.8
3.OA.9
4.MD.2
4.NBT.1
4.NBT.2
4.NBT.3
4.NBT.4
4.NBT.5
4.NBT.6
4.NF.1
4.NF.2
4.NF.3
4.NF.4
4.NF.5
4.NF.6
4.NF.7
4.OA.1
4.OA.2
4.OA.3
4.OA.4
4.OA.5
5.MD.2
5.MD.5
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
5.OA.1
5.OA.2
5.OA.3
6.EE.2
6.EE.3
6.EE.7
6.NS.3
6.NS.5
6.NS.6
6.NS.7
6.NS.8
6.RP.1
6.RP.2
6.RP.3
7.EE.1
7.EE.2
7.EE.3
7.EE.4
7.NS.1
7.NS.2
7.NS.3
7.RP.1
7.RP.2
7.RP.3
8.EE.2
8.EE.4
8.EE.5
8.EE.6
8.EE.7
8.NS.1
8.NS.2
8.SP.3
A-APR.1
A-APR.2
A-APR.3
A-APR.4
A-APR.5
A-APR.6
A-APR.7
A-CED.1
A-REI.2
A-SSE.4
F-BF.1
F-IF.7
G-C.5
G-GPE.5
G-GPE.6
G-SRT.1
G-SRT.2
G-SRT.4
G-SRT.6
G-SRT.7
G-SRT.8
K.CC.5
K.NBT.1
K.OA.1
K.OA.2
K.OA.3
K.OA.4
K.OA.5
N-CN.1
N-CN.2
N-CN.3
N-CN.4
N-CN.5
N-CN.6
N-RN.1
N-RN.2
N-RN.3
N-VM.10
N-VM.11
N-VM.12
N-VM.4
N-VM.5
N-VM.6
N-VM.7
N-VM.8
N-VM.9
S-ID.7

```

## assistant  <sub>2026-09-07T04:06:51.645Z</sub>

<details><summary>thinking</summary>

```
I've confirmed the key codes. The word "ratio|proportional|unit rate|slope" appears in lots of rows because "ratio" matches "ration/al" (rational). That's fine — I have what I need.

Confirmed:
- K has nothing on this thread (no fractions, no halves; the first mention of halves is 1.G.3).
- 1.G.3, 2.G.3 — shares
- 2.MD.6 — number line with whole numbers (precursor for number line but not fractions)
- 4.OA.1/2 — multiplicative comparison (precursor of ratio reasoning)
- 3.G.2, 3.NF.1-3, 4.NF.1-7, 5.NF.1-7, 6.NS.1, 6.RP.1-3, 7.RP.1-3, 7.NS.2-3, 8.NS.1, 8.EE.5-6, 8.F.3-4, 8.G.4, then HS: N-Q.1-2, A-CED.2, F-LE.1-3, F-LE.5, F-IF.6, A-APR.6-7, N-RN.1-2, G-SRT.1-2.

Now let me compose the final answer in Chinese with:
1. 逐年级表：编号 + 一句话要求（中文概括，基于原文）+ pdf_page。Per skill convention: give grade/domain and pdf_page. I'll make a compact table with 年级 | 编号 | 一句话要求 | (domain can be inferred; maybe fold domain into a group header). I'll add pdf_page in the code column or separate. Keep it readable.

2. 演进链: an ASCII chain diagram.

3. 三个断档点: each with 断在哪两条编号之间, why.

The three break points I'll present:

**断档① 2.G.3 → 3.NF.1/3.NF.2（2升3年级）**：从「几何域的等分口头语」到「数域里的数」。
- 2.G.3 的 half/third 仍是"份"的口头描述（describe the shares using the words halves, thirds），属于 Geometry 域；3.NF.1 要求把 a/b 理解为一个数（quantity），3.NF.2 直接上数轴（number line）。
- 表里 K-2 没有任何课标把分数当数处理；数轴上只有 2.MD.6 的整数。域的切换在表里是可见的：Geometry → Number and Operations—Fractions。3.G.2（面积=unit fraction）是官方打的补丁，但它仍停留在面积模型，没补「分数是有位置和大小的数」这一步。

**断档② 5.NF.7/6.NS.1 → 6.RP.1（5升6年级）**：从「分数是一个数（part–whole / 商）」到「比率是两个量之间的关系」。
- 5.NF.3 刚刚把 a/b 定性为除法 a÷b，6.NS.1 熟练分数除分数；紧接着 6.RP.1 把 ratio 定义为 two quantities 之间的关系。学生最容易把 2:3 直接当成数 2/3 处理（部分-整体 vs 部分-部分），表里没有一条 3-5 年级课标教 part-part 比较；唯一的前驱是 4.OA.1/4.OA.2 的 multiplicative comparison（整数倍比较），但它在 OA 域，与 NF 域之间没有显式衔接。6.RP.2 的 unit rate a/b 又要把它重新"分数化"，一来一回最容易掉链子。

**断档③ 8.F.4/8.EE.6 → F-LE.1（8年级→高中）**：从「unit rate = 斜率 = 线性」到「线性 vs 指数（恒定差 vs 恒定比）」。
- 7.RP 之后 RP 域在表里消失；8 年级靠 8.EE.5-6 把 unit rate 转成 slope，8.F.4 转成 rate of change。到高中，这条主线没有了自己的域，散进 F-LE/N-Q/G-SRT/A-APR。F-LE.1a/b/c 要求区分 "grow by equal differences" 与 "grow by equal factors"——加法思维 vs 乘法思维的最终对决。4.NF.4（乘法=重复加）与 5.NF.5（乘法=scaling）的老分歧在这里总爆发：一路只会"unit rate × 自变量"的学生，面对"每期增长 r%"没有先修课标做桥。且 F-LE 是 ★ modeling 域，A-APR.7（有理式封闭性——分数运算的终点）还是 (+) 选修，多数学生不再回访这条主线。

Wait — I should double check the claim "RP 域在表里消失" — yes, index shows RP only in grades 6 and 7. Good.

Also for the K part: the user said "从 K 到高中" — I should note honestly that in K the table has nothing on this thread (K.CC/OA/NBT/MD/G none mention halves or fractions). The thread actually starts at grade 1 (1.G.3). That's honest reporting per skill convention ("表里没有的条目直说没有").

For the one-liner requirements, keep each to one short sentence in Chinese, grounded in original text. I'll include pdf_page values. Let me gather the pdf pages:
- 1.G.3: P16
- 2.G.3: P20
- 2.MD.6: P20
- 4.OA.1/2: P29
- 3.G.2: P26
- 3.NF.1: P24, 3.NF.2: P24, 3.NF.3: P24
- 4.NF.1-4: P30, 4.NF.5-7: P31
- 5.NF.1-2: P36, 5.NF.3-7: P36-37
- 6.NS.1: P42, 6.RP.1-3: P42
- 7.RP.1-3: P48, 7.NS.2-3: P48-49
- 8.NS.1: P54, 8.EE.5-6: P54, 8.F.3-4: P55, 8.G.4: P55-56
- N-Q.1: P60, A-CED.2: P65, A-APR.6-7: P65, F-IF.6: P69, F-LE.1-3: P70-71, F-LE.5: P71, N-RN.1-2: P60, G-SRT.1-2: P77

For the table, I'll do one row per grade with the key codes and one-line summaries. To keep "一句话要求" per code, maybe group codes that share a theme (e.g., 4.NF.5-7 as "decimal notation"). The user said "逐年级列出该主线上的关键课标编号与一句话要求" — per grade, list key codes and one-sentence requirement. I think listing each code with its one-liner is cleanest; for sub-codes I can combine where sensible. Let me write each key code with one line.

Chain diagram (演进链):

```
1.G.3 ─→ 2.G.3 ─→ 3.G.2 ─┬─→ 3.NF.1 ─→ 3.NF.2 ─→ 3.NF.3
（几何：等分"份"）          │   （分数成为"数"：单位分数→数轴→等值比较）
                          │
4.OA.1/2 ─────────────────┼────────────（整数倍比较：比率推理的暗线）
                          ↓
4.NF.1 ─→ 4.NF.2 ─→ 4.NF.3/4 ─→ 4.NF.5-7 ─→ 5.NF.1/2 ─→ 5.NF.3 ─→ 5.NF.4/5 ─→ 5.NF.7 ─→ 6.NS.1
 等值原理    异分母比较   单位分数加减乘     小数记法      异分母加减    分数=除法   乘=缩放      除法        分数÷分数
                                                                    │
                                                                    ↓
6.RP.1 ─→ 6.RP.2 ─→ 6.RP.3 ─→ 7.RP.1 ─→ 7.RP.2 ─→ 7.RP.3 ─┬─→ 8.EE.5 ─→ 8.EE.6 ─→ 8.F.3/4
 比率概念   unit rate   表/百分/换算   分数比率的rate  常数k、方程   多步百分数      rate=斜率   相似三角形→y=mx+b  线性函数
                                                             │
                                                             ↓
F-LE.1 ─→ F-LE.2/5 ─→ F-IF.6 ──（线性 vs 指数）    N-Q.1/2（单位与建模）
分支：7.NS.2/3 & 8.NS.1（有理数四则）─→ N-RN.1/2（有理指数） & A-APR.6/7（有理式）
分支：8.G.4 ─→ G-SRT.1/2（相似/比例因子）
```

Hmm, that's complex. Let me simplify the chain into one main line with branch lines. A vertical chain might be cleaner. Let me design a clean vertical flow:

主线（数与运算）:
1.G.3 → 2.G.3 → 3.G.2 → 3.NF.1-3 → 4.NF.1-4 → 4.NF.5-7 → 5.NF.1-2 → 5.NF.3 → 5.NF.4-5 → 5.NF.7 → 6.NS.1 → (7.NS.2-3 → 8.NS.1)

主线（比率→函数）:
4.OA.1-2 → 6.RP.1 → 6.RP.2 → 6.RP.3 → 7.RP.1 → 7.RP.2 → 7.RP.3 → 8.EE.5 → 8.EE.6 → 8.F.3-4 → F-LE.1-3/F-LE.5 → F-IF.6 (+A-CED.2, N-Q.1)

支线（几何相似）: 8.G.4 → G-SRT.1-2
支线（代数终点）: 7.NS.2 → N-RN.1-2 / A-APR.6-7

I'll draw it as a code block ASCII diagram with the three 断档 marked with ✂ or ⚠.

Actually let me draw one main spine and mark break points on it:

```
1.G.3 → 2.G.3 ──✂①──→ 3.NF.1 → 3.NF.2 → 3.NF.3
                                      │(3.G.2 面积桥)
4.OA.1/2 ────────────────────────────┐
                                      ↓
4.NF.1 → 4.NF.2 → 4.NF.3/4 → 4.NF.5-7 → 5.NF.1/2 → 5.NF.3 → 5.NF.4/5 → 5.NF.6/7 → 6.NS.1
                                                                                  │
5.NF.7/6.NS.1 ──✂②──→ 6.RP.1 → 6.RP.2 → 6.RP.3 → 7.RP.1 → 7.RP.2 → 7.RP.3 → 7.NS.2/3
                                                                                  │
7.RP.2 → 8.EE.5 → 8.EE.6 → 8.F.3/4 ──✂③──→ F-LE.1 → F-LE.2/5 → F-IF.6 / N-Q.1 / A-CED.2
                                                                                  │
支线: 7.NS.2/8.NS.1 → N-RN.1/2、A-APR.6/7（有理指数与有理式）
支线: 8.G.4 → G-SRT.1/2（相似与比例因子）
```

OK. Now the per-grade table. Columns: 年级 | 主线编号 | 一句话要求. I'll keep one-liners tight. Include pdf_page maybe as a small column — the skill convention says to give grade/domain and pdf_page when citing. I'll include a "页" column to be compliant but keep it compact. Hmm, tables get wide. Let me do: | 年级 | 编号 | 一句话要求 | 页 |. Domain I can mention via grouping headers in the 年级 column, or skip since the编号 prefix encodes the domain (NF, RP, EE...). Actually the code prefix IS the domain abbreviation. I'll note domain in a few places where it matters for the argument (e.g., 1.G.3 is Geometry). Maybe add a thin "域" column... that's 5 columns. Let me instead fold: "编号(域)" no — the code already shows domain. I'll add pdf pages in parentheses after the requirement or in a separate narrow column. A separate column is cleaner.

Let me draft the answer now. Also the user says "只用表里存在的编号" — all codes I use exist in the CSV, verified above. K: I'll state explicitly the table has nothing at K; the thread starts at 1.G.3.

One more check: should 5.MD.2 (line plot with fractional units) be included? It's minor; I can mention in passing or skip. Skip to keep focus. 4.MD.4 also line plot. Skip — the user asked for key standards.

Also should I include 6.EE.9? It was in the ratio/proportional grep results ("Use variables to represent two quantities in a real-world problem... that change in relationship to one another" — actually 6.EE.9 is about dependent variables). It showed up in grep because of "ratio" matching "rational"? No wait — 6.EE.9 appeared in the grep for 'ratio|proportional|unit rate|slope'. Let me think: 6.EE.9 text mentions "two quantities that change in relationship"... Hmm, why would it match? Maybe "ratio" appears in "ratio nal"? No. Possibly the requirement contains "proportional"? Unlikely. It could contain the word "ratio" via... hmm, "ratio nal" isn't in it. Let me not worry — 6.EE.9 is about representing two varying quantities with variables, which IS relevant as a bridge from 6.RP.3 tables to 7.RP.2 equations. But I didn't verify its text. I shouldn't cite its text without checking. I could check quickly... it's optional. Actually, it might strengthen the gap-2 analysis (what bridges tables to equations). Let me just check it quickly to be safe. Also A-REI.2? No, that's rational equations... wait A-REI.2 appeared in the grep! "Solve simple rational and radical equations" — hmm, in full Common Core, A-REI.2 is "Solve simple rational and radical equations in one variable" — that's on the fraction thread too. It matched "rational". Let me check it. If A-REI.2 exists in the table, it's a legit endpoint of the rational-expression branch.

Let me check 6.EE.9 and A-REI.2 quickly.
```

</details>

Two final checks — 6.EE.9 (variable quantities, potential bridge from ratio tables to equations) and A-REI.2 (rational equations, potential endpoint of the fraction branch):

🔧 `bash({"command": "cd /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards && grep -E '^(6\\.EE\\.9|A-REI\\.2),' references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:06:51.675Z</sub>

```
6.EE.9,6,Expressions and Equations,Represent and analyze quantitative relationships between dependent and independent variables.,"9. Use variables to represent two quantities in a real-world problem that change in relationship to one another; write an equation to express one quantity, thought of as the dependent variable, in terms of the other quantity, thought of as the independent variable. Analyze the relationship between the dependent and independent variables using graphs and tables, and relate these to the equation.",P44
A-REI.2,High School — Algebra,Reasoning with Equations and Inequalities,Understand solving equations as a process of reasoning and explain the reasoning,"2. Solve simple rational and radical equations in one variable, and give examples showing how extraneous solutions may arise.",P65

```

## assistant  <sub>2026-09-07T04:08:28.398Z</sub>

<details><summary>thinking</summary>

```
All verified. Now let me compose the final answer.

Structure:
1. 前置说明：K 在表里没有该主线的条目（诚实说明），主线从 1.G.3 起步。
2. 逐年级表（年级 | 编号 | 一句话要求 | 页）。
3. 演进链 ASCII 图（标注三个断档）。
4. 三个断档详析。

Keep it organized. Per-grade one-liners:

- 1: 1.G.3 — 把圆和矩形等分成两份、四份，用 halves/fourths/quarters 描述"份"，并知道等分越多每份越小。P16
- 2: 2.G.3 — 等分成 2、3、4 份，扩展到 thirds，认识"等分份形状可以不同"。P20
- (2.MD.6 — 整数表示为数轴上等距点，分数数轴前唯一数轴经验。P20)
- 3: 3.G.2 — 把图形等分成等面积部分，每部分面积写成 unit fraction。P26
- 3.NF.1 — 1/b 是整体等分成 b 份中的 1 份；a/b 是 a 个 1/b。P24
- 3.NF.2 — 分数是数轴上的数（0-1 分成 b 等份）。P24
- 3.NF.3 — 特例等值 + 同分子/同分母比较大小。P24
- 4: 4.NF.1 — 等值通则 a/b=(n×a)/(n×b)。P30
- 4.NF.2 — 异分子异分母比较。P30
- 4.NF.3 — a/b 是单位分数之和；同分母加减（含带分数）。P30
- 4.NF.4 — 分数×整数（a/b 是 1/b 的倍数）。P30
- 4.NF.5-7 — 分母 10/100 的分数与十进制小数互化、比较。P31
- (4.OA.1/2 — 乘法=倍数比较 "times as many"，比率推理暗线起点。P29)
- 5: 5.NF.1/2 — 等值改写实现异分母加减及应用题。P36
- 5.NF.3 — a/b = a÷b：分数即除法。P36-37
- 5.NF.4/5 — 分数×分数（含矩形面积模型）；乘法=缩放。P36-37
- 5.NF.6 — 现实问题中分数与带分数乘法。P36-37
- 5.NF.7 — 单位分数÷整数、整数÷单位分数。P36-37
- 6: 6.NS.1 — 分数÷分数并解应用题。P42
- 6.RP.1 — 比率概念与语言。P42
- 6.RP.2 — unit rate a/b。P42
- 6.RP.3 — 等值比率表、单价/速度、百分数、单位换算。P42
- (6.EE.9 — 用变量表示两个相依变化的量并写方程。P44)
- 7: 7.RP.1 — 计算分数比率的 unit rate。P48
- 7.RP.2 — 判定比例关系、常数 k、方程表示、(1,r)。P48
- 7.RP.3 — 多步比率和百分数问题。P48
- 7.NS.2/3 — 有理数乘除（含 p/q、循环小数）。P48-49
- 8: 8.NS.1 — 有理数=有限或循环小数；循环小数化分数。P54
- 8.EE.5 — 图像化比例关系，unit rate 即斜率。P54
- 8.EE.6 — 相似三角形推出 y=mx、y=mx+b。P54
- 8.F.3/4 — y=mx+b 是线性函数；构造线性模型、rate of change。P55
- (8.G.4 — 相似=旋转/反射/平移+放缩。P55-56)
- HS: F-LE.1 — 等差增长 vs 等比增长（线性 vs 指数）。P70-71
- F-LE.2 — 由图/描述/两输入输出对构造线性或指数函数。P70-71
- F-LE.5 — 解释线性/指数函数参数。P71
- F-IF.6 — 平均变化率。P69
- N-Q.1/2 — 单位、量与建模。P60
- A-CED.2 — 建立二元方程并作图。P65
- N-RN.1/2 — 有理指数。P60
- A-APR.6/7 — 有理式改写与四则（有理数系的类比）。P65
- A-REI.2 — 解有理方程。P65
- G-SRT.1/2 — 放缩与比例因子、相似。P77

That's comprehensive. For the table I'll mark main-line vs 支线 (branch) codes. To keep the table readable, group by grade with sub-bullets.

断档点 final three:

✂① 2.G.3 → 3.NF.1/3.NF.2（2→3 年级）：从"份"到"数"。
- 断在哪：2.G.3（Geometry，口头描述等分份）与 3.NF.1/3.NF.2（Number and Operations—Fractions，分数是数、上数轴）之间。
- 为什么：K-2 阶段"一半"只是几何域里的分配语言（shares），从未作为数参与运算或比较；3.NF.2 却直接要求把分数定位到数轴（0-1 区间 b 等分）。表里 K-2 数轴经验只有 2.MD.6 的整数；3.G.2 用面积打补丁（面积=unit fraction），但仍是几何模型。域的硬切换 + 表示模型的硬切换（面积→数轴/长度）叠加，是经典的 whole-number→fraction 断崖。

✂② 5.NF.3/6.NS.1 → 6.RP.1（5→6 年级）：从"分数是一个数"到"比率是两量关系"。
- 断在哪：5.NF.7/6.NS.1（分数作为数与商）与 6.RP.1（比率=两个 quantity 之间的关系）之间。
- 为什么：5.NF.3 刚把 a/b 收敛为除法商，6.NS.1 完成分数四则的收尾；6.RP.1 立刻换对象：ratio 描述的是两个量之间的关系（a:b），不是单一数值。学生把 2:3 当作 2/3 参与四则（部分-整体 vs 部分-部分混淆）是最典型的断层。表里 3-5 年级没有任何条目教"部分-部分"关系；唯一暗线是 4.OA.1/4.OA.2 的 multiplicative comparison（"times as many"），但它在 OA 域、且只限整数倍。6.RP.2 再要求把关系重新压缩成 unit rate a/b，概念在一学期内来回切换两次。

✂③ 8.F.4/8.EE.6 → F-LE.1（8 年级→高中）：从"恒定 rate 的线性"到"等差 vs 等比"。
- 断在哪：8.EE.6/8.F.4（unit rate=斜率、y=mx+b、rate of change）与 F-LE.1（线性=等差增长 vs 指数=等比增长）之间。
- 为什么：7.RP 之后 RP 域在表里整体消失，8 年级靠 8.EE.5-6、8.F.3/4 把比率主线转译成"斜率/线性函数"，但全部是恒定 rate 的线性语境；到高中 F-LE.1 要求区分 "grow by equal differences"（加法）与 "grow by equal factors / constant percent rate"（乘法），后者（F-LE.1c）在表里此前无任何先修——5.NF.5 的"乘法=缩放"是唯一远亲，中间隔了 3 个年级。同时这条主线进入高中后失去自己的域，散落为 F-LE/F-IF.6/N-Q/A-CED.2 的碎片；而它的运算终点 A-APR.6/7、A-REI.2 在 Algebra 域，N-RN.1/2 在 Number 域，一旦在这步掉队，几乎没有再回访的机会（A-APR.7 还是 (+) 选修）。

Hmm wait, one issue: is 5.NF.5 really the closest precursor to "constant percent growth"? Yes — multiplication as scaling is the multiplicative-change seed. And percent itself appears in 6.RP.3c ("Find a percent of a quantity as a rate per 100"). Interesting — 6.RP.3c is actually a precursor of percent growth. So F-LE.1c has precursors in 6.RP.3c (percent) and 7.RP.3 (multistep percent problems). Hmm, that weakens my claim "无任何先修". Let me reframe: the *additive vs multiplicative contrast* is new in F-LE.1; percents existed (6.RP.3c, 7.RP.3), but never as *growth over intervals* (每单位区间增长 r%) nor in contrast with linear growth. The real cliff: nothing between 8.F.4 and F-LE.1 requires students to *distinguish* additive from multiplicative change; also the ★ modeling context and the dissolution of the strand's home domain. I'll phrase it carefully: "6.RP.3c/7.RP.3 教过百分数静态计算，但从没把'每期增长 r%'与'每期增加常数'并置对比；F-LE.1a 要求给出 growth by equal differences vs equal factors 的证明，这是全新的一步"。

That's more accurate and defensible.

Alternatively, I could argue 断档③ is 7.RP.3 → 8.EE.5 (RP domain vanishes), but 8.EE.5 explicitly says "unit rate as slope" so the bridge exists. The 8→HS one is genuinely the biggest cliff (documented in research: linear vs exponential confusion is huge). Keep mine.

Also, why not 断档 between 4.NF.4 → 5.NF.4? It's a known difficulty (multiplication of fraction×fraction, and 5.NF.5 scaling), but the standards deliberately build it via unit fractions (4.NF.3b/4.NF.4), and 5.NF.4a explicitly gives "a × q ÷ b" decomposition. So the scaffolding exists in the table. I can mention this as an honorable mention.

Now, also per skill convention: "引用课标要求时给出原文（英文）加编号，必要时再翻译" — in the break-point analysis I'll quote key English phrases. In the table I'll give Chinese one-liners (condensed translations) — that's a translation, fine. I'll add short English key terms where crucial (unit rate, scaling, etc.). And give pdf_page everywhere. Good.

Also the answer should note K: 表里 K 年级六个域（CC/OA/NBT/MD/G）均无该主线条目 — the thread literally starts at 1.G.3. I'll state that up front honestly ("表里 K 没有分数主线的条目").

Domain info: I'll put domain in the chain/table where it changes (e.g., 1.G.3/2.G.3 是 Geometry；3.NF 是 Number and Operations—Fractions；6/7.RP 是 Ratios and Proportional Relationships；8.EE/F 是 EE/Functions；HS 散布).

Let me also double-check 3.NF.3's pdf page and cluster title... P24 ✓. 4.NF cluster: "Extend understanding of fraction equivalence and ordering" P30 ✓.

Also I want to double check 5.NF.3's exact quote "a/b = a ÷ b" — yes: "Interpret a fraction as division of the numerator by the denominator (a/b = a ÷ b)".

7.RP.2c: "Represent proportional relationships by equations." — doesn't literally say y=kx but says constant of proportionality (unit rate) in 7.RP.2b. OK.

8.EE.5: "Graph proportional relationships, interpreting the unit rate as the slope of the graph." ✓

F-LE.1a: "Prove that linear functions grow by equal differences over equal intervals, and that exponential functions grow by equal factors over equal intervals." ✓
F-LE.1c: "Recognize situations in which a quantity grows or decays by a constant percent rate per unit interval relative to another." ✓

A-APR.7: "(+) Understand that rational expressions form a system analogous to the rational numbers, closed under addition, subtraction, multiplication, and division by a nonzero rational expression" ✓

1.G.3: "Understand for these examples that decomposing into more equal shares creates smaller shares." ✓

6.RP.1: "Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities." ✓

3.NF.2: "Understand a fraction as a number on the number line" ✓

Great. Now write the final answer. Format: use headers, a compact per-grade table, ASCII chain, then three break points. Keep the one-liners genuinely one sentence. Include page numbers in a compact way (e.g., "P24").

Since the user communicates in Chinese, respond in Chinese.

Length: this is a substantive analysis task; medium-long is appropriate, but avoid bloat. The table will be the bulk. Let me write it.
```

</details>

以下全部编号都已在 `references/standards.csv` 中逐条核对存在（括号内为 PDF 页码）。先说一个诚实的前提：**表里 K 年级六个域（K.CC / K.OA / K.NBT / K.MD / K.G）都没有分数主线的条目**——这条主线真正起步于 1 年级的 1.G.3。

## 一、逐年级关键课标与一句话要求

| 年级（域） | 编号 | 一句话要求 | 页 |
| --- | --- | --- | --- |
| 1（Geometry） | 1.G.3 | 把圆和矩形等分成 2 份、4 份，用 halves / fourths / quarters 口头描述“份”，知道分得越多每份越小 | P16 |
| 2（Geometry） | 2.G.3 | 等分扩展到 2、3、4 份（引入 thirds），认识到等分出的份形状不必相同 | P20 |
| 2（MD） | 2.MD.6 | 整数表示为 0 起等距数轴上的点（分数数轴前唯一的数轴经验） | P20 |
| 3（Geometry） | 3.G.2 | 把图形分成等面积部分，每部分面积表达为整体的 unit fraction（几何→分数的官方补丁） | P26 |
| 3（NF） | 3.NF.1 | 1/b 是整体等分 b 份中的 1 份；a/b 是 a 个 1/b 叠加成的**量** | P24 |
| 3（NF） | 3.NF.2 | 分数是**数轴上的数**：把 0–1 区间 b 等分定位 1/b、a/b | P24 |
| 3（NF） | 3.NF.3 | 特例等值 + 同分子/同分母分数比大小 | P24 |
| 4（OA） | 4.OA.1/2 | 乘法即“倍数比较”（times as many），比率推理的整数暗线 | P29 |
| 4（NF） | 4.NF.1 | 等值通则：a/b = (n×a)/(n×b)，用模型说明为何成立 | P30 |
| 4（NF） | 4.NF.2 | 异分子、异分母分数比较大小 | P30 |
| 4（NF） | 4.NF.3 | a/b 是单位分数之和；同分母加减、分解、带分数 | P30 |
| 4（NF） | 4.NF.4 | 分数×整数（a/b 视为 1/b 的倍数，即重复累加） | P30 |
| 4（NF） | 4.NF.5–7 | 分母 10/100 的分数 ↔ 十进制小数，及小数比较 | P31 |
| 5（NF） | 5.NF.1/2 | 用等值改写实现**异分母**加减并解应用题 | P36 |
| 5（NF） | 5.NF.3 | **a/b = a ÷ b：分数即除法** | P36–37 |
| 5（NF） | 5.NF.4/5 | 分数×分数（矩形面积模型）；乘法解读为**缩放 scaling** | P36–37 |
| 5（NF） | 5.NF.6/7 | 现实问题中的分数乘法；单位分数÷整数、整数÷单位分数 | P36–37 |
| 6（NS） | 6.NS.1 | 分数÷分数并解应用题（分数四则的收尾） | P42 |
| 6（RP） | 6.RP.1 | 理解比率概念：**两个量之间**的关系 | P42 |
| 6（RP） | 6.RP.2 | 比率 a:b 对应 unit rate a/b | P42 |
| 6（RP） | 6.RP.3 | 用等值比率表、单价/速度、百分数（rate per 100）、单位换算解题 | P42 |
| 6（EE） | 6.EE.9 | 用变量表示两个相依变化的量并写出方程（表格→方程的桥） | P44 |
| 7（RP） | 7.RP.1 | 计算由**分数组成的比率**的 unit rate | P48 |
| 7（RP） | 7.RP.2 | 判定比例关系、找 constant of proportionality、用方程表示、解释点 (1, r) | P48 |
| 7（RP） | 7.RP.3 | 多步比率与百分数问题 | P48 |
| 7（NS） | 7.NS.2/3 | 有理数乘除（p/q 形式、循环小数）与四则应用 | P48–49 |
| 8（NS） | 8.NS.1 | 有理数=有限或循环小数；循环小数化回分数 | P54 |
| 8（EE） | 8.EE.5 | 图像化比例关系，**unit rate 即斜率** | P54 |
| 8（EE） | 8.EE.6 | 用相似三角形推导 y = mx 与 y = mx + b | P54 |
| 8（F） | 8.F.3/4 | y = mx + b 定义线性函数；构造线性模型、读出 rate of change | P55 |
| 8（G） | 8.G.4 | 相似 = 旋转/反射/平移 + **放缩**（几何支线入口） | P55–56 |
| HS（Functions） | F-LE.1 | 区分线性与指数：**equal differences vs equal factors**（含 constant percent rate） | P70–71 |
| HS（Functions） | F-LE.2/5 | 由图/描述/两对输入输出构造线性或指数函数；解释参数 | P70–71 |
| HS（Functions） | F-IF.6 | 计算并解释**平均变化率** | P69 |
| HS（N&Q） | N-Q.1/2 | 用单位理解和解题、为建模选择恰当的量 | P60 |
| HS（Algebra） | A-CED.2 | 建立两变量方程并作图（带标签和刻度） | P65 |
| HS（N&Q） | N-RN.1/2 | 有理指数与根式互化（分数指数） | P60 |
| HS（Algebra） | A-APR.6/7 | 有理式改写与四则；有理式构成“与有理数类比”的封闭系统（A-APR.7 为 (+) 选修） | P65 |
| HS（Algebra） | A-REI.2 | 解一元有理方程（注意增根） | P65 |
| HS（Geometry） | G-SRT.1/2 | 放缩的比例因子性质；相似 ⟺ 对应边成比例 | P77 |

## 二、演进链

```
【数与运算主线】
1.G.3 ──→ 2.G.3 ──✂①──→ 3.NF.1 ─→ 3.NF.2 ─→ 3.NF.3
（几何"份"）      （3.G.2 用面积打补丁）   （分数成为"数"，上数轴）

4.NF.1 ─→ 4.NF.2 ─→ 4.NF.3/4 ─→ 4.NF.5-7 ─→ 5.NF.1/2 ─→ 5.NF.3 ─→ 5.NF.4/5 ─→ 5.NF.7 ─→ 6.NS.1
 等值原理    异分母比较   单位分数运算    小数记法      异分母加减    分数=除法   乘=缩放    单位分数除法   分数÷分数
                                                                                     │
【比率→函数主线】                                                        ✂②
4.OA.1/2 ─────────────────────────────→ 6.RP.1 ─→ 6.RP.2 ─→ 6.RP.3 ─→ 7.RP.1 ─→ 7.RP.2 ─→ 7.RP.3
（整数倍比较：暗线）                        比率概念   unit rate  表/百分数   分数比率   常数k/方程  多步百分数
                                                                                  │
                              6.EE.9（变量与方程）↘                     8.EE.5 ─→ 8.EE.6 ─→ 8.F.3/4
                                                    （7.NS.2/3、8.NS.1：有理数化收尾）  rate=斜率  y=mx+b   线性函数
                                                                                    │
                                                                    ✂③
                                                                    F-LE.1 ─→ F-LE.2/5 ─→ F-IF.6 ─┐
                                                     （线性 vs 指数）                        ├─ N-Q.1/2、A-CED.2
【高中支线】 7.NS.2/8.NS.1 ─→ N-RN.1/2（有理指数）、A-APR.6/7 & A-REI.2（有理式与有理方程）
             8.G.4 ─→ G-SRT.1/2（相似与比例因子）
```

## 三、三个最容易断档的衔接点

**✂① 2.G.3 → 3.NF.1 / 3.NF.2（2 升 3 年级）：从“份”到“数”的悬崖**
- 断点位置：Geometry 域的 2.G.3（"describe the shares using the words halves, thirds"）与 NF 域的 3.NF.1/3.NF.2（"a fraction as a number on the number line"）之间。
- 为什么容易断：K–2 的“一半”始终是**几何分配语言**，从未作为数参与运算或比较；3.NF.2 却要求一步到位把分数定位到数轴上。表里 K–2 的数轴经验只有 2.MD.6 的整数点。表里也可见域的硬切换（Geometry → Number and Operations—Fractions）；3.G.2 用“面积 = unit fraction”打了补丁，但仍是面积模型，补不了“分数是有位置、有大小的数”这半边。表示模型（面积→数轴）与概念（份→数）同时切换，是经典的 whole-number→fraction 断崖。

**✂② 6.NS.1（及其上游 5.NF.3/5.NF.7）→ 6.RP.1（5 升 6 年级）：从“分数是一个数”到“比率是两个量的关系”**
- 断点位置：5.NF.3/6.NS.1（分数收敛为一个数、一个商）与 6.RP.1（"a ratio relationship between two quantities"）之间。
- 为什么容易断：5.NF.3 刚把 a/b 定性为 a ÷ b，6.NS.1 完成分数四则的收官；6.RP.1 却换了对象——比率描述**两个量之间的关系**（a:b），不是单一数值。学生把 2:3 当作数 2/3 直接做四则（部分—整体 vs 部分—部分的混淆）是最典型的断层。表里 3–5 年级没有任何条目教“部分—部分”关系，唯一先修暗线是 4.OA.1/4.OA.2 的整数倍比较，但它远在 OA 域且与 NF 域无显式衔接；紧接着 6.RP.2 又要求把关系重新压缩成 unit rate a/b，一学期内概念往返切换两次，掉链子率最高。

**✂③ 8.F.4 / 8.EE.6 → F-LE.1（8 年级 → 高中）：从“恒定 rate 的线性”到“等差 vs 等比”**
- 断点位置：8.EE.6/8.F.4（unit rate = 斜率、rate of change、y = mx + b）与 F-LE.1（"grow by equal differences" vs "grow by equal factors"）之间。
- 为什么容易断：7 年级之后 **RP 域在表里整体消失**，8 年级把整条比率主线全部转译成“斜率 / 线性函数”，但清一色是恒定 rate 的线性语境；F-LE.1a 要求证明线性按等差增长、指数按等比增长，F-LE.1c 的 “constant percent rate per unit interval” 是加法思维与乘法思维的正面交锋。虽然 6.RP.3c/7.RP.3 教过百分数的静态计算，但**从没有任何一条课标把“每期增长 r%”与“每期增加常数”并置对比**——最近的乘法思想远亲是三个年级前 5.NF.5 的 “multiplication as scaling”（与 4.NF.4 的“乘=重复加”本来就存在张力）。同时这条主线进入高中后失去自己的域，散落为 F-LE / F-IF.6 / N-Q / A-CED.2 的碎片；其运算终点 A-APR.6/7、A-REI.2、N-RN.1/2 分属不同域，且 A-APR.7 还是 (+) 选修——在这步掉队的学生几乎没有再回访这条主线的机会。

**附注**：4 年级末（4.NF.4 → 5.NF.3/5.NF.4，即“分数=除法、乘=缩放”的引入）也是一个已知的难点，但表内脚手架完整（4.NF.3 的单位分数分解、5.NF.4a 的 "a × q ÷ b" 改写），属于“陡但不断”，故未列入三大断档。

