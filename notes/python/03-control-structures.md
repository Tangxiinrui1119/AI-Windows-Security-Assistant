# 第3章 程序的控制结构

> 来源：课程 PPT《第3章 程序的控制结构》
> 复习目标：掌握顺序、选择、循环三种基本程序结构。

## 一、知识地图

    程序控制结构
    ↓
    三种基本结构
    ├─ 顺序结构
    ├─ ⭐ 选择结构
    └─ ⭐ 循环结构
    ↓
    顺序结构
    └─ 语句按先后顺序执行
    ↓
    ⭐ 选择结构
    ├─ if
    ├─ if / else
    ├─ if / elif / else
    ├─ 关系运算符判断条件
    └─ 条件表达式：A if 条件 else B
    ↓
    ⭐ for 循环
    ├─ for 变量 in 序列
    └─ range(start, stop, step)
       ├─ start：起点
       ├─ stop：终点，不包含
       └─ step：步长
    ↓
    ⭐ while 循环
    └─ 条件为 True 时持续执行
    ↓
    循环控制
    ├─ break → 跳出当前循环
    └─ continue → 跳过本轮，进入下一轮
    ↓
    循环嵌套
    └─ 循环中继续包含循环
    ↓
    pass
    └─ 空语句 / 占位，不执行实际操作

> [!IMPORTANT]
> 本章重点：
> **⭐ if / elif / else 的分支逻辑**
> **⭐ range() 的 stop 不包含在结果中**
> **⭐ for 与 while 的基本使用**
> **⭐ break 和 continue 的区别**
> **⭐ Python 依靠缩进表示代码块**
## 二、三种基本结构

1. 顺序结构：语句按顺序执行。
2. 选择结构：根据条件决定执行哪一部分。
3. 循环结构：重复执行某段代码。

## 三、选择结构

基本形式：

    if 条件:
        语句

多分支：

    if 条件1:
        ...
    elif 条件2:
        ...
    else:
        ...

关系运算符：

    <  <=  >  >=  ==  !=

## 四、条件表达式

PPT 给出的紧凑形式：

    表达式2 if 表达式1 else 表达式3

例如：

    result = "及格" if score >= 60 else "不及格"

## 五、for 循环

基本形式：

    for 变量 in range(start, stop, step):
        循环体

range()：

- start：起点
- stop：终点，但不包含
- step：步长

例如：

    for i in range(0, 10, 2):
        print(i)

输出：

    0 2 4 6 8

## 六、while 循环

基本思路：

    while 条件:
        循环体

只要条件为 True 就继续执行。

## 七、break 与 continue

### break

立即跳出当前循环。

### continue

结束本次循环，直接进入下一次循环判断。

## 八、循环嵌套

循环内部还可以再写循环。

典型用途：九九乘法表、二维数据遍历等。

## 九、pass

pass 是空语句，不执行任何实际操作，常用于暂时占位。

    if x > 0:
        pass

## 十、本章最该记住

    if / elif / else
    for ... in range(...)
    while ...
    break
    continue
    pass

易错点：

- Python 代码块依靠缩进。
- range() 的 stop 不包含在结果中。
- break 结束整个当前循环；continue 只结束本轮。
