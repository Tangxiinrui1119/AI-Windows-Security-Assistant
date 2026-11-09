# 信息安全数学基础

> 按六份课程课件整理。每章开头有知识地图，正文按课件顺序保留主要定义、公式和定理，并用课件例题串起解法。文中的页码按各 PDF 顺序计。

## 章节入口

- [01 · 整数的可除性](01-divisibility-of-integers.md)
- [02 · 同余](02-congruence.md)
- [03 · 一次同余方程](03-linear-congruences.md)
- [04 · 二次同余](04-quadratic-congruences.md)
- [05 · 原根和阶](05-primitive-roots-and-orders.md)
- [06 · 近世代数基础](06-abstract-algebra.md)

## 跨章节复习

| 从哪章开始 | 用到后面哪章 |
| --- | --- |
| 第 1 章用扩展欧几里得算法求整系数组合 | 第 2–3 章用组合系数求模逆与一次同余方程的解 |
| 第 2 章用简化剩余系计数并对指数降阶 | 第 5 章把指数周期从欧拉函数缩小到元素的阶 |
| 第 3 章用中国剩余定理把局部解拼成全局解 | 第 4 章拆分合数模，再用平方剩余和勒让得符号判断各部分 |
| 第 5 章用原根生成整个简化剩余系 | 第 6 章将这个思想推广到循环群与有限域的本原元 |
| 第 1–2 章的整除、带余除法和同余 | 第 6 章对域上的多项式做对应运算，再模不可约多项式构造有限域 |

## 容易用错的条件

- 同余式约去因子时检查它与模数是否互素。若不互素，约分后要换成相应的较小模数。
- 中国剩余定理的直接构造要求模数两两互素。解数按最终模数下的剩余类计。
- 勒让得符号在奇素数模下判别二次同余。对奇合数模，雅可比符号为 +1 仍需检查局部方程。
- 欧拉函数给出阶的倍数。阶要求最小的正指数。离散对数的指数按阶分类。
- 有限域的加法和乘法先按系数所在的基域计算。乘积再对指定的不可约多项式取余。

[2026 年 11 月学习日志](../../docs/devlog/2026/11.md) · 旧笔记存档：[第 1 章](https://github.com/Tangxiinrui1119/AI-Windows-Security-Assistant/blob/8f074591560b9c707a6bb68190620012858a1077/notes/security-mathematics/01-divisibility-of-integers.md) · [第 2 章（含 RSA 延伸）](https://github.com/Tangxiinrui1119/AI-Windows-Security-Assistant/blob/8f074591560b9c707a6bb68190620012858a1077/notes/security-mathematics/02-congruence.md) · [原跨章复习](https://github.com/Tangxiinrui1119/AI-Windows-Security-Assistant/blob/8f074591560b9c707a6bb68190620012858a1077/notes/security-mathematics/README.md)
