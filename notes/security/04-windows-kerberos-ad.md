# Windows 域安全：Kerberos、KDC、TGT、TGS、SPN、Kerberoasting 与 AD

> 📅 学习日期：2026-09-10（三年计划 Day 5）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[03 · Windows 身份认证与授权体系（二）：Hash、SAM、LSASS 与 NTLM](03-windows-authentication-ntlm.md)
> 学习主题：Kerberos、KDC、TGT、TGS、SPN、Kerberoasting、Active Directory（AD）、Domain Controller（DC）
> 学习阶段：信息安全基础
> 🎯 学习目的：理解 Windows 域认证机制与相关攻击原理，为后续防御与检测打基础。

---

# 一、今日学习目标

今天主要学习 Windows 域安全中的基础认证体系，并把之前学习的 NTLM、SID、Access Token、ACL 串联起来。

核心知识：

1. NTLM 与 Kerberos 的区别
2. KDC 是什么
3. AS / TGS 的作用
4. TGT 是什么
5. SPN 是什么
6. Service Ticket 是什么
7. Kerberos 中认证与授权的区别
8. Kerberoasting 的基本原理
9. Pass-the-Hash 与 Kerberoasting 的区别
10. Active Directory（AD）是什么
11. Domain Controller（DC）是什么

---

# 二、Kerberos 是什么

Kerberos 是一种网络身份认证协议。

它和之前学习的 NTLM 都可以用于 Windows 网络中的身份认证，但工作方式不同。

## NTLM

NTLM 更接近：

```text
客户端
   │
   │ Challenge / Response
   ▼
服务器
```

服务器向客户端发送 Challenge，客户端利用自己的认证秘密计算 Response，服务器进行验证。

---

## Kerberos

Kerberos 更依赖一个可信的中心认证机构：

```text
客户端
   │
   ▼
KDC
   │
   ├── AS
   │
   └── TGS
   │
   ▼
目标服务器
```

核心思想：

> 不需要每次访问不同服务器都重新进行完整的身份认证，而是由 KDC 帮用户签发对应服务的 Ticket。

---

# 三、KDC 是什么

KDC：

```text
Key Distribution Center
密钥分发中心
```

KDC 可以理解成 Kerberos 中负责身份认证和 Ticket 签发的核心服务。

在 Windows Active Directory 域环境中，KDC 通常运行在 Domain Controller（DC）上。

KDC 主要包含两个逻辑角色：

```text
KDC
│
├── AS
│
└── TGS
```

---

# 四、AS 是什么

AS：

```text
Authentication Server
认证服务器
```

AS 主要负责用户最开始的身份认证。

用户通过初始认证后，AS 会给用户一个：

```text
TGT
```

即：

```text
Ticket Granting Ticket
票据授予票据
```

---

# 五、TGT 是什么

TGT 可以理解成：

> “这个用户已经通过域认证，可以继续向 TGS 请求其他服务的 Ticket。”

所以初学阶段可以记：

```text
TGT = 已经完成身份认证的证明
```

但要注意：

**TGT 不是拿去直接访问 FileServer 的 Service Ticket。**

---

# 六、TGS 是什么

TGS：

```text
Ticket Granting Server
票据授予服务器
```

TGS 的作用是：

> 根据用户已有的 TGT，以及用户想访问的具体服务，签发对应的 Service Ticket。

流程：

```text
用户
 │
 │ TGT + 想访问的服务
 ▼
TGS
 │
 │ Service Ticket
 ▼
用户
```

---

# 七、SPN 是什么

SPN：

```text
Service Principal Name
服务主体名称
```

SPN 不是一个服务器，也不是一个人。

它更像是：

> “我要访问的具体服务的唯一标识”。

例如：

```text
cifs/FileServer01
```

可以简单理解为：

```text
cifs
  ↓
SMB/CIFS 文件共享服务

FileServer01
  ↓
具体服务器
```

所以：

```text
cifs/FileServer01
```

表示：

> FileServer01 上的 CIFS 文件共享服务。

---

# 八、Service Ticket 是什么

Service Ticket：

> 针对某个具体服务签发的 Kerberos 票据。

例如用户想访问：

```text
cifs/FileServer01
```

那么 TGS 会根据这个服务的 SPN，签发针对该服务的 Service Ticket。

基本流程：

```text
用户
 │
 │ TGT + SPN
 ▼
TGS
 │
 │ Service Ticket
 ▼
FileServer01
```

FileServer01 可以验证：

> 这个 Ticket 是不是针对我的服务，以及这个用户是否经过 Kerberos 认证。

---

# 九、为什么 TGT 不能直接给 FileServer

TGT 和 Service Ticket 的用途不同。

可以简单记：

```text
TGT
↓
证明“我已经被域认证”
↓
用于向 TGS 请求 Service Ticket


Service Ticket
↓
针对某个具体服务
↓
用于向目标服务证明身份
```

例如：

```text
TGT
   ↓
请求
   ↓
TGS + cifs/FileServer01
   ↓
Service Ticket
   ↓
FileServer01
```

如果想访问另一个服务：

```text
SQLServer
```

就需要针对 SQL 服务获取对应的 Service Ticket。

---

# 十、非常重要：Ticket ≠ 权限

这是今天学习中最容易混淆的地方。

Kerberos Ticket 主要解决：

> “你是谁？你有没有通过认证？这个 Ticket 是不是给我的服务？”

而 ACL 解决：

> “你已经被认证了，那么你到底能对这个资源做什么？”

所以：

```text
Kerberos
   ↓
认证 Authentication
   ↓
确认身份
```

然后：

```text
SID
+
Access Token
+
ACL
   ↓
授权 Authorization
   ↓
决定具体权限
```

例如：

用户张三成功拿到访问 FileServer 的 Service Ticket。

这并不意味着：

```text
张三 = 可以读取所有文件
张三 = 可以删除所有文件
张三 = 可以修改所有文件
```

真正能不能操作文件，还要继续进行授权检查。

---

# 十一、认证和授权的区别

## Authentication

认证：

> “你是谁？”

例如：

```text
Kerberos
NTLM
```

负责身份认证。

---

## Authorization

授权：

> “你能做什么？”

例如：

```text
SID
Access Token
ACL
ACE
```

决定具体权限。

---

## 最重要的记忆方式

```text
Authentication
      ↓
     你是谁？

Authorization
      ↓
    你能干什么？
```

---

# 十二、Kerberos 完整流程

把今天学习的内容串起来：

```text
用户
 │
 │ 初始认证
 ▼
DC / KDC
 │
 ▼
AS
 │
 │ TGT
 ▼
用户
 │
 │ TGT + SPN
 ▼
TGS
 │
 │ Service Ticket
 ▼
用户
 │
 │ Service Ticket
 ▼
目标服务器
 │
 │ 验证身份
 ▼
SID / Access Token
 │
 │
 ▼
ACL / ACE
 │
 ▼
最终权限
```

可以浓缩成：

```text
AS → TGT
TGT + SPN → TGS
TGS → Service Ticket
Service Ticket → 目标服务
Token + ACL → 最终权限
```

---

# 十三、Active Directory（AD）

AD：

```text
Active Directory
```

可以理解成：

> Windows 域环境中的身份、计算机、用户组等对象的集中管理体系。

它可以管理很多东西，例如：

```text
用户
计算机
用户组
服务相关对象
域中的各种资源
```

例如一个公司可能有：

```text
公司 AD 域
│
├── 用户
│   ├── 张三
│   ├── 李四
│   └── 王五
│
├── 用户组
│   ├── 普通员工
│   └── IT管理员
│
├── 计算机
│   ├── PC-01
│   ├── PC-02
│   └── FileServer
│
└── 域控制器
```

---

# 十四、Domain Controller（DC）

DC：

```text
Domain Controller
域控制器
```

可以理解为：

> 负责管理和提供 Windows 域核心服务的服务器。

在 AD 环境中，DC 承担非常重要的身份认证和目录服务功能。

今天学到的 KDC，在 Microsoft Active Directory 环境中通常运行于 DC 上。

所以可以先记：

```text
AD
↓
整个域环境的核心目录和管理体系

DC
↓
承载域核心服务的服务器

KDC
↓
Kerberos 认证和 Ticket 服务

AS
↓
负责初始认证、发 TGT

TGS
↓
根据 TGT + SPN 发 Service Ticket
```

---

# 十五、Kerberoasting 基本原理

Kerberoasting 是一种针对 Kerberos 服务账户的攻击思路。

核心不是：

> “直接从 Service Ticket 中拿到服务账户密码。”

这是错误理解。

正确理解：

```text
服务账户密码
      ↓
派生 Kerberos 密钥
      ↓
用于保护 Service Ticket 中的相关信息
```

攻击者如果能够获得某些 Service Ticket，就可以尝试进行：

```text
Service Ticket
      ↓
离线密码猜测
      ↓
猜一个密码
      ↓
根据猜测密码计算对应密钥
      ↓
检查是否能够正确验证 Ticket 中的加密内容
```

如果服务账户密码比较弱，就可能被猜出来。

---

# 十六、为什么 Kerberoasting 可以离线猜测

关键是：

> 获取到 Ticket 后，后面的密码猜测和验证可以在攻击者自己的机器上进行。

不需要：

```text
猜密码
↓
请求服务器
↓
服务器告诉你对不对
↓
再猜下一个
↓
再请求服务器
```

而是：

```text
获得 Ticket
↓
本地猜密码
↓
本地计算
↓
本地验证
↓
继续猜
```

所以这里的：

```text
Offline
```

指的是：

> 密码猜测的验证过程不需要持续请求目标服务器。

---

# 十七、Pass-the-Hash 与 Kerberoasting

这两个不要混为一谈。

## Pass-the-Hash

针对 NTLM。

核心：

> 已经获得 NTLM Hash 后，不一定需要知道明文密码，可以直接利用 Hash 参与 NTLM 认证。

所以：

```text
获得 NTLM Hash
       ↓
直接用于 NTLM 认证
       ↓
目标服务器
```

Pass-the-Hash 本身不是离线猜密码。

---

## Offline Hash Cracking

这是另外一个概念。

例如：

```text
获得 NTLM Hash
       ↓
本地猜密码
       ↓
计算 NTLM Hash
       ↓
与已获得的 Hash 比较
```

这是离线破解。

---

## Kerberoasting

```text
获取 Kerberos Service Ticket
       ↓
本地进行密码猜测
       ↓
推导候选 Kerberos 密钥
       ↓
验证 Ticket
```

所以：

```text
Pass-the-Hash
≠
Kerberoasting
```

它们都是凭据攻击相关技术，但利用的材料和认证机制不同。

---

# 十八、Online 与 Offline 的真正区别

这里要特别记住：

**Online / Offline 说的是“验证猜测的位置”。**

不是说：

> “有没有访问服务器。”

---

## Online Guessing

```text
猜密码
 ↓
发送给服务器
 ↓
服务器判断
 ↓
正确 / 错误
```

每一次猜测都需要和服务器交互。

---

## Offline Guessing

```text
获得 Hash / Ticket 等验证材料
 ↓
本地猜密码
 ↓
本地计算
 ↓
本地验证
```

不需要每次猜测都访问服务器。

---

# 十九、Brute Force 和 Online / Offline 的关系

暴力破解（Brute Force）本身只是一种：

> 不断尝试候选密码的方式。

它既可以是：

```text
Online Brute Force
```

也可以是：

```text
Offline Brute Force
```

关键取决于：

> 每次猜测到底是在服务器上验证，还是在本地验证。

---

# 二十、今天最重要的知识地图

```text
                 Active Directory
                        │
                        ▼
               Domain Controller
                        │
                        ▼
                       KDC
                    /       \
                   /         \
                  ▼           ▼
                 AS           TGS
                  │            │
                  │            │
                 TGT      TGT + SPN
                  │            │
                  │            ▼
                  │      Service Ticket
                  │            │
                  │            ▼
                  └──────→ 目标服务
                               │
                               ▼
                         身份认证完成
                               │
                               ▼
                     SID + Access Token
                               │
                               ▼
                          ACL / ACE
                               │
                               ▼
                          最终权限
```

---

# 二十一、今日最终记忆版

如果以后忘了细节，先记下面这些：

### 1. KDC

```text
KDC = Kerberos 的核心服务
```

包含：

```text
AS + TGS
```

---

### 2. AS

```text
AS → TGT
```

负责初始认证并发 TGT。

---

### 3. TGT

```text
TGT = 已完成域认证的凭证
```

主要用于向 TGS 请求 Service Ticket。

---

### 4. SPN

```text
SPN = 某个具体服务的标识
```

例如：

```text
cifs/FileServer01
```

---

### 5. TGS

```text
TGT + SPN → TGS → Service Ticket
```

---

### 6. Service Ticket

```text
针对具体服务的 Ticket
```

用于让目标服务验证 Kerberos 身份。

---

### 7. ACL

```text
ACL = 决定身份最终能做什么
```

---

### 8. AD

```text
AD = Windows 域中的核心目录和身份管理体系
```

---

### 9. DC

```text
DC = Domain Controller
   = 域控制器
```

KDC 通常运行在 DC 上。

---

### 10. Kerberoasting

```text
获取 Service Ticket
       ↓
离线猜测服务账户密码
```

---

### 11. Pass-the-Hash

```text
获得 NTLM Hash
       ↓
直接利用 Hash 参与 NTLM 认证
```

不要把它理解成离线破解。

---

# 二十二、今日复习问题

明天开始学习前，可以尝试不看答案回答：

1. KDC 是什么？里面主要包含哪两个角色？
2. AS 和 TGS 分别负责什么？
3. TGT 和 Service Ticket 有什么区别？
4. SPN 是服务器吗？
5. 为什么访问 FileServer 后还需要检查 ACL？
6. Authentication 和 Authorization 有什么区别？
7. AD 和 DC 分别是什么？
8. Kerberoasting 为什么能够进行离线猜测？
9. Pass-the-Hash 为什么不是离线破解？
10. Online Guessing 和 Offline Guessing 的区别到底是什么？

---

# 今日一句话总结

> Kerberos 负责“证明你是谁”，AD/DC 提供域环境和核心服务，KDC 中的 AS 负责发 TGT、TGS 根据 SPN 发对应服务的 Service Ticket，而最终“你能对资源做什么”仍然由 SID、Access Token、ACL 等授权机制决定。