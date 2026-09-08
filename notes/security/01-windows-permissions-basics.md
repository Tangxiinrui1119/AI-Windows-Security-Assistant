# Windows 权限基础：SID、Access Token、ACL、ACE 与有效权限

> 📅 学习日期：2026-09-07（三年计划 Day 2）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[01 · Windows 注册表、启动项与 SID](../powershell/01-windows-registry-startup-sid.md)
> 学习主题：Windows 安全机制 / NTFS 权限
> 学习内容：SID、用户组、Access Token、ACL、ACE、Allow/Deny、权限继承、Effective Permissions
> 学习阶段：信息安全基础

---

## 一、今天学习的核心知识链

今天学习的内容可以串成一条完整的权限判断链：

```text
用户
 ↓
SID
 ↓
用户所属的组
 ↓
登录 Windows
 ↓
Access Token
 ↓
访问文件/文件夹
 ↓
ACL
 ↓
ACE
 ↓
Allow / Deny
 ↓
权限继承
 ↓
Effective Permissions（最终有效权限）
```

以后遇到 Windows 权限问题，可以按照这条链逐步分析。

---

# 二、SID —— Security Identifier

## 2.1 SID 是什么？

SID 全称：

```text
Security Identifier
```

中文：

> **安全标识符**

SID 是 Windows 用来标识一个**安全主体（Security Principal）**的唯一标识。

安全主体不只是普通用户，还可以包括：

* 用户
* 用户组
* 计算机账户
* 其他安全主体

例如：

```text
Alice
 ↓
S-Alice-1001
```

这里的：

```text
S-Alice-1001
```

只是为了方便理解的示例，真实 Windows SID 一般长得类似：

```text
S-1-5-21-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-1001
```

---

## 2.2 为什么不用用户名直接作为权限身份？

因为用户名是可以修改的。

例如：

```text
Alice
 ↓
改名
 ↓
Tom
```

但是如果只是修改用户名，通常不会因此产生一个全新的用户身份。

例如：

```text
原来：

Alice
SID = S-1-5-21-...-1001


改名后：

Tom
SID = S-1-5-21-...-1001
```

所以文件权限仍然可以识别这是原来的那个安全主体。

---

## 2.3 SID 最重要的作用

可以记：

> **SID = “你是谁？”**

例如：

```text
Alice
 ↓
SID：S-Alice
```

Windows 在权限判断中主要依据安全主体的 SID，而不是单纯看显示出来的用户名。

---

# 三、NTFS —— Windows 的文件系统

## 3.1 NTFS 是什么？

NTFS 全称：

```text
New Technology File System
```

中文：

> 新技术文件系统

NTFS 是 Windows 常用的文件系统之一。

它负责管理：

* 文件
* 文件夹
* 文件属性
* 文件元数据
* 文件所有者
* 文件权限
* 日志等

所以可以把 NTFS 暂时理解成：

> **负责管理 Windows 文件和文件夹的一套文件系统。**

---

## 3.2 NTFS 和权限是什么关系？

不要把 NTFS 和 ACL 混为一谈。

可以理解为：

```text
NTFS
│
├── 管理文件和文件夹
├── 管理文件相关元数据
├── 支持权限控制
│      ↓
│     ACL
│      ↓
│     ACE
│      ↓
│     SID
│
└── 其他文件系统功能
```

因此：

> **NTFS 是文件系统。**
>
> **ACL 是访问控制规则集合。**
>
> **ACE 是其中的一条具体规则。**

---

# 四、ACL —— Access Control List

## 4.1 ACL 是什么？

ACL 全称：

```text
Access Control List
```

中文：

> **访问控制列表**

ACL 是一个对象上的**访问控制规则集合**。

例如某个文件的 ACL：

```text
ACL
├── Alice SID → Allow → Read
├── Bob SID → Deny → Write
└── Administrators SID → Allow → Full Control
```

可以把 ACL 理解成：

> **“这个文件允许谁做什么、不允许谁做什么”的规则列表。**

---

# 五、ACE —— Access Control Entry

## 5.1 ACE 是什么？

ACE 全称：

```text
Access Control Entry
```

中文：

> **访问控制条目**

ACE 就是 ACL 中的一条具体权限规则。

例如：

```text
Alice SID → Allow → Read
```

就是一条 ACE。

一个 ACL 可以包含很多 ACE：

```text
ACL
│
├── ACE 1：Alice → Allow → Read
├── ACE 2：Bob → Deny → Write
└── ACE 3：Students → Allow → Read
```

所以：

> **ACE = 一条权限规则**
>
> **ACL = 多条 ACE 组成的规则集合**

---

# 六、Allow 和 Deny

ACE 中通常会包含访问类型，例如：

```text
Allow
Deny
```

可以简单理解：

```text
Allow = 允许
Deny  = 拒绝
```

例如：

```text
Alice → Allow → Read
```

表示 Alice 可以读取。

```text
Alice → Deny → Write
```

表示 Alice 不允许写入。

---

## 6.1 Deny 为什么经常会“压过”Allow？

例如：

```text
Students → Allow → Write
Admins   → Deny  → Write
```

如果 Alice 同时属于：

```text
Students
Admins
```

那么 Alice 的权限中：

```text
Write → ❌
```

原因不是：

> Admins 这个组“等级更高”。

Windows 并不是简单的：

```text
Admins > Students
```

真正原因是：

> **Alice 的身份信息中匹配到了一个针对 Write 的 Deny。**

所以在基础权限判断中可以记：

> **对于同一个具体权限，如果存在适用的 Deny，通常会导致该权限被拒绝。**

但是不要把它错误理解成：

> “只要出现一个 Deny，所有权限全部没了。”

例如：

```text
Alice → Allow → Read
Alice → Deny  → Write
```

最终：

```text
Read  ✅
Write ❌
```

Deny Write 并不会自动把 Read 也拒绝。

---

# 七、用户组与组 SID

Windows 权限并不一定直接授予某个用户，也可以授予一个组。

例如：

```text
Alice
 ↓
属于 Students
```

Students 本身也是一个安全主体，因此也有自己的 SID：

```text
Students
 ↓
S-Student
```

文件 ACL：

```text
Students → Allow → Read
```

那么 Alice 即使没有：

```text
Alice → Allow → Read
```

也可以因为自己属于 Students 而获得 Read。

---

## 7.1 为什么？

因为 Alice 登录 Windows 后，Windows 不只是知道：

```text
Alice 的 SID
```

还会知道：

```text
Alice 属于哪些组
```

这就引出了 Access Token。

---

# 八、Access Token

## 8.1 Access Token 是什么？

可以把 Access Token 理解为：

> **Windows 用户登录后生成的一份“权限身份证”。**

它记录与当前安全上下文有关的重要身份信息。

入门阶段重点理解：

```text
Access Token
├── 用户 SID
├── 用户所属组的 SID
└── 其他安全相关信息
```

例如：

```text
Alice：

SID：
S-Alice

所属组：

Students
S-Student

Admins
S-Admin
```

Alice 登录后，可以把它简化理解成：

```text
Access Token
├── S-Alice
├── S-Student
└── S-Admin
```

---

## 8.2 Access Token 的作用

当 Alice 访问一个文件时：

```text
Alice
 ↓
Access Token
 ↓
拿到其中的 SID
 ↓
与文件 ACL 中的 ACE 进行匹配
 ↓
判断 Allow / Deny
 ↓
得到最终有效权限
```

所以：

> **Access Token 不是权限本身。**

它更像是：

> **“我是谁 + 我属于哪些安全主体”的身份信息集合。**

---

# 九、SID、Access Token、ACL、ACE 的关系

这是今天非常重要的一部分。

可以记成：

```text
SID
= 我是谁？
```

```text
Access Token
= 我登录后携带哪些身份？
```

```text
ACE
= 某个身份允许/拒绝做什么？
```

```text
ACL
= 一堆 ACE 的集合
```

例如：

```text
Alice
│
├── S-Alice
├── Students
│      └── S-Student
└── Admins
       └── S-Admin
          ↓
     Access Token
          ↓
 ┌──────────────────────┐
 │ S-Alice              │
 │ S-Student            │
 │ S-Admin              │
 └──────────────────────┘
          ↓
      文件 ACL
          ↓
 ┌──────────────────────┐
 │ S-Student → Allow Read
 │ S-Student → Allow Write
 │ S-Admin   → Deny Write
 │ S-Admin   → Allow Delete
 └──────────────────────┘
          ↓
   Effective Permissions
```

---

# 十、权限继承

## 10.1 什么是权限继承？

Windows 文件夹中的权限可以从父文件夹向子对象传递。

例如：

```text
D:\Project
│
├── code
│   ├── main.cpp
│   └── test.cpp
│
└── notes
    └── study.txt
```

如果：

```text
Project：

Students → Allow → Read
```

并且启用了权限继承，那么下面的子文件/文件夹可以继承这条 ACE。

```text
Project
 ↓
code
 ↓
main.cpp
```

以及：

```text
Project
 ↓
notes
 ↓
study.txt
```

---

## 10.2 继承方向

一定要记住：

> **父对象 → 子对象**

不是：

```text
test.txt → 向上继承 Project
```

而是：

```text
Project
   ↓
Secret
   ↓
password.txt
```

父对象的权限可以向下传递。

---

# 十一、Explicit ACE 和 Inherited ACE

权限条目可以简单分成：

### Explicit ACE

直接设置在当前对象上的 ACE。

例如：

```text
main.cpp：

Alice → Allow → Write
```

这是直接设置的。

---

### Inherited ACE

从父对象继承过来的 ACE。

例如：

```text
Project：

Students → Allow → Read
```

然后：

```text
Project
 ↓
main.cpp
```

那么 main.cpp 上：

```text
Students → Allow → Read
```

就是继承来的。

---

# 十二、关闭权限继承

假设：

```text
Project
├── A.txt
└── B.txt
```

Project：

```text
Students → Allow → Read
```

A.txt 和 B.txt 原本都会继承。

如果 B.txt 禁用继承：

```text
A.txt → 继续继承
B.txt → 不再自动继承
```

---

## 12.1 非常重要的细节

> **关闭继承 ≠ 立即删除所有原来的权限**

Windows 在关闭继承时可能让你：

* 保留并转换为显式权限
* 删除继承来的权限

因此更准确地说：

> **关闭继承意味着这个对象不再自动从父对象获得后续的继承权限。**

例如 Project 后来新增：

```text
Students → Allow → Write
```

那么：

```text
A.txt → 可以继续继承 Write
B.txt → 不会因为原来的继承关系自动获得 Write
```

---

# 十三、Effective Permissions —— 有效权限

## 13.1 什么是有效权限？

Effective Permissions：

> **最终这个用户到底能对某个资源执行什么操作。**

前面的所有知识最终都是为了得到这个结果。

---

## 13.2 判断有效权限的五步法

以后遇到 Windows 权限题，可以固定按照下面的方法：

### 第一步：确定用户身份

例如：

```text
Alice
SID = S-Alice
```

---

### 第二步：确定用户所属的组

例如：

```text
Alice
├── Students
└── SecurityTeam
```

对应：

```text
S-Alice
S-Student
S-Security
```

---

### 第三步：确定 Access Token

简化理解：

```text
Access Token
├── S-Alice
├── S-Student
└── S-Security
```

---

### 第四步：查看目标文件最终有哪些 ACE

要注意：

* 直接设置的 ACE
* 从父文件夹继承的 ACE
* Allow
* Deny

---

### 第五步：匹配并计算

例如：

```text
Students     → Allow → Read
SecurityTeam → Allow → Write
Students     → Deny  → Write
```

Alice：

```text
S-Alice
S-Student
S-Security
```

最终：

```text
Read  → ✅
Write → ❌
```

---

# 十四、综合实战例题

## 场景

目录结构：

```text
D:\Project
└── Secret
    └── password.txt
```

Alice：

```text
Alice SID = S-Alice

属于：
Students → S-Student
SecurityTeam → S-Security
```

因此 Access Token 简化为：

```text
S-Alice
S-Student
S-Security
```

---

## Project ACL

```text
Students     → Allow → Read
SecurityTeam → Allow → Write
```

Secret 继承 Project 的权限。

---

## Secret 自己添加

```text
Students → Deny → Write
```

password.txt 又继续继承 Secret 的权限。

因此 password.txt 最终可以理解为：

```text
Students     → Allow → Read
SecurityTeam → Allow → Write
Students     → Deny  → Write
```

---

## 最终结果

### Read

```text
Students → Allow → Read
```

Alice 属于 Students。

所以：

```text
Read → ✅
```

### Write

```text
SecurityTeam → Allow → Write
Students     → Deny  → Write
```

Alice 同时属于两个组。

因此：

```text
Write → ❌
```

### 权限来源

```text
Students → Deny → Write
```

来源：

```text
Secret
```

然后继承到：

```text
password.txt
```

而：

```text
SecurityTeam → Allow → Write
```

来源：

```text
Project
```

然后：

```text
Project
 ↓
Secret
 ↓
password.txt
```

一路向下继承。

---

# 十五、今天最容易犯的错误

## 错误 1：SID 就是用户名

错误：

```text
SID = Alice
```

正确：

```text
Alice
 ↓
SID
```

SID 是 Windows 用于标识安全主体的标识符。

---

## 错误 2：ACL 和 ACE 是同一个东西

错误：

> ACL 就是一条权限。

正确：

```text
ACL
├── ACE
├── ACE
└── ACE
```

ACL 是集合，ACE 是其中的一条规则。

---

## 错误 3：Access Token 就是权限

错误：

> Access Token 就是我拥有的权限。

更准确：

> Access Token 记录当前安全上下文中的身份和组等信息，Windows 会利用这些信息去检查资源的访问控制规则。

---

## 错误 4：Admins 一定比 Students 权限高

错误：

```text
Admins > Students
```

正确：

> Windows 不是简单按照组的“等级”判断权限。

如果：

```text
Students → Allow → Write
Admins → Deny → Write
```

Alice 同时属于两个组：

```text
Write → ❌
```

主要原因是存在适用于 Alice 的 Deny Write。

---

## 错误 5：一个 Deny 就什么都不能做

错误：

```text
Deny Write
↓
所有权限都没了
```

正确：

```text
Read  → 仍然可能允许
Write → 被拒绝
Delete → 仍然可能允许
```

Deny 针对的是具体访问权限。

---

## 错误 6：权限继承是从子向父

错误：

```text
test.txt
 ↑
Secret
 ↑
Project
```

正确：

```text
Project
 ↓
Secret
 ↓
test.txt
```

权限继承的核心方向是：

> **父对象 → 子对象**

---

# 十六、核心记忆表

| 概念                    | 全称                         | 最简单理解         |
| --------------------- | -------------------------- | ------------- |
| SID                   | Security Identifier        | 我是谁           |
| Group                 | User Group                 | 我属于哪个群体       |
| Access Token          | Access Token               | 登录后携带的身份/组信息  |
| ACE                   | Access Control Entry       | 一条具体权限规则      |
| ACL                   | Access Control List        | 一组权限规则        |
| NTFS                  | New Technology File System | Windows 的文件系统 |
| Allow                 | Allow                      | 允许            |
| Deny                  | Deny                       | 拒绝            |
| Inheritance           | Permission Inheritance     | 父对象向子对象传递权限   |
| Effective Permissions | Effective Permissions      | 最终实际能做什么      |

---

# 十七、一句话记忆法

```text
SID：你是谁？

Group：你属于谁？

Access Token：你登录后带着哪些身份？

ACE：这个身份能不能做某件事？

ACL：有哪些权限规则？

NTFS：这些文件和文件夹由什么文件系统管理？

Inheritance：父文件夹的权限怎么传给子对象？

Effective Permissions：最后你到底能干什么？
```

---

# 十八、最终总图

```text
                         Windows
                            │
                           NTFS
                            │
                    文件 / 文件夹 / 资源
                            │
                           ACL
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
         ACE               ACE               ACE
          │                 │                 │
      SID/Group         SID/Group         SID/Group
          │                 │                 │
       Allow              Deny              Allow
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                     用户访问资源
                            │
                           SID
                            │
                      所属用户组
                            │
                     Access Token
                            │
                     匹配 ACL / ACE
                            │
                 Allow / Deny + 继承
                            │
                            ↓
                Effective Permissions
                            │
                 ┌──────────┼──────────┐
                 ↓          ↓          ↓
               Read       Write      Delete
                ✅          ❌          ✅
```

---

# 十九、今天学习总结

今天主要完成了 Windows 权限基础中的一个完整闭环。

已经理解：

* SID 是安全主体的身份标识
* 用户名改变不等于 SID 改变
* 用户组本身也有 SID
* 用户登录后会形成 Access Token
* Access Token 中包含用户 SID、组 SID 等身份信息
* Windows 会利用这些身份信息匹配资源的 ACL
* ACL 是访问控制规则集合
* ACE 是 ACL 中的一条具体规则
* Allow 表示允许
* Deny 表示拒绝
* 权限可以从父文件夹继承到子对象
* Explicit ACE 是直接设置的权限
* Inherited ACE 是继承来的权限
* 关闭继承意味着不再自动继承后续父级权限，但不一定立即删除现有权限
* Effective Permissions 是最终实际获得的权限

最重要的思考方式：

```text
用户是谁？
    ↓
有哪些 SID？
    ↓
Access Token 有哪些 SID？
    ↓
目标资源有哪些 ACE？
    ↓
哪些 ACE 能匹配？
    ↓
有没有 Allow / Deny？
    ↓
有没有继承？
    ↓
最终 Effective Permissions 是什么？
```

> **这套流程比死记“Deny 优先”“Admins 权限高”更加重要。**

---

# 二十、动手验证（建议）

> 说明：本节是整理时补充的动手建议（今天的学习以理论推演为主，以下命令还没实际执行过）。全部为**只读**操作。

## 验证 1：亲眼看到一个文件夹的 ACL

```powershell
icacls "D:\Project"
```
（扩展知识：`icacls` 是 Windows 查看/管理 NTFS 权限的命令行工具，本阶段只用它观察，不改动。）

**应该看到什么**：一串 SID 和组名，后面跟着 Allow/Deny 标记——这就是真实的 ACE；有些条目会标出（继承自）来源，对应今天学的 Inherited ACE。
**如何理解**：把输出和今天笔记里的 ACL 图对照，纸上推演和真实系统就对上了。

## 验证 2：看当前用户的 Access Token 里有哪些组

```powershell
whoami /groups
```

**应该看到什么**：当前用户 SID + 所属各组 SID，还有「已启用/已拒绝」的状态。
**如何理解**：这就是登录后 Access Token 的近似内容——访问资源时，Windows 拿这里的 SID 去和 ACL 匹配。

> ✅ 已实机验证：[02 · Windows ACL 实机验证与有效权限（Day 3）](02-windows-acl-effective-permissions.md)（2026-09-08）
