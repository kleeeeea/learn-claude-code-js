# session history

来源：`2026-09-07T04-12-23-192Z_01a07a11-3518-71cb-bffe-4b078ba12f84.jsonl`

## user  <sub>2026-09-07T04:12:23.249Z</sub>

4 年级 Number and Operations in Base Ten 只剩 4 个课时，但该 domain 的课标条目不止 4 条。请列出全部条目，按「后续年级依赖它的程度」排序（依赖关系必须用表里真实的编号说明），给出 4 课时的取舍方案，并明确列出被舍弃的编号和风险。

## assistant  <sub>2026-09-07T04:12:26.662Z</sub>

<details><summary>thinking</summary>

```
The user is asking about Grade 4 Number and Operations in Base Ten (NBT) Common Core standards. They have only 4 class periods left, but the domain has more than 4 standards. They want:

1. List all standards in the domain
2. Sort them by "how much later grades depend on them" (dependency relationships must use real standard codes from the table)
3. Give a plan for 4 class periods (what to keep, what to cut)
4. Explicitly list the cut standards and risks

There's a skill available: math-standards. I should read the skill file first to understand how to query the standards data.
```

</details>

🔧 `read({"path": "/Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/SKILL.md"})`

## toolResult · read  <sub>2026-09-07T04:12:26.671Z</sub>

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

## assistant  <sub>2026-09-07T04:12:28.225Z</sub>

<details><summary>thinking</summary>

```
Let me query the standards for Grade 4 NBT domain. First let me look at the reference files.
```

</details>

🔧 `bash({"command": "ls /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/"})`

## toolResult · bash  <sub>2026-09-07T04:12:28.239Z</sub>

```
index.md
standards.csv

```

## assistant  <sub>2026-09-07T04:12:30.088Z</sub>

🔧 `bash({"command": "awk -F',' '$2==\"4\" && $3==\"Number and Operations in Base Ten\"' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:12:30.102Z</sub>

```
(no output)
```

## assistant  <sub>2026-09-07T04:12:31.588Z</sub>

🔧 `bash({"command": "awk -F',' '$2==\"4\"' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv | cut -d',' -f1-4"})`

## toolResult · bash  <sub>2026-09-07T04:12:31.604Z</sub>

```
4.OA.1,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.
4.OA.2,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.
4.OA.3,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.
4.OA.4,4,Operations and Algebraic Thinking,Gain familiarity with factors and multiples.
4.OA.5,4,Operations and Algebraic Thinking,Generate and analyze patterns.
4.NBT.1,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.
4.NBT.2,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.
4.NBT.3,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.
4.NBT.4,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.
4.NBT.5,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.
4.NBT.6,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.
4.NF.1,4,Number and Operations—Fractions[3],Extend understanding of fraction equivalence and ordering.
4.NF.2,4,Number and Operations—Fractions[3],Extend understanding of fraction equivalence and ordering.
4.NF.3,4,Number and Operations—Fractions[3],Build fractions from unit fractions by applying and extending previous understandings of operations on whole numbers.
4.NF.4,4,Number and Operations—Fractions[3],Build fractions from unit fractions by applying and extending previous understandings of operations on whole numbers.
4.NF.5,4,Number and Operations—Fractions[3],"Understand decimal notation for fractions
4.NF.6,4,Number and Operations—Fractions[3],"Understand decimal notation for fractions
4.NF.7,4,Number and Operations—Fractions[3],"Unders
…（省略 969 字）
```

## assistant  <sub>2026-09-07T04:12:33.995Z</sub>

<details><summary>thinking</summary>

```
The domain name in the CSV is "Number and Operations in Base Ten[2]" (with a footnote marker). So 4.NBT.1 through 4.NBT.6 — 6 standards. Let me get the full requirement text for each of these, plus the pdf_page. The requirement field contains commas, so I need to grep whole lines.
```

</details>

🔧 `bash({"command": "grep -E '^4\\.NBT\\.[1-6],' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv"})`

## toolResult · bash  <sub>2026-09-07T04:12:34.007Z</sub>

```
4.NBT.1,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.,"1. Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right.",P29
4.NBT.2,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.,"2. Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form. Compare two multi-digit numbers based on meanings of the digits in each place, using >, =, and < symbols to record the results of comparisons.",P29
4.NBT.3,4,Number and Operations in Base Ten[2],Generalize place value understanding for multi-digit whole numbers.,3. Use place value understanding to round multi-digit whole numbers to any place.,P29
4.NBT.4,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.,4. Fluently add and subtract multi-digit whole numbers using the standard algorithm.,"P29, 30"
4.NBT.5,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.,"5. Multiply a whole number of up to four digits by a one-digit whole number, and multiply two two-digit numbers, using strategies based on place value and the properties of operations. Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models.","P29, 30"
4.NBT.6,4,Number and Operations in Base Ten[2],Use place value understanding and properties of operations to perform multi-digit arithmetic.,"6. Find whole-number quotients and remainders with up to four-digit dividends and one-digit divisors, using strategies based on place value, the properties of operations, and/or the relationship between multiplication and division. Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models.","P29, 30"

```

## assistant  <sub>2026-09-07T04:13:04.586Z</sub>

<details><summary>thinking</summary>

```
Now I have all 6 standards of Grade 4 NBT:

- 4.NBT.1: Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right. (place value: 10x relationship)
- 4.NBT.2: Read/write multi-digit whole numbers (base-ten numerals, number names, expanded form); compare using >, =, <
- 4.NBT.3: Round multi-digit whole numbers to any place
- 4.NBT.4: Fluently add/subtract multi-digit whole numbers using standard algorithm
- 4.NBT.5: Multiply up to 4-digit × 1-digit, and 2-digit × 2-digit, using strategies based on place value; illustrate with equations, arrays, area models
- 4.NBT.6: Whole-number quotients and remainders with up to 4-digit dividends and 1-digit divisors, using strategies; illustrate with equations, arrays, area models

Now I need to determine "how much later grades depend on them" using real standard codes from the table. Let me check what later grades say that references these. Key dependency evidence:

1. **5.NBT.1**: "Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left." — this directly extends 4.NBT.1 to decimals (1/10). Let me check the actual text.

2. **5.NBT.2**: powers of 10, exponents — builds on 4.NBT.1.

3. **5.NBT.3**: Read/write decimals, expanded form — extends 4.NBT.2.

4. **5.NBT.4**: Round decimals — extends 4.NBT.3.

5. **5.NBT.5**: Fluently multiply multi-digit whole numbers using the standard algorithm — this is the standard-algorithm version of 4.NBT.5. So 4.NBT.5 is a direct prerequisite.

6. **5.NBT.6**: Find whole-number quotients... using strategies — extends 4.NBT.6. Actually 5.NBT.6 is "Find whole-number quotients of whole numbers with up to four-digit dividends and two-digit divisors, using strategies based on place value..." — extends 4.NBT.6 (which is 1-digit divisors) to 2-digit divisors.

7. **5.NBT.7**: decimals operations — depends on decimal place value (4.NF.5-7 + 5.NBT.1-3) but also on whole-number strategies from 4.NBT.5/6.

Also relevant:
- 5.OA.1/2 use operations but those are more algebraic.
- 5.NF flows depend on multiplication/division understanding (4.NBT.5, 4.NBT.6) — e.g., 5.NF.5 interprets multiplication as scaling; fraction division in 5.NF.7 builds on division understanding.
- 6.NS fluency: 6.NS.2 (divide multi-digit), 6.NS.3 (fluently add/subtract/multiply/divide multi-digit decimals) — these depend on 5.NBT.5/6/7 which depend on 4.NBT.4/5/6.
- 4.OA.3 multi-step word problems depend on 4.NBT.4/5/6 for computation (within same grade).

Let me also check what the table says for 5.NBT standards to cite real dependencies. Let me grep them.

Also I should check the K-8 progression — but the skill says use the table's real codes. Let me pull 5.NBT rows and relevant 6.NS rows.

Then I'll build a dependency ranking:

**4.NBT.1 (10× place value)**: directly feeds 5.NBT.1 (extends to decimals 1/10), 5.NBT.2 (powers of 10). Also foundational for 4.NBT.5/6 strategies themselves. Rank high.

**4.NBT.2 (read/write/compare)**: feeds 5.NBT.3 (decimals, compare). Also basic literacy for all later work. But 5.NBT.3 re-does it for decimals; the whole-number version largely consolidates 2.NBT/3.NBT skills? Actually 2.NBT.1-3 and 3.NBT.1 cover earlier; 4.NBT.2 extends to 1,000,000. Hmm.

**4.NBT.3 (rounding)**: feeds 5.NBT.4 (round decimals), and estimation for checking reasonableness in 4.OA.3. But if 5.NBT.4 re-teaches rounding in decimal context, there's a recovery point. Lower priority.

**4.NBT.4 (standard algorithm add/sub)**: fluency assumed everywhere later — 5.NBT.7 decimal add/sub, 5.MD, 5.NF computations, 6.NS.3. This is terminal fluency (no later grade re-teaches whole-number add/sub standard algorithm). Very high priority.

**4.NBT.5 (multiplication strategies)**: direct prerequisite of 5.NBT.5 (standard algorithm multi-digit ×) — 5.NBT.5 explicitly says "using the standard algorithm", and the grade-4 strategies (area models, place value) are the bridge. Also feeds 4.NBT.6, 5.NF, 6.NS. Very high.

**4.NBT.6 (division with 1-digit divisors, strategies)**: direct prerequisite of 5.NBT.6 (2-digit divisors) and 6.NS.2. Also feeds fraction understanding 5.NF.7 (division of unit fraction by whole number and vice versa). Very high.

Ranking by later-grade dependency (I need to justify with real codes):

Tier 1 (must keep):
1. 4.NBT.5 — multiplication: 5.NBT.5 (standard algorithm), 5.NBT.7, 5.NF.5-7, 6.NS.3 all build on it. Also 4.NBT.6 depends on it (division via multiplication relationship).
2. 4.NBT.6 — division: 5.NBT.6 (2-digit divisors), 6.NS.2, 5.NF.7.
3. 4.NBT.4 — add/sub standard algorithm: used in 5.NBT.7, 6.NS.3; no re-teach later.
4. 4.NBT.1 — 10× relationship: 5.NBT.1 (extends to 1/10), 5.NBT.2 (powers of 10 ×/÷). Conceptual engine for 5.NBT.5/6.

Tier 2 (cut, with mitigation):
5. 4.NBT.2 — 5.NBT.3 re-does read/write/compare for decimals; whole-number part largely carries from 3.NBT? Hmm, actually let me check 3.NBT rows. Let me check what 3.NBT.1/2 say — but wait, is 4.NBT.2's target range to 1,000,000 (per the cluster note "whole numbers to 1,000,000"? The table may not include that note). The cluster text says "Generalize place value understanding for multi-digit whole numbers." Let me check the 2.NBT and 3.NBT standards to see overlap.
6. 4.NBT.3 — rounding: 5.NBT.4 rounds decimals, and the whole-number rounding skill was already introduced in 3.NBT.1 ("round to nearest 10 or 100"). So cutting 4.NBT.3 has a built-in recovery point: 3.NBT.1 taught the skill, 5.NBT.4 re-teaches in decimal context. Lowest dependency.

So the natural cut is 4.NBT.2 and 4.NBT.3, with 4.NBT.1 kept (conceptual core), and fold compare/round lightweight into warm-ups.

Wait, but I need to be careful with the ranking order and justify each dependency with real codes from the table. Let me pull the actual text of the dependency standards: 5.NBT.1-7, 3.NBT.1-2, 2.NBT.1-4 maybe, 6.NS.2, 6.NS.3, 5.NF.7, 4.OA.3.

Let me grep those.

Actually, let me be careful about the claim "5.NBT.5 uses standard algorithm" — I need to verify from the table. Let me grep the 5.NBT rows.

Then the answer structure:

1. 全部条目列表 (6 items, with cluster grouping, full text + pdf_page)
2. 依赖度排序 with explicit evidence chain (each ranked standard: which later standards depend on it, quoted/cited by code)
3. 4-课时方案 (课时1-4, what to teach, what to fold in)
4. 被舍弃条目 + 风险 + 缓解

Let me get the data for the dependency standards.
```

</details>

Grade 4 NBT 共 6 条。现在查后续年级的依赖证据（5.NBT、6.NS、3.NBT 等的真实原文），用于排序论证。

🔧 `bash({"command": "grep -E '^5\\.NBT\\.[1-7],' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv"})`

🔧 `bash({"command": "grep -E '^(3\\.NBT|2\\.NBT)\\.[0-9]+,' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv | cut -c1-400"})`

## toolResult · bash  <sub>2026-09-07T04:13:04.606Z</sub>

```
5.NBT.1,5,Number and Operations in Base Ten,Understand the place value system.,"1. Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left.",P35
5.NBT.2,5,Number and Operations in Base Ten,Understand the place value system.,"2. Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.",P35
5.NBT.3,5,Number and Operations in Base Ten,Understand the place value system.,"3. Read, write, and compare decimals to thousandths. a. Read and write decimals to thousandths using base-ten numerals, number names, and expanded form, b. Compare two decimals to thousandths based on meanings of the digits in each place, using >, =, and < symbols to record the results of comparisons.",P35
5.NBT.4,5,Number and Operations in Base Ten,Understand the place value system.,4. Use place value understanding to round decimals to any place.,P35
5.NBT.5,5,Number and Operations in Base Ten,Perform operations with multi-digit whole numbers and with decimals to hundredths.,5. Fluently multiply multi-digit whole numbers using the standard algorithm.,P35
5.NBT.6,5,Number and Operations in Base Ten,Perform operations with multi-digit whole numbers and with decimals to hundredths.,"6. Find whole-number quotients of whole numbers with up to four-digit dividends and two-digit divisors, using strategies based on place value, the properties of operations, and/or the relationship between multiplication and division. Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models.",P35
5.NBT.7,5,Number and Operations in Base Ten,Perform operations with multi-digit whole numbers and with decimals to hundredths.,"7. Add, subtract, multipl
…（省略 271 字）
```

## toolResult · bash  <sub>2026-09-07T04:13:04.606Z</sub>

```
2.NBT.1,2,Number and Operations in Base Ten,Understand place value.,"1. Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones; a. 100 can be thought of as a bundle of ten tens — called a “hundred.” b. The numbers 100, 200, 300, 400, 500, 600, 700, 800, 900 refer to one, two, three, four, five, six, seven, eight, or nine hundreds (and 0 tens and 0 on
2.NBT.2,2,Number and Operations in Base Ten,Understand place value.,"2. Count within 1000; skip-count by 5s, 10s, and 100s.",P19
2.NBT.3,2,Number and Operations in Base Ten,Understand place value.,"3. Read and write numbers to 1000 using base-ten numerals, number names, and expanded form.",P19
2.NBT.4,2,Number and Operations in Base Ten,Understand place value.,"4. Compare two three-digit numbers based on meanings of the hundreds, tens, and ones digits, using >, =, and < symbols to record the results of comparisons.",P19
2.NBT.5,2,Number and Operations in Base Ten,Use place value understanding and properties of operations to add and subtract.,"5. Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction.",P19
2.NBT.6,2,Number and Operations in Base Ten,Use place value understanding and properties of operations to add and subtract.,6. Add up to four two-digit numbers using strategies based on place value and properties of operations.,P19
2.NBT.7,2,Number and Operations in Base Ten,Use place value understanding and properties of operations to add and subtract.,"7. Add and subtract within 1000, using concrete models or drawings and strategies based on place value, properties of operations, and/or the relationship between addition and subtraction; relate the strategy to a written method. Understand that in adding or subtracting three
2.NBT.8,2,Number and Operations in Base Ten,Use place value understanding and properties of operations to add and subtract.,"8. Mentally add 1
…（省略 1186 字）
```

## assistant  <sub>2026-09-07T04:13:10.080Z</sub>

<details><summary>thinking</summary>

```
Now let me check 6.NS.2, 6.NS.3, 5.NF.7, 4.OA.3, 4.MD.2, and 5.OA for cross-domain dependencies. Also 4.NBT's cluster note "[2]" is likely a footnote about "whole numbers to 1,000,000" (grade 4 range) and "[4]" for grade 3 about "algorithms based on place value". Let me check the footnotes maybe not in CSV. Not critical.

Let me get 6.NS.2/6.NS.3 and 5.NF.5/5.NF.7 and 4.OA.3.
```

</details>

再查 6 年级和跨领域（NF、OA）的下游依赖证据：

🔧 `bash({"command": "grep -E '^6\\.NS\\.[1-3],' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv | cut -c1-300"})`

🔧 `bash({"command": "grep -E '^(5\\.NF\\.5|5\\.NF\\.7|4\\.OA\\.3|4\\.MD\\.2|5\\.MD\\.1),' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv | cut -c1-400"})`

## toolResult · bash  <sub>2026-09-07T04:13:10.106Z</sub>

```
6.NS.1,6,The Number System,Apply and extend previous understandings of multiplication and division to divide fractions by fractions.,"1. Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions,",P42
6.NS.2,6,The Number System,Compute fluently with multi-digit numbers and find common factors and multiples.,2. Fluently divide multi-digit numbers using the standard algorithm.,P42
6.NS.3,6,The Number System,Compute fluently with multi-digit numbers and find common factors and multiples.,"3. Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm for each operation.",P42

```

## toolResult · bash  <sub>2026-09-07T04:13:10.106Z</sub>

```
4.OA.3,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"3. Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness o
4.MD.2,4,Measurement and Data,Solve problems involving measurement and conversion of measurements from a larger unit to a smaller unit.,"2. Use the four operations to solve word problems involving distances, intervals of time, liquid volumes, masses of objects, and money, including problems involving simple fractions or decimals, and problems that require expressing measurements given in a larger 
5.NF.5,5,Number and Operations—Fractions,Apply and extend previous understandings of multiplication and division to multiply and divide fractions.,"5. Interpret multiplication as scaling (resizing), by: a. Comparing the size of a product to the size of one factor on the basis of the size of the other factor, without performing the indicated multiplication. b. Explaining why multiplying a given num
5.NF.7,5,Number and Operations—Fractions,Apply and extend previous understandings of multiplication and division to multiply and divide fractions.,"7. Apply and extend previous understandings of division to divide unit fractions by whole numbers and whole numbers by unit fractions. a. Interpret division of a unit fraction by a non-zero whole number, and compute such quotients. b. Interpret divisio
5.MD.1,5,Measurement and Data,Convert like measurement units within a given measurement system.,"1. Convert among different-sized standard measurement units within a given measurement system, and use these conversions in solving multi-step, real world problems.",P37

```

## assistant  <sub>2026-09-07T04:14:35.091Z</sub>

<details><summary>thinking</summary>

```
Now I have solid evidence. Let me also quickly verify 4.NBT.1's relationship — check if there's a footnote [2] in the CSV. The domain name has "[2]" appended, likely a PDF footnote. Not needed.

Let me now build the dependency analysis:

**4.NBT 全部 6 条** (from table):
- 4.NBT.1 (P29): 10× place-value relationship
- 4.NBT.2 (P29): read/write/compare multi-digit whole numbers
- 4.NBT.3 (P29): round to any place
- 4.NBT.4 (P29,30): fluent standard algorithm add/sub
- 4.NBT.5 (P29,30): multiply (4-digit×1-digit, 2-digit×2-digit) with strategies + models
- 4.NBT.6 (P29,30): division with remainders (4-digit÷1-digit) with strategies + models

**Dependency chains (real codes):**

4.NBT.1 →
- 5.NBT.1 (extends 10× to 1/10, decimals) — direct continuation
- 5.NBT.2 (patterns × powers of 10, exponents)
- indirect: underpins all strategies in 4.NBT.5/6 themselves ("strategies based on place value")

4.NBT.2 →
- 5.NBT.3 (read/write/compare decimals to thousandths — same three verbs, extended to decimals)
- But: prior coverage exists at 2.NBT.3/2.NBT.4 (read/write/compare to 1000); grade 4 extends magnitude. Downstream is one standard (5.NBT.3) and it re-teaches in decimal context.

4.NBT.3 →
- 5.NBT.4 (round decimals to any place)
- Prior coverage: 3.NBT.1 (round to nearest 10/100) — skill exists; grade 4 extends to "any place"
- Used for estimation in 4.OA.3 (assess reasonableness — the text got cut, let me check the rest of 4.OA.3 text: "Assess the reasonableness of answers using mental computation and estimation strategies including rounding."). Let me verify that full text.

4.NBT.4 →
- 5.NBT.7 (decimal add/sub via strategies), 6.NS.3 (fluently add/subtract multi-digit decimals using standard algorithm)
- No later grade re-teaches whole-number add/sub standard algorithm — it's a terminal fluency.
- Also within-grade: 4.OA.3, 4.MD.2 word problems need it.

4.NBT.5 →
- 5.NBT.5 (fluently multiply multi-digit using standard algorithm) — direct prerequisite, same operation, grade 4 builds the strategy foundation
- 5.NBT.7 (decimal multiplication), 6.NS.3
- within grade: 4.NBT.6 uses "relationship between multiplication and division"; 4.OA.1/2/3; 4.MD.2
- 5.NF.5 (multiplication as scaling) builds on multiplication concepts

4.NBT.6 →
- 5.NBT.6 (4-digit ÷ 2-digit, strategies) — direct prerequisite
- 6.NS.2 (fluently divide multi-digit standard algorithm)
- 5.NF.7, 6.NS.1 (fraction division "apply and extend previous understandings of division")
- within grade: 4.OA.3 remainder interpretation

Let me check 4.OA.3 full text for the rounding mention, and 4.OA.1/4.OA.2 for multiplication dependence. Also, check whether 5.NBT.6 retains "strategies" (yes) — meaning 4.NBT.6's strategy work is the direct bridge.

Let me get the full 4.OA.3 text.

Ranking by downstream dependency (number and directness of downstream standards):

1. **4.NBT.1** — downstream: 5.NBT.1 (direct restatement + extension), 5.NBT.2. But also it's the conceptual basis of 4.NBT.5/6's "strategies based on place value". Actually, how many downstream standards depend? 5.NBT.1, 5.NBT.2, and implicitly 5.NBT.3a (expanded form of decimals), 5.NBT.7. It's the conceptual engine.

2. **4.NBT.5** — downstream: 5.NBT.5 (direct, same op, standard algorithm), 5.NBT.7, 6.NS.3, 5.NF.5. Plus within-grade 4.NBT.6 and 4.OA.1/2/3.

3. **4.NBT.6** — downstream: 5.NBT.6 (direct), 6.NS.2, 5.NF.7, 6.NS.1.

4. **4.NBT.4** — downstream: 5.NBT.7 (partial), 6.NS.3. Terminal fluency, no re-teach. But: 3.NBT.2 already got kids to "fluently add/subtract within 1000" — grade 4 just removes the range cap and mandates standard algorithm. So it's an incremental extension, not a brand-new skill. Hmm, this matters for the ranking. The add/sub algorithm is largely built by 3.NBT.2 (within 1000, strategies and algorithms); 4.NBT.4 extends to any multi-digit with standard algorithm. So dependency is high (used everywhere) but teachability burden is low — students have partial mastery. Actually the question asks to rank by "后续年级依赖它的程度" — degree later grades depend on it. 

Let me think about what "依赖" means precisely: how much downstream standards require this as a prerequisite.

- 4.NBT.5: 5.NBT.5 says "Fluently multiply multi-digit whole numbers using the standard algorithm" — grade 5 explicitly requires fluency; the 2017 CC revision notes this was moved... but from the table alone: 5.NBT.5 depends on 4.NBT.5's strategies (area model → algorithm). Without 4.NBT.5, grade 5 multiplication is a cold start. Strong dependency.
- 4.NBT.6: 5.NBT.6 explicitly repeats "using strategies based on place value... Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models" — it's literally the same sentence with 2-digit divisors. Without 4.NBT.6, grade 5 has to build both the strategy AND extend divisor digits. Strong dependency.
- 4.NBT.4: 5.NBT.7 needs add/sub of decimals "using strategies based on place value... relate the strategy to a written method"; 6.NS.3 needs standard algorithm fluency for decimals. Whole-number fluency is the anchor. But 3.NBT.2 already established fluency within 1000 "using strategies and algorithms" — so the incremental dependency is moderate: the gap is just algorithm formalization + beyond-1000. Still, if not taught, the standard algorithm formalization has no other recovery point in later grades (5/6 assume it).
- 4.NBT.1: 5.NBT.1 restates and extends to 1/10; 5.NBT.2 builds on it. If 4.NBT.1 is skipped, 5.NBT.1 has to build the 10× idea from scratch (3.NBT.3 touches multiples of 10; 2.NBT.1 bundles). Moderate-high conceptual dependency — but it can be folded into the first minutes of other lessons since it's one sentence conceptually. Actually as a *lesson* it's cheap; as a *concept* it's load-bearing.
- 4.NBT.2: downstream 5.NBT.3 (decimals read/write/compare). Prior: 2.NBT.3/2.NBT.4 (to 1000). The grade-4 delta is mostly magnitude (to 1,000,000 per footnote — not in table though; the cluster just says "multi-digit"). Lowest marginal dependency: skills largely exist from grade 2; grade 5 re-does the same verbs for decimals.
- 4.NBT.3: downstream 5.NBT.4 (round decimals). Prior: 3.NBT.1 (round to 10/100). Grade-4 delta: "to any place" (e.g., round to thousands). 5.NBT.4 will re-teach rounding in decimal context anyway. Lowest.

So ranking by downstream dependency (high → low):

1. 4.NBT.5 (multiplication strategies) — most downstream dependents, no prior fluency foundation (3.NBT.3 only covers 1-digit × multiples of 10; nothing else teaches multi-digit multiplication before grade 4). Actually wait — is there 2-digit×1-digit in grade 3? From the table, 3.NBT.3 is the only grade-3 NBT multiplication item: "Multiply one-digit whole numbers by multiples of 10 in the range 10–90". So grade 4 is where multi-digit multiplication is born. That makes 4.NBT.5 the most load-bearing: 5.NBT.5, 5.NBT.7, 6.NS.3, 5.NF.5, and within-grade 4.NBT.6/4.OA.2/4.OA.3.

2. 4.NBT.6 (division strategies + remainders) — 5.NBT.6 verbatim continuation, 6.NS.2, 5.NF.7, 6.NS.1; within-grade 4.OA.3 (remainders interpretation). Also born in grade 4 (grade 3 has no division NBT standard in the table — grade 3 OA.2 etc. are about equal groups, not multi-digit strategies). Let me double check 3.OA standards exist but those are within 100. From the table, 3.NBT only has 3 items. So division strategies with 4-digit dividends is born here.

3. 4.NBT.1 (10× relationship) — 5.NBT.1, 5.NBT.2, and the engine for 4.NBT.5/6 strategies. Conceptually load-bearing but compact to teach.

4. 4.NBT.4 (standard algorithm add/sub) — universally used (5.NBT.7, 6.NS.3, every domain's word problems), but partial prior coverage at 3.NBT.2 (fluency within 1000) narrows the gap to algorithm formalization + magnitude extension.

Hmm, actually, should 4.NBT.4 outrank 4.NBT.1? By "degree later grades depend on it": 4.NBT.4's skill is assumed by 5.NBT.7, 6.NS.3 and all computation. 4.NBT.1 is assumed by 5.NBT.1/2. In raw count, 4.NBT.4 has more dependents. But the *dependency depth* differs: later grades don't re-teach add/sub, while 5.NBT.1 does explicitly restate the place-value relationship (it re-teaches, which paradoxically lowers the cost of skipping 4.NBT.1... but no — 5.NBT.1 restates it because it's foundational; if kids lack it, 5.NBT.1 still has to build it).

For a 4-period plan, the practical ranking matters for what to cut. The natural cut candidates are 4.NBT.2 and 4.NBT.3 (lowest dependency, have both prior coverage and later re-teach points). I'll rank:

1. 4.NBT.5 — multiplication
2. 4.NBT.6 — division
3. 4.NBT.4 — add/sub standard algorithm
4. 4.NBT.1 — place value 10×
5. 4.NBT.2 — read/write/compare
6. 4.NBT.3 — rounding

Wait, but hmm. Let me reconsider 4.NBT.1 vs 4.NBT.4 ordering. 

Evidence for 4.NBT.4 above 4.NBT.1:
- 4.NBT.4 is depended on by: 5.NBT.7 (add/sub decimals), 6.NS.3 (standard algorithm decimals), plus every multi-step problem in grades 4-8 (4.OA.3, 4.MD.2, 5.MD.1...). 
- 4.NBT.1 is depended on by: 5.NBT.1, 5.NBT.2, and indirectly by 5.NBT.3/5.NBT.7 place-value reasoning.

But also note: 4.NBT.1 is the conceptual foundation that 4.NBT.5/6 strategies rely on within the same 4 periods I'm planning. If I teach 4.NBT.5/6, I'll need 4.NBT.1 anyway as the opening move. So 4.NBT.1 gets folded into lesson 1 regardless — it's tiny (one idea: a digit = 10× the one to its right).

And 4.NBT.4: students arrive with 3.NBT.2 fluency within 1000. The gap is small. A full period for it may be overkill, but its downstream fluency demand is high.

The plan: 4 periods:

- Period 1: 4.NBT.1 (+ carryover of 4.NBT.2's compare as warm-up) — place value to 1,000,000, 10× relationship, reading/writing numbers, comparison. Rationale: 4.NBT.1 is the engine; 4.NBT.2 skills are 80% carried from 2.NBT.3/2.NBT.4, so only the magnitude extension and expanded form refresher needed.

Hmm wait — but if I fold 4.NBT.2 into period 1, then I'm not really "舍弃" it. The user asks for a取舍方案 with explicit舍弃 items. I could either:
(a) Keep 4 standards (1, 4, 5, 6), cut 2 and 3 entirely.
(b) Merge 1+2 into one period, keep 4, 5, 6 as periods 2-4... that also cuts nothing formally but compresses.

Given 6 standards into 4 periods, the cleanest defensible plan: full periods for 4.NBT.5, 4.NBT.6, 4.NBT.4; period 1 covers 4.NBT.1 fully + 4.NBT.2's compare only briefly. Cut: 4.NBT.3 (rounding to any place) entirely, and 4.NBT.2 mostly.

Hmm. Let me think about what's most honest. The user says "只剩 4 个课时" and wants "4 课时的取舍方案" + "明确列出被舍弃的编号和风险". So they expect some standards get dropped. 

Option A (drop 2, keep 4): drop 4.NBT.2, 4.NBT.3.
- Keep: 4.NBT.1, 4.NBT.4, 4.NBT.5, 4.NBT.6 (one period each).
- Mitigation: fold compare (4.NBT.2) into 4.NBT.1's period as 10-min warm-up since it's cheap; rounding (4.NBT.3) gets a single estimation mini-slot in the 4.NBT.5/6 periods ("use rounding to check reasonableness" — which also serves 4.OA.3's estimation requirement).

Actually, that's a nice structure. Let me also double-check 4.OA.3's full text mentions "estimation strategies including rounding" — let me verify. The cut text said: "Assess the reasonableness of answers using mental computation and estimation strategies including rounding." Let me confirm.

Also — importantly — I should double-check the grade-4 range footnote. In official CC, Grade 4 NBT limits whole numbers to 1,000,000. The CSV domain "Number and Operations in Base Ten[2]" footnote [2] probably says that. I shouldn't invent it though — the skill says don't fabricate what's not in the table. I can mention it as the official footnote if I verify... The footnote isn't in the CSV. I'll avoid asserting the 1,000,000 range, or mention it's in the PDF footnote (domain name carries "[2]" marker, pdf P29). Safer to not claim specifics; I can note "域名后缀 [2] 是 PDF 脚注标记" and not fabricate its content. Actually, I know from the official CCSS doc that footnote 2 says "Grade 4 expectations in this domain are limited to whole numbers less than or equal to 1,000,000." But per the skill's rules, I should only state what's in the table. I'll keep it minimal and just cite what the table shows, maybe with a hedge like "(PDF 脚注，表内未收录其文字)". Better to just not bring up the 1,000,000 claim... though it's useful context for 4.NBT.2 (the delta from grade 3 is mainly magnitude). I could phrase: "4.NBT.2 的增量主要是数位扩展（域名的 [2] 脚注在 PDF P29，表格未收录脚注文字，此处不臆造）". Hmm, that's awkward. I'll just say the new content vs 2.NBT.3/2.NBT.4 is "multi-digit" (multi-digit generalization), citing the table.

Let me verify 4.OA.3 full text and 4.OA.1/4.OA.2 quickly. Also 3.OA.7 maybe (fluency within 100) — relevant for showing that grade 4 is where multi-digit ops are born. Let me check 3.OA.7 and 4.OA.1.

Then write the final answer. Structure:

## 一、4.NBT 全部条目（表内实查：6 条）
Table: code / cluster / requirement (原文) / pdf_page

## 二、按后续年级依赖度排序（高→低），每条给真实编号的证据链
1. 4.NBT.5 — 依赖它的：5.NBT.5（同操作、要求 standard algorithm 流畅，4 年级的策略与模型正是它的地基）、5.NBT.7（小数乘法沿用同一套 place value 策略）、6.NS.3、5.NF.5；且它是 4.NBT.6（除法"relationship between multiplication and division"）与 4.OA.1/4.OA.2/4.OA.3 的运算基础。而表内 3.NBT 只有 3.NBT.3（一位数×10 的倍数），多位数乘法在此首次出现 → 没有任何前期覆盖。
2. 4.NBT.6 — 5.NBT.6 原文几乎是它的逐句延伸（4 位被除数、除数从 1 位变 2 位，连 "Illustrate and explain... equations, rectangular arrays, and/or area models" 都一样）、6.NS.2（多位数除法标准算法）、5.NF.7 与 6.NS.1（"Apply and extend previous understandings of division"）；4.OA.3 的 remainder 解释。
3. 4.NBT.4 — 5.NBT.7、6.NS.3（小数四则的 standard algorithm 直接平移整数的）、以及 4.OA.3/4.MD.2/5.MD.1 一切多步计算；且后续年级不再重教整数加减的 standard algorithm（5、6 年级 NBT/NS 无此条目）→ 终点性流畅度。但注意 3.NBT.2 已有 within 1000 的 fluency，缺口只是"任意多位 + 标准算法化"。
4. 4.NBT.1 — 5.NBT.1（原文直接重述并把 10× 扩展到 1/10）、5.NBT.2（10 的幂的规律）；同时是 4.NBT.5/6 "strategies based on place value" 的概念引擎。但它是单句概念，教学成本低。
5. 4.NBT.2 — 下游只有 5.NBT.3（同样的三个动词 read/write/compare 平移到小数）；且 2.NBT.3/2.NBT.4 已覆盖到 1000 的读写比较，4 年级的增量最小，5 年级还会再教一遍（小数语境）。
6. 4.NBT.3 — 下游只有 5.NBT.4（round decimals to any place）；前期 3.NBT.1 已教 nearest 10/100 的 round；增量只是"any place"（如千位、万位）；且 5.NBT.4 本身就是重教点。

Wait — I should double check: is there any other downstream consumer of rounding? 4.OA.3 "estimation strategies including rounding" (within-grade, need to verify the full text). And 5.NBT.4. That's it in NBT land. 

Rank order rationale: I put 4.NBT.4 above 4.NBT.1 because... hmm, let me reconsider once more. 

The user's criterion: "按后续年级依赖它的程度排序（依赖关系必须用表里真实的编号说明）". So it's a single-order ranking. My order: 5 > 6 > 4 > 1 > 2 > 3.

Justification for 4.NBT.4 > 4.NBT.1: number of direct downstream consumers (5.NBT.7 + 6.NS.3 + all word-problem work vs 5.NBT.1 + 5.NBT.2), and no later re-teach of whole-number add/sub algorithm vs. 5.NBT.1 explicitly restating the place-value idea. Counterargument: 4.NBT.1 is the conceptual engine for everything. But "依赖程度" by evidence of explicit downstream statements favors 4.NBT.4. Also, in my 4-period plan both get taught anyway (period 1 = 4.NBT.1 with 4.NBT.2 folded in; period 2 = 4.NBT.4... wait, actually, hmm, should period 1 be 4.NBT.1? It's a small idea — maybe pair 4.NBT.1+4.NBT.4 in one period? 

Let me think about period allocation:
- P1: 4.NBT.1 (10× relationship) + 4.NBT.2 残留（读、写、比较，10 分钟热身）— place value and number sense
- P2: 4.NBT.4 — standard algorithm add/sub (fresh from 3.NBT.2, focus on algorithm formalization, magnitude, and speed)
- P3: 4.NBT.5 — multiplication strategies + area models
- P4: 4.NBT.6 — division strategies + remainders

That's the natural sequence and each of the four "kept" standards gets a period. 4.NBT.2's surviving core (compare) rides along in P1 warm-up; expanded form is honestly mostly review of 2.NBT.3. 4.NBT.3 is cut with a mitigation: one 5-minute "round to check reasonableness" habit embedded in P3/P4 word problems (which also serves 4.OA.3's estimation requirement — cross-domain win).

被舍弃: 4.NBT.2 (most of it; formal coverage dropped, only comparison folded as warm-up), 4.NBT.3 (entirely, mitigated by estimation mini-slots).

Risks:
- 4.NBT.2 risk: 5.NBT.3 (read/write/compare decimals) assumes the whole-number读写在手; students who can't handle expanded form of whole numbers will struggle with 5.NBT.3a's expanded decimal form. Mitigation: 2.NBT.3/2.NBT.4 prior coverage + P1 warm-up + 5.NBT.3 re-teach point. Also state-test items on 4.NBT.2 will be untaught (accountability risk).
- 4.NBT.3 risk: 5.NBT.4 (round decimals) assumes rounding transfer; 4.OA.3 explicitly requires "estimation strategies including rounding" for reasonableness checks — if unmitigated, word-problem reasonableness suffers. Mitigation: embed rounding-to-lead-digit checks in P3/P4; 3.NBT.1 covered nearest 10/100.

Also note: per the AGENTS.md context — this is a course repo about claude-code, and the skill is a custom skill in this repo. The question is a pure curriculum question; no code changes needed. Just answer well.

One more check: the full text of 4.OA.3 (to confirm the rounding mention) and maybe 4.OA.1/4.OA.2 and 3.OA.7 to support "multi-digit multiplication is born in grade 4". Let me grep those.

Also double-check there are no other Grade 4 NBT items beyond .1-.6 (e.g., no 4.NBT.7). The awk listing showed exactly 6. Good.

Also verify 5.NF.5 full text mentions comparing product size without multiplying — it builds on multiplication understanding. And 5.NF.7b/c. Fine.

Let me also confirm 3.OA.7 (fluently multiply/divide within 100) to support "grade 3 fluency is within 100; multi-digit is new at grade 4". And check 4.OA.1/4.OA.2 reference multiplication/division comparisons.
```

</details>

再核对几个跨域依赖的原文（4.OA.3 的完整文本、3.OA.7 的前期覆盖范围）：

🔧 `bash({"command": "grep -E '^4\\.OA\\.3,' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv"})`

🔧 `bash({"command": "grep -E '^(3\\.OA\\.7|4\\.OA\\.1|4\\.OA\\.2),' /Users/l/other_git_repos/calculus-quest/nodejs_react_lib/learn-claude-code/custom_skill_space/math-standards/references/standards.csv | cut -c1-350"})`

## toolResult · bash  <sub>2026-09-07T04:14:35.114Z</sub>

```
4.OA.3,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"3. Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. Represent these problems using equations with a letter standing for the unknown quantity. Assess the reasonableness of answers using mental computation and estimation strategies including rounding.",P29

```

## toolResult · bash  <sub>2026-09-07T04:14:35.114Z</sub>

```
3.OA.7,3,Operations and Algebraic Thinking,Multiply and divide within 100.,"7. Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers.",P23
4.OA.1,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"1. Interpret a multiplication equation as a comparison,",P29
4.OA.2,4,Operations and Algebraic Thinking,Use the four operations with whole numbers to solve problems.,"2. Multiply or divide to solve word problems involving multiplicative comparison,",P29

```

## assistant  <sub>2026-09-07T04:15:15.933Z</sub>

<details><summary>thinking</summary>

```
All evidence is confirmed. Now I have everything I need:

**Grade 4 NBT = 6 standards** (table-verified, all P29 / P29-30).

**Downstream evidence (all real codes):**

- 4.NBT.5 (multiplication):
  - 5.NBT.5: "Fluently multiply multi-digit whole numbers using the standard algorithm" — direct continuation, same operation, grade 4 strategies are the bridge.
  - 5.NBT.7, 6.NS.3: decimal ops reuse the same place-value strategies.
  - 5.NF.5 (multiplication as scaling).
  - Within grade: 4.NBT.6 ("relationship between multiplication and division"), 4.OA.1/4.OA.2 (multiplicative comparison), 4.OA.3.
  - Prior coverage: only 3.OA.7 (within 100) + 3.NBT.3 (1-digit × multiples of 10). Multi-digit multiplication is BORN in grade 4 → no recovery point if skipped.

- 4.NBT.6 (division):
  - 5.NBT.6: nearly verbatim continuation (4-digit dividends, 2-digit divisors, same strategies/models sentence).
  - 6.NS.2: "Fluently divide multi-digit numbers using the standard algorithm."
  - 5.NF.7 / 6.NS.1: "Apply and extend previous understandings of division."
  - Within grade: 4.OA.3 (remainder interpretation).
  - Prior coverage: 3.OA.7 within 100 only → multi-digit division strategies born here.

- 4.NBT.4 (add/sub standard algorithm):
  - 5.NBT.7, 6.NS.3 (decimal add/sub via standard algorithm).
  - All word problems: 4.OA.3, 4.MD.2, 5.MD.1.
  - No later re-teach of whole-number add/sub (5.NBT/6.NS have no such item) — terminal fluency.
  - BUT prior coverage: 3.NBT.2 (fluently add/sub within 1000) narrows the gap to "any multi-digit + algorithm formalization."

- 4.NBT.1 (10× place value):
  - 5.NBT.1 (restates + extends to 1/10), 5.NBT.2 (powers of 10).
  - Engine of 4.NBT.5/6's "strategies based on place value."
  - Conceptually load-bearing but a single idea — cheap to teach.

- 4.NBT.2 (read/write/compare):
  - Downstream: 5.NBT.3 only (same verbs for decimals).
  - Prior: 2.NBT.3/2.NBT.4 (to 1000) — smallest delta of all six.

- 4.NBT.3 (rounding):
  - Downstream: 5.NBT.4 only (round decimals to any place).
  - Prior: 3.NBT.1 (nearest 10/100); in-grade use in 4.OA.3 ("estimation strategies including rounding").
  - Delta: "to any place."

**4-period plan:**
- P1: 4.NBT.1 full + 4.NBT.2's comparison as warm-up (10 min)
- P2: 4.NBT.4
- P3: 4.NBT.5
- P4: 4.NBT.6 (+ embed rounding-to-lead-digit reasonableness checks, serving 4.OA.3's estimation clause)

**Cut: 4.NBT.2 (most), 4.NBT.3 (all formal teaching).**

Risks clearly stated with code-based reasoning.

Now, formatting: The user communicates in Chinese, so respond in Chinese. Use headers and a table. Cite original English text with codes and pdf pages per the skill's conventions. Keep it organized:

1. 全部条目 (6 条，含原文 + pdf_page)
2. 依赖度排序表 (with evidence chains using real codes)
3. 4 课时方案
4. 舍弃清单 + 风险

Length: this deserves a thorough answer since it's a detailed curriculum-planning question with explicit requirements. But keep it tight — no fluff. Use markdown tables where they help.
```

</details>

表内核对完毕（`references/standards.csv`，共 385 条中实查）。以下是完整分析。

## 一、4 年级 NBT 全部条目（实查：共 6 条，非 4 条）

| 编号 | 课标原文（英文） | PDF 页 |
|---|---|---|
| 4.NBT.1 | Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right. | P29 |
| 4.NBT.2 | Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form. Compare two multi-digit numbers based on meanings of the digits in each place, using >, =, and < symbols… | P29 |
| 4.NBT.3 | Use place value understanding to round multi-digit whole numbers to any place. | P29 |
| 4.NBT.4 | Fluently add and subtract multi-digit whole numbers using the standard algorithm. | P29, 30 |
| 4.NBT.5 | Multiply a whole number of up to four digits by a one-digit whole number, and multiply two two-digit numbers, using strategies based on place value and the properties of operations. Illustrate and explain… using equations, rectangular arrays, and/or area models. | P29, 30 |
| 4.NBT.6 | Find whole-number quotients and remainders with up to four-digit dividends and one-digit divisors, using strategies based on place value… and/or the relationship between multiplication and division. Illustrate and explain… | P29, 30 |

## 二、按后续年级依赖度排序（高 → 低，证据全部来自表内编号）

| 排名 | 条目 | 依赖它的后续课标（真实编号 + 原文依据） | 前期覆盖 |
|---|---|---|---|
| 1 | **4.NBT.5** 多位数乘法 | **5.NBT.5**（"Fluently multiply multi-digit whole numbers using the standard algorithm"——同操作直接续接，4 年级策略是算法的地基）；**5.NBT.7**、**6.NS.3**（小数四则沿用同一套 place value 策略）；**5.NF.5**（乘法 scaling）；本年级 **4.NBT.6**（原文明确靠 "relationship between multiplication and division"）、**4.OA.1/4.OA.2/4.OA.3** | 仅 3.OA.7（within 100）+ 3.NBT.3（一位数×10 的倍数）。**多位数乘法在 4 年级才诞生，跳过即无任何补课点** |
| 2 | **4.NBT.6** 多位数除法 | **5.NBT.6**（几乎逐句平移：被除数仍 4 位、除数 1 位→2 位，连 "Illustrate and explain… equations, rectangular arrays, and/or area models" 都原样重复）；**6.NS.2**（"Fluently divide multi-digit numbers using the standard algorithm"）；**5.NF.7 / 6.NS.1**（均以 "Apply and extend previous understandings of division" 开头）；本年级 **4.OA.3**（余数解释） | 仅 3.OA.7（within 100）。**除法策略同样在 4 年级才诞生** |
| 3 | **4.NBT.4** 标准算法加减 | **5.NBT.7**、**6.NS.3**（小数加减的标准算法直接平移整数版本）；**4.OA.3、4.MD.2、5.MD.1** 等一切多步应用题的计算底盘。5/6 年级 NBT/NS 中**不再有任何重教整数加减的条目**——终点性流畅度 | 3.NBT.2 已达 "Fluently add and subtract within 1000"，缺口仅是“任意多位 + 算法正式化”，是 6 条中前期覆盖最好的 |
| 4 | **4.NBT.1** 10 倍位值关系 | **5.NBT.1**（原文直接重述并扩展："10 times as much… and 1/10 of what it represents"——把本条从整数推广到小数）；**5.NBT.2**（10 的幂的规律与指数记法）；同时是 4.NBT.5/6 原文 "strategies based on place value" 的概念引擎 | 2.NBT.1 有百十个的捆扎经验；本条是单句概念，教学成本极低 |
| 5 | **4.NBT.2** 读写与比较 | 下游仅 **5.NBT.3** 一条（"Read, write, and compare decimals to thousandths"——同样三个动词平移到小数，且届时会重教） | 2.NBT.3/2.NBT.4 已覆盖到 1000 的读写比较。六条中**增量最小**：只是数位变长 |
| 6 | **4.NBT.3** 任意位四舍五入 | 下游仅 **5.NBT.4** 一条（"round decimals to any place"——本身就是重教点）；本年级 4.OA.3 原文 "estimation strategies including rounding" 用到它做合理性检验 | 3.NBT.1 已教 nearest 10/100。增量只是 "any place"（千位、万位） |

排序逻辑：**4.NBT.5、4.NBT.6 排前两位的决定性证据**是“该运算的多位数形态首次出现在 4 年级、且 5 年级同编号条目（5.NBT.5/5.NBT.6）直接在其上建标准算法/扩位”，跳过它们等于让 5 年级冷启动。4.NBT.4 虽然下游使用面最广，但 3.NBT.2 已铺好 most of the way。4.NBT.2、4.NBT.3 不仅下游各只有一条（5.NBT.3、5.NBT.4），还有 2.NBT/3.NBT 的前期覆盖 + 5 年级的重教点，属于“双向都有缓冲垫”。

## 三、4 课时方案

| 课时 | 内容 | 说明 |
|---|---|---|
| 第 1 课 | **4.NBT.1**（主体）+ 4.NBT.2 的"比较"作 10 分钟热身 | 把位值 10 倍关系讲透（这是后面三课的概念引擎），顺势带 >, =, < 比较和多成本极低 |
| 第 2 课 | **4.NBT.4** 标准算法加减 | 学生带着 3.NBT.2 的基础来，重点只需算法正式化 + 超过 1000 的数位扩展，一课足够 |
| 第 3 课 | **4.NBT.5** 多位数乘法 | 面积模型/位值策略，这是 5.NBT.5 标准算法的唯一地基，全课时投入 |
| 第 4 课 | **4.NBT.6** 除法与余数 | 紧贴第 3 课的乘法逆运算关系；应用题环节嵌入"四舍五入估首数验算"（同时服务 4.OA.3 的 estimation 要求） |

## 四、被舍弃的编号与风险

**正式舍弃：4.NBT.3（整条）＋ 4.NBT.2（除热身外的读写/展开形式部分）**

| 舍弃条目 | 风险（基于表内编号） | 缓解措施 |
|---|---|---|
| **4.NBT.3** | ① **5.NBT.4**（round decimals to any place）默认整数四舍五入已会，学生若从未见过“round to thousands”这类非 3.NBT.1 范围的位，迁移会慢；② 本年级 **4.OA.3** 原文明确要求 "estimation strategies including rounding" 检验答案合理性，完全跳过会影响多步应用题的验算习惯 | ① 3.NBT.1 已教 nearest 10/100，技能骨架在；② 第 3、4 课的应用题环节每次花 5 分钟做“估首数验算”，把 rounding 当习惯而非专题；③ 5.NBT.4 是天然重教点 |
| **4.NBT.2**（大部分） | ① **5.NBT.3a** 要求小数的 expanded form，若学生整数展开形式（本条）不牢，小数展开会直接卡壳；② 州测评若直考 4.NBT.2（如 1,000,000 以内的读写），属于完全未授课内容，纯丢分 | ① 2.NBT.3/2.NBT.4 已覆盖读写比较（到 1000），本条增量小；② 第 1 课热身保留"比较"；③ 展开形式在第 2 课标准算法的“分解数位”过程中自然复现，布置 2 道课后读写题即可 |

**一句话总结**：砍掉的必须是“前有 2/3 年级覆盖、后有 5 年级重教点”的 4.NBT.2/4.NBT.3；**绝不能砍 4.NBT.5/4.NBT.6**——表内证据显示多位数乘除在 4 年级才首次出现（3 年级只有 3.OA.7 within 100 和 3.NBT.3），砍了它们，5.NBT.5/5.NBT.6 就成了无地基的空中楼阁。

