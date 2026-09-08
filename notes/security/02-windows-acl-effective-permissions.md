# Windows ACL 实机验证与有效权限（Day 3）

> 📅 学习日期：2026-09-08（三年计划 Day 3）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 🔗 前置笔记：[01 · Windows 权限基础：SID、Access Token、ACL、ACE 与有效权限](01-windows-permissions-basics.md)
> 学习主题：Windows ACL 实机验证 / icacls / 有效权限
> 学习阶段：信息安全基础

> 今天的定位：不是重新学习 SID、ACL 的基础定义，而是把前两天建立的理论链路放到 Windows 实机上，用 `icacls` 命令逐项验证。

---

## 一、今天的验证对象

前两天的笔记已经建立这条链：

```text
SID → 用户/组 → Access Token → ACL → ACE → Allow/Deny → Effective Permission
```

- Day 1：SID 是什么
- Day 2：ACL / ACE / 继承 / 有效权限的理论模型
- Day 3（今天）：真机验证 + 综合权限判断

---

## 二、实验 1：查看 Desktop 的 ACL

执行：

```powershell
icacls "$env:USERPROFILE\Desktop"
```

本机实际输出类似：

```text
NT AUTHORITY\SYSTEM:(I)(OI)(CI)(F)
BUILTIN\Administrators:(I)(OI)(CI)(F)
难办叔叔的电脑\73360:(I)(OI)(CI)(F)
```

每一行都是一条 ACE，格式：`谁 : 标记(权限)`。逐项理解：

| 标记 | 含义 |
| ---- | ---- |
| `I` | Inherited：该 ACE 从父对象继承而来 |
| `OI` | Object Inherit：该 ACE 可以向**子文件**传播 |
| `CI` | Container Inherit：该 ACE 可以向**子目录**传播 |
| `F` | Full Control：完全控制 |

**重要注意**：`OI/CI` 是「继承传播设置」，并不能单凭它断言所有后代对象当前都已经拥有该 ACE。要验证实际的继承结果，必须直接查看子对象的 ACL（实验 3 就是这么做的）。

---

## 三、实验 2：对比用户目录的 ACL

执行：

```powershell
icacls "$env:USERPROFILE"
```

发现：

```text
难办叔叔\73360:(OI)(CI)(F)
```

**没有 `(I)`**。

说明这条 ACE 是**直接写在 `C:\Users\73360` 上的显式 ACE**；而 Desktop 上的 `73360:(I)(OI)(CI)(F)` 是从父目录继承下来的。

实际继承关系：

```text
C:\Users\73360
└── 73360:(OI)(CI)(F)      ← 显式 ACE（没有 (I)）
          ↓ 继承
Desktop
└── 73360:(I)(OI)(CI)(F)   ← 继承 ACE（多了 (I)）
```

这正好把 Day 2 学的「Explicit ACE vs Inherited ACE」在真实输出里对上了号。

---

## 四、实验 3：新建文件，验证继承真的发生

执行：

```powershell
New-Item "$env:USERPROFILE\Desktop\acl-test.txt" -ItemType File
icacls "$env:USERPROFILE\Desktop\acl-test.txt"
```

得到：

```text
NT AUTHORITY\SYSTEM:(I)(F)
BUILTIN\Administrators:(I)(F)
难办叔叔的电脑\73360:(I)(F)
```

由此验证：

```text
C:\Users\73360
    ↓
Desktop
    ↓
acl-test.txt
```

权限确实一路继承了下来。

另一层理解：文件是继承链的末端，所以它身上只显示 `(I)`，不会再显示目录才用的 OI/CI 传播标记。

---

## 五、实验 4：多个 ACE 同时作用

创建第二个测试文件并增加一条显式 Allow：

```powershell
New-Item "$env:USERPROFILE\Desktop\acl-test2.txt" -ItemType File
icacls "$env:USERPROFILE\Desktop\acl-test2.txt"
icacls "$env:USERPROFILE\Desktop\acl-test2.txt" /grant "Everyone:(R)"
icacls "$env:USERPROFILE\Desktop\acl-test2.txt"
```

增加后输出：

```text
Everyone:(R)
NT AUTHORITY\SYSTEM:(I)(F)
BUILTIN\Administrators:(I)(F)
难办叔叔的电脑\73360:(I)(F)
```

重点：
- `Everyone:(R)` 没有 `(I)` → **显式 ACE**（直接添加到该文件上）
- `73360:(I)(F)` → **继承 ACE**

同一个文件的 ACL 里，显式 ACE 和继承 ACE 可以共存。

---

## 六、理解多个 Allow ACE 共同贡献

假设：

```text
73360          → Allow Read
Students       → Allow Write
Administrators → Allow Full Control
```

并且：

```text
73360 ∈ Students
73360 ∈ Administrators
```

那么当前用户的 Access Token 会同时匹配到多条 ACE。

**重要理解**：多个 Allow ACE 并不是简单的「后面的覆盖前面的」——不同 ACE 可以**共同贡献**权限。

例如：

```text
Everyone → Allow Read
73360    → Allow Full Control
```

那么 73360：

```text
Read   → ✅
Write  → ✅
Delete → ✅
```

因为 Full Control 本身包含很多具体权限（读、写、删……）。

---

## 七、实验 5：实际加入 Deny

执行：

```powershell
icacls "$env:USERPROFILE\Desktop\acl-test2.txt" /deny "Everyone:(W)"
icacls "$env:USERPROFILE\Desktop\acl-test2.txt"
```

得到：

```text
Everyone:(DENY)(W)
Everyone:(R)
NT AUTHORITY\SYSTEM:(I)(F)
BUILTIN\Administrators:(I)(F)
难办叔叔的电脑\73360:(I)(F)
```

由于 `73360 ∈ Everyone`，73360 同时匹配：

```text
Everyone → Deny Write
Everyone → Allow Read
73360    → Allow Full Control
```

最终判断：

```text
Read   → ✅   原因：Everyone → Allow Read
Write  → ❌   原因：Everyone → Deny Write
Delete → ✅   原因：73360 → Full Control，且没有针对 Delete 的 Deny
```

---

## 八、重要理解：不要死记「Deny 永远优先」

更准确的表述是：

> Windows 的访问检查会根据当前用户的 Access Token 匹配相关 ACE，并结合 ACE 的顺序、显式/继承关系，以及当前请求的具体权限进行判断。

所以学习重点应该是这套判断链：

```text
我是谁？
    ↓
Access Token 中有哪些 SID？
    ↓
文件 ACL 中有哪些 ACE？
    ↓
哪些 ACE 与当前用户匹配？
    ↓
当前请求的是 Read / Write / Delete 中的哪一种权限？
    ↓
这些 ACE 如何影响这个具体请求？
    ↓
最终 Effective Permission
```

---

## 九、今天的综合练习

练习：

```text
secret.txt

Alice          → Allow Read
Students       → Allow Write
Students       → Deny Delete
Administrators → Allow Full Control
```

并且：

```text
Alice ∈ Students
Alice ∈ Administrators
```

最终判断：

```text
Read   → ✅   原因：Alice 自己的 SID 匹配 Allow Read
Write  → ✅   原因：Alice ∈ Students，匹配 Allow Write
Delete → ❌   原因：Alice ∈ Students，匹配 Deny Delete
```

这个练习验证了：**一个用户可以因为自己的 SID 和所属组的 SID，同时匹配多条 ACE**。

---

## 十、今天最终掌握的完整链路

```text
SID
 ↓
用户 / 组身份
 ↓
Access Token
 ↓
ACL
 ↓
ACE
 ↓
匹配当前用户及其所属组
 ↓
Allow / Deny
 ↓
针对具体请求的权限进行判断
 ↓
Effective Permission
```

今天完成的是：

```text
理论权限模型 → Windows 实机 → icacls → 实际 ACL → 多 ACE → Allow/Deny → 有效权限
```

---

## 十一、Day 3 学习成果

- [x] 使用 `icacls` 查看真实 Windows ACL
- [x] 理解 `I`（Inherited）
- [x] 理解 `OI`（Object Inherit）
- [x] 理解 `CI`（Container Inherit）
- [x] 理解 `F`（Full Control）
- [x] 区分显式 ACE 与继承 ACE
- [x] 实际验证目录 → 文件的权限继承
- [x] 理解多个 ACE 可以同时匹配
- [x] 理解 Access Token 与组 ACE 的关系
- [x] 实际添加 Allow ACE（`/grant`）
- [x] 实际添加 Deny ACE（`/deny`）
- [x] 综合判断 Allow + Deny
- [x] 根据 ACL 推导 Effective Permission

---

## 十二、实验收尾（提醒）

桌面上留下了两个测试文件 `acl-test.txt`、`acl-test2.txt`。73360 有 Full Control（Delete 权限包含在内），确认结果后可以直接删除。删除前如果想留个纪念，可以再跑一次 `icacls` 把最终 ACL 存进学习日志。
