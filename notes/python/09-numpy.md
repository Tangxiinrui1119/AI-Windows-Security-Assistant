# 第9章 NumPy 库

> 来源：课程 PPT《第9章 NumPy库》
> 复习目标：理解 ndarray，掌握 NumPy 数组创建、属性、索引切片和基本数组操作。

## 一、知识地图

    NumPy
    ↓
    NumPy 概述
    ├─ Python 科学计算第三方基础库
    ├─ 多维数组
    ├─ 矩阵运算
    └─ 数学函数库
    ↓
    ⭐ ndarray
    ├─ NumPy 核心数据对象
    ├─ 元素类型相同
    ├─ 维度 = 轴 axis
    └─ 轴的个数 = 秩 rank
    ↓
    ⭐ 创建 ndarray
    ├─ np.array(列表 / 元组)
    ├─ np.arange()
    ├─ np.linspace()
    ├─ np.indices()
    ├─ np.ones() / np.zeros()
    └─ np.random.rand() / randn()
    ↓
    dtype 数据类型
    ├─ bool
    ├─ int / uint
    ├─ float
    └─ complex
    ↓
    ⭐ ndarray 常用属性
    ├─ ndim → 维度 / 秩
    ├─ shape → 各维度大小
    ├─ size → 元素总数
    ├─ dtype → 元素类型
    ├─ itemsize → 单个元素字节数
    └─ data → 缓冲区
    ↓
    ⭐ 索引与切片
    ├─ 一维索引：a[i]
    ├─ 多维索引：a[row, col]
    ├─ x[start:stop:step]
    ├─ 多维切片：先行后列
    └─ ⭐ 切片得到原数组视图，修改会反映到原数组
    ↓
    ⭐ 数组形态操作
    ├─ reshape() → 返回新形态数组
    ├─ resize() → 直接改变原数组
    ├─ swapaxes() → 交换轴
    ├─ flatten() → 展平为拷贝
    └─ ravel() → 展平为视图
    ↓
    数组拼接
    ├─ vstack() → 按行 / 垂直拼接
    ├─ hstack() → 按列 / 水平拼接
    └─ concatenate() → axis 指定方向
    ↓
    数组切分
    ├─ vsplit()
    ├─ hsplit()
    └─ split()
    ↓
    转置与翻转
    ├─ transpose() / T
    ├─ fliplr() → 左右翻转
    └─ flipud() → 上下翻转
    ↓
    ⭐ ufunc 元素级运算
    ├─ 一元：sqrt / square / ceil / floor / sin / cos / log / diff...
    ├─ 算术：add / subtract / multiply / divide / power / mod
    ├─ 比较：equal / not_equal / less / greater...
    └─ where(condition, x, y)
    ↓
    综合示例
    └─ NumPy 随机数 + 绘图

> [!IMPORTANT]
> 本章重点：
> **⭐ ndarray 是什么，以及为什么元素类型统一**
> **⭐ ndim / shape / size / dtype**
> **⭐ 多维索引与切片**
> **⭐ reshape 与 resize、flatten 与 ravel 的区别**
> **⭐ NumPy 运算通常对数组元素批量执行**
## 二、NumPy 是什么

NumPy（Numerical Python）是 Python 科学计算常用的第三方基础库。

主要用于：

- 多维数组
- 矩阵运算
- 大量数组数学运算

核心数据对象：

    ndarray

PPT 强调：ndarray 中的元素类型相同。

## 三、导入

常见写法：

    import numpy as np

补充理解：

- numpy 是模块名。
- np 只是给 numpy 起的常用别名。
- 不使用别名也可写 import numpy，只是后面要写 numpy.array(...)。

## 四、创建 ndarray

从列表或元组创建：

    a = np.array([1, 2, 3])

二维：

    a = np.array([
        [1, 2, 3],
        [4, 5, 6]
    ])

常见创建函数：

    np.arange(x, y, step)
    np.linspace(x, y, n)
    np.ones((m, n), dtype)
    np.zeros((m, n), dtype)
    np.random.rand(m, n)
    np.random.randn(m, n)

## 五、ndarray 与普通 list

Python 列表也可以嵌套形成二维结构，因此 ndarray 并不是“只有它才能多维”。

NumPy ndarray 的重点是：

- 专门面向数值数组。
- 元素类型统一。
- 提供大量数组级、元素级运算函数。

## 六、dtype

创建数组时可通过 dtype 指定数据类型。

PPT 列出：

- bool
- int8 / int16 / int32 / int64
- uint8 / uint16 / uint32 / uint64
- float16 / float32 / float64
- complex64 / complex128

课程强调：不需要死记全部，只需知道整数、浮点、布尔、复数等大类。

## 七、常用属性

    a.ndim      # 轴的个数 / 秩
    a.shape     # 各维度大小
    a.size      # 元素总数
    a.dtype     # 元素类型
    a.itemsize  # 单个元素字节数
    a.data      # 数据缓冲区

例如二维数组：

    [[1,2,3],
     [4,5,6]]

则：

    ndim  = 2
    shape = (2, 3)
    size  = 6

## 八、索引

一维数组与列表类似：

    a[0]
    a[-1]

二维数组使用逗号分隔维度索引：

    a[row, column]

## 九、切片

格式：

    x[start:stop:step]

与列表切片相似。

多维数组：

    a[行切片, 列切片]

重要：PPT 指出 ndarray 切片得到的是原数组的视图，对切片结果的修改会反映到原数组。

## 十、数组形态

    reshape(m, n)

返回新形态数组，原数组形态不变。

    resize(m, n)

直接改变原数组形态。

    flatten()

展开为一维新数组，返回拷贝。

    ravel()

展开为一维视图。

    swapaxes()

交换指定轴。

## 十一、拼接与切分

拼接：

    np.vstack(...)
    np.hstack(...)
    np.concatenate(..., axis=...)

PPT 中：

- vstack：垂直方向 / 按行拼接
- hstack：水平方向 / 按列拼接
- concatenate：自定义轴

切分：

    np.vsplit(...)
    np.hsplit(...)
    np.split(..., axis=...)

## 十二、转置与翻转

转置：

    a.transpose()
    a.T

翻转：

    np.fliplr(a)   # 左右翻转
    np.flipud(a)   # 上下翻转

## 十三、ufunc 通用函数

ufunc 对 ndarray 进行元素级运算。

常见一元函数：

    np.sqrt(x)
    np.square(x)
    np.ceil(x)
    np.floor(x)
    np.sin(x)
    np.cos(x)
    np.exp(x)
    np.log(x)
    np.diff(x)

数组算术：

    +
    -
    *
    /
    //
    **
    %

对应也有：

    np.add
    np.subtract
    np.multiply
    np.divide
    np.power
    np.mod

数组比较会逐元素进行，并返回布尔数组。

PPT 还介绍：

    np.where(condition, x, y)

条件为 True 取 x，否则取 y。

## 十四、本章最该记住

    import numpy as np
    np.array(...)
    ndim / shape / size / dtype
    索引和切片
    reshape()
    vstack / hstack
    a.T
    np.sqrt 等元素级运算

不需要一次背完所有函数，先知道 NumPy 是“面向数值数组的一整套工具”。
