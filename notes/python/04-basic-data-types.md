# 第4章 基本内置数据类型

> 来源：课程 PPT《第4章 基本内置数据类型》
> 复习目标：掌握 Python 常见内置数据类型，尤其是字符串、元组、列表、字典和集合。

## 一、知识地图

数字 Number
→ 序列：String / Tuple / List
→ Dictionary
→ Set
→ 类型转换
→ 迭代器与生成器

## 二、可变与不可变

不可变数据：

- Number
- String
- Tuple

可变数据：

- List
- Dictionary
- Set

核心区别：

- 不可变：创建后其中内容不能直接修改。
- 可变：可以添加、修改或删除元素。

## 三、Number

主要包括：

- int
- float
- complex

查看类型：

    type(x)
    isinstance(x, int)

显式转换：

    int(...)
    float(...)

int() 转换浮点数时会截去小数部分。

PPT 还介绍：

    round(x, n)

用于按指定精度取整。

## 四、String

字符串是字符序列。

    s = "Python"

索引：

    s[0]

切片：

    s[start:end]

常见操作：

    "egg" + "plant"
    3 * "egg"
    len("plant")
    s.upper()
    s.strip()

转义：

    
   换行
    	   制表符

原始字符串：

    r"..."

## 五、Tuple 元组

创建：

    t = (1, 2, 3)

元组不可修改。

单元素元组必须有逗号：

    (50,)   # tuple
    (50)    # int

元组支持索引、切片、+、*。

PPT 强调：元组不可变，可减少误修改重要对象的风险。

## 六、List 列表

创建：

    a = [1, 2, 3]
    b = ["cat", "dog"]

列表元素类型可以不同。

添加：

    a.append(x)
    a.insert(index, x)

删除：

    a.remove(value)
    a.pop(index)
    del a[index]

修改：

    a[index] = new_value

列表支持：

- 正向 / 反向索引
- 切片
- + / *
- 嵌套列表
- in
- for 遍历

zip() 可以把多个序列对应位置的元素组合起来。

## 七、Dictionary 字典

字典是可变的键值对集合。

    user = {
        "name": "Alice",
        "age": 10
    }

结构：

    key : value

访问：

    user["name"]
    user.get("name")

新增 / 修改：

    user["age"] = 18

常见方法：

    keys()
    values()
    items()
    update()

判断键是否存在：

    "name" in user

注意：

- 键通常唯一。
- 键一般使用不可变对象。
- 值可以是各种数据类型。

## 八、Set 集合

集合特点：

- 无序
- 元素不重复

创建：

    s = {1, 2, 3}
    s = set()

注意：

    {}      # 空字典
    set()   # 空集合

常见操作：

    s.add(x)
    s.update(...)
    s.remove(x)
    s.discard(x)
    s.pop()
    s.clear()

discard() 删除不存在元素时不会报错。

集合可用于列表去重：

    list(set(data))

还支持并集、交集、差集、对称差等集合运算。

## 九、迭代器与生成器

PPT 的核心思想：

处理大量数据时，可以不一次性把所有数据都放进内存，而是逐个产生和处理数据。

迭代器常见操作：

    iter(...)
    next(...)

生成器也用于按需产生数据。

## 十、本章最该记住

    () → tuple
    [] → list
    {} + key:value → dict
    {1,2,3} → set

以及：

- List / Dict / Set 可变。
- String / Tuple / Number 不可变。
- 字典靠 key 查 value。
- 集合用于“不重复元素”的场景。
