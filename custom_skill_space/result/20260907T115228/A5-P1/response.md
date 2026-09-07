# A5-P1 · 命题与评估

> ark-plan/glm-5.3 · 307.2s · PASS · 编号 7.EE.4

已从课标库中查到该条，先给原文与页码，再出题。

## 课标原文

**7.EE.4** · Grade 7 · 域：Expressions and Equations
簇：Solve real-life and mathematical problems using numerical and algebraic expressions and equations.
**PDF 页码：P49**

> "4. Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems by reasoning about the quantities. a. Solve word problems leading to equations of the form px + q = r and p(x + q) = r, where p, q, and r are specific rational numbers. Solve equations of these forms fluently. Compare an algebraic solution to an arithmetic solution, identifying the sequence of the operations used in each approach. b. Solve word problems leading to inequalities of the form px + q > r or px + q < r, where p, q, and r are specific rational numbers. Graph the solution set of the inequality and interpret it in the context of the problem."

中文大意：用变量表示现实或数学问题中的量，通过推理数量关系构造简单方程/不等式来解题；a) 解实际问题导出的形如 px + q = r 与 p(x + q) = r 的方程（p、q、r 为特定有理数），要求熟练求解，并能比较代数解法与算术解法、指出每种方法所用运算的先后序列；b) 解形如 px + q > r 或 px + q < r 的不等式（p、q、r 为特定有理数），画出解集并在情境中解释其含义。

---

## 题目 1（直接应用）

**题干**
Solve each equation. Show every step.
(a) (2/3)x + 5 = −3
(b) 0.4(x + 9) = −6
(c) Mai solved equation (a) by working backwards with arithmetic: start with −3, subtract 5 to get −8, then divide by 2/3 to get −12. In order, list the operations you used in your algebraic solution of (a), and compare your sequence with Mai's. What do you notice?

（中文大意：(a)(b) 逐步解方程；(c) Mai 用算术倒推解 (a)：从 −3 出发先减 5 得 −8，再除以 2/3 得 −12。请按顺序列出你代数解的运算，与 Mai 的序列比较，写出发现。）

**参考答案**
- (a) 两边减 5：(2/3)x = −8；两边乘 3/2：x = **−12**。检验：(2/3)(−12) + 5 = −3 ✓
- (b) 两边除以 0.4：x + 9 = −15；两边减 9：x = **−24**。（或先分配：0.4x + 3.6 = −6 → 0.4x = −9.6 → x = −24。）检验：0.4(−24 + 9) = −6 ✓
- (c) 代数解序列：两边减 5 → 两边除以 2/3。Mai 的序列：减 5 → 除以 2/3。两条序列的运算与顺序**完全相同**；区别是算术倒推只对数值做逆运算，代数解对等式两边同时做同样的逆运算，因此对任何 px + q = r 都成立——代数解就是算术倒推的一般化。

**评分要点（每步 1 分，共 6 分）**
1. (a) 两边同减 5，得 (2/3)x = −8 —— 逆运算选对、两边同变
2. (a) 两边同乘 3/2，得 x = −12 —— 有理数运算正确
3. (b) 两边同除以 0.4，得 x + 9 = −15 —— 必须除"整边"；只除 x 一项（写成 0.4x + 9 = −6）此步不给分
4. (b) 两边同减 9，得 x = −24（先分配再解同样给满）
5. (c) 按顺序正确列出自己代数解的运算序列
6. (c) 正确复述 Mai 的序列并作出比较：两条序列一致，能点出"代数解＝把算术倒推同时作用于两边"

**测查的原文动词/短语**
- "**Solve equations of these forms fluently**"：整题限时、不用计算器，直接考两类方程的熟练求解。
- "equations of the form **px + q = r** and **p(x + q) = r**, where p, q, and r are **specific rational numbers**"：(a) 取 p = 2/3（分数）、(b) 取 p = 0.4（小数），两种形式各一道。
- "Compare an algebraic solution to an arithmetic solution, **identifying the sequence of the operations used in each approach**"：(c) 要求列出并比较两种解法的运算序列。

---

## 题目 2（情境应用）

**题干**
Kiran is raising money for a charity walk. His goal is to raise **more than** $500. So far he has raised $165. Each additional sponsor donates $12.50.
(a) Use a variable to represent the number of additional sponsors Kiran needs, and write an inequality that can be used to find when he reaches his goal.
(b) Solve the inequality.
(c) Graph the solution set on a number line.
(d) What is the minimum whole number of additional sponsors Kiran needs? Explain how you know.

（中文大意：Kiran 为慈善健走筹款，目标是"超过"500 美元；已筹 165 美元，每位新赞助人捐 12.50 美元。(a) 设变量、列不等式；(b) 求解；(c) 数轴上画解集；(d) 至少还需多少位赞助人？说明理由。）

**参考答案**
- (a) 设 s = 追加赞助人数：165 + 12.5s > 500（等价写法均可）
- (b) 两边减 165：12.5s > 335；两边除以 12.5：**s > 26.8**
- (c) 数轴上 26.8 处画**空心圆点**，向右画射线（26.8 不含在解集内）
- (d) 至少 **27 位**：s 须为整数且严格大于 26.8。检验：26 位 → 165 + 325 = 490（不够）；27 位 → 165 + 337.5 = 502.5（达标）

**评分要点（每步 1 分，共 5 分）**
1. 设出变量并写出正确不等式 165 + 12.5s > 500 —— 只写方程、或不设变量，此步不给分
2. 两边减 165，得 12.5s > 335
3. 两边除以 12.5，得 s > 26.8 —— p 为正，不等号方向不变
4. 数轴图：26.8 处**空心**圆点、向右 —— 画成实心、位置标成 26 或 27、方向画反，此步不给分
5. 情境解释：至少 27 位，理由涉及"整数 + 必须超过 26.8" —— 答"26.8 位"或向下取整成 26 不给分（此步顺带暴露"机械取整"的常见误解）

**测查的原文动词/短语**
- "**Use variables to represent quantities in a real-world or mathematical problem**"：(a) 要求学生自己设变量 s。
- "construct simple equations and inequalities to solve problems **by reasoning about the quantities**"：由"超过 500"构造严格不等式；(d) 按量的实际含义（人数为整数）推理。
- "Solve word problems leading to **inequalities of the form px + q > r**, where p, q, and r are **specific rational numbers**"：p = 12.5，q = 165，r = 500，严格">"型。
- "**Graph the solution set of the inequality**"：(c)。
- "**interpret it in the context of the problem**"：(d) 把 s > 26.8 解释为"至少 27 位"。

---

## 题目 3（误解暴露题）

**题干**
A pool contains 420 gallons of water and is draining at a constant rate of 12 gallons per minute.
(a) Write and solve an inequality to find after how many minutes the pool will contain less than 60 gallons.
(b) Diego solved the problem like this：

```
420 − 12m < 60
−12m < −360   (subtracted 420 from both sides)
m < 30        (divided both sides by −12)
```

He concluded: "Within 30 minutes, the pool will contain less than 60 gallons."
Identify Diego's error, and use one or more specific numbers of minutes to show why his conclusion cannot be correct.

（中文大意：泳池有 420 加仑水，以每分钟 12 加仑匀速放水。(a) 写出并解不等式，求多少分钟后水量低于 60 加仑；(b) Diego 解得 m < 30 并断言"30 分钟内水量就会低于 60 加仑"。请指出他的错误，并用具体的分钟数说明该结论为何不可能成立。）

**参考答案**
- (a) 设 m = 放水分钟数：420 − 12m < 60 → −12m < −360 → **m > 30**（两边除以 −12 时不等号反转）。即 30 分钟之后水量低于 60 加仑（30 分钟整时恰为 60，不算"低于"）。
- (b) 错误：不等式两边同除以**负数**（−12）时，不等号方向必须反转，他仍写"<"。用数值驳斥：取 m = 20（满足他的 m < 30），剩余 420 − 240 = 180 加仑，远大于 60，结论不成立；取 m = 31，剩余 420 − 372 = 48 < 60，与 m > 30 一致。也可用情境推理：水量随时间递减，前 30 分钟内不可能低于 60 加仑。

**评分要点（每步 1 分，共 5 分）**
1. 从情境写出不等式 420 − 12m < 60（或等价形式）
2. 两边减 420，得 −12m < −360
3. 两边除以 −12 **并反转不等号**，得 m > 30 —— 写成 m < 30 此步 0 分（目标误解；但第 1、2 步分照给，体现"只是变号处失分"）
4. 准确指出错误：除以负数须变号 —— 只答"他算错了"不给分
5. 用具体数值或数量推理验证：如 m = 20 时剩 180 加仑（> 60）驳斥 m < 30；或 m = 31 时剩 48 加仑佐证；或用"水量单调递减"的情境推理

**测查的原文动词/短语**
- "Solve word problems leading to **inequalities of the form px + q < r**, where p, q, and r are **specific rational numbers**"：本题 p = **−12**（负有理数）、q = 420、r = 60。负系数把"除以负数要变号"逼出来——这是该句之下最典型、最高频的误解。
- "construct simple equations and inequalities to solve problems **by reasoning about the quantities**"：第 1 步建模，以及 (b) 中代回具体数值检验、推翻错误结论，都是"对量进行推理"而非死套程序。

---

## 覆盖小结

| 原文动词/短语 | 对应题目 |
|---|---|
| Use variables to represent quantities | 题 2(a)、题 3(a) |
| construct … by reasoning about the quantities | 题 2(a)(d)、题 3(a)(b) |
| px + q = r / p(x + q) = r，specific rational numbers | 题 1(a)(b) |
| Solve … fluently | 题 1 整题 |
| Compare an algebraic solution to an arithmetic solution, identifying the sequence of the operations | 题 1(c) |
| px + q > r | 题 2；px + q < r（负系数） | 题 3 |
| Graph the solution set | 题 2(c) |
| interpret it in the context | 题 2(d) |

三题合起来覆盖了 7.EE.4 主句及 a、b 两个子句的全部行为动词。
