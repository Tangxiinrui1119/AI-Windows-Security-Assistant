# 第5章 函数

> 来源：课程 PPT《第5章 函数》
> 复习目标：掌握函数定义、参数、返回值、作用域，以及常用数学、随机和日期时间库。

## 一、知识地图

定义函数
→ 调用与参数
→ return
→ 默认 / 关键字 / 不定长参数
→ lambda
→ 局部与全局变量
→ math / random
→ datetime

## 二、定义与调用

函数可以提高代码复用性和模块化程度。

基本结构：

    def 函数名(参数):
        语句
        return 返回值

形参：定义函数时括号中的参数。
实参：调用函数时传入的参数。

## 三、return

    return value

用于把结果返回给调用者。

不带表达式的 return 相当于返回 None。

## 四、参数传递

PPT 将对象分为：

不可变类型：

- number
- string
- tuple

可变类型：

- list
- set
- dictionary

函数内部如果对可变对象本身进行修改，调用者可能看到变化；仅把局部变量重新绑定到其他对象，并不等于修改原对象。

## 五、常见参数形式

### 关键字参数

    print_info(age=20, name="John")

### 默认参数

    def f(x=10):
        ...

### 不定长参数

    *args

收集额外的位置参数，通常形成元组。

    **kwargs

收集额外的关键字参数，形成字典。

PPT 还介绍：

- /：前面的参数要求按位置传递。
- *：后面的参数要求按关键字传递。

## 六、lambda 匿名函数

格式：

    lambda 参数: 表达式

例如：

    f = lambda x: x * 2

主要用于简短表达式函数。

## 七、局部变量与全局变量

函数内部定义的变量通常是局部变量。

若要在函数内部明确修改全局变量，可使用：

    global n

## 八、math 库

两种导入：

    import math
    math.sqrt(25)

或：

    from math import sqrt
    sqrt(25)

## 九、random 库

PPT 中常见函数：

    random()          # [0.0, 1.0)
    randint(a, b)     # [a, b] 整数
    randrange(...)    # 类似 range 的随机整数
    choice(seq)       # 随机选一个
    shuffle(list)     # 打乱列表
    uniform(a, b)     # 随机浮点数

seed()：相同随机种子可得到相同随机数序列。

## 十、datetime 库

PPT 重点包括：

字符串转日期时间：

    datetime.strptime(date_string, format)

创建日期：

    datetime.date(year, month, day)

以及 datetime 对象属性、时间差计算。

## 十一、本章易错点

- 形参在定义时出现，实参在调用时出现。
- return 与 print() 不是一回事：return 是把结果交回调用者。
- *args 是额外位置参数；**kwargs 是额外关键字参数。
- randint(a, b) 两端都可能取到。
