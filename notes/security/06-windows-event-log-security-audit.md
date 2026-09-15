# Windows 事件日志与安全审计（Day 7）

> 📅 学习日期：2026-09-15（三年计划 Day 7）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[05 · Kerberos 深入理解：Ticket 与 Session Key（Day 6）](05-windows-kerberos-ticket-session-key.md)
> 学习主题：Windows Event Log / Security Log / Event ID / Logon Type / Logon ID / Audit / Timeline
> 学习阶段：信息安全基础
> 🎯 学习目的：理解 Windows 安全日志与审计，利用事件字段关联登录会话、还原时间线，并区分客观事实与猜测。

---

## 一、今天学了什么

今天开始学习 Windows 安全中的日志与审计，核心目标是：

> 当登录、认证、进程启动等行为发生以后，Windows 是如何记录这些行为的，以及安全人员如何利用日志还原事件时间线。

今天涉及的主要知识：

- Windows Event Log
- Event Viewer
- Security Log
- Event ID
- Logon Type
- Source Network Address
- Logon ID
- Windows Audit
- Timeline 时间线分析
- 4624 / 4625 / 4634 / 4688
- 实机查看 Windows Security 日志

---

# 二、Windows Event Log 是什么

Windows Event Log，即：

> Windows 事件日志。

可以把它理解成 Windows 自己维护的一套“系统日记”。

Windows 中发生很多事情以后，都可能产生事件，例如：

```text
用户登录
用户登录失败
服务启动
程序崩溃
账户变化
进程启动
系统错误
安全相关行为
```

每一条记录称为：

```text
Event
```

即“事件”。

---

# 三、Event Viewer

Windows 自带：

```text
Event Viewer
```

中文：

```text
事件查看器
```

可以使用：

```text
Win + R
```

然后输入：

```text
eventvwr.msc
```

打开。

常见日志分类：

```text
Application
Security
System
```

含义：

```text
Application
应用程序相关事件

Security
安全事件

System
Windows 系统本身的事件
```

目前 Windows 安全学习最关注：

```text
Security Log
```

---

# 四、Event ID

Windows 会给不同种类的事件分配一个编号：

```text
Event ID
```

即：

```text
事件编号
```

今天需要认识的四个：

```text
4624
登录成功

4625
登录失败

4634
登录会话结束

4688
新进程创建
```

注意：

不能只看到一个 Event ID 就判断是否存在攻击。

例如：

```text
4625
4625
4625
4624
```

只能确定：

```text
连续登录失败后成功登录。
```

可能是：

```text
用户自己输错密码
```

也可能是：

```text
异常的凭据尝试
```

因此：

> 日志告诉我们“发生了什么”，但不一定直接告诉我们“为什么发生”。

---

# 五、Logon Type

即使都是：

```text
4624
```

也不代表登录方式完全一样。

Windows 使用：

```text
Logon Type
```

表示登录方式。

今天见过：

| Logon Type | 名称 | 含义 |
|---|---|---|
| 2 | Interactive | 本地交互式登录 |
| 3 | Network | 网络登录 |
| 5 | Service | 服务登录 |
| 7 | Unlock | 解锁已有会话 |
| 10 | RemoteInteractive | 远程交互式登录，常见于 RDP |
| 11 | CachedInteractive | 使用缓存凭据进行交互式登录 |

---

# 六、Logon Type 2

```text
Type 2
Interactive
```

可以理解为：

> 用户人在电脑前进行本地交互式登录。

例如：

```text
输入密码 / PIN
进入 Windows 桌面
```

---

# 七、Logon Type 3

```text
Type 3
Network
```

表示通过网络访问计算机资源。

例如以后可能遇到：

```text
访问共享文件
访问网络服务
```

它不等于：

```text
用户一定进入了远程桌面。
```

---

# 八、Logon Type 5

```text
Type 5
Service
```

表示：

> Windows 服务建立登录会话。

今天在自己的电脑上真正看到了一个 Type 5。

真实日志：

```text
Event ID: 4624
Account Name: SYSTEM
Logon Type: 5
Logon ID: 0x3E7
Process:
C:\Windows\System32\services.exe
Source Network Address: -
```

可以翻译成人话：

> Windows 的 services.exe 为 SYSTEM 系统账户建立了一个服务类型的登录会话。

这个事件本身非常符合正常 Windows 系统行为。

---

# 九、SYSTEM

日志中看到：

```text
NT AUTHORITY\SYSTEM
```

这是 Windows 非常高权限的内置系统账户。

对应 SID：

```text
S-1-5-18
```

这和之前学习 SID 的知识连接起来：

```text
SYSTEM
↓
也是一个安全主体
↓
也拥有自己的 SID
↓
S-1-5-18
```

所以：

> SID 不只是普通用户才有。

---

# 十、0x3E7

今天实机日志中还看到：

```text
Logon ID: 0x3E7
```

这个值经常和：

```text
SYSTEM
```

系统上下文相关。

但安全分析不能只凭：

```text
0x3E7
```

就直接下结论。

仍然需要一起看：

```text
Account Name
Process Name
Logon Type
Event ID
```

---

# 十一、Logon Type 7

```text
Type 7
Unlock
```

表示：

> 解锁一个已经存在的 Windows 会话。

例如：

```text
用户已经登录
↓
锁屏
↓
回来输入 PIN / 密码
↓
解锁
```

它和重新完整建立一个普通登录会话不是完全一回事。

---

# 十二、Logon Type 10

```text
Type 10
RemoteInteractive
```

表示远程交互登录。

常见场景：

```text
RDP
Remote Desktop
远程桌面
```

例如：

```text
4624
User: Alice
Logon Type: 10
Time: 02:16
```

如果 Alice 平时不在凌晨远程办公，则：

```text
可疑
```

但不能直接说：

```text
Alice 被黑了
```

正确思路应该是继续调查：

```text
是不是 Alice 本人？
是否经过授权？
来源地址是什么？
之后做了什么？
```

---

# 十三、Logon Type 11

```text
Type 11
CachedInteractive
```

即：

```text
缓存交互式登录
```

主要容易在域环境中出现。

例如：

```text
Alice 平时用 AD 域账号登录公司笔记本
↓
电脑之前成功验证过该账户
↓
Windows 保留必要的缓存登录信息
↓
某次无法联系域控制器
↓
Alice 仍然可以登录
```

这时可能看到：

```text
Logon Type 11
```

简单记忆：

```text
Type 2
普通交互登录

Type 11
利用缓存凭据进行交互式登录
```

---

# 十四、Source Network Address

登录事件中可能看到：

```text
Source Network Address
```

即：

> 网络登录请求来自什么地址。

例如：

```text
Source IP:
192.168.1.77
```

在分析远程登录时，可以继续追查：

```text
这个 IP 属于谁？
是不是正常设备？
平时是否出现过？
```

但是：

如果看到：

```text
Source Network Address: -
```

不一定代表异常。

例如今天的 Type 5 Service 登录：

```text
services.exe
SYSTEM
Type 5
```

本来就是本机内部服务行为，因此没有网络来源地址很正常。

---

# 十五、Logon ID

今天最重要的字段之一：

```text
Logon ID
```

可以先理解成：

> 某一次具体登录会话的编号。

例如：

```text
User: Bob
Logon ID: 0x1234
```

Bob 可能同时存在：

```text
本地登录
RDP 登录
其他会话
```

因此：

```text
User = 哪个账户

Logon ID = 这个账户的哪一次具体登录会话
```

---

# 十六、为什么不能只看用户名

例如：

```text
02:00
4624
User: Bob
Logon ID: 0x1234
```

后来：

```text
02:03
4688
User: Bob
Process: powershell.exe
Logon ID: 0x9999
```

以及：

```text
02:05
4688
User: Bob
Process: cmd.exe
Logon ID: 0x1234
```

虽然两个进程都是：

```text
Bob
```

但真正更有理由和 02:00 登录关联的是：

```text
cmd.exe
```

因为：

```text
Logon ID = 0x1234
```

相同。

而：

```text
powershell.exe
```

属于：

```text
0x9999
```

不能只因为用户名都是 Bob 就硬关联到同一会话。

---

# 十七、同一个用户也可以拥有多个 Logon ID

以前容易误以为：

> 不同 Logon ID = 不同用户。

这是错误的。

例如：

```text
Bob 本地登录
User: Bob
Logon ID: 0x1111
```

同时：

```text
Bob 又通过远程桌面登录
User: Bob
Logon ID: 0x2222
```

所以：

> 同一个账户可以同时存在多个不同登录会话。

---

# 十八、4634

```text
Event ID 4634
```

表示：

> 登录会话结束。

今天实机找到了：

```text
Event ID: 4634
Account: 73360
Logon ID: 0xFFF5D73
Logon Type: 2
```

可以理解为：

> 账户 73360 的某个本地交互式登录会话已经结束。

其中：

```text
Logon Type 2
```

说明是交互式登录会话。

而：

```text
Logon ID 0xFFF5D73
```

理论上可以用来寻找对应的：

```text
4624
```

从而得到：

```text
4624
会话创建
↓
中间行为
↓
4634
会话结束
```

---

# 十九、4688

```text
Event ID 4688
```

表示：

> 一个新进程被创建。

例如可能记录：

```text
notepad.exe
cmd.exe
powershell.exe
```

安全调查中，可以利用 4688 了解：

> 某次登录之后启动过哪些程序。

例如：

```text
02:00
4624
Bob
Logon ID: 0x1234

02:05
4688
Bob
Logon ID: 0x1234
Process: powershell.exe
```

就可以把：

```text
登录
↓
进程启动
```

串起来。

---

# 二十、PowerShell 不等于攻击

看到：

```text
powershell.exe
```

不能直接认为：

```text
黑客攻击
```

因为正常用户、管理员、软件也可能使用 PowerShell。

应该继续调查：

```text
是谁启动的？
什么时间？
属于哪个 Logon ID？
执行了什么命令？
运行的脚本是什么？
这个行为平时是否正常？
```

---

# 二十一、Command Line

如果系统启用了相关记录，可以在 4688 等事件中看到：

```text
Command Line
```

例如：

```text
Process:
powershell.exe

Command Line:
powershell.exe -File backup.ps1
```

这比单纯看到：

```text
powershell.exe
```

信息更多。

因为现在知道它运行了：

```text
backup.ps1
```

但是：

```text
backup.ps1
```

仍然不一定恶意。

需要继续分析脚本内容和运行背景。

---

# 二十二、Windows Audit

今天学习：

```text
Audit
```

即：

```text
审计
```

可以理解为：

> 让系统记录某些安全相关行为，以便之后进行调查。

例如：

```text
登录审计
进程创建审计
账户管理审计
```

一个非常重要的事实：

> Windows 不会无限详细地记录所有行为。

某些日志只有开启对应审计以后才会产生。

---

# 二十三、为什么审计必须提前开

假设：

```text
昨天
发生可疑进程行为
```

但是：

```text
昨天没有开启进程创建审计
```

今天才开启：

```text
进程创建审计
```

那么不能指望 Windows 自动补回：

```text
昨天所有没有记录的 4688
```

因为：

> 当时没记录下来的事件，不会因为后来开启审计而凭空出现。

所以：

```text
日志和审计必须提前配置。
```

---

# 二十四、Timeline 时间线分析

安全人员分析日志时，不应该只看孤立事件。

应该尽量构建：

```text
Timeline
```

即：

```text
时间线
```

例如：

```text
01:58
4625
Bob
Type 10
登录失败

↓

01:59
4625
Bob
Type 10
再次失败

↓

02:00
4624
Bob
Type 10
Source IP: 192.168.1.77
Logon ID: 0x1234
登录成功

↓

02:04
4688
Bob
Logon ID: 0x1234
powershell.exe

↓

02:20
4634
Bob
会话结束
```

现在我们可以确认一些事实：

```text
Bob 账户发生远程登录
先失败后成功
成功后建立了一次会话
该会话中启动了一些进程
之后会话结束
```

但仍然不能只凭这些直接判断：

```text
一定发生了攻击
```

---

# 二十五、安全分析中的“事实”和“猜测”

这是今天最重要的思维之一。

例如：

```text
4625
4625
4624
```

事实是：

```text
发生两次登录失败
随后登录成功
```

猜测可能是：

```text
有人尝试密码
```

但是也可能只是：

```text
用户忘记密码
```

因此调查时应该区分：

```text
我知道什么
```

和：

```text
我猜测什么
```

---

# 二十六、日志调查基本思路

可以使用：

```text
谁
何时
何地
做什么
```

展开分析。

例如：

```text
谁：
Alice

何时：
03:12

哪里来：
10.0.0.23

怎么登录：
Logon Type 10

成功还是失败：
4624

哪一次会话：
Logon ID 0xABCD

登录以后：
4688
powershell.exe
```

可以进一步调查：

```text
Alice 是否本人操作？
来源 IP 是什么设备？
这个登录时间正常吗？
这个 Logon ID 后续启动了什么？
运行了哪些程序？
有没有账户、权限或文件相关异常？
```

---

# 二十七、今天实机实验

## 1. 打开事件查看器

```text
Win + R
```

输入：

```text
eventvwr.msc
```

进入：

```text
Windows 日志
↓
安全
```

然后可以使用：

```text
筛选当前日志
```

例如筛选：

```text
4624,4625,4634
```

---

## 2. 实际看到的 4624

真实机器日志：

```text
Event ID: 4624

Account:
SYSTEM

SID:
S-1-5-18

Logon Type:
5

Logon ID:
0x3E7

Process:
C:\Windows\System32\services.exe

Source Network Address:
-
```

分析：

```text
4624
↓
登录成功事件

SYSTEM
↓
Windows 内置系统账户

S-1-5-18
↓
SYSTEM 对应 SID

Type 5
↓
服务登录

services.exe
↓
Windows 服务相关系统进程

Source IP -
↓
本机服务行为，不是典型远程网络登录
```

初步判断：

> 与正常 Windows 系统服务行为相符。

---

## 3. 实际看到的 4634

```text
Event ID: 4634

Account:
73360

Logon ID:
0xFFF5D73

Logon Type:
2
```

分析：

```text
4634
↓
登录会话结束

Type 2
↓
本地交互式会话

Logon ID 0xFFF5D73
↓
可以尝试关联之前同一 Logon ID 的 4624
```

---

# 二十八、容易犯的错误

## 错误 1

看到：

```text
4624
```

就认为：

```text
有人坐在电脑前输入密码登录
```

错误。

应该继续看：

```text
Logon Type
```

因为：

```text
Type 5
```

可能只是 Windows 服务。

---

## 错误 2

看到：

```text
powershell.exe
```

就认为：

```text
攻击行为
```

错误。

PowerShell 本身只是正常 Windows 工具。

必须结合上下文判断。

---

## 错误 3

用户名相同，就认为属于同一登录会话。

错误。

例如：

```text
Bob
Logon ID 0x1111
```

和：

```text
Bob
Logon ID 0x2222
```

可以是两个不同会话。

---

## 错误 4

看到异常行为就立刻定性。

例如：

```text
凌晨 RDP 登录
```

只能先说：

```text
可疑
```

应该继续验证：

```text
是否本人登录
是否有授权
来源 IP
后续进程
其他日志
```

---

## 错误 5

认为事后打开审计就可以恢复以前所有日志。

错误。

```text
当时没记录
=
后来不会自动补出来
```

---

# 二十九、和之前知识的连接

目前学习链条：

```text
SID
↓
标识“你是谁”

Access Token
↓
保存登录后的身份、组和权限信息

ACL / ACE
↓
判断能否访问资源

SAM / NTLM
↓
本地账户与身份认证

AD / Kerberos
↓
域环境中的身份认证

TGT / Service Ticket
↓
Kerberos 票据体系

Windows Event Log
↓
把认证、登录、进程等行为留下记录

Audit
↓
决定哪些行为会留下日志

Timeline
↓
把日志串起来还原发生了什么
```

---

# 三十、今天最需要记住的内容

```text
4624 = 登录成功

4625 = 登录失败

4634 = 登录会话结束

4688 = 新进程创建
```

以及：

```text
Logon Type
=
怎么登录的
```

```text
Logon ID
=
具体是哪一次登录会话
```

```text
Source Network Address
=
网络登录从哪里来
```

```text
Audit
=
决定系统记录哪些安全行为
```

```text
Timeline
=
把多个事件按时间串起来进行分析
```

安全调查最重要的原则：

> 先确认客观事实，再判断是否异常，最后继续寻找证据，不要根据单条日志直接下结论。

---

# 三十一、下一步

Day 7 已完成：

- Windows Event Log 基础
- Security Log
- Event ID
- Logon Type
- Logon ID
- Source IP
- Audit
- Timeline
- Event Viewer 实机查看
- 4624 / 4634 实机日志分析

下次开始时：

```text
先进行 Day 7 短复习
↓
再进入 Day 8 新知识
```

复习重点：

```text
4624 / 4625 / 4634 / 4688

Logon Type 2 / 3 / 5 / 7 / 10 / 11

Logon ID 的作用

为什么不能只凭一条日志判断攻击

为什么审计必须提前开启
```
