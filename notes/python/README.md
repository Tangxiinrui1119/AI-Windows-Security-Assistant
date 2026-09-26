# Python 课程学习笔记

> 本目录整理自课程第 1～9 章 PPT，用于后续复习、查语法和做小程序时快速回看。

## 目录

| 章节 | 主题 | 核心内容 |
|---|---|---|
| [第1章 初识 Python](./01-python-introduction.md) | Python 入门 | Python 特点、开发环境、编译与解释、程序运行方式 |
| [第2章 编写简单的程序](./02-simple-programs.md) | 基础语法 | 变量、运算符、赋值、输入输出、字符串、编码、math |
| [第3章 程序的控制结构](./03-control-structures.md) | 流程控制 | if、for、while、range、break、continue、pass |
| [第4章 基本内置数据类型](./04-basic-data-types.md) | 数据结构基础 | Number、String、Tuple、List、Dictionary、Set |
| [第5章 函数](./05-functions.md) | 函数与常用库 | 参数、return、*args、**kwargs、lambda、作用域、random、datetime |
| [第6章 面向对象编程](./06-object-oriented-programming.md) | OOP | class、对象、self、__init__、属性、方法、继承、多态、模块与包 |
| [第7章 字符串与正则表达式](./07-strings-and-regex.md) | 文本处理 | split、join、f-string、正则表达式、re、异常处理 |
| [第8章 文件读写、CSV 与 JSON](./08-file-io-csv-json.md) | 文件与数据交换 | open、read/write、with、CSV、JSON、dumps/loads |
| [第9章 NumPy](./09-numpy.md) | 数值数组 | ndarray、创建数组、shape、索引切片、reshape、ufunc |

---

## 九章知识路线

    Python 是什么、怎么运行
            ↓
    变量、表达式、输入输出
            ↓
    if / for / while 控制程序流程
            ↓
    字符串、列表、字典、集合等数据类型
            ↓
    用函数组织和复用代码
            ↓
    用类和对象组织更复杂的程序
            ↓
    用字符串方法和正则处理文本
            ↓
    从文件 / CSV / JSON 中读写数据
            ↓
    用 NumPy 处理数值数组

---

## 当前阶段最值得先记住的内容

第一次学完不需要把所有函数名全部背下来，优先保证下面这些概念清楚：

### 基础语法

    变量赋值
    input / print
    if / elif / else
    for / while
    range

### 常用数据类型

    str
    list
    tuple
    dict
    set

重点分清：

    String / Tuple / Number → 不可变
    List / Dictionary / Set → 可变

### 函数

    def
    return
    *args
    **kwargs
    lambda

### 面向对象

    class
    对象
    self
    __init__
    继承
    方法重写

### 文本处理

    split
    join
    strip
    replace
    re.search
    re.findall
    re.match
    re.fullmatch

### 文件

    with open(...) as f
    read / readline / readlines
    write / writelines

### JSON

    dumps：Python 对象 → JSON 字符串
    loads：JSON 字符串 → Python 对象

### NumPy

    import numpy as np
    np.array(...)
    ndim
    shape
    size
    dtype
    索引 / 切片
    reshape

---

## 推荐复习方式

这 9 章一次学完后，不建议立刻重新从第一页 PPT 再看一遍。

更适合的节奏：

### 第 1 次复习：第二天

目标：确认自己还记得什么。

- 先不看笔记，回忆每章大概讲了什么。
- 每章只用 1～2 分钟。
- 卡住的地方再打开对应 Markdown。
- 总时间控制在约 20～30 分钟。

### 第 2 次复习：2～3 天后

目标：把“看懂”变成“会写”。

手敲几个很短的小程序，例如：

- 输入两个数并计算结果。
- 用 if 判断成绩。
- 用循环遍历列表。
- 写一个函数。
- 创建一个简单类。
- 用正则找数字。
- 读取一个 txt / CSV。
- 把字典转换成 JSON。
- 创建一个 NumPy 数组。

### 第 3 次复习：约一周后

目标：快速查漏补缺。

优先复习：

- 自己前两次答错的内容。
- 函数参数。
- list / tuple / dict / set 区别。
- self / __init__。
- 正则。
- 文件读写。
- JSON。
- NumPy 基础。

---

## 使用方式

后续写 Python 小程序时，不需要强迫自己背全部 API。

推荐流程：

    想实现某个功能
        ↓
    先判断属于哪一章
        ↓
    打开对应笔记
        ↓
    查函数 / 语法
        ↓
    自己手敲并运行
        ↓
    多使用几次后自然记住

这套笔记的目标不是“背完 Python”，而是建立一张可以不断回查和补充的知识地图。
