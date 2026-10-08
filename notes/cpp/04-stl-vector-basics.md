# 04 · C++ STL vector 入门与指针复习

> 📅 学习日期：2026-10-08  
> 📔 关联日志：[docs/devlog/2026/10.md](../../docs/devlog/2026/10.md)  
> 🔗 关联项目：[AI-Windows-Security-Assistant](../../README.md)  
> 📚 学习阶段：C++ 基础  
> 🎯 今日目标：复习指针传值与指针引用、空指针判断、delete 后的别名问题；学习 vector 的基本操作，完成输入、遍历与求和。

---

## 一、今日学习进度

1. 复习函数参数 `int*` 与 `int*&` 的区别。
2. 复习 `nullptr`、`=` 与 `==`，以及 delete 后别名指针悬空的问题。
3. 学习 STL 中的 `vector<int>`。
4. 使用 `push_back`、`pop_back`、`size`、`empty` 和下标访问。
5. 使用普通 for 与范围 for。
6. 完成读取 5 个整数、保存、逐个输出并求和的成绩统计器。

今天的学习在 C++ 练习后结束。

## 知识地图

```text
复习
├─ int*：复制指针的值，可以通过 *p 修改所指对象
├─ int*&：引用调用者的指针，可以修改原指针的指向
├─ nullptr：空指针值；== 用于比较
└─ delete：释放对象，不会自动清空所有别名指针

新课：vector<int>
├─ push_back：末尾添加
├─ pop_back：末尾删除
├─ size / empty：元素数量 / 是否为空
├─ [i]：下标访问
└─ for：输入 → 遍历 → 输出与求和
```

---

## 二、复习：指针传值 `int*` 与指针引用 `int*&`

### 1. 是什么、为什么要区分

指针变量保存地址。函数可以修改这个地址，也可以通过地址修改对象，这两件事要分清。

| 参数 | 函数得到什么 | 修改形参的指向 | 通过 `*p` 修改有效对象 |
|---|---|---|---|
| `int* p` | 原指针中地址值的副本 | 不改变调用者的指针 | 可以影响原对象 |
| `int*& p` | 调用者指针变量的引用 | 改变调用者的指针 | 可以影响原对象 |

### 2. 指针传值的例子

```cpp
void change(int* p, int* target)
{
    p = target;
}

int x = 10;
int y = 20;
int* p = &x;

change(p, &y);
// p 仍然指向 x，x = 10，y = 20。
```

函数中的 `p` 是独立的指针副本，改变它保存的地址，不会改变外面的 `p`。

但如果函数中写的是 `*p = 30;`，就会修改它指向的对象。若此时指向 x，x 就变成 30。

### 3. 指针引用的例子

```cpp
void change(int*& p, int* target)
{
    p = target;
}

int x = 10;
int y = 20;
int* p = &x;

change(p, &y);
// p 改为指向 y，x = 10，y = 20。
```

`int*& p` 中的 `p` 是外面指针变量的别名。因此函数中的 `p = target;` 会改变原指针。

**易混淆点：**指针传值不代表“什么都不能改”；它可以通过 `*p` 修改有效对象，只是给形参 p 重新赋地址不会影响原指针。

以后写函数时，先判断需要修改的是对象中的数据，还是调用者指针的指向。

关联复习：[01 · 指针、引用与 const](01-pointers-references-const.md)。

---

## 三、复习：`nullptr`、`=` 与 `==`

`nullptr` 表示空指针值，可以用来明确表示“这个指针没有指向对象”。

```cpp
int* p = nullptr;       // =：赋值

if (p == nullptr) {     // ==：判断是否相等
    cout << "empty pointer" << endl;
}
```

区别：

- `p = nullptr;`：把 p 设为空指针。
- `p == nullptr`：比较 p 是否为空指针，不修改 p。
- `p != nullptr`：比较 p 是否非空。

不能对空指针执行 `*p`。另外，非空不等于一定有效：悬空指针也可能没有被设为 nullptr。

以后判断指针时，既要看空值，也要清楚它所指对象是否仍然存在。

---

## 四、复习：delete 后，别名指针不会自动清空

```cpp
int* p = new int(10);
int* q = p;

delete p;
p = nullptr;

// q 也曾指向刚刚释放的对象，现在是悬空指针。
// 不能执行 cout << *q，也不能再次 delete q。
q = nullptr;
```

执行前，p 和 q 保存同一个对象的地址，但它们是两个独立的指针变量。

`delete p;` 释放对象；`p = nullptr;` 只改变 p 自己，q 不会跟着变成 nullptr。

将 q 设为 nullptr 只是清除它保存的旧地址，不是再释放一次对象。

还要区分：

- `int* q = p;`：复制地址，q 是独立指针。
- `int*& r = p;`：r 是 p 的引用；给 r 赋值就是给 p 赋值。

**易混淆点：**不能靠“一个指针已经设为空”推断所有指向该对象的指针都安全，也不能再通过另一个别名释放同一个对象。

以后管理动态对象时，要同时考虑所有仍然保存其地址的指针。

关联复习：[03 · 动态内存与生命周期](03-dynamic-memory-new-delete.md)。

---

## 五、新课：STL 与 `vector<int>`

今天从 STL 的 vector 开始。STL 可以先理解为 C++ 标准库中常用的容器与工具，今天只学习 vector 的基础操作。

vector 是可以随着添加、删除元素而改变元素数量的容器。需要依次保存多个整数，再遍历处理时，可以使用 `vector<int>`。

```cpp
#include <vector>
using namespace std;

vector<int> numbers;                 // 初始没有元素
vector<int> values = {10, 20, 30};    // 初始有 3 个整数
```

拆解：`vector` 是容器类型，`<int>` 表示其中保存的元素是整数，`numbers` 是变量名。

创建空 vector 后，要先加入元素，才能访问对应位置。

以后可以用它保存成绩或其他需要按顺序处理的整数数据。

---

## 六、添加、删除、数量与空判断

| 写法 | 作用 | 预期结果与注意点 |
|---|---|---|
| `numbers.push_back(10);` | 在末尾添加 10 | 元素数量增加 1 |
| `numbers.pop_back();` | 删除末尾元素 | 元素数量减少 1；调用前必须非空 |
| `numbers.size()` | 得到当前元素数量 | 不是最后一个下标 |
| `numbers.empty()` | 判断是否没有元素 | 空时为 true，非空时为 false |

```cpp
vector<int> numbers;

numbers.push_back(10);
numbers.push_back(20);
numbers.push_back(30);
// 内容：10 20 30；size() 为 3，empty() 为 false。

numbers.pop_back();
// 内容：10 20；size() 为 2。

if (!numbers.empty()) {
    numbers.pop_back();
}
// 内容：10。
```

这里的 `!` 表示“不是”。先判断非空，再删除末尾，避免对空 vector 执行 pop_back。

**常见错误：**`pop_back()` 不接收下标，也不返回被删除的数字。

---

## 七、下标访问

```cpp
vector<int> numbers = {10, 20, 30};

cout << numbers[0] << endl;  // 10
cout << numbers[2] << endl;  // 30

numbers[1] = 25;
// 内容变成：10 25 30。
```

下标从 0 开始。3 个元素的有效下标是 0、1、2。

一般情况下，有效下标必须小于 `size()`。`numbers[numbers.size()]` 已经越界，不能访问。

**常见错误：**空 vector 的 `numbers[0]` 不存在，下标赋值不会自动添加元素；添加元素应使用今天学的 `push_back`。

---

## 八、普通 for 与范围 for

### 1. 普通 for：按下标遍历

```cpp
vector<int> numbers = {10, 20, 30};

for (int i = 0; i < numbers.size(); i++) {
    cout << numbers[i] << " ";
}
```

从下标 0 开始，每轮 i 增加 1，直到 i 不再小于元素数量。需要知道位置或按下标访问时，可以这样写。

### 2. 范围 for：逐个读取元素

```cpp
for (int number : numbers) {
    cout << number << " ";
}
```

每一轮把一个元素的值交给 number。number 是当前元素的值，不是下标。

这里的 `int number` 得到元素的副本；给 number 重新赋值，不会修改 numbers 里的元素。本次练习只读取和输出，因此这种写法就够用。

两种遍历都会依次输出：

```text
10 20 30
```

---

## 九、今日实践：vector 成绩统计器

练习文件：[vector_practice.cpp](exercises/vector_practice.cpp)。

> 代码按今日截图所述核心逻辑还原，不是截图原文件的逐字转录。保留读取 5 个整数、存入 vector、遍历累加并输出每个数字、最后输出总和的流程。

核心步骤：

1. 创建空的 `vector<int> scores`。
2. 普通 for 重复 5 次，使用 cin 读取一个整数，再 push_back。
3. 把 sum 初始化为 0。
4. 范围 for 遍历 scores，执行 `sum += score;`，同时输出 score。
5. 遍历结束后输出 sum。

`sum += score;` 等价于 `sum = sum + score;`。sum 要在遍历前初始化，才能保存所有轮次的累计结果。

本练习假定输入 5 个有效整数。示例输入：

```text
80 90 70 85 95
```

预期输出：

```text
80 90 70 85 95
Sum: 420
```

最后一个数字后有一个空格，不影响求和结果。

**常见错误：**忘记 push_back、把 sum 放进循环里每轮重置为 0、把范围 for 的元素值当下标、把求和结果在遍历结束前当作最终总和输出。

---

## 十、今日必须掌握

1. `int*` 复制指针值；`int*&` 引用原指针变量。
2. 修改指针的指向与修改它所指的数据是两件事。
3. `=` 赋值，`==` 比较；nullptr 是空指针值。
4. delete 后，一个指针设为 nullptr 不会自动清空独立的别名指针。
5. `vector<int>` 保存整数；push_back 添加末尾，pop_back 删除末尾。
6. size 是数量，empty 判断是否为空；下标从 0 开始并且必须在范围内。
7. 普通 for 可以按下标访问，范围 for 可以依次读取元素值。
8. 成绩统计器的流程是：输入 → 保存 → 遍历 → 累加与逐个输出 → 输出总和。
