# A2-P3 · 知识点识别与对齐

> ark-plan/glm-5.3 · 123.5s · PASS · 编号 3.OA.8, 4.MD.3, 4.MD.7, 4.NBT.4, 4.NBT.5, 4.NBT.6, 4.OA.1, 4.OA.2, 4.OA.3, 4.OA.5, 5.OA.1, 5.OA.2, 5.OA.3, 6.EE.5, 6.EE.6, 6.EE.7, 7.EE.4, 8.EE.7

已核对技能数据。再查几个衔接年级（1、3、5 年级）里与"未知数"相关的真实条目，把来龙去脉对齐：数据已核对完毕（来源：`references/standards.csv`，Common Core 数学课标）。下面回表判断。

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
