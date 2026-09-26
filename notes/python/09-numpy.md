# 第9章 NumPy 库

> 来源：课程 PPT《第9章 NumPy库》
> 复习目标：理解 ndarray，掌握 NumPy 数组创建、属性、索引切片和基本数组操作。

## 一、知识地图

NumPy
→ ndarray
→ 创建数组
→ dtype 与属性
→ 索引 / 切片
→ reshape 等形态操作
→ 拼接 / 切分
→ 转置 / 翻转
→ ufunc 元素级运算

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
