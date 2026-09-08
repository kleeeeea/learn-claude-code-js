# Data schema

`standards.csv` 存放 Demo 使用的五年级 CCSS 课标。

`knowledge_points.csv` 存放知识点名称、描述、对应课标和外部前置知识。

`relations.csv` 存放知识点关系。`source_id -> target_id` 表示前者是后者的前置知识。

`manual` 表示人工整理，`pending-review` 表示还没有完成教师审核。这些关系不是 CCSS 原文中的关系。
