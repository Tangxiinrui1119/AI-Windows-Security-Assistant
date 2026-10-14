# 03 · 数据结构与算法：栈和队列

> 📅 学习日期：2026-10-12；整理日期：2026-10-14
> 📔 关联日志：[2026 年 10 月](../../docs/devlog/2026/10.md)
> 🔗 关联项目：[AI Windows 安全助手](../../README.md)
> 📚 学习阶段：数据结构与算法基础
> 教材：沿用前两章的《数据结构与算法（C/C++版）》课程笔记
> 范围：第 3 章 栈和队列；代码采用 C++17，教学实现以 int 为元素类型。
> 前置：[第 1 章 绪论](01-introduction.md) → [第 2 章 线性表](02-linear-lists.md)

## 重点标记

- ★★★：必须掌握 / 高频重点
- ★★：重要，需要理解
- ★：了解即可

---

# 第3章 栈和队列

## 一、知识地图

```text
线性表（第2章）
│
└── 限制插入、删除的位置
    ├── 栈 Stack：同一端操作，LIFO ★★★
    │   ├── ADT：push / pop / top / empty / size
    │   ├── 顺序栈：数组 + top，下标与容量 ★★★
    │   ├── 链栈：Node* + 头插头删 + delete ★★★
    │   ├── STL stack 与自定义实现 ★★
    │   └── 应用
    │       ├── 括号匹配 ★★★
    │       ├── 中缀 → 后缀：运算符栈 ★★★
    │       ├── 前缀 / 后缀求值：操作数栈 ★★★
    │       └── 递归、回退、DFS（扩展）★
    └── 队列 Queue：队尾入、队头出，FIFO ★★★
        ├── ADT：enqueue / dequeue / front / empty / size
        ├── 顺序队列：假溢出 ★★
        ├── 循环队列：front / rear / 取模 / 留空位 ★★★
        ├── 链式队列：队头删除、队尾插入 ★★★
        ├── STL queue 与自定义实现 ★★
        └── BFS：按层访问、入队与出队顺序 ★★★

逻辑结构：规定访问规则；存储结构：数组或节点如何保存数据。
学习主线：定义 → 指针/下标约定 → 操作 → 边界 → 应用 → 复杂度。
```

---

# 3.1 基本概念与 ADT ★★★

## 3.1.1 栈：后进先出 LIFO

栈是**只允许在一端插入、删除的线性表**。这一端叫栈顶，另一端叫栈底。LIFO = Last In, First Out，最后入栈的元素最先出栈。

```text
依次 push(A)、push(B)、push(C)：

栈顶 → [C]  ← push / pop / top 都在这里
       [B]
栈底 → [A]

连续出栈：C → B → A
```

`push` 入栈；`pop` 删除栈顶；`top` 只查看栈顶。**读取不等于删除**。LIFO 约束出栈行为，不表示底层数组中的地址方向。

## 3.1.2 队列：先进先出 FIFO

队列是**队尾插入、队头删除的线性表**。FIFO = First In, First Out，最早入队的元素最先出队。

```text
出队 ← 队头 [A] [B] [C] 队尾 ← 入队
依次入队 A、B、C；连续出队 A → B → C。
```

## 3.1.3 ADT 关注操作的含义

栈和队列的元素都有线性次序，但不提供普通线性表那样任意位置的插入、删除。

| 功能 | 栈 ADT | 队列 ADT | 语义 / 前提 |
|---|---|---|---|
| 初始化 | InitStack | InitQueue | 建立空结构 |
| 判空 | StackEmpty | QueueEmpty | 元素数为 0 |
| 长度 | StackLength | QueueLength | 当前元素数 |
| 加入元素 | Push | EnQueue | 加到栈顶 / 队尾；有容量限制时先判满 |
| 删除并取得元素 | Pop | DeQueue | 删除栈顶 / 队头；必须非空 |
| 查看元素 | GetTop | GetHead | 读取栈顶 / 队头；必须非空 |
| 清空 | ClearStack | ClearQueue | 删除所有元素，结构仍可用 |
| 销毁 | DestroyStack | DestroyQueue | 释放结构拥有的资源 |

教材 ADT 的 `Pop(S, x)` 可以通过 x 带回数据；STL 的 `pop()` 返回 void。**接口返回方式取决于具体实现，不能从操作名字推断。** 本文自定义代码用 bool 表示成功，用 `int& out` 输出数据；失败时 out 保持原值。

---

# 3.2 顺序栈 ★★★

## 3.2.1 下标约定与边界

顺序栈用连续空间保存元素。本文规定：**top_ 指向当前栈顶元素的下标**，初始为 -1。

```text
容量 CAP = 4
下标：     0    1    2    3
内容：    [A]  [B]  [C]  [ ]
                     ↑ top_ = 2

判空：top_ == -1
判满：top_ == CAP - 1
长度：top_ + 1
入栈：先检查满，再 ++top_，写入 data[top_]
出栈：先检查空，再读取 data[top_]，然后 --top_
```

另一种合法约定是 top 指向**下一次插入的位置**：初始 0、判满 top == CAP、入栈 `data[top++] = x`、出栈 `x = data[--top]`。两种约定都能使用，**公式必须配套，不能混用**。

## 3.2.2 固定容量实现

```cpp
class SeqStack {
    static constexpr int CAP = 4;
    int data_[CAP]{};
    int top_ = -1;
public:
    bool empty() const { return top_ == -1; }
    bool full() const { return top_ == CAP - 1; }
    int size() const { return top_ + 1; }
    bool push(int x) {
        if (full()) return false;
        data_[++top_] = x;
        return true;
    }
    bool pop(int& out) {
        if (empty()) return false;
        out = data_[top_--];
        return true;
    }
    bool top(int& out) const {
        if (empty()) return false;
        out = data_[top_];
        return true;
    }
    void clear() { top_ = -1; }
};
```

这里没有 new，因此不需要 delete。出栈只改变有效范围，旧数组格中的 int 不必清零，之后不能再把它视为栈内元素。泛型栈还要考虑元素对象的析构，本文 int 示例不涉及这一点。

## 3.2.3 固定数组与动态增长 ★★

- `int data[CAP]` 的容量固定，写满后不能再写，程序不会自动扩大数组。
- `new int[CAP]` 虽在运行时分配，**这一块数组的容量仍固定**；扩大时要另建空间、搬移元素、释放旧空间并更新容量。
- 用 `std::vector` 实现顺序栈可以自动管理增长。单次扩容可能搬移 n 个元素，入栈通常为**摊还 O(1)**，扩容那一次为 O(n)。动态增长也受内存和容器限制。

“顺序存储”描述连续存放，“固定容量”描述是否允许扩容，二者不是同一个概念。

---

# 3.3 链栈、指针与内存释放 ★★★

## 3.3.1 Node 与 Node*

```text
Node  是一个节点对象，内部有 data 和 next。
Node* 是“指向 Node 的指针”类型，变量中保存节点地址或 nullptr。

top_ → [30 | next] → [20 | next] → [10 | nullptr]
        栈顶                         栈底
```

`Node* p` 声明指针，并未自动创建节点。`new Node{30, top_}` 创建节点并返回地址。有效指针 p 的 `p->data` 等价于 `(*p).data`；`p->next` 是**当前节点里保存的后继地址**。

必须区分：

- `p = p->next`：改变 p 的指向。
- `p->next = q`：改变节点里的链接。
- `delete p`：销毁 p 指向的对象并释放其空间；p 本身不会自动变成 nullptr。
- `delete p` 不会沿着 next 自动删除整条链；`Node*` 是普通指针。

详见 [C++ 指针](../cpp/01-pointers-references-const.md) 与 [new / delete](../cpp/03-dynamic-memory-new-delete.md)。

## 3.3.2 为什么把表头当栈顶

在单链表头部插入、删除，只改少量指针，为 O(1)。若把尾部当栈顶，出栈通常要从头找尾节点的前驱，为 O(n)。本文链栈**不设头节点**，top_ 直接指向第一个数据节点。

入栈 40：

```text
① p = new Node{40, top_};
   p → [40 | next] ───→ 原栈顶 [30] → [20] → [10]
② top_ = p;
   top_ → [40] → [30] → [20] → [10]
```

必须先让新节点连到原栈顶，再更新 top_，否则可能丢失旧链。

出栈：**保存旧栈顶 → 读取数据 → top_ 移到后继 → delete 旧节点**。不能先 delete 再读取 `old->next`，那是释放后访问。

## 3.3.3 自定义链栈

```cpp
#include <cstddef>

class LinkedStack {
    struct Node { int data; Node* next; };
    Node* top_ = nullptr;
    std::size_t size_ = 0;
public:
    LinkedStack() = default;
    LinkedStack(const LinkedStack&) = delete;
    LinkedStack& operator=(const LinkedStack&) = delete;
    ~LinkedStack() { clear(); }
    bool empty() const { return top_ == nullptr; }
    std::size_t size() const { return size_; }
    void push(int x) {
        Node* p = new Node{x, top_};
        top_ = p;
        ++size_;
    }
    bool pop(int& out) {
        if (empty()) return false;
        Node* old = top_;
        out = old->data;
        top_ = old->next;
        delete old;
        --size_;
        return true;
    }
    bool top(int& out) const {
        if (empty()) return false;
        out = top_->data;
        return true;
    }
    void clear() {
        int ignored;
        while (pop(ignored)) {}
    }
};
```

析构函数负责释放剩余节点。持有这些地址的外部别名在节点释放后也会悬空，不能再解引用。禁止复制是为了避免两个对象浅拷贝后共同拥有同一条链并重复释放；完整的拷贝/移动语义属于扩展知识。本教学类也不提供移动操作。

链栈没有预设的固定数组上限，但申请内存仍可能失败；这里 new 失败会抛出异常，不能说链栈“永远不会满”。

---

# 3.4 队列、假溢出与循环队列 ★★★

## 3.4.1 普通顺序队列为什么出现假溢出

先考虑没有回绕的数组队列，front 指向队头，rear 指向下一次插入位置。入队 rear++，出队 front++。

```text
数组容量 5，先入队 A B C D E，再出队 A B：
下标：  0     1     2     3     4
       [空]  [空]  [C]   [D]   [E]   rear = 5（到数组末端之外）
                    ↑ front = 2
```

数组前面有空位，却因 rear 到末端而无法继续按原规则入队，这叫**假溢出**。把所有元素搬回前面需要 O(n) 时间；循环队列用下标回绕复用空位。

## 3.4.2 循环队列的固定约定

本文采用最常见的**留一个空位**方案，数组长度为 M，M ≥ 2：

- front 指向队头元素；队空时它是一个合法下标，但该格不含有效队头。
- **rear 指向下一次插入的位置，不是最后一个元素。**
- 初始 front = rear = 0。
- 前进一格：`(index + 1) % M`。
- 最大可存 **M - 1** 个元素。

```text
判空：front == rear
判满：(rear + 1) % M == front
长度：(rear - front + M) % M
入队：data[rear] = x; rear = (rear + 1) % M;
出队：x = data[front]; front = (front + 1) % M;
```

操作前必须先判满/判空。有效元素沿取模方向从 front 开始，到 rear 之前结束。非空时最后一个元素在 `(rear - 1 + M) % M`。

**为什么留一个空位？** 如果允许全部 M 个格子都被占用，rear 绕一圈后也会等于 front，单凭二者无法区分空与满。留空位让“再入一个就追上 front”表示已满。留出的格子随下标移动，并不固定为数组最后一格。

## 3.4.3 回绕过程（M = 5）

| 操作 | front | rear | 从队头到队尾的有效元素 | 长度 |
|---|---:|---:|---|---:|
| 初始化 | 0 | 0 | 空 | 0 |
| 入 A B C D | 0 | 4 | A B C D | 4，满 |
| 出 A B | 2 | 4 | C D | 2 |
| 入 E | 2 | 0 | C D E | 3 |
| 入 F | 2 | 1 | C D E F | 4，满 |
| 出 C D E F | 1 | 1 | 空 | 0 |

```text
入 F 后的物理数组：
下标：   0    1    2    3    4
        [F]  [ ]  [C]  [D]  [E]
              ↑    ↑
             rear front
逻辑次序：2 → 3 → 4 → 0，即 C → D → E → F。
```

rear < front 也可能是正常非空状态。**循环队列的逻辑次序不等于下标从小到大的顺序**。

## 3.4.4 固定容量实现

```cpp
class CircularQueue {
    static constexpr int M = 5;
    int data_[M]{};
    int front_ = 0;
    int rear_ = 0; // 下一个插入位置
public:
    bool empty() const { return front_ == rear_; }
    bool full() const { return (rear_ + 1) % M == front_; }
    int size() const { return (rear_ - front_ + M) % M; }
    bool enqueue(int x) {
        if (full()) return false;
        data_[rear_] = x;
        rear_ = (rear_ + 1) % M;
        return true;
    }
    bool dequeue(int& out) {
        if (empty()) return false;
        out = data_[front_];
        front_ = (front_ + 1) % M;
        return true;
    }
    bool front(int& out) const {
        if (empty()) return false;
        out = data_[front_];
        return true;
    }
    void clear() { front_ = rear_ = 0; }
};
```

本例下标采用有符号 int，故长度公式中的差值可以为负，加 M 后再取模。若换为 unsigned 或 size_t，须避免减法先发生无符号下溢，不能原封不动照抄公式。

## 3.4.5 其他判满方案（扩展知识）★★

可以额外维护 count：空时 count == 0，满时 count == M，这时可以用满 M 个格子；也可以维护标志区别最后一次是入队还是出队。**count 方案的容量、判满条件与留空位方案不同**，不要同时套用两套规则。

动态扩容循环队列时，要按逻辑次序把旧元素搬到新数组的 0…n-1，再令 front = 0、rear = n，并留足空间。仅扩大 M 而不整理旧元素会改变取模关系，不能保证次序正确。

---

# 3.5 链式队列 ★★★

## 3.5.1 front / rear 的含义

本文链式队列**不设头节点**：front_ 指向第一个数据节点，rear_ 指向最后一个数据节点。队空时两者均为 nullptr。

```text
front_ → [A | next] → [B | next] → [C | nullptr] ← rear_
          出队位置                  入队连接位置
```

注意：循环队列的 rear 是“下一个插入格的下标”，链式队列的 rear_ 是“最后一个节点的地址”。**同名变量的含义取决于实现约定**。

入队 D：创建 `[D | nullptr]`；若非空，先 `rear_->next = p`，再 `rear_ = p`；若原来为空，要同时 `front_ = rear_ = p`。

出队 A：保存旧 front_、读数据、令 front_ 指向后继、释放旧节点。**删掉最后一个节点时，必须把 rear_ 也设为 nullptr**，否则 rear_ 成为悬空指针。

## 3.5.2 自定义实现

```cpp
class LinkedQueue {
    struct Node { int data; Node* next; };
    Node* front_ = nullptr;
    Node* rear_ = nullptr;
    std::size_t size_ = 0;
public:
    LinkedQueue() = default;
    LinkedQueue(const LinkedQueue&) = delete;
    LinkedQueue& operator=(const LinkedQueue&) = delete;
    ~LinkedQueue() { clear(); }
    bool empty() const { return front_ == nullptr; }
    std::size_t size() const { return size_; }
    void enqueue(int x) {
        Node* p = new Node{x, nullptr};
        if (empty()) front_ = p;
        else rear_->next = p;
        rear_ = p;
        ++size_;
    }
    bool dequeue(int& out) {
        if (empty()) return false;
        Node* old = front_;
        out = old->data;
        front_ = old->next;
        if (front_ == nullptr) rear_ = nullptr;
        delete old;
        --size_;
        return true;
    }
    bool front(int& out) const {
        if (empty()) return false;
        out = front_->data;
        return true;
    }
    void clear() {
        int ignored;
        while (dequeue(ignored)) {}
    }
};
```

带头节点的教材版本：front 指向不存有效数据的头节点，首元素是 `front->next`，空队通常 `front == rear`；删除最后一个数据节点后 `rear = front`，销毁时还要释放头节点。**本代码没有头节点，不能把教材带头节点公式直接代入。**

---

# 3.6 C++ STL 与复杂度 ★★

## 3.6.1 stack / queue 的日常用法

```cpp
#include <stack>
#include <queue>
#include <iostream>

void stlDemo() {
    std::stack<int> s;
    s.push(10);
    s.push(20);
    if (!s.empty()) {
        int x = s.top(); // 先读值
        s.pop();        // 再删除，返回 void
        std::cout << x << '\n'; // 20
    }
    std::queue<int> q;
    q.push(10);
    q.push(20);
    if (!q.empty()) {
        int x = q.front();
        q.pop();
        std::cout << x << ' ' << q.back() << '\n'; // 10 20
    }
}
```

不要对空容器调用 top/front/back/pop；先判空。保存 `int x = s.top()` 得到值副本，出栈后仍可用；若保存元素的引用或指针，删除该元素后不能继续使用。

STL 的 stack/queue 是**容器适配器**：约束底层容器的操作接口。两者默认底层都是 deque，由底层管理内存；它们不会暴露教材中的 top 下标、front/rear 字段，也没有直接遍历、随机下标访问和通用 full() 接口。[C++ 标准草案：stack](https://eel.is/c++draft/stack)、[queue](https://eel.is/c++draft/queue)。

stack 可以用满足要求的 vector、deque 或 list 作底层；queue 要求底层支持 pop_front，普通 vector 不满足这一要求。[适配器底层要求](https://eel.is/c++draft/queue#queue.defn)。

| 对比 | 自定义教学实现 | std::stack / std::queue |
|---|---|---|
| 目的 | 学习指针、下标和边界 | 直接使用已实现的操作 |
| 底层 | 明确写出数组或节点 | 默认 deque，也可选择合适容器 |
| 容量 | 固定数组主动判满；链式申请内存 | 无固定教材 MAXSIZE，但仍受资源限制 |
| 删除取值 | 本文用 bool + out | 先 top/front，再 pop；pop 返回 void |
| 内存责任 | 链式代码负责 new/delete、析构 | 容器管理自身元素和存储 |

扩展知识：`std::stack<Node*>` 析构只销毁指针元素，不会替你 delete 指针指向的独立对象；需要明确所有权或使用智能指针。

## 3.6.2 时间与空间复杂度 ★★★

以下默认元素赋值等基础操作为 O(1)，链式分配按教材常用模型计；真实分配器耗时和失败另行考虑。

| 结构 / 算法 | 插入 | 删除 | 查看 / 判空 | size / 清空 | 存储或辅助空间 |
|---|---|---|---|---|---|
| 本文固定顺序栈 | O(1) | O(1) | O(1) | O(1) / O(1) | O(CAP) |
| vector 动态顺序栈 | 摊还 O(1)，扩容一次 O(n) | O(1) | O(1) | O(1) / 泛型一般 O(n) | O(容量) |
| 链栈 | O(1) | O(1) | O(1) | 维护计数 O(1) / O(n) | O(n)，含指针开销 |
| 本文固定循环队列 | O(1) | O(1) | O(1) | O(1) / O(1) | O(M) |
| 链式队列（有尾指针） | O(1) | O(1) | O(1) | 维护计数 O(1) / O(n) | O(n)，含指针开销 |
| 默认 deque 的 STL 栈/队列 | O(1) | O(1) | O(1) | O(1) / 删除全部 O(n) | 随元素数增长 |
| 括号匹配、表达式转换/求值 | — | — | — | 总时间 O(n) | O(n) |
| BFS（邻接表） | — | — | — | 总时间 O(V + E) | 辅助 O(V) |

链式 size 若不维护计数而每次遍历，就变成 O(n)。固定 int 数组清空仅重置下标，已分配的数组空间仍存在。若讨论 BFS 的邻接矩阵实现，扫描所有邻接位置通常为 O(V²)。

---

# 3.7 栈的应用：括号匹配 ★★★

遇到左括号先保存，遇到右括号时必须匹配**最近还未匹配的左括号**，因此用栈。

```text
扫描 ([{}])，用引号区分括号字符，栈按“栈底 → 栈顶”表示：
( → ['(']
[ → ['(', '[']
{ → ['(', '[', '{']
} → 匹配 {，弹出，剩 ['(', '[']
] → 匹配 [，弹出，剩 ['(']
) → 匹配 (，弹出，空栈 → 成功

([)] → 遇 ) 时栈顶是 [，类型不符 → 失败
())  → 最后的 ) 找不到左括号 → 失败
(()  → 扫描完仍有 ( → 失败
```

```cpp
#include <string>

bool bracketsMatch(const std::string& text) {
    std::stack<char> s;
    for (char c : text) {
        if (c == '(' || c == '[' || c == '{') s.push(c);
        else if (c == ')' || c == ']' || c == '}') {
            if (s.empty()) return false;
            char left = s.top();
            bool ok = (left == '(' && c == ')') ||
                      (left == '[' && c == ']') ||
                      (left == '{' && c == '}');
            if (!ok) return false;
            s.pop();
        }
    }
    return s.empty();
}
```

本函数忽略其他字符，并会把引号/注释内的括号也当作括号。检查真实 C++ 源码还要词法分析，属于扩展知识。总时间 O(n)，最坏辅助空间 O(n)。

---

# 3.8 前缀、中缀、后缀与表达式处理 ★★★

## 3.8.1 三种表示法

以 `5 * (2 + 3)` 为例：

| 表示 | 运算符位置 | 结果 |
|---|---|---|
| 中缀 infix | 两个操作数之间 | `5 * (2 + 3)` |
| 前缀 prefix | 两个操作数之前 | `* 5 + 2 3` |
| 后缀 postfix | 两个操作数之后 | `5 2 3 + *` |

多位数必须按完整 token 处理：`12 3 +`，不能按字符误读成 `1 2 3 +`。前/后缀在运算符元数已知、token 边界明确时不需要用括号表达优先级。

```text
表达式树（每个运算符有左右两个操作数）：
       *
      / \
     5   +
        / \
       2   3

根→左→右：前缀 * 5 + 2 3
左→根→右：中缀 5 * (2 + 3)，打印时按结构加必要括号
左→右→根：后缀 5 2 3 + *
```

## 3.8.2 中缀转后缀：括号怎么操作

维护“后缀输出”和“运算符栈”，从左到右扫描：

1. 操作数：直接输出。
2. `(`：压入运算符栈，作为分隔边界。
3. `)`：不断弹出并输出运算符，直到遇到 `(`；**丢弃这一对括号，不把括号输出到后缀式**。找不到 `(` 则不匹配。
4. 运算符：弹出应先计算的栈顶运算符，再把当前运算符入栈。
5. 扫描结束：输出剩余运算符；若还残留括号则不匹配。

本文四则运算中 `* /` 高于 `+ -`，均为左结合，所以遇到当前运算符时，弹出栈顶**优先级大于或等于**它的运算符；遇到 `(` 就停。

```text
中缀：5 * (2 + 3)
token    后缀输出         运算符栈（底→顶）
5        5                空
*        5                *
(        5                * (
2        5 2              * (
+        5 2              * ( +
3        5 2 3            * ( +
)        5 2 3 +          *       ← 弹出 +，丢弃 (；* 留在栈中
结束     5 2 3 + *        空
```

`(` 隔开外层与内层；遇到 `)` 只结算这对括号内部的运算符。因此不能遇到右括号就把整个栈清空。另例：`3 * (4 + 5)` → `3 4 5 + *`。

左结合例子：`8 - 3 - 2` → `8 3 - 2 -`，等于 `(8 - 3) - 2 = 3`。

扩展知识：数学幂运算常定义为右结合，当前为右结合运算符时只弹出更高优先级的栈顶，同级不弹；C++ 的 `^` 是按位异或，不是幂。下面代码不支持幂、一元负号、函数或隐式乘法。

## 3.8.3 中缀转后缀 C++ 实现

输入已经分词：非负十进制整数、四则运算符和圆括号，每个都是独立字符串。`expectOperand` 用来发现空括号、连续运算符、缺操作数等错误。`-3` 应先扩展一元运算规则，不能直接交给本函数。

```cpp
#include <vector>
#include <algorithm>
#include <stdexcept>

bool isIntegerToken(const std::string& t) {
    return !t.empty() && std::all_of(t.begin(), t.end(),
        [](char c) { return c >= '0' && c <= '9'; });
}
int precedence(const std::string& op) {
    if (op == "*" || op == "/") return 2;
    if (op == "+" || op == "-") return 1;
    return 0;
}
std::vector<std::string> infixToPostfix(
        const std::vector<std::string>& tokens) {
    std::vector<std::string> output;
    std::stack<std::string> ops;
    bool expectOperand = true;
    for (const auto& t : tokens) {
        if (isIntegerToken(t)) {
            if (!expectOperand) throw std::invalid_argument("missing operator");
            output.push_back(t);
            expectOperand = false;
        } else if (t == "(") {
            if (!expectOperand) throw std::invalid_argument("missing operator");
            ops.push(t);
        } else if (t == ")") {
            if (expectOperand) throw std::invalid_argument("missing operand");
            while (!ops.empty() && ops.top() != "(") {
                output.push_back(ops.top());
                ops.pop();
            }
            if (ops.empty()) throw std::invalid_argument("unmatched )");
            ops.pop(); // 丢弃 (
            expectOperand = false;
        } else if (precedence(t) != 0) {
            if (expectOperand) throw std::invalid_argument("missing operand");
            while (!ops.empty() && ops.top() != "(" &&
                   precedence(ops.top()) >= precedence(t)) {
                output.push_back(ops.top());
                ops.pop();
            }
            ops.push(t);
            expectOperand = true;
        } else throw std::invalid_argument("unknown token");
    }
    if (expectOperand) throw std::invalid_argument("empty or incomplete expression");
    while (!ops.empty()) {
        if (ops.top() == "(") throw std::invalid_argument("unmatched (");
        output.push_back(ops.top());
        ops.pop();
    }
    return output;
}
```

调用例：`infixToPostfix({"5", "*", "(", "2", "+", "3", ")"})` 返回 `{"5", "2", "3", "+", "*"}`。本代码的 n 表示 token 数；每个 token 的比较/转换开销若随字符串长度增长，应再计入总字符数。

## 3.8.4 后缀求值：先弹右操作数

从左到右：遇数压栈；遇二元运算符，**先弹出的为右操作数 b，后弹出的为左操作数 a**，计算 a op b，再压回。

```text
后缀：5 2 3 + *
5 → [5]
2 → [5, 2]
3 → [5, 2, 3]
+ → b=3，a=2，压回 5 → [5, 5]
* → b=5，a=5，压回 25 → [25]

后缀：8 2 / → b=2，a=8 → 8/2 = 4
若误写 b/a，则得到 2/8，结果错误。
```

最后栈中必须恰好一个结果；计算时不足两个数、未知 token、除以零、结束后剩多个数都应报错。

```cpp
#include <cmath>

double evalPostfix(const std::vector<std::string>& tokens) {
    std::stack<double> values;
    for (const auto& t : tokens) {
        if (isIntegerToken(t)) {
            double x = std::stod(t); // 数值超范围时抛出异常
            if (!std::isfinite(x)) throw std::overflow_error("number overflow");
            values.push(x);
        } else {
            if (precedence(t) == 0) throw std::invalid_argument("unknown token");
            if (values.size() < 2) throw std::invalid_argument("missing operand");
            double b = values.top(); values.pop(); // 右操作数
            double a = values.top(); values.pop(); // 左操作数
            double result;
            if (t == "+") result = a + b;
            else if (t == "-") result = a - b;
            else if (t == "*") result = a * b;
            else {
                if (b == 0.0) throw std::domain_error("division by zero");
                result = a / b;
            }
            if (!std::isfinite(result)) throw std::overflow_error("result overflow");
            values.push(result);
        }
    }
    if (values.size() != 1) throw std::invalid_argument("invalid postfix");
    return values.top();
}
```

输入数字 token 与转换函数相同，只接收非负整数文字；中间结果可以是负数或小数。为避免教学代码中的整数溢出，计算采用 double，故 `7 2 /` 得 3.5；若教材用 int 则整数除法得到 3。double 有舍入误差，不能用于要求任意大整数精确结果的题目。

## 3.8.5 前缀转换与求值 ★★

中缀转前缀可以先按优先级和括号建立表达式树，再以前序遍历输出；从后缀建树时，遇数建叶子，遇二元运算符先弹右子树、再弹左子树，组合后压回。这样能保留左右顺序和结合性。

前缀求值**从右到左扫描**：遇数压栈；遇二元运算符，先弹出的为左操作数 a，后弹出的为右操作数 b，计算 a op b。

```text
前缀：- / 8 2 1
从右扫描：1 → [1]
          2 → [1, 2]
          8 → [1, 2, 8]
          / → a=8，b=2 → [1, 4]
          - → a=4，b=1 → [3]
对应中缀：(8 / 2) - 1。
```

“反转中缀、交换括号、转后缀、再反转”也可用于前缀转换，但**反向扫描时要调整同级运算符的结合规则，并按 token 反转**。把普通后缀算法照搬容易把 `a-b-c` 的结合关系弄错；优先理解表达式树方法。

---

# 3.9 队列的应用：BFS 按层访问 ★★★

## 3.9.1 为什么队列能保持层次

BFS = Breadth-First Search，广度优先搜索。从起点开始，先处理距离 0 的顶点，再处理距离 1、2……的顶点（距离指无权图中边数）。FIFO 保证先发现并入队的顶点先被取出处理。

```text
          A（第0层）
         / \
        B   C（第1层）
       / \   \
      D   E   F（第2层）
```

约定按图中从左到右的邻居次序遍历；队列从左到右为队头到队尾：

| 出队处理 | 新入队 | 处理后队列 |
|---|---|---|
| 初始化 | A | A |
| A | B、C | B C |
| B | D、E | C D E |
| C | F | D E F |
| D | 无 | E F |
| E | 无 | F |
| F | 无 | 空 |

出队顺序：**A B C D E F**。处理 B 后，下一个出队是已经在队头的 C，不能因为 D、E 刚入队就先访问它们。

同一层内部次序由邻接表/邻居枚举次序决定；若先枚举 C 再 B，层次仍正确，但出队序列可以不同。一次普通 BFS 不保证按字母或编号排序。

## 3.9.2 入队时标记，而非等到出队

一般图会有环，两个顶点也可能指向同一个邻居。**发现顶点并准备入队时就标记**，避免同一顶点被多个前驱重复入队。对树可依赖其结构，对一般图应使用 visited 或距离数组。

“访问”一词可能指发现、入队或出队处理，答题前要确认题目的定义。下面实现把出队后加入 level 的时刻作为处理时刻。

## 3.9.3 显式按层输出 C++ 实现

```cpp
std::vector<std::vector<int>> bfsLevels(
        const std::vector<std::vector<int>>& graph, int start) {
    // 前提：graph 中所有邻居编号均合法；编号范围 0..graph.size()-1。
    if (start < 0 || static_cast<std::size_t>(start) >= graph.size())
        throw std::invalid_argument("invalid start");
    std::vector<bool> visited(graph.size(), false);
    std::queue<int> q;
    std::vector<std::vector<int>> levels;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        std::size_t count = q.size(); // 固定本层开始时的元素数量
        std::vector<int> level;
        for (std::size_t i = 0; i < count; ++i) {
            int u = q.front();
            q.pop();
            level.push_back(u);
            for (int v : graph[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    q.push(v);
                }
            }
        }
        levels.push_back(level);
    }
    return levels;
}
```

例：用 0…5 对应 A…F，邻接表 `{{1,2},{3,4},{5},{},{},{}}`，起点 0，得到 `{{0},{1,2},{3,4,5}}`。

本层处理过程中队列大小会变化，不能写 `i < q.size()` 来代替固定的 count，否则可能少处理本层或误把下一层算进来。本函数只遍历起点可达部分；遍历非连通图的所有顶点要在外层对未访问顶点再次启动 BFS。

扩展知识：邻接表 BFS 为 O(V+E)，辅助空间 O(V)，队列峰值也可能达到 O(V)。它求得无权图或各边等权图按边数的最短距离；边权不同的最短路需要另选算法。未来可用于进程树按层展示、依赖关系遍历和任务调度基础。

---

# 3.10 易错点速查 ★★★

| 易错说法 / 操作 | 正确理解 |
|---|---|
| 栈先进先出、队列后进先出 | 栈 LIFO，队列 FIFO |
| 栈就是数组 | 栈是访问规则，可用数组或链表实现 |
| new 出来的数组会自动长大 | 每次分配的数组长度固定，需要另行扩容 |
| top 是下标 0，所以栈为空 | 本文空栈 top_ = -1；先看约定 |
| pop 会自动返回元素 | STL pop 返回 void，先读取再删除 |
| Node* 是一个完整节点 | 它是指针类型；节点需另行创建 |
| 先 delete old，再读 old->next | 释放后访问无效，先保存/更新后继 |
| delete top_ 会释放整条链 | 普通 Node* 不会递归释放后继 |
| 循环队列 rear 指向最后一个元素 | 本文 rear 指向下一个插入格 |
| rear == M 就是队满 | 循环队列每次更新取模；本文判满为 (rear+1)%M == front |
| front == rear 既空又满 | 留空位方案中它只表示空；其他方案需要 count/标志 |
| 长度 rear-front，满容量 M | 本文长度 (rear-front+M)%M，满容量 M-1 |
| 链式队列出空后只置 front 为空 | 无头节点版本的 rear 也要置为空 |
| 转后缀时括号进入输出 | 括号仅用于运算符栈中的边界，最终丢弃 |
| 后缀先弹出的数是左操作数 | 先弹右、后弹左；前缀从右扫描时先弹左 |
| BFS 刚入队的孩子立刻处理 | 它们排在队尾，已有队头先出队 |
| BFS 同层次序一定唯一 | 次序由邻居枚举顺序决定 |

---

# 3.11 自测题（先做题，再看答案）

1. 依次入栈 A、B、C 后出栈一次，再入栈 D，之后全部出栈，完整出栈序列是什么？
2. 本文顺序栈容量 4，top_ = 2 时有几个元素？再入栈一次后是否满？
3. `Node* p = top_; p = p->next;` 是否改变原 top_？`p->next = q;` 改变的又是什么？
4. 链栈 pop 为什么不能先 delete old，再执行 `top_ = old->next`？
5. `new int[100]` 是否能自动扩容？vector 入栈为何说“摊还 O(1)”？
6. 留空位循环队列 M = 7，front = 4，rear = 2：长度多少？最后一个元素下标多少？还能入几个元素？
7. 同一队列 M = 7，front = 3，rear = 2，是空、满还是普通非空状态？
8. 数组长 5 的留空位队列，从空队依次入 1、2、3、4，出两个，再入 5、6：front、rear 和出队次序是什么？
9. 无头节点链式队列只有一个节点，删掉它之后 front_、rear_ 应是什么？若带头节点又如何？
10. `([)]`、`([]{})`、`(()` 哪些括号匹配？仅左右括号数量相等是否足够？
11. 把 `5 * (2 + 3)`、`8 - 3 - 2`、`12 / (3 + 1)` 转为后缀。第一个表达式遇右括号时为什么不弹出 *？
12. 求 `8 2 / 1 -` 的值，并写出先后弹出的操作数。对应前缀式是什么？
13. 图中 A 的邻居按 B、C 枚举，B 的邻居 D、E，C 的邻居 F：处理完 B 后队列是什么？下一个出队是谁？
14. BFS 图中 B、C 都连接 D，为什么应在 D 入队时标记 visited？
15. 为什么按层 BFS 要保存本层开始时的 q.size()，而不能在循环条件里每次读取它？

<details>
<summary>展开参考答案与解析</summary>

1. **C、D、B、A**。C 已在第一次出栈时离开；D 后入，先于 B、A 离开。
2. 3 个；再入一次 top_ = 3，达到 CAP - 1，满。
3. 第一段只移动独立指针 p，不改变 top_。第二句修改 p 当前指向的节点的 next 字段，会改变链的连接；两者都要求所访问指针有效。
4. delete 后 old 所指节点生命周期已结束，再读 next 是释放后访问。
5. 不能。vector 扩容一次可能复制/移动 n 个元素，但容量按增长策略扩大，多次入栈的总成本可摊到每次 O(1)。
6. 长度 `(2-4+7)%7 = 5`；最后下标 `(2-1+7)%7 = 1`；有效容量 6，所以还能入 1 个。
7. 满：`(2+1)%7 == 3`。front != rear，所以非空。
8. front = 2，rear = 1；出队次序 3、4、5、6。它们的物理下标依次为 2、3、4、0。
9. 无头节点：都为 nullptr。有头节点：都指向仍存在的头节点，rear = front。
10. 仅 `([]{})` 匹配。`([)]` 类型和嵌套顺序不符；`(()` 有左括号残留。数量相等还不够。
11. `5 2 3 + *`；`8 3 - 2 -`；`12 3 1 + /`。遇右括号只弹出对应左括号之上的 +，* 属于外层。
12. 值 3。遇 / 先弹 2 再弹 8，计算 8/2；遇 - 先弹 1 再弹 4，计算 4-1。前缀 `- / 8 2 1`。
13. 队列 C D E；下一次出队 C。
14. B 首先发现 D 时就标记，C 再遇到 D 就不重复入队；否则可能重复处理并破坏复杂度保证。
15. 出队使 q.size() 减小、入队使它增大；动态条件不能代表“本层原有多少顶点”，固定 count 才能隔开层次。

</details>

---

# 第3章重点总结

★★★ 必须掌握：

- 栈 LIFO、队列 FIFO，逻辑规则与存储实现分开理解。
- 顺序栈 top 下标约定，链栈头插头删与释放顺序。
- Node / Node* / next，修改指针变量与修改链接的区别。
- 循环队列 rear 指向下一个插入位置，取模回绕，留空位方案的判空判满与长度。
- 无头节点链式队列入空队、出最后一个节点时的 front/rear 更新。
- 括号匹配、运算符优先级与结合性、后缀求值的左右操作数顺序。
- BFS 使用 FIFO，入队时标记，按层处理时固定当前层大小。

★★ 重点理解：

- ADT 与 STL 接口的返回值差异；STL 的底层容器和内存管理。
- 固定数组、动态分配数组、动态增长容器之间的区别。
- O(1)、摊还 O(1)、清空 O(n) 的适用前提。
- 前缀求值、表达式树、其他队满方案；扩展内容不替代本章基本约定。

## 代码使用与复习路径

所有 C++ 代码块按文中顺序放入同一个 .cpp 可组成教学函数/类库，再添加 main 调用；头文件在前面的代码块中已包含，单独复制某一节时应补齐它依赖的头文件。链式类不可复制，固定数组容量仅为便于手算的示例。

复习顺序：知识地图 → 画一次链栈 push/pop → 手算一次循环队列回绕 → 转换并求值 `5*(2+3)` → 写 BFS 队列变化 → 自测题。

第1章认识逻辑结构与复杂度，第2章学习数组和链表，第3章在这些基础上限制操作位置，并用访问次序解决表达式、括号和按层遍历问题。
