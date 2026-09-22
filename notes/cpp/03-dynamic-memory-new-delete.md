# C++ 动态内存：new / delete、栈堆与生命周期

> 📅 学习日期：2026-09-22  
> 📚 学习阶段：C++ 基础  
> 🎯 今日目标：理解动态内存、new / delete、动态数组、内存泄漏、悬空指针、栈与堆、作用域与生命周期。

---

# 知识地图

```text
动态内存
├─ new
│  ├─ 申请单个对象：new int
│  └─ 申请数组：new int[n]
├─ 指针
│  └─ 保存动态对象的地址
├─ delete
│  ├─ 单个对象：delete p
│  └─ 动态数组：delete[] arr
└─ 安全管理
   ├─ delete 后设为 nullptr
   ├─ 避免内存泄漏
   ├─ 避免悬空指针
   └─ 避免重复 delete

对象关系
├─ 栈：局部变量通常随作用域自动结束生命周期
└─ 堆 / 动态内存：可跨函数作用域，需主动释放
   └─ 作用域 ≠ 生命周期
```

# 一、为什么需要动态内存

普通数组通常在写代码时就确定大小，例如：

    int arr[5];

但有些情况下，数组大小要等程序运行后才能确定。

例如：

    int n;
    cin >> n;

用户可能输入：

    5
    100
    10000

此时可以使用动态内存：

    int* arr = new int[n];

这样数组大小可以在程序运行过程中决定。

---

# 二、new 的作用

例如：

    int* p = new int;

其中：

    new int

表示：

申请一块能够存放一个 int 对象的动态内存。

new 会返回：

这块内存的地址。

然后：

    int* p

使用指针 p 保存这个地址。

例如：

    int* p = new int;
    *p = 50;

此时：

    p

保存地址。

而：

    *p

表示访问该地址中的 int 对象。

当前：

    *p = 50

---

# 三、普通指针与 new 的区别

普通情况：

    int a = 10;
    int* p = &a;

这里：

a 本身已经存在。

p 只是保存：

    a 的地址

而：

    int* p = new int;

表示：

程序先动态申请一块新的内存，

然后：

p 保存这块动态内存的地址。

---

# 四、delete

通过 new 申请的动态内存，在不再使用时需要释放。

例如：

    int* p = new int;

    *p = 10;

    delete p;

核心关系：

    new
    →
    申请动态内存

    delete
    →
    释放动态内存

如果不断 new，却不释放已经不用的动态内存，就可能出现：

    Memory Leak
    内存泄漏

---

# 五、动态数组

动态申请数组：

    int n;
    cin >> n;

    int* arr = new int[n];

其中：

    new int[n]

表示：

申请一块能够连续存放 n 个 int 的动态内存。

arr 保存：

第一个元素的地址。

因此可以正常使用：

    arr[0]
    arr[1]
    arr[2]

也可以利用之前学习的数组和指针关系：

    arr[i]

等价于：

    *(arr + i)

例如：

    arr[2] = 30;

等价于：

    *(arr + 2) = 30;

---

# 六、delete 和 delete[] 的区别

单个动态对象：

    int* p = new int;

释放：

    delete p;

动态数组：

    int* arr = new int[10];

释放：

    delete[] arr;

必须区分：

    new int
    →
    delete

    new int[n]
    →
    delete[]

---

# 七、悬空指针 Dangling Pointer

例如：

    int* p = new int;
    *p = 50;

    delete p;

执行：

    delete p;

以后，动态内存已经释放。

但是：

p 这个指针变量本身仍然存在。

并且它可能仍然保存原来的地址。

此时 p 指向的是：

一块已经失效的内存。

这种指针叫：

    Dangling Pointer
    悬空指针

此时不能继续：

    cout << *p;

因为这是：

    Undefined Behavior
    未定义行为

可能：

- 看起来还能输出原来的值
- 输出错误数据
- 程序崩溃
- 出现其他不可预测行为

---

# 八、nullptr

释放动态内存后，通常可以写：

    delete p;
    p = nullptr;

其中：

    delete p;

负责：

释放动态内存。

而：

    p = nullptr;

负责：

让 p 不再保存已经失效的旧地址。

nullptr 可以理解成：

这个指针当前不指向任何有效对象。

例如：

    int* p = nullptr;

判断：

    if (p != nullptr) {
        // p 当前指向某个对象
    }

核心区别：

    delete
    →
    释放内存

    nullptr
    →
    清除指针中的失效地址

---

# 九、double delete

错误示例：

    int* p = new int;

    delete p;
    delete p;

第一次：

    delete p;

已经释放了动态内存。

第二次再次释放同一块已经释放的内存，会导致：

    Double Delete
    Double Free

这属于：

    Undefined Behavior

可能导致程序崩溃或其他严重问题。

因此常见写法：

    delete p;
    p = nullptr;

因为：

    delete nullptr;

是安全的。

---

# 十、内存泄漏

例如：

    void test() {
        int* p = new int[100];
    }

函数结束后：

局部指针 p 消失。

但是：

    new int[100]

申请的动态内存仍然存在。

此时保存该内存地址的 p 已经消失。

因此这块动态内存：

无法再正常找到并释放。

这就叫：

    Memory Leak
    内存泄漏

---

# 十一、内存泄漏的影响

如果程序不断申请动态内存却不释放：

    while (true) {
        test();
    }

程序占用的内存会不断增加。

可能导致：

- 内存使用量越来越高
- 程序性能下降
- 系统频繁进行内存交换
- 程序崩溃
- 严重时系统内存不足

对于：

- 游戏
- 浏览器
- 服务器
- 长时间运行的软件

内存泄漏尤其危险。

注意：

如果整个程序彻底退出，现代操作系统通常会统一回收该进程占用的内存。

因此内存泄漏最主要的问题是：

程序仍然运行时，无用内存长期无法回收。

---

# 十二、栈 Stack

普通局部变量通常可以理解为位于栈中。

例如：

    void test() {
        int a = 10;
        int b = 20;
    }

特点：

局部对象的生命周期通常由语言和作用域自动管理。

函数结束：

    a
    b

的生命周期结束。

不需要手动：

    delete

因此：

普通局部变量通常不需要程序员手动释放。

---

# 十三、堆 Heap / 动态内存

例如：

    int* p = new int;

可以理解为：

p：

通常是一个局部指针变量。

new int：

申请出来的对象属于动态内存区域，学习阶段通常称为：

    Heap
    堆

结构可以理解为：

    栈                         堆

    p
    │
    │ 保存地址
    ↓
    -----------------------> [ int ]

因此：

p 和 p 指向的对象不是同一个东西。

---

# 十四、指针本身和指向对象的区别

例如：

    int* p = new int;
    *p = 50;

这里存在两个对象：

第一：

    p

这是一个指针变量。

第二：

    new int

这是动态申请出来的 int 对象。

因此不能简单说：

    p 在堆里

更准确是：

    p 本身如果是局部变量，通常在当前函数的栈帧中。

而：

    p 指向的 int

是通过 new 动态申请的。

---

# 十五、为什么栈变量能自动销毁

例如：

    void test() {
        int a = 10;
    }

当函数结束时：

局部变量 a 的生命周期自动结束。

C++ 知道：

a 是当前作用域中的局部对象。

因此不需要程序员手动管理。

---

# 十六、为什么 new 出来的对象不会自动销毁

例如：

    int* createNumber() {
        int* p = new int;
        *p = 100;

        return p;
    }

函数结束以后：

局部指针：

    p

消失。

但：

    new int

申请的对象仍然存在。

因此外部：

    int* x = createNumber();

仍然可以：

    cout << *x;

最后需要：

    delete x;
    x = nullptr;

这就是动态内存的重要作用：

让对象的生命周期不必受到创建它的函数作用域限制。

---

# 十七、作用域 Scope

作用域表示：

一个名字在哪一段代码范围内可以被访问。

例如：

    void test() {
        int a = 10;
    }

变量名：

    a

只能在 test 的对应作用域中使用。

出了大括号以后：

不能再通过名字 a 访问它。

---

# 十八、生命周期 Lifetime

生命周期表示：

一个对象从创建到销毁真正存在的时间。

对于普通局部变量：

    int a = 10;

通常：

作用域结束时，

生命周期也结束。

但对于：

    new int

动态对象的生命周期：

不会因为创建它的函数结束就自动结束。

必须通过：

    delete

主动结束。

因此：

作用域和生命周期不是完全相同的概念。

---

# 十九、返回局部变量地址的问题

错误示例：

    int* createNumber() {
        int a = 100;
        return &a;
    }

a 是局部变量。

函数结束以后：

a 的生命周期结束。

但是函数却返回：

    &a

也就是 a 原来的地址。

此时外部：

    int* p = createNumber();

得到的是一个已经失效的地址。

如果继续：

    cout << *p;

属于：

    Undefined Behavior

可能出现：

- 原来的值
- 垃圾数据
- 程序崩溃
- 其他不可预测结果

原因：

原来的栈空间可能已经被后续函数调用重新使用。

---

# 二十、使用动态内存跨越函数生命周期

可以写：

    int* createNumber() {
        int* p = new int;
        *p = 100;

        return p;
    }

外部：

    int* x = createNumber();

    cout << *x;

    delete x;
    x = nullptr;

createNumber 函数结束以后：

局部变量 p 已经销毁。

但：

new int

申请的对象仍然存在。

返回的地址仍然有效。

最后由调用者负责释放。

---

# 二十一、函数返回动态数组

例如：

    int* createArray(int n) {
        int* arr = new int[n];

        for (int i = 0; i < n; i++) {
            arr[i] = i + 1;
        }

        return arr;
    }

调用：

    int* p = createArray(5);

此时：

createArray 内部的局部指针 arr 已经消失。

但是：

    new int[5]

申请出来的数组仍然存在。

p 保存：

该动态数组首元素地址。

因此：

    cout << p[2];

输出：

    3

最后需要：

    delete[] p;
    p = nullptr;

---

# 二十二、栈与堆核心区别

栈上的普通局部对象：

    int a = 10;

特点：

- 生命周期通常由作用域自动管理
- 函数结束通常自动销毁
- 不需要 delete
- 使用相对简单

动态内存：

    int* p = new int;

特点：

- 生命周期可以跨越函数作用域
- 不会因为创建函数结束自动释放
- 需要主动 delete
- 管理错误可能产生内存泄漏、悬空指针等问题

---

# 二十三、今日常见错误

## 1. new 后忘记 delete

错误：

    int* p = new int;

结果：

可能造成内存泄漏。

---

## 2. new[] 却使用 delete

错误：

    int* p = new int[10];

    delete p;

正确：

    delete[] p;

---

## 3. delete 后继续解引用

错误：

    delete p;

    cout << *p;

属于：

未定义行为。

---

## 4. delete 后留下悬空指针

更安全的写法：

    delete p;
    p = nullptr;

---

## 5. 重复 delete

错误：

    delete p;
    delete p;

可能造成：

Double Delete / Double Free。

---

## 6. 返回局部变量地址

错误：

    int* func() {
        int a = 10;
        return &a;
    }

因为：

函数结束后 a 已经被销毁。

---

# 二十四、今日核心知识链

普通局部变量
↓
通常由作用域自动管理
↓
函数结束
↓
生命周期结束

new
↓
动态申请内存
↓
指针保存地址
↓
可以跨越当前函数作用域继续存在
↓
不用时必须 delete / delete[]
↓
必要时将指针设为 nullptr

如果：

new 后不 delete

↓

内存泄漏

如果：

delete 后继续使用旧地址

↓

悬空指针 / 未定义行为

如果：

同一块内存 delete 两次

↓

Double Delete / 未定义行为

---

# 二十五、今日必须掌握

1. new 用于动态申请内存。

2. new 返回动态内存的地址。

3. 指针保存地址，解引用后访问地址对应的对象。

4. 单个对象：

    new int
    →
    delete

5. 动态数组：

    new int[n]
    →
    delete[]

6. delete 后原指针不会自动变成 nullptr。

7. delete 后继续访问原地址属于未定义行为。

8. nullptr 表示指针当前不指向有效对象。

9. 内存泄漏是动态内存已经没有用途，却仍然无法被释放。

10. 局部变量通常随着作用域结束自动销毁。

11. new 出来的对象不会因为创建它的函数结束自动销毁。

12. 作用域表示名字在哪能使用。

13. 生命周期表示对象真正存在多久。

14. 不应该返回普通局部变量的地址。

15. 动态内存可以跨越函数作用域继续存在，但必须明确管理释放时机。
