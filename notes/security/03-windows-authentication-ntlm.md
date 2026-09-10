# Windows 身份认证与授权体系（二）：Hash、SAM、LSASS 与 NTLM

> 📅 学习日期：2026-09-09（三年计划 Day 4）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[01 · Windows 权限基础（Access Token / ACL）](01-windows-permissions-basics.md) ｜ [02 · Windows ACL 实机验证](02-windows-acl-effective-permissions.md)
> 学习主题：Windows 身份认证与授权体系
> 学习阶段：信息安全基础
> 🎯 学习目的：理解 Windows 认证机制与常见攻击原理，为后续防御与检测打基础。

## 今日主题

Windows 身份认证深入：

- Hash
- SAM
- LSASS
- NTLM 认证协议
- Pass-the-Hash 攻击
- Access Token
- Authentication 与 Authorization 的关系

---

# 一、Authentication 与 Authorization

## 1. Authentication（认证）

作用：

> 确认「你是谁」。

例如：用户登录 Windows：

```text
用户名 + 密码
```

系统需要验证：

```text
这个密码是否属于这个用户？
```

## 2. Authorization（授权）

作用：

> 确认「你能做什么」。

认证成功后，Windows 不会每次访问文件都重新验证密码，而是使用：

```text
Access Token
```

进行权限判断。

关系：

```text
Authentication
        |
        ↓
生成身份信息
        |
        ↓
Authorization
        |
        ↓
判断资源权限
```

---

# 二、Hash 基础

## 1. 什么是 Hash？

Hash 是一种单向计算方式：

```text
明文
 |
 | Hash算法
 ↓
Hash值
```

例如：

```text
密码: 123456
经过 Hash 得到: xxxxxxxx
```

注意：**Hash 值 ≠ 明文密码**。

Hash 不是加密：

- 加密：可以通过密钥解密
- Hash：设计目标是不可逆

## 2. 为什么弱密码容易破解？

不是因为 Hash 算法弱，原因：**密码空间太小或者密码太常见**。

例如 `123456`、`password`、`admin` 存在于攻击者字典中。

攻击过程：

```text
猜测密码
  ↓
计算 Hash
  ↓
与目标 Hash 比较
  ↓
匹配成功
```

密码强度取决于：

1. 长度
2. 字符组合数量
3. 是否容易被预测

---

# 三、SAM 数据库

## 1. SAM 是什么？

SAM：Security Account Manager，保存 Windows 本地账户信息。

包括：

```text
用户名
SID
密码 Hash
```

例如：

```text
Alice
SID: S-1-5-21-xxxx
NTLM Hash: xxxxxx
```

位置：

```text
C:\Windows\System32\config\SAM
```

## 2. 为什么 SAM 重要？

因为 SAM 保存本地账户认证相关信息。如果攻击者获取 SAM，可能获得：

- 用户 Hash
- 管理员 Hash

风险：可能进行：

- 密码破解
- 身份冒充
- 权限提升

---

# 四、LSASS

## 1. LSASS 是什么？

全称：Local Security Authority Subsystem Service

对应进程：

```text
lsass.exe
```

作用：Windows 安全认证核心。负责：

- 用户登录验证
- 调用认证协议
- 创建 Access Token
- 管理认证相关信息

---

# 五、Windows 登录流程

```text
用户输入密码
  ↓
Winlogon 接收登录
  ↓
LSASS 处理认证
  ↓
读取 SAM 中的账户信息
  ↓
验证密码 Hash
  ↓
认证成功
  ↓
创建 Access Token
  ↓
用户进入系统
```

---

# 六、NTLM

## 1. NTLM 是什么？

NTLM：NT LAN Manager。它不是 Hash，而是 **Windows 身份认证协议**。

作用：让客户端证明：

> 「我是这个用户，并且我知道对应的秘密。」

## 2. NTLM 与 Hash 关系

```text
密码
 ↓
Hash 算法
 ↓
NTLM Hash
 ↓
NTLM 认证协议使用
```

注意：**NTLM 协议 ≠ NTLM Hash**。

---

# 七、NTLM Challenge-Response 认证

## 为什么需要 Challenge-Response？

因为不能直接发送密码。如果：

```text
客户端 ----密码----> 服务器
```

密码可能被监听。所以 NTLM 设计：**不发送密码，只证明知道密码**。

## 认证流程

### 第一步：客户端请求登录

```text
我是 Alice
```

### 第二步：服务器发送随机 Challenge

```text
Challenge = 随机值
```

### 第三步：客户端计算 Response

使用：

```text
NTLM Hash + Challenge
```

生成：

```text
Response
```

发送给服务器。

### 第四步：服务器验证

服务器自己计算「预期 Response」，比较：

```text
客户端 Response  VS  服务器 Response
```

一致 → 认证成功。

---

# 八、Pass-the-Hash 攻击

## 1. 什么是 Pass-the-Hash？

不是破解 Hash，而是：**利用已经获取的 Hash 直接冒充用户进行认证**。

## 2. 与暴力破解区别

| 攻击 | 目标 |
| ---- | ---- |
| 暴力破解 | 得到明文密码 |
| Pass-the-Hash | 不需要密码，直接冒充身份 |

## 3. 为什么 Hash 可以被利用？

因为 NTLM 认证过程中，Hash 属于认证秘密材料。攻击者获得 Hash，可以参与认证流程：

```text
获取用户 Hash
  ↓
进行 NTLM 认证
  ↓
冒充用户
  ↓
获得该用户身份
```

---

# 九、Access Token

## 1. 什么是 Access Token？

Access Token：**Windows 认证成功后生成的用户身份凭证**。可以理解为用户登录后的「身份证」。

## 2. Token 包含内容

### User SID
表示：

```text
你是谁
```

### Group SID
表示：

```text
你属于哪些组
```

例如：

```text
Users
Administrators
```

### Privileges
系统权限，例如：

```text
SeBackupPrivilege
SeDebugPrivilege
```

---

# 十、Token 与 ACL 权限判断

访问文件（例如 `secret.txt`）时，Windows 不会查看密码、Hash，而是：

```text
Access Token + ACL
  ↓
ACE 匹配
  ↓
Allow / Deny
```

例：

```text
Token:
Alice
Developers

ACL:
Alice:      Deny Read
Developers: Allow Read
```

结果：

```text
拒绝读取
```

原因：显式 Deny 优先级最高。

> 与 Day 3 的判断链一致：先用 Token 里的 SID 匹配 ACE，再落到具体请求的权限（Read）上——这里 Alice 自己的 SID 匹配到了显式 Deny Read，所以拒绝。不是「因为 Deny 所以永远赢」，而是「匹配到了这条显式 Deny，且请求的正是 Read」。

---

# 十一、完整 Windows 安全链

```text
用户
 ↓
密码
 ↓
Hash
 ↓
NTLM 认证
 ↓
LSASS
 ↓
Access Token
 ↓
ACL 检查
 ↓
文件权限
```

---

# 十二、核心总结

1. Hash 不是密码，而是密码经过算法后的结果。
2. SAM 保存本地账户信息和密码 Hash。
3. LSASS 负责 Windows 身份认证，并创建 Access Token。
4. NTLM 是一种身份认证协议，通过 Challenge-Response 验证身份。
5. Pass-the-Hash 不是破解 Hash，而是利用 Hash 冒充用户。
6. Authentication 解决「你是谁」。
7. Authorization 解决「你能做什么」。
8. 文件权限判断依靠：

```text
Access Token + ACL
```

而不是密码或 Hash。

---

# 今日知识地图

```text
身份(SID)
  ↓
认证(Authentication)
密码
 ↓
Hash
 ↓
NTLM
 ↓
LSASS
  ↓
Access Token
  ↓
授权(Authorization)
ACL
 ↓
ACE
  ↓
资源权限
```

> 续篇：[04 · Windows 域安全：Kerberos、KDC、AD 与 Kerberoasting](04-windows-kerberos-ad.md)（Day 5，2026-09-10）—— 域环境下的认证体系 Kerberos
