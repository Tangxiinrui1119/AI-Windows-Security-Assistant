# Windows 进程、PID、PPID 与进程树（Day 8）

> 📅 学习日期：2026-09-16  
> 📔 学习阶段：信息安全基础  
> 🔗 前置知识：Windows Event Log / Security Log / 4624 / 4634 / 4688 / Logon ID  
> 🎯 今日目标：理解 Windows 进程、PID、PPID、父子进程和进程树，并把进程行为与登录会话关联起来。

---

# 一、今日复习

昨天学习了 Windows 安全日志与登录会话分析。

今天开始之前，先复习了几个关键点。

## 1. Logon ID

`Logon ID` 用来区分：

> 同一个账户的不同登录会话。

例如：

```text
User: Alice
Logon ID: 0x1111
```

和：

```text
User: Alice
Logon ID: 0x2222
```

虽然都是 Alice，但这是两个不同的登录会话。

因此不能只看用户名判断两个事件是否属于同一次登录。

---

## 2. Event ID 4634

```text
4634
```

表示：

> 某一次登录会话结束。

例如：

```text
Event ID: 4634
User: Alice
Logon ID: 0x1111
Logon Type: 2
```

说明：

> Alice 的某次本地交互式登录会话结束。

---

## 3. Event ID 4688

```text
4688
```

表示：

> 创建了一个新的进程。

例如：

```text
Process:
powershell.exe
```

但仅仅看到：

```text
powershell.exe
```

不能直接判断为攻击。

必须继续结合：

```text
谁启动的？
属于哪个登录会话？
父进程是谁？
什么时间启动？
执行了什么？
```

进行分析。

---

# 二、什么是进程

程序运行起来以后，Windows 会为它创建：

```text
Process
```

即：

```text
进程
```

例如：

```text
notepad.exe
powershell.exe
chrome.exe
explorer.exe
```

运行之后都会在系统中对应一个或多个进程。

---

# 三、PID

PID：

```text
Process ID
```

即：

```text
进程 ID
```

可以理解成：

> Windows 当前给某个具体进程实例分配的编号。

例如：

```text
powershell.exe
PID 3200
```

以及：

```text
powershell.exe
PID 7400
```

虽然两个进程名字都叫：

```text
powershell.exe
```

但它们的 PID 不同。

因此它们是：

> 两个不同的 PowerShell 进程实例。

可以简单记忆：

```text
进程名
→ 运行的是什么程序

PID
→ 具体是哪一个进程
```

---

# 四、PID 存在哪里

PID 和 Windows Event Log 不完全一样。

进程运行时：

```text
Windows 内核
↓
维护当前进程对象
↓
其中包含 PID
```

因此 PID 首先属于：

> 当前运行状态。

例如：

```text
powershell.exe
PID 8948
```

只是在这个 PowerShell 进程还存在的时候，这个编号用来标识它。

进程结束以后：

```text
这个进程不存在
↓
PID 不再代表这个旧进程
```

以后这个 PID 甚至可能被系统重新分配给别的进程。

---

# 五、PID 能不能被日志记录

可以。

如果 Windows 开启了：

```text
Audit Process Creation
```

即：

```text
进程创建审计
```

那么进程创建的时候，可以产生：

```text
Event ID 4688
```

日志中可以保存当时的信息，例如：

```text
New Process Name
New Process ID
Creator Process
Creator Process ID
```

因此可以这样区分：

```text
当前进程状态
↓
现在有哪些 PID

Security Log / 4688
↓
历史上创建过哪些进程
```

---

# 六、PPID

PPID：

```text
Parent Process ID
```

即：

```text
父进程 ID
```

它回答的问题是：

> 谁启动了这个进程？

例如：

```text
cmd.exe
PID 4000
```

然后：

```text
notepad.exe
PID 6200
PPID 4000
```

因为：

```text
notepad.exe 的 PPID = 4000
```

而：

```text
cmd.exe 的 PID = 4000
```

所以可以判断：

```text
cmd.exe
↓
notepad.exe
```

即：

> cmd.exe 是 notepad.exe 的父进程。

---

# 七、PID 与 PPID 的核心区别

最简单的记忆方式：

```text
PID
= 我是谁

PPID
= 谁启动了我
```

例如：

```text
cmd.exe
PID 3000

powershell.exe
PID 7000
PPID 3000
```

说明：

```text
cmd.exe
↓
powershell.exe
```

---

# 八、怎么寻找父进程

判断方法：

> 拿当前进程的 PPID，去找哪个进程的 PID 等于这个 PPID。

例如：

```text
powershell.exe
PID 7000
PPID 3000
```

然后查到：

```text
cmd.exe
PID 3000
```

于是：

```text
powershell.exe 的 PPID
=
cmd.exe 的 PID
```

因此：

```text
cmd.exe
↓
powershell.exe
```

---

# 九、进程树 Process Tree

多个父子进程关系连起来以后，就形成：

```text
Process Tree
```

即：

```text
进程树
```

例如：

```text
explorer.exe
PID 1200
   ↓
cmd.exe
PID 3000
   ↓
powershell.exe
PID 7000
```

表示：

```text
explorer.exe
↓
创建 cmd.exe
↓
cmd.exe 创建 powershell.exe
```

可以把它理解成：

```text
父进程
↓
子进程
↓
孙进程
```

---

# 十、进程树和登录时间线不是一回事

进程树本身只描述：

```text
进程
↓
进程
↓
进程
```

例如：

```text
explorer.exe
↓
cmd.exe
↓
powershell.exe
```

而：

```text
4624
Alice 登录
↓
explorer.exe
↓
cmd.exe
↓
powershell.exe
```

已经不仅仅是进程树。

这是：

> 登录时间线 + 进程树

结合起来进行分析。

---

# 十一、Logon ID + PID + PPID

昨天和今天的知识可以连接起来。

例如：

```text
01:30

4624
User: Alice
Logon ID: 0x8888
Logon Type: 10
```

说明：

```text
Alice
↓
建立远程交互式登录会话
↓
Logon ID = 0x8888
```

然后：

```text
01:32

4688

Logon ID: 0x8888

New Process:
cmd.exe

PID:
4000

Creator Process:
explorer.exe

Creator PID:
2000
```

之后：

```text
01:33

4688

Logon ID: 0x8888

New Process:
powershell.exe

PID:
6000

Creator Process:
cmd.exe

Creator PID:
4000
```

可以画成：

```text
Alice 登录
Logon ID 0x8888
        ↓

explorer.exe
PID 2000
        ↓

cmd.exe
PID 4000
        ↓

powershell.exe
PID 6000
```

因为这些日志中的：

```text
Logon ID
```

都是：

```text
0x8888
```

所以有理由把这些行为关联到 Alice 的这一次登录会话。

---

# 十二、两条不同的关联线

今天非常重要的一点：

## 登录关系

```text
Logon ID
```

回答：

> 这个行为属于哪一次登录会话？

---

## 进程关系

```text
PID / PPID
```

回答：

> 哪个进程创建了哪个进程？

因此：

```text
Logon ID
→ 登录会话之间的关联
```

而：

```text
PID / PPID
→ 进程之间的父子关联
```

---

# 十三、PID 会重复使用

PID 并不是永久唯一编号。

例如：

```text
上午：

notepad.exe
PID 5000
```

进程退出以后，过了一段时间：

```text
chrome.exe
PID 5000
```

也是可能的。

因此安全分析不能只看：

```text
PID = 5000
```

就认为一定是同一个进程。

还需要结合：

```text
时间
进程名
父进程
日志
```

一起判断。

---

# 十四、explorer.exe 是什么

今天实机中看到：

```text
explorer.exe
```

它是 Windows 非常重要的：

```text
Windows Shell / Windows Explorer
```

可以先理解成：

> Windows 图形桌面与文件资源管理相关的重要进程。

例如我们平时看到和使用的很多图形界面行为，都和 `explorer.exe` 有关系：

```text
桌面
任务栏
文件资源管理器
从图形界面启动程序
```

因此看到：

```text
explorer.exe
↓
powershell.exe
```

一种常见情况就是：

> 用户从 Windows 图形界面启动了 PowerShell。

---

# 十五、父进程权限一定高于子进程吗

不是。

这是今天纠正的一个重要误区：

```text
父进程
≠
权限一定更高
```

父子进程关系说明的是：

```text
谁创建了谁
```

权限关系描述的是：

```text
谁拥有什么权限
```

这是两个完全不同的问题。

---

# 十六、Access Token 和父子进程

普通情况下，子进程通常会在父进程的安全上下文基础上运行。

例如：

```text
explorer.exe
普通用户
↓
powershell.exe
普通用户
```

这里并不能说：

```text
explorer.exe 权限 > powershell.exe
```

它们可能处于相同用户的安全上下文中。

---

# 十七、子进程甚至可能拥有更高权限

例如：

```text
explorer.exe
普通用户权限
```

用户选择：

```text
以管理员身份运行 PowerShell
```

然后经过：

```text
UAC
```

最终可能得到：

```text
powershell.exe
管理员权限
```

此时可能出现：

```text
父进程权限
<
子进程权限
```

因此：

> 不能通过父子进程关系直接推断谁权限更高。

---

# 十八、PID / PPID 与 Access Token 的区别

今天需要牢牢记住：

```text
PID / PPID
→ 进程关系
```

而：

```text
SID / Access Token / Privileges
→ 身份与权限
```

所以：

```text
PPID
告诉我：
“谁启动了我？”
```

而：

```text
Access Token
告诉我：
“我是谁，我拥有哪些身份和权限信息？”
```

---

# 十九、今天的实机命令

在 PowerShell 中执行：

```powershell
Get-CimInstance Win32_Process |
Select-Object Name, ProcessId, ParentProcessId |
Sort-Object ProcessId |
Format-Table -AutoSize
```

---

# 二十、命令逐部分解释

## Get-CimInstance Win32_Process

```powershell
Get-CimInstance Win32_Process
```

获取 Windows 当前进程信息。

---

## Select-Object

```powershell
Select-Object Name, ProcessId, ParentProcessId
```

只显示：

```text
Name
ProcessId
ParentProcessId
```

即：

```text
进程名
PID
PPID
```

---

## Sort-Object

```powershell
Sort-Object ProcessId
```

根据：

```text
PID
```

进行排序。

---

## Format-Table

```powershell
Format-Table -AutoSize
```

把结果以表格形式显示。

---

# 二十一、今天的真实实机结果

今天在自己的电脑上观察到：

```text
powershell.exe
PID 8948
PPID 9368
```

同时：

```text
explorer.exe
PID 9368
```

因此：

```text
explorer.exe
PID 9368
   ↓
powershell.exe
PID 8948
```

这说明：

> 这次观察中的 PowerShell 父进程是 explorer.exe。

---

# 二十二、另一条真实进程链

今天还观察到：

```text
explorer.exe
PID 9368
```

然后：

```text
ChatGPT.exe
PID 12908
PPID 9368
```

继续：

```text
codex.exe
PID 17160
PPID 12908
```

然后：

```text
cmd.exe
PID 17668
PPID 17160
```

因此可以画成：

```text
explorer.exe
PID 9368
   ↓

ChatGPT.exe
PID 12908
   ↓

codex.exe
PID 17160
   ↓

cmd.exe
PID 17668
```

这是真正在自己电脑上观察到的一条进程树分支。

---

# 二十三、今天最重要的完整知识链

目前可以把前几天学过的概念逐渐连接起来：

```text
SID
↓
哪个安全主体 / 用户
```

```text
Access Token
↓
这个登录后的身份、组和权限信息
```

```text
Logon ID
↓
是哪一次登录会话
```

```text
PID
↓
是哪一个具体进程
```

```text
PPID
↓
是谁启动了这个进程
```

最终：

```text
用户登录
↓
Logon ID

进程创建
↓
4688

具体哪个进程
↓
PID

谁创建了它
↓
PPID

多个父子关系
↓
Process Tree
```

---

# 二十四、常见误区

## 误区 1

```text
powershell.exe 出现
=
攻击
```

错误。

PowerShell 是正常 Windows 管理工具。

必须结合上下文分析。

---

## 误区 2

```text
父进程
=
权限更高
```

错误。

父子关系说明：

```text
谁创建谁
```

不是权限高低关系。

---

## 误区 3

```text
PID 一样
=
永远是同一个进程
```

错误。

PID 在进程退出以后可能被重新利用。

---

## 误区 4

```text
进程树
=
整个事件时间线
```

错误。

进程树主要表示：

```text
进程父子关系
```

如果加入：

```text
4624
Logon ID
时间
网络来源
```

才是在进一步构造：

```text
安全事件时间线
```

---

# 二十五、今天应该记住什么

今天最重要的五句话：

```text
1. PID = 当前具体是哪一个进程。

2. PPID = 谁启动了这个进程。

3. PPID 找到对应 PID，就可以寻找父进程。

4. 多个父子进程关系连接起来，就是进程树。

5. 父进程启动子进程，不代表父进程权限一定高于子进程。
```

再加上之前的知识：

```text
SID
→ 谁

Logon ID
→ 哪一次登录

PID
→ 哪一个进程

PPID
→ 谁启动它

Access Token
→ 身份和权限信息
```

---

# 二十六、今日状态

已完成：

- 理解 Process
- 理解 PID
- 理解 PID 属于当前进程状态
- 理解 4688 可以记录进程创建历史
- 理解 PPID
- 学会根据 PID / PPID 寻找父子进程
- 理解 Process Tree
- 能把 Logon ID 与进程行为进行关联
- 理解 explorer.exe 的基本作用
- 理解父子进程关系不等于权限高低
- 使用 PowerShell 查看本机真实 PID / PPID
- 从自己的电脑中成功找出真实进程树

今天没有继续学习：

```text
进程注入
DLL
恶意持久化
更复杂的进程攻击技术
```

这些不属于 Day 8 内容。

---

# 二十七、今日总结

今天从昨天的 Windows Event Log 继续向下学习了 Windows 进程。

昨天主要回答：

```text
谁登录了？
是哪一次登录？
发生了什么事件？
```

今天继续回答：

```text
运行了什么程序？
具体是哪一个进程？
是谁启动了这个进程？
这些进程之间是什么关系？
```

核心链路已经逐渐变成：

```text
4624
用户登录
↓
Logon ID
区分登录会话
↓
4688
进程创建
↓
PID
区分具体进程
↓
PPID
寻找父进程
↓
Process Tree
还原进程关系
```

今天最重要的认识：

> 安全分析不是看到某一个程序就判断攻击，而是通过 Logon ID、PID、PPID、时间和日志，把行为之间的关系逐渐串起来。

---

# 下一次学习

下一次继续沿当前 Windows 安全路线学习。

开始前仍然：

```text
先短复习
↓
再进入新知识
```

并且不要把今天已经完成的：

```text
PID
PPID
Process Tree
```

再次作为新课重复讲解。
