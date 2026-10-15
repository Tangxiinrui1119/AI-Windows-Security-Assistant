# 05 · C++ STL 迭代器与成绩分析器实操

> 📅 学习日期：2026-10-15  
> 📔 关联日志：[docs/devlog/2026/10.md](../../docs/devlog/2026/10.md)  
> 🔗 关联项目：[AI-Windows-Security-Assistant](../../README.md)  
> 📚 学习阶段：C++ 基础 · STL vector 进阶  
> 🧪 实操任务：[成绩分析器任务书](exercises/score_manager_task.md)  
> 🎯 今日目标：复习指针、引用、动态内存和 vector；理解迭代器；在 VS Code 中独立完成并验收成绩分析器。

---

## 一、今日进度与知识地图

本次按「复习检测 → 讲解新课 → 练习推演 → VS Code 独立编程与调试 → 验收」推进。

```text
已学复习
├─ int*&：指针变量的引用
├─ new / delete 与别名指针悬空
├─ vector：push_back / pop_back / size
└─ 范围 for：int x（副本）与 int& x（引用）
                 ↓
新课：vector 迭代器
├─ nums.begin() 获取首元素迭代器
├─ nums.end() 获取尾后迭代器（不可解引用）
├─ auto it = nums.begin()
├─ *it：访问或修改当前元素
├─ ++it / --it：移动迭代器（vector 支持）
└─ it != nums.end()：遍历停止条件
                 ↓
成绩分析器
├─ showScores：遍历输出
├─ addBonus：修改每个成绩，上限 100
├─ averageScore：计算 double 平均值
└─ countPassed：计数 >= 60
```

> 状态边界：今天没有开始预定的信息安全新课；并未将信息安全实操记为已完成。

---

## 二、复习：指针引用、布尔输出和内存释放

### 1. `int*&` 是什么，为什么存在

```cpp
void func(int*& x) {
    x = nullptr;
}

int* p = new int(10);
int* q = p;
func(p);
```

- `int*` 说明 x 关联的对象是一个指针变量；`&` 说明 x 是原指针 p 的引用（别名）。
- `func(p)` 把 p 设为 `nullptr`，但 q 仍指向原来申请的、**尚未释放**的动态对象。
- `cout << (p == nullptr);` 默认输出 `1`，不是字符串 `true`；加 `boolalpha` 才会输出 `true`。
- `cout << *q;` 此时仍能得到 10；最终需要通过 q 释放一次动态内存。

### 2. `delete` 与 `nullptr` 不是一回事

```cpp
int* p = new int[5];
delete[] p;           // 正确，new[] 与 delete[] 对应
// p = nullptr;       // 可选：清空 p，不是释放内存所必需
```

- `delete` / `delete[]` 用于释放相应方式申请的动态内存。
- `p = nullptr` 只是改变 p 的值，**不负责释放内存**。
- 若 `int* q = p;`，之后 `delete p;`，q 也变为悬空指针；不能再读 `*q`，也不能重复释放。
- 单独把 p 设为 `nullptr` 不会自动更新独立的 q。

**当天纠错记录：**复习题中曾把未写 `p = nullptr` 的 `delete[] p` 误判为错误；现已纠正：`delete[]` 释放与置空是两步，不必绑定。

---

## 三、复习：范围 for 为什么有副本和引用两种写法

```cpp
vector<int> nums = {10, 20, 30};

for (int x : nums) {
    x = 100;          // x 是元素副本，nums 不变
}

for (int& x : nums) {
    x = 100;          // x 引用原元素，nums 被修改
}
```

先前已学习 vector 的 `push_back`、`pop_back`、`size` 等操作。这里重点补足范围 for 的语义：

- `int x`：按值取当前元素。
- `int& x`：引用当前元素，可以修改它。
- `const int& x`：只读引用（扩展复习）；适合不想复制但也不允许修改的场景。

---

## 四、新课：迭代器是什么

### 1. 是什么

**迭代器（iterator）是用于定位、访问、遍历容器元素的对象**，行为类似指针；但不能把所有迭代器都等同于原生内存地址。

```cpp
vector<int> nums = {10, 20, 30};
auto it = nums.begin();
cout << *it;         // 10
```

拆解：

- `nums` 是容器；
- `nums.begin()` 是**容器提供的成员函数**，返回首元素迭代器；
- `it` 是迭代器变量；`auto` 让编译器推断具体迭代器类型；
- `*it` 才是解引用，访问 it 当前指向的元素。

**误区：**不是“迭代器内部包含 begin/end 两个函数”。更准确是 vector 用 `begin()` / `end()` **提供**迭代器，迭代器再负责移动、访问。

### 2. 为什么存在

不同 STL 容器采用不同的数据结构，并非都能使用 `container[i]`。迭代器提供了更通用的遍历与算法接口。

### 3. 怎么工作：首元素与尾后位置

```text
vector<int> nums = {10,20,30}

begin()
   ↓
 [ 10 ][ 20 ][ 30 ][ end ]
    0     1     2     ↑
                      end() 是尾后位置，不是数字 30
```

| 写法 | 对于 vector 的意义 |
|---|---|
| `nums.begin()` | 首元素位置 |
| `nums.end()` | 末元素后一个位置 |
| `*it` | 读取或修改当前元素（需可解引用） |
| `++it` | 移动至下一个元素 |
| `--it` | 向前移动一个元素（vector 迭代器支持） |
| `it != nums.end()` | 尚未到达尾后位置 |

`end()` 不能直接解引用；非空 vector 可以先 `--it` 从尾后移动到最后一个元素再读。空 vector 不能这么做。

### 4. 与队列 front/rear 的联系和区别

学习时联想到链队列的队头、队尾指针，这是有用的类比：都和“位置”有关。但队尾指针通常定位最后一个数据节点，`vector.end()` 却是**尾后标记**。而 `std::queue` 不直接开放 `begin()/end()` 遍历接口。

### 5. 迭代器遍历示例

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {10, 20, 30};
    for (auto it = nums.begin(); it != nums.end(); ++it) {
        cout << *it << " ";
    }
}
```

输出：`10 20 30`。

注意循环条件比较的是 **`it`（迭代器）**，而不是 `*it`（`int` 元素值）。

### 6. 迭代器的修改能力

```cpp
vector<int> nums = {10,20,30};
auto it = nums.begin();
++it;              // it 指向 20
*it = 100;         // nums 变为 {10,100,30}
```

`*it = 100` 修改实际容器元素。可以类比 `int* p = &x; *p = 100;`，但概念上要区分迭代器与原生指针。

---

## 五、迭代器三道小练习：原题、答案与纠错

### 练习 1：移动迭代器

```cpp
vector<int> v = {5, 10, 15, 20};
auto it = v.begin();
++it;
*it = 100;
++it;
cout << *it << endl;
```

- 当时误答：输出 100；v 为 `{100,10,15,20}`。
- 正确：**输出 15；v 为 `{5,100,15,20}`**。
- 理由：第一次 `++it` 定位第 2 个元素（10），`*it=100` 修改它；第二次 `++it` 又移到第 3 个元素（15）。

### 练习 2：为什么 `end()` 需要 `--it`

```cpp
vector<int> v = {10, 20, 30};
auto it = v.end();
--it;
cout << *it;
```

正确答出：输出 **30**。因为 `end()` 是尾后位置，非空 vector 中先左移一次才是最后一个元素。

### 练习 3：通过迭代器修改原数据

```cpp
vector<int> v = {1, 2, 3};
for (auto it = v.begin(); it != v.end(); ++it) {
    *it = *it * 2;
}
```

正确答出：`v = {2,4,6}`；`*it` 访问到的是原容器元素，修改会反映在 vector 中。

---

## 六、实操：C++ 成绩分析器

### 1. 需求及用途

把今天的迭代器新知识与已学函数、引用、循环、条件判断相结合。

初始数据：

```cpp
vector<int> scores = {58,72,90,45,83};
```

四个函数：

| 函数 | 功能 | 关键知识 |
|---|---|---|
| `showScores(const vector<int>& scores)` | 遍历并输出成绩 | 只读引用、迭代器 |
| `addBonus(vector<int>& scores)` | 每人加 5 分，封顶 100 | 可修改引用、`*it`、if |
| `averageScore(const vector<int>& scores)` | 返回平均分 `double` | 求和、避免整数除法 |
| `countPassed(const vector<int>& scores)` | 统计成绩 >= 60 的人数 | 遍历与条件计数 |

`const vector<int>&`：引用传参，无需复制整个容器，禁止通过这个形参修改成绩。  
`vector<int>&`：引用传参，函数能直接改原来的 vector。

注意：对于 const vector，`begin()` 返回只读迭代器；不能通过 `*it` 写入新值。

### 2. 测试与预期结果

在给原来 5 人加分后，再执行 `scores.push_back(96)`：

| 验收项 | 输出结果 |
|---|---|
| 原始成绩 | `58 72 90 45 83` |
| 原始平均分 | `69.6` |
| 原始及格人数 | `3` |
| 更新后成绩 | `63 77 95 50 88 96` |
| 更新后平均分 | 约 `78.1667` |
| 更新后及格人数 | `5` |

边界测试：将某个初始成绩改为 `98`，加 5 分后应为 `100`，而非 `103`。

### 3. 当天实操状态

已在 Windows 的 VS Code / PowerShell 环境建立 `D:\learn\score_manager.cpp`，使用 g++ 编译调试；从最终运行截图可确认原始与更新后的均分、及格人数以及更新后 6 个成绩正确，VS Code 问题数显示为 0。Codex 对话反馈四个功能和 98 分边界测试均通过。

**保真说明：**本篇保留任务、思路、结果和错误；当前并未获取本人电脑上 `score_manager.cpp` 的完整原始内容，因此**不把示例代码冒称为本人的源文件备份**。需要精确保存源码时，应在本机提交实际 `.cpp` 文件。

### 4. 编译调试过程中的两类错误

**错误 A：混淆迭代器与元素值**

错误：

```cpp
for (auto it = scores.begin(); *it != scores.end(); ++it)
```

`*it` 是整数，`scores.end()` 是迭代器，不能比较；而且在判断之前提前解引用还可能访问尾后位置。

正确：

```cpp
for (auto it = scores.begin(); it != scores.end(); ++it)
```

**错误 B：使用未声明的变量**

编译器提示 `'sum' was not declared in this scope`，原因是返回了一个当前作用域未声明的变量。统计及格人数应在循环外初始化计数器，符合条件时加 1，并返回这个已声明的计数器。

编译器成功运行后，终端显示更新后平均分 `78.1667`，及格人数 `5`。

---

## 七、易混淆点速查

| 容易混淆 | 正确理解 |
|---|---|
| `begin()` 是迭代器吗？ | 是容器函数，调用后**返回**迭代器 |
| `it` 和 `*it` | 前者定位元素；后者访问该元素 |
| `end()` 是最后一个元素吗？ | 不是，是尾后位置 |
| `*it != scores.end()` | 类型不匹配，应写 `it != scores.end()` |
| `for (int x : v)` 和 `for (int& x : v)` | 值副本 vs 原元素引用 |
| `delete[] p` 后不置空是否错误？ | 释放写法正确；置空可选 |
| `int*& x` | 指针变量的引用，不是“引用所指对象” |
| `sum / size` | 注意整数除法，需保证浮点运算 |
| g++ 报错很多条 | 优先修复最早的类型错误和未声明变量，再重新编译 |

---

## 八、以后用在哪里

遍历、读取和修改容器元素的能力，既是 STL 算法的基础，也能用在后续的安全工具里：例如把采集到的一批进程信息放进容器，逐项计算、筛选或输出。

**扩展知识（本次未正式教学）**：vector 扩容、插入和删除元素时，某些迭代器可能失效；以后学容器迭代器失效规则时再展开。本次项目只在 `addBonus` 的循环结束后 `push_back`，没有继续使用旧迭代器。

---

## 九、下一次复习起点

1. 脱离 Codex，独立写一遍迭代器遍历及条件计数。
2. 解释 `int x`、`int& x`、`const vector<int>&` 的作用。
3. 排查 `it` 与 `*it`、`end()`、整数除法三个常见错误。
4. C++ 下一知识可考虑进一步练习 STL 容器与算法；**不把未开始的信息安全课记为完成**。

前置：[04 · STL vector 入门](04-stl-vector-basics.md)。
