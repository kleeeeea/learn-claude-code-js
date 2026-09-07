# A3-P1 · 学情诊断与补救

> ark-plan/glm-5.3 · 128.0s · PASS · 编号 3.NF.1, 3.NF.2, 3.NF.3, 4.NF.1, 4.NF.2, 5.NF.1, 5.NF.5, 5.NF.6, 5.NF.7, 6.NS.1

现在我来调取三年级到五年级的所有分数课标，因为这三个错误都发生在 Number and Operations—Fractions（分数的运算与思考）这个领域：我现在已经获取了所有三个年级的完整 NF 领域数据。让我再核对一个参考标准——学生错误写下的算式 `1/2 ÷ 1/3` 实际上属于六年级的内容（分数 ÷ 分数），我需要确认它是否存在，并检查 4.NF.2 关于比较链的内容：数据齐了。以下是定位、链路与补救方案（编号均来自 `standards.csv`，可按 pdf_page 回 PDF 核对）。

---

## 一、错题定位：各违反了哪条课标

### 错 1｜2/3 + 1/4 → 分子加分子、分母加分母（= 3/7）

**直接违反 5.NF.1**（5 年级 · Number and Operations—Fractions · **P36**）

> "Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions in such a way as to produce an equivalent sum or difference of fractions with like denominators."

译：异分母分数加减（含带分数），必须先用**等值分数**替换，化成同分母后再加减。学生完全跳过通分，其根源还违反了 **4.NF.3a**（4 年级 · 同 domain · **P30**）：

> "Understand addition and subtraction of fractions as joining and separating parts referring to **the same whole**."

分数加减是“**同一整体**上各部分的合并与分离”——分子加分子、分母加分母，等于把两个不同大小单位上的计数直接混加，恰恰违背"same whole"。

### 错 2｜说不出 3/4 × 5 比 5 大还是小

**直接违反 5.NF.5（尤其 5a、5b）**（5 年级 · Number and Operations—Fractions · **P36–37**）

> "5. Interpret multiplication as **scaling (resizing)**, by:
> a. Comparing the size of a product to the size of one factor **on the basis of the size of the other factor, without performing the indicated multiplication**.
> b. …explaining why multiplying a given number by **a fraction less than 1 results in a product smaller than the given number**…"

译：不动笔计算，仅凭另一因子（3/4 < 1）就能判断积比 5 小——这正是该生做不到的“乘法即缩放”观念。

### 错 3｜「1/2 米的 1/3」列式为 1/2 ÷ 1/3

**直接违反 5.NF.6**（5 年级 · Number and Operations—Fractions · **P36–37**）：

> "Solve real world problems involving **multiplication of fractions** and mixed numbers…"

“……的……”结构是分数**乘**分数：1/2 × 1/3。概念根子违反 **5.NF.4a**（同上页）：

> "Interpret the product (a/b) × q as **a parts of a partition of q into b equal parts**…"

即“把 q 平均分成 b 份取 a 份”本身就是乘。顺带两点：5 年级的除法只要求到 **5.NF.7**（单位分数÷整数、整数÷单位分数）；学生误写的“分数÷分数”要到 **6.NS.1**（6 年级 · The Number System · P42）才要求——他是既没建立“的=乘”，又提前套用了尚不存在的除法套路。

---

## 二、沿同一 domain（Number and Operations—Fractions）的前置课标链

该 domain 从 3 年级才开始（表里 3、4 年级写作 Number and Operations—Fractions，即同一领域），故链条最深到 3 年级：

| 错误 | 前置链（高 → 低） |
| --- | --- |
| 错 1（加法） | **5.NF.1**(5) ← **4.NF.3a/b**(4，同分母加减、拆分) ← **4.NF.1**(4，等值分数) ← **3.NF.3a/b**(3，等值初步) ← **3.NF.1**(3，单位分数) |
| 错 2（缩放） | **5.NF.5a/b**(5) ← **4.NF.4a/b**(4，分数×整数=若干个 1/b) ← **4.NF.1**(4) ← **3.NF.3c/d**(3，整数写成分数 1=4/4、比大小) ← **3.NF.1**(3) |
| 错 3（乘法应用） | **5.NF.6**(5) ← **5.NF.4a**(5) ← **4.NF.4c**(4，分数×整数应用题) ← **4.NF.4a/b**(4) ← **3.NF.2**(3，数线表示，可视化用) ← **3.NF.1**(3) |

三条链在 **3.NF.1** 汇合——三个错误共同的地基都是“单位分数”概念缺失。

---

## 三、补救顺序（从最底层前置开始）

**两条主线共用 3–4 年级地基，补完地基后先收口加法线、再走乘法线：**

1. **3.NF.1**（3 年级）— 单位分数：整体平均分成 b 份，1 份是 1/b，a/b 是 a 个 1/b。面积模型、折纸。三错共同的第一块砖。
2. **3.NF.3**（3 年级）— 等值与比较初步：同样大小即等值；1 = 4/4；同分子/同分母比大小。其间用 **3.NF.2** 的数线做可视化。
3. **4.NF.1**（4 年级）— 用模型解释 a/b = (n×a)/(n×b)，熟练生成等值分数——后面通分和缩放判断都要用它。
4. **4.NF.3a/b**（4 年级）— 同分母加减、把分数拆成单位分数之和，反复强调“只有同样大小的份才能直接合并”（same whole），正面拆掉“分子加分子”的错误。
5. **5.NF.1**（5 年级）— 异分母加减收口：2/3 + 1/4 = 8/12 + 3/12 = 11/12（用第 3 步的等值分数通分）。
6. **4.NF.4a/b/c**（4 年级）— 分数×整数：a/b 是 1/b 的倍数；解“3 个 1/4 米”类应用题。
7. **5.NF.4a**（5 年级）— “的”字结构：1/2 米的 1/3 = 把 1/2 米平均分成 3 份取 1 份 = 1/2 × 1/3，画矩形面积模型验证（同时覆盖 5.NF.4b）。
8. **5.NF.5a/b**（5 年级）— 不动笔判断：另一个因子比 1 大还是小 ⇒ 积变大还是变小。3/4 < 1，故 3/4 × 5 < 5。
9. **5.NF.6**（5 年级）— 分数乘法真实情境应用题收口，综合检验三错是否消除。

（学生误用的“分数÷分数”属 6.NS.1，是 6 年级内容，不在本次 5 年级补救范围内。）
