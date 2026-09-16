# 01 · C++ 指针、引用与 const

> 📅 学习日期：2026-09-16
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 关联项目：[AI-Windows-Security-Assistant](../../README.md)
> 学习主题：值传递 / 引用传递 / 普通指针 / 二级指针 / 指针引用 / const / 临时对象
> 学习阶段：C++ 基础
> 🎯 学习目的：区分指针的指向与所指数据，理解引用和 const 的限制，并掌握只读参数 const T& 的基本用法。

---

## 一、今日学习进度

今天主要学习并巩固了：

1. 值传递与引用传递
2. 普通指针
3. 二级指针
4. 指针的引用
5. `const` 与指针
6. 常量引用
7. `const T&` 作为函数参数
8. 临时对象与 `const` 引用

> 注意：  
> **“数组和指针的关系”今天还没有正式开始学习。**
>
> 下一次 C++ 学习从这里继续。

---

# 二、值传递与引用传递

## 1. 值传递

```cpp
void change(int a)
{
    a = a + 10;
}

int main()
{
    int x = 5;
    change(x);

    cout << x;
}
```

输出：

```text
5
```

原因：

调用：

```cpp
change(x);
```

时，相当于把 `x` 的值复制给形参 `a`。

可以理解为：

```text
x = 5

a = 5   // 一份副本
```

之后：

```cpp
a = 15;
```

只修改 `a`，不会影响 `x`。

因此：

```text
值传递 = 函数得到原变量的一份副本
```

---

## 2. 引用传递

```cpp
void change(int &a)
{
    a = a + 10;
}
```

调用：

```cpp
int x = 5;
change(x);
```

这里：

```cpp
int &a
```

表示：

```text
a 是 x 的别名
```

因此：

```cpp
a = 15;
```

实际上就是：

```cpp
x = 15;
```

所以：

```text
引用传递 = 不复制数据，形参直接代表原变量
```

---

# 三、普通指针

基本写法：

```cpp
int x = 10;

int *p = &x;
```

这里必须区分四个东西：

```cpp
x
```

表示：

```text
x 的值
```

即：

```text
10
```

---

```cpp
&x
```

表示：

```text
x 的内存地址
```

---

```cpp
p
```

表示：

```text
指针变量 p 中保存的地址
```

由于：

```cpp
int *p = &x;
```

所以：

```text
p 保存的是 x 的地址
```

---

```cpp
*p
```

表示：

```text
访问 p 所保存地址对应的数据
```

也叫：

```text
解引用
```

因此：

```cpp
*p
```

就是：

```cpp
x
```

的值。

---

## 示例

```cpp
int x = 10;
int y = 20;

int *p = &x;

*p = 30;

p = &y;

*p = *p + 5;
```

执行过程：

### 第一步

```cpp
int *p = &x;
```

此时：

```text
p → x
x = 10
```

### 第二步

```cpp
*p = 30;
```

修改的是 `p` 指向的数据。

此时 `p` 指向 `x`，所以：

```text
x = 30
```

### 第三步

```cpp
p = &y;
```

修改的是：

```text
p 自己保存的地址
```

因此：

```text
p → y
```

### 第四步

```cpp
*p = *p + 5;
```

此时 `p` 指向 `y`。

所以相当于：

```cpp
y = y + 5;
```

最终：

```text
x = 30
y = 25
```

---

# 四、修改 `p` 和修改 `*p` 的区别

这是今天非常重要的一点。

```cpp
p = &y;
```

表示：

```text
修改 p 保存的地址
```

也就是：

```text
改变 p 指向谁
```

而：

```cpp
*p = 50;
```

表示：

```text
修改 p 指向对象中的数据
```

简单记忆：

```text
p    → 地址
*p   → 地址里的数据
```

---

# 五、二级指针

代码：

```cpp
int x = 10;

int *p = &x;

int **pp = &p;
```

关系：

```text
pp → p → x → 10
```

因此：

```cpp
pp
```

表示：

```text
p 的地址
```

---

```cpp
*pp
```

表示：

```text
p
```

也就是：

```text
x 的地址
```

---

```cpp
**pp
```

表示：

```text
x 的值
```

---

## 示例

```cpp
int x = 10;
int y = 20;

int *p = &x;
int **pp = &p;

**pp = 30;

*pp = &y;

**pp = **pp + 5;
```

第一步：

```cpp
**pp = 30;
```

相当于：

```cpp
x = 30;
```

第二步：

```cpp
*pp = &y;
```

因为：

```cpp
*pp
```

就是：

```cpp
p
```

所以相当于：

```cpp
p = &y;
```

注意：

```text
pp 本身仍然指向 p
```

改变的是：

```text
p 指向谁
```

第三步：

```cpp
**pp = **pp + 5;
```

此时：

```text
p → y
```

所以相当于：

```cpp
y = y + 5;
```

最终：

```text
x = 30
y = 25
```

---

# 六、指针的引用

代码：

```cpp
int *p = &x;

int *&r = p;
```

这里：

```cpp
int *&r = p;
```

表示：

```text
r 是指针变量 p 的引用
```

也就是：

```text
r 是 p 的别名
```

注意：

`r` 不是一个新的独立指针。

---

例如：

```cpp
int x = 10;
int y = 20;

int *p = &x;
int *&r = p;

r = &y;
*r = 50;
```

因为：

```text
r 就是 p 的别名
```

所以：

```cpp
r = &y;
```

等价于：

```cpp
p = &y;
```

现在：

```text
p → y
```

然后：

```cpp
*r = 50;
```

等价于：

```cpp
*p = 50;
```

所以：

```text
y = 50
```

最终：

```text
x = 10
y = 50
```

---

# 七、const 与指针

这是今天最重要的新知识之一。

主要有三种形式：

```cpp
const int *p;
```

```cpp
int *const p;
```

```cpp
const int *const p;
```

---

# 八、`const int *p`

例如：

```cpp
int x = 10;

const int *p = &x;
```

意思是：

```text
不能通过 p 修改它指向的数据
```

所以：

```cpp
*p = 20;
```

不合法。

但是：

```cpp
int y = 30;

p = &y;
```

合法。

因为 `p` 自己可以改变指向。

因此：

```text
const int *p

p     可以改变
*p    不可以通过 p 修改
```

---

## 一个非常重要的误区

```cpp
int x = 10;

const int *p = &x;
```

并不代表：

```text
x 本身变成常量
```

它只代表：

```text
不能通过 p 修改 x
```

所以：

```cpp
x = 50;
```

完全合法。

然后：

```cpp
cout << *p;
```

会输出：

```text
50
```

因为 `p` 仍然指向同一个 `x`。

---

# 九、`int *const p`

例如：

```cpp
int x = 10;

int *const p = &x;
```

这里：

```text
p 本身不能改变
```

所以：

```cpp
p = &y;
```

不合法。

但是：

```cpp
*p = 30;
```

合法。

因为：

```text
指向的数据仍然可以修改
```

因此：

```text
int *const p

p     不可以改变
*p    可以改变
```

---

# 十、`const int *const p`

例如：

```cpp
const int *const p = &x;
```

这里两边都限制了：

```text
p 本身不能改变
*p 也不能通过 p 修改
```

因此：

```cpp
p = &y;     // 错误

*p = 30;    // 错误
```

可以理解为：

```text
指向不能换
内容不能通过 p 修改
```

---

# 十一、const 指针记忆方式

### 1.

```cpp
const int *p;
```

可以理解为：

```text
const 在 * 左边

→ 指向的数据不能通过 p 修改
```

---

### 2.

```cpp
int *const p;
```

可以理解为：

```text
const 在 * 右边

→ 指针本身不能修改
```

---

### 3.

```cpp
const int *const p;
```

表示：

```text
两边都不能改
```

---

# 十二、引用一旦绑定不能换对象

例如：

```cpp
int x = 10;
int y = 20;

int &a = x;
```

此时：

```text
a 是 x 的别名
```

如果执行：

```cpp
a = y;
```

并不是：

```text
a 改成 y 的别名
```

而是：

```text
把 y 的值赋给 x
```

因此最终：

```text
x = 20
y = 20
```

但：

```text
a 仍然是 x 的引用
```

结论：

```text
引用绑定之后不能重新绑定到其他对象。
```

---

# 十三、常量引用

普通引用：

```cpp
int &a = x;
```

可以通过 `a` 修改 `x`：

```cpp
a = 20;
```

---

常量引用：

```cpp
const int &a = x;
```

则：

```cpp
a = 20;
```

不允许。

但是：

```cpp
x = 20;
```

依然允许。

原因和：

```cpp
const int *p
```

类似。

`const` 限制的是：

```text
不能通过这个引用修改对象
```

并没有自动把原对象变成常量。

---

# 十四、`const T&` 作为函数参数

例如：

```cpp
void show(const string &s)
{
    cout << s;
}
```

这里：

```cpp
const string &s
```

同时实现：

```text
1. 不复制原对象
2. 不允许函数修改原对象
```

---

## 三种参数方式对比

### 值传递

```cpp
void func(string s);
```

特点：

```text
复制一份字符串
函数修改副本不会影响原对象
```

---

### 普通引用

```cpp
void func(string &s);
```

特点：

```text
不复制
可以修改原对象
```

---

### 常量引用

```cpp
void func(const string &s);
```

特点：

```text
不复制
不能修改原对象
```

---

因此：

```text
T
→ 值传递

T&
→ 引用传递，可以修改原对象

const T&
→ 不复制，同时保证不修改原对象
```

---

# 十五、为什么 `const T&` 很有用

例如一个很大的字符串：

```cpp
string text = ...;
```

如果：

```cpp
void print(string text)
```

调用函数时需要复制整个字符串。

如果字符串很大：

```text
复制会浪费时间和内存
```

而：

```cpp
void print(const string &text)
```

直接访问原对象：

```text
不需要复制
```

同时因为有：

```cpp
const
```

函数又不能修改它。

因此：

```text
const T& 非常适合“只读取较大对象”的函数参数。
```

---

# 十六、小类型通常直接值传递

例如：

```cpp
int
char
double
```

这些类型数据很小，复制成本很低。

所以通常直接：

```cpp
void func(int x);
```

而不是专门：

```cpp
void func(const int &x);
```

目前可以简单记忆：

```text
int / char / double 等小类型
→ 通常直接值传递

string / 较大的对象
→ 只读时常使用 const T&

需要修改原对象
→ 使用 T&
```

---

# 十七、临时对象与 const 引用

普通引用：

```cpp
int &a = 10;
```

通常不允许。

因为：

```text
10 是一个临时值，不是普通的可修改左值对象
```

普通左值引用：

```cpp
int &
```

不能直接绑定这种临时值。

---

但是：

```cpp
const int &a = 10;
```

可以。

可以暂时理解为编译器帮助创建一个临时对象：

```cpp
const int 临时对象 = 10;

const int &a = 临时对象;
```

并且：

```text
临时对象的生命周期会因为这个 const 引用而延长
```

因此：

```cpp
cout << a;
```

可以正常得到：

```text
10
```

---

# 十八、字符串临时对象

例如：

```cpp
void show(const string &s)
{
    cout << s;
}
```

调用：

```cpp
show("Jerry");
```

`"Jerry"` 本身不是一个普通的 `std::string` 变量。

但是它可以用于构造一个临时：

```cpp
string
```

对象。

然后：

```cpp
const string &s
```

绑定到这个临时对象上。

可以简单理解成：

```cpp
string 临时对象 = "Jerry";

const string &s = 临时对象;
```

因此：

```cpp
show("Jerry");
```

可以正常工作。

---

# 十九、今天接触到但没有正式深入的内容

今天提到了：

```cpp
int &&a = 10;
```

这是：

```text
右值引用
```

目前只知道：

```text
int&        → 普通左值引用

const int&  → 只读引用，可以绑定临时值

int&&       → 右值引用
```

右值引用、移动语义等内容今天没有深入学习。

以后再单独讲。

---

# 二十、vector 说明

今天为了理解：

```cpp
const T&
```

简单出现过：

```cpp
vector<int>
```

例如：

```cpp
vector<int> a = {1, 2, 3};
```

但：

> **今天没有正式学习 vector 或 STL。**

只临时把它理解为：

```text
一个装着多个整数的容器
```

例如：

```cpp
a[0]
```

表示第一个元素。

正式的：

```text
vector
STL
迭代器
```

等内容以后再学习。

---

# 二十一、今日核心理解

今天最需要记住以下内容。

## 1. 值传递

```cpp
T x
```

函数得到：

```text
原对象的副本
```

---

## 2. 引用传递

```cpp
T &x
```

函数中的参数就是：

```text
原对象的别名
```

所以可以修改原对象。

---

## 3. 常量引用

```cpp
const T &x
```

特点：

```text
不复制原对象

不能通过这个引用修改对象
```

---

## 4. 普通指针

```cpp
int *p = &x;
```

关系：

```text
p
→ 保存 x 的地址

*p
→ x 中的数据
```

---

## 5. 二级指针

```cpp
int **pp = &p;
```

关系：

```text
pp → p → x
```

所以：

```text
pp
→ p 的地址

*pp
→ p

**pp
→ x
```

---

## 6. 指针引用

```cpp
int *&r = p;
```

表示：

```text
r 是指针 p 的别名
```

---

## 7. const 指针

```cpp
const int *p;
```

表示：

```text
可以换指向

不能通过 p 修改数据
```

---

```cpp
int *const p;
```

表示：

```text
不能换指向

可以修改数据
```

---

```cpp
const int *const p;
```

表示：

```text
指向不能换

数据也不能通过 p 修改
```

---

# 二十二、今天出现过的易错点

## 易错点 1

错误理解：

```text
p 就是地址
```

更准确：

```text
p 是一个指针变量。

p 中保存的值是一个地址。
```

---

## 易错点 2

在：

```cpp
int **pp = &p;

*pp = &y;
```

中，不是修改：

```text
pp 的值
```

而是修改：

```text
p 的值
```

因为：

```cpp
*pp
```

就是：

```cpp
p
```

---

## 易错点 3

```cpp
const int *p = &x;
```

不代表：

```text
x 变成常量
```

而只是：

```text
不能通过 p 修改 x
```

因此：

```cpp
x = 50;
```

仍然合法。

---

## 易错点 4

引用不能重新绑定。

```cpp
int &a = x;

a = y;
```

不是：

```text
a 改为引用 y
```

而是：

```text
x = y
```

`a` 仍然引用 `x`。

---

# 二十三、今日掌握情况

目前已经能够较熟练判断：

```cpp
int *p
```

```cpp
int **pp
```

```cpp
int *&r
```

```cpp
const int *p
```

```cpp
int *const p
```

```cpp
const int *const p
```

```cpp
int &a
```

```cpp
const int &a
```

以及：

```cpp
T
T&
const T&
```

作为函数参数时的区别。

目前对这些内容已经具备通过代码自行推导结果的能力。

---

# 二十四、下一次 C++ 学习起点

下一节正式开始：

# 数组和指针的关系

目前这一部分：

> **尚未学习，不应计入今天已经完成的内容。**

下一次从：

```cpp
int a[3] = {10, 20, 30};

int *p = a;
```

开始。

重点准备学习：

```text
数组名为什么能赋值给指针

a 和 &a[0] 的关系

p + 1 到底是什么意思

指针运算

*p、*(p+1)

a[i] 和 *(a+i) 的关系
```

---

## 今日学习路线

```text
值传递
↓
引用传递
↓
普通指针
↓
二级指针
↓
指针的引用
↓
const + 指针
↓
const 引用
↓
const T& 函数参数
↓
临时对象与 const 引用
↓
【暂停】
↓
下次：数组与指针
```
