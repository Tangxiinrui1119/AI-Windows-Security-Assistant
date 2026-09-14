# Kerberos 深入理解：Ticket 与 Session Key（Day 6）

> 📅 学习日期：2026-09-14（三年计划 Day 6）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[04 · Windows 域安全：Kerberos、KDC、TGT、TGS、SPN、Kerberoasting 与 AD](04-windows-kerberos-ad.md)
> 学习主题：Kerberos Ticket / Session Key / Pass-the-Ticket
> 学习阶段：信息安全基础
> 🎯 学习目的：理解 Kerberos 票据与会话密钥的机制，为后续防御与检测打基础。

## 今日目标

在掌握 Kerberos 基础流程：

```text
用户登录 → KDC → TGT → TGS → Service Ticket → 服务访问
```

之后，进一步理解：

1. Kerberos Ticket 为什么不能被客户端随意修改
2. Service Ticket 的作用
3. Session Key 的作用
4. Ticket 与 Session Key 的区别
5. Pass-the-Hash、Pass-the-Ticket、Kerberoasting 的区别

---

# 一、Kerberos Ticket 为什么不能被随意修改？

## 1. 问题

如果攻击者获得了一个 Service Ticket：

```text
User: Alice
Service: FileServer
```

攻击者是否可以直接修改：

```text
Alice
↓
Administrator
```

然后冒充管理员访问？

答案：**不能**。

## 2. 原因

Kerberos Ticket 不是普通文本。Ticket 由 KDC 生成，并且受到目标服务密钥保护。

流程：

```text
KDC 生成 Ticket
  ↓
使用目标服务密钥保护
  ↓
Service Ticket
  ↓
客户端携带 Ticket
  ↓
目标服务器验证 Ticket
```

客户端可以：

- 保存 Ticket
- 传递 Ticket

但是不能：

- 解密 Ticket
- 修改 Ticket 内容
- 重新生成合法 Ticket

原因：**客户端没有目标服务的秘密密钥**。

## 3. 服务器如何发现 Ticket 被修改？

不是服务器提前保存了一份正确 Ticket，而是服务器收到 Ticket 后：

```text
收到 Ticket
  ↓
使用自己的密钥验证
  ↓
验证失败
  ↓
拒绝访问
```

原因：加密不仅提供：

### Confidentiality（机密性）
防止别人读取内容。

### Integrity（完整性）
防止别人偷偷修改内容。

攻击者即使修改 Ticket，也无法生成一个合法的新 Ticket。

---

# 二、Service Ticket 的作用

Service Ticket 主要解决：

> 「服务器为什么相信你是谁？」

也就是：Authentication（认证）。

流程：

```text
Alice
  ↓
Service Ticket
  ↓
FileServer
  ↓
验证 Ticket
  ↓
确认 Alice 身份
```

Ticket 可以理解为：**KDC 认可的身份凭证**。

---

# 三、Session Key（会话密钥）

## 1. 为什么需要 Session Key？

Kerberos 完成身份认证后，客户端和服务器还需要继续通信。

例如：

```text
Alice:      我要读取文件
FileServer: 返回文件内容
```

如果通信没有保护，攻击者可能监听数据。

因此需要 Session Key（会话密钥）。

作用：**保护客户端和服务器之间的后续通信**。

---

# 四、Ticket 和 Session Key 的区别

| | Ticket | Session Key |
|-|-|-|
| 作用 | 证明身份 | 保护通信 |
| 解决问题 | 你是谁？ | 怎么安全交流？ |
| 生成者 | KDC | KDC |
| 使用对象 | 服务器验证 | 客户端与服务器通信 |
| 生命周期 | 临时 | 临时 |

记忆：

```text
Ticket = 身份证明

Session Key = 通信钥匙
```

---

# 五、Authentication 和 Authorization 区别

Kerberos 负责 Authentication（认证），解决「你是谁？」。

ACL 负责 Authorization（授权），解决「你能做什么？」。

完整流程：

```text
Kerberos
  ↓
确认身份
  ↓
Service Ticket
  ↓
服务器知道是谁
  ↓
ACL 检查权限
  ↓
决定允许什么操作
```

---

# 六、攻击方式复习

## 1. Pass-the-Hash（PTH）

对象：NTLM Hash

流程：

```text
获取 NTLM Hash
  ↓
利用 Hash 进行认证
  ↓
冒用身份
```

核心：**Hash 本身成为认证凭据**。

## 2. Pass-the-Ticket（PTT）

对象：Kerberos Ticket

流程：

```text
获取合法 Ticket
  ↓
直接使用 Ticket
  ↓
冒用身份访问服务
```

核心：**利用已经认证过的票据**。

> 扩展知识：实际利用时，PTT 还需要与 Ticket 配套的 Session Key 一起窃取/使用（票据和对应会话密钥是一对）。Day 7 的 AS/TGS 报文流程会展开这一点。

## 3. Kerberoasting

对象：Service Ticket 中与服务账户相关的信息。

目的：离线猜测服务账户密码。

区别：

```text
Pass-the-Ticket：拿 Ticket 直接使用

Kerberoasting：拿 Ticket 进行离线破解
```

---

# 今日知识总结

## 1. Kerberos Ticket 为什么不能被随便修改？

因为：

- Ticket 受到目标服务密钥保护
- 攻击者没有对应密钥
- 无法生成合法修改后的 Ticket

## 2. Ticket 和 Session Key 区别

```text
Ticket：证明身份

Session Key：保护通信
```

## 3. Windows 安全认证链

```text
用户
  ↓
Kerberos / NTLM
  ↓
Authentication（认证）
  ↓
ACL
  ↓
Authorization（授权）
```

## 4. 不同攻击对应不同凭据

```text
NTLM Hash
  ↓
Pass-the-Hash

Kerberos Ticket
  ↓
Pass-the-Ticket

Service Ticket 相关材料
  ↓
Kerberoasting
```

---

# 下一步学习计划

Day 7：Kerberos 完整认证流程：

```text
AS-REQ / AS-REP
TGS-REQ / TGS-REP
```

深入理解：

1. 用户如何获得 TGT
2. 用户如何获得 Service Ticket
3. KDC 在每一步做了什么
4. Kerberos 完整认证链路
