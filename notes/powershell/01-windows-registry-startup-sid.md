# Windows 注册表、启动项与 SID

> 📅 学习日期：2026-09-06（三年计划 Day 1）
> 📔 关联日志：[docs/devlog/2026/09.md](../../docs/devlog/2026/09.md)
> 💻 关联项目：[project/level1-powershell-startup](../../project/level1-powershell-startup/)

---

## 1. Windows 注册表是什么

**注册表（Registry）是 Windows 用来集中存储配置信息的层次化数据库。**

### 为什么 Windows 需要注册表
早期的 Windows 程序把配置各自写进散布各处的 `.ini` 文件：没有统一格式、难以互相共享、也没有统一的权限控制。注册表把「系统、硬件、软件、用户」的配置集中到一棵树里，由 Windows 内核统一管理，并带上了访问控制（谁能读、谁能改）。

### 注册表保存什么类型的信息
- 硬件与驱动信息
- 系统服务配置
- 软件安装信息（路径、版本、卸载信息）
- 文件关联（双击 .txt 用哪个程序打开）
- 用户个性化设置（壁纸、主题、输入法）
- 启动项（Run 键就是其中一类）
- 安全相关信息（例如账户对应的 SID）

### 注册表和普通文件有什么区别

| | 普通文件 | 注册表 |
|---|---|---|
| 本质 | 一段字节流（文档/程序） | 带类型的键值数据库 |
| 结构 | 无固定结构 | Key / Subkey / Value 组成的树 |
| 访问方式 | 文件系统 API | Windows 内核管理的注册表 API |
| 权限 | NTFS 的 ACL | 注册表也有自己的 ACL |

### 基本结构：Key / Subkey / Value / Data

```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run    ← Key（键，像文件夹）
                              └── OneDrive = "C:\...\OneDrive.exe /background"
                                  ↑ 名称      ↑ 类型(REG_SZ)  ↑ Data（数据）
```

- **Key（键）**：相当于文件夹，例如 `...\CurrentVersion\Run`
- **Subkey（子键）**：键下面套的键，层层嵌套形成树
- **Value（值）**：键里的一条数据，由「名称 + 类型 + 数据」组成
- **Data（数据）**：值里真正存的内容

### 具体例子
某个程序（比如 OneDrive）安装后，会在 `HKCU\...\CurrentVersion\Run` 里写一条：
- 名称：`OneDrive`
- 类型：`REG_SZ`（字符串）
- 数据：`"C:\Users\...\OneDrive.exe" /background`

这就回答了「程序的配置为什么可能出现在注册表里」：**安装程序主动写进去的**。
也回答了「注册表为什么能影响 Windows 的行为」：**Windows 的关键流程会在特定时点去读注册表**——比如登录时读 Run 键，读到谁就启动谁。所以注册表里的一条数据，可以直接改变系统的行为。

---

## 2. HKLM：HKEY_LOCAL_MACHINE

- **是什么**：本机（这台电脑）级别的配置根键。
- **为什么叫 Local Machine**：它描述的是这台机器本身，与「当前登录的是谁」无关。
- **主要保存什么**：硬件、驱动、服务、已安装软件、系统级设置。
- **和当前用户的关系**：没有直接关系——不管谁登录，读到的都是同一份。
- **哪些配置影响整台电脑**：服务定义（`HKLM\SYSTEM\CurrentControlSet\Services`）、系统级启动项（`HKLM\...\Run`）、软件安装信息（`HKLM\SOFTWARE`）等。

**为什么 HKLM 里的配置会影响多个用户？**
登录流程对所有用户都会读取 HKLM 的配置（例如所有用户登录时都会执行 `HKLM\...\Run` 里的启动项），所以它天然是全机生效的。

**为什么访问/修改某些 HKLM 内容需要管理员权限？**
HKLM 的 ACL 默认只允许 Administrators 和 SYSTEM 写入。因为它影响整台机器，微软用权限把它保护起来——普通用户能读，不能随便改。

> 例子：在 `HKLM\...\Run` 加一条记录，这台电脑上所有账户登录时都会启动它；在 `HKCU\...\Run` 加，只有你自己。

---

## 3. HKU：HKEY_USERS

- **是什么**：这台电脑上「用户配置单元（profile）的集合」。
- **为什么和用户有关**：每个用户有自己的配置（壁纸、软件设置、自启项），Windows 把这些按人分开存放。
- **每个 SID 子项是什么**：每一个已加载的用户配置，都会在 HKU 下以一个「该用户的 SID」命名的子键出现，例如：
  `HKEY_USERS\S-1-5-21-1234567890-1234567890-1234567890-1001`
- **为什么键名是 S-1-5-21-... 而不是用户名**：键名必须稳定、唯一。用户名会被改名（Alice → Bob），SID 永远不会变，所以用 SID 当键名。
- **注意**：HKU 下还有几个系统账户的固定 SID：
  - `S-1-5-18`：SYSTEM（本地系统账户）
  - `S-1-5-19`：LocalService
  - `S-1-5-20`：NetworkService

**一句话**：HKU = 「不同 Windows 用户配置单元的集合」，而不是「用户本身」。用户没登录（profile 没加载）时，HKU 里就看不到他。

---

## 4. HKCU：HKEY_CURRENT_USER

- **是什么**：当前登录用户配置的「入口 / 便捷视图」。
- **为什么叫 Current User**：程序只要问 HKCU，就能拿到「当前这个人」的配置，不需要自己先算出 SID。
- **和当前登录用户的关系**：当前用户是谁，HKCU 就指向谁的配置。
- **和 HKU 的关系（重点）**：HKCU 不是一份独立存储。普通本地用户登录时，HKCU 指向的是 HKU 里「当前用户 SID」那个子键：

```
当前用户（豆豆）
   ↓
当前用户的 SID（S-1-5-21-...-1001）
   ↓
HKU 中对应的用户配置（HKU\S-1-5-21-...-1001）
   ↓
HKCU = 指向这份配置的便捷映射/视图
```

**例子**：往 `HKCU\Software\...\Run` 写一条启动项，等价于往 `HKU\S-1-5-21-...-1001\Software\...\Run` 写——是同一个位置的两扇门。

> 扩展知识：如果进程以 SYSTEM 身份运行（比如 Windows 服务），它的「当前用户」是 SYSTEM，HKCU 就会指向 `S-1-5-18` 的配置。所以「当前」取决于进程的安全上下文，不一定是屏幕前坐着的人。

---

## 5. HKLM、HKU、HKCU 对比

| 项目 | 全称 | 主要作用 | 影响范围 | 与用户关系 |
| ---- | ---- | ---- | ---- | ---- |
| HKLM | HKEY_LOCAL_MACHINE | 硬件、驱动、服务、系统级配置 | 整台电脑、所有用户 | 与登录用户无关 |
| HKU | HKEY_USERS | 存放每个用户的配置（按 SID 分键） | 每个子键只影响对应 SID | 每个子键 = 一个安全主体的配置 |
| HKCU | HKEY_CURRENT_USER | 当前用户配置的便捷入口 | 当前登录用户 | 指向 HKU 中当前用户 SID 的子键 |

理解要点：HKLM 是「机器的」，HKU 是「所有人的档案柜」，HKCU 是「打开我那一格抽屉的把手」。

---

## 6. Run 启动项

### 是什么
注册表里专门存放「登录后要自动启动的程序」的键。Windows 登录流程完成后，会读取这些位置并把里面的程序启动起来。

### 为什么某些程序能在登录后自动启动
因为安装程序把「登录后请启动我」这条指令写进了 Run 键，而 Windows 的登录流程每次都来读这个键。

### 相关位置
```text
# 当前用户登录时启动（只影响你）
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run

# 所有用户登录时启动（影响整台电脑）
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run

# 32 位程序在 64 位系统上的位置（扩展知识）
HKEY_LOCAL_MACHINE\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run
```

### HKCU 下的 Run 和 HKLM 下的 Run 有什么区别
- `HKCU\...\Run`：当前用户专属，用户自己就能读写，清理也容易
- `HKLM\...\Run`：全机生效，写入一般需要管理员权限
- 为什么一个偏用户、一个偏机器：这正是第 2/4 节讲过的「机器配置 vs 用户配置」的体现

### 什么情况用哪个
- 只给自己装的个人软件 → 写在 HKCU 的 Run
- 给整台电脑装的管理/安全类软件 → 写在 HKLM 的 Run

> ⚠️ **风险提醒**：修改注册表有风险。实验阶段只用只读命令观察；不要为了「实验」删除任何不认识、不确定的键值——有些是系统必需的，删错可能导致程序异常甚至系统问题。

---

## 7. PowerShell 查询启动项

```powershell
Get-CimInstance Win32_StartupCommand
```

### Get-CimInstance 是什么
PowerShell 的一个 cmdlet，作用是「获取 CIM 类的实例」。
- **CIM**（Common Information Model，通用信息模型）是一个跨平台的系统管理信息标准：把系统的各种信息（进程、硬件、启动项、服务……）抽象成一个个「类」（Class），每个类下面有具体的一批「实例」（Instance）。
- Windows 的 WMI（Windows Management Instrumentation）就是基于 CIM 的实现，`Get-CimInstance` 是现代 PowerShell 查询 WMI/CIM 数据的推荐方式。

### Win32_StartupCommand 是什么
CIM/WMI 里的一个类，用来汇总「启动命令」——它背后的数据来自注册表的 Run 键、启动文件夹等位置。查询它，等于让 Windows 帮你把这些分散的位置查一遍并合并输出。

### 命令拆解

```
Get-CimInstance          Win32_StartupCommand
        ↓                        ↓
  获取 CIM 类实例           指定要查询的类
```

### 执行逻辑
PowerShell 收到命令 → 通过 WS-Man 协议向本机（或远程机）的 CIM/WMI 服务发起查询 → 服务返回 Win32_StartupCommand 的实例集合（每个启动项一个对象）→ PowerShell 格式化成表格输出。

### 示例输出与字段解释
（不同 Windows 版本、中英文系统输出可能略有差异，以自己机器为准）

| 字段 | 含义 |
| ---- | ---- |
| Name | 启动项的显示名称 |
| Command | 登录后实际要执行的命令行（程序路径 + 参数） |
| Location | 它来自哪里：Startup（用户启动文件夹）、Common Startup（公共启动文件夹）、注册表路径等 |
| User | 影响哪个用户：Public / All Users / 具体用户名 |

> 注意：Win32_StartupCommand 只汇总了部分启动来源。Windows 的自动启动机制远不止 Run 键（还有 RunOnce、启动文件夹、服务、计划任务等），所以它 ≠ 「所有开机启动程序」。（扩展知识）

---

## 8. PowerShell 管道 |

### 到底是什么
`|` 叫**管道**：把前一个命令输出的数据，作为输入交给后一个命令继续处理。

### 为什么叫管道
因为数据像水一样，从前一个命令「流」进后一个命令，中途可以接上任意多个处理步骤。它是 PowerShell 的核心思想：**拿数据 → 加工 → 再加工 → 得到想要的**。

### 关键：传的是对象，不是纯文本
PowerShell 管道里流动的是「对象」（带结构的数据，有 Name、Command 这些属性），所以下一步可以直接引用字段，不需要先做文本解析。

### 简单例子
```powershell
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command
```
```
前一个命令产生的数据（一堆启动项对象）
        ↓  通过管道
交给后一个命令继续处理（Select-Object 只挑 Name、Command 两列）
```
为什么这样做：原始输出字段多、表格宽，只挑关心的字段，输出立刻清爽。

### 过滤例子
```powershell
Get-CimInstance Win32_StartupCommand | Where-Object { $_.Location -like '*Startup*' }
```
- `Where-Object`：按条件过滤
- `$_`：代表管道里「当前这个对象」
- `-like '*Startup*'`：Location 字段里包含 Startup 的才留下（即只看来自启动文件夹的启动项）

先理解「数据流」这个概念，命令再长也能拆开读。

---

## 9. SID 是什么（本次重点）

**SID（Security Identifier，安全标识符）是 Windows 用来唯一标识「安全主体」的标识符。**

- **安全主体（Security Principal）**：所有可能「被授予/被拒绝权限」的对象，包括：
  - 用户账户（你、Administrator、Guest……）
  - 组（Users、Administrators、Everyone……）
  - 系统账户（SYSTEM、LocalService、NetworkService……）
- **为什么需要 SID**：权限系统必须能稳定、唯一、明确地指出「到底是谁」。用户名做不到（可改名、可重复），SID 可以。

---

## 10. 用户名和 SID 的区别

```
用户名（给人看）：  Alice
SID（给系统看）：   S-1-5-21-1234567890-1234567890-1234567890-1001
```

- 用户名：人类可读的显示名，可以改。
- SID：Windows 安全机制内部识别「这个人」的唯一标识，生成后不再变。

**为什么 Windows 不能只靠用户名判断权限？**
把用户名从 `Alice` 改成 `Bob`，如果系统靠用户名识别身份，改个名字所有文件权限就全丢了——这不合理。同理，删掉 Alice 再新建一个「Alice」，那是完全不同的两个人，不该继承旧权限。所以 Windows 用 SID：**改名字 SID 不变，权限跟着身份走；删了重建 SID 变了，权限自然不再继承**。这就是 SID 最重要的意义之一。

---

## 11. 如何查看当前用户 SID

```cmd
whoami /user
```

- `whoami`：显示「当前进程以哪个身份在运行」。
- `/user`：以表格形式输出用户名和 SID。

### 示例输出
```text
USER INFORMATION
----------------
User Name        SID
DESKTOP\Alice    S-1-5-21-1234567890-1234567890-1234567890-1001
```

逐项解释：`User Name` 是显示名；`SID` 是当前身份的安全标识符。
**意义**：这条命令不是「看用户名」，而是看「当前进程以什么安全身份运行」——这个身份决定你能访问什么。

---

## 12. SID 的基本结构

```text
S-1-5-21-1234567890-1234567890-1234567890-1001
```

- `S`：SID 的前缀，表示这是一个 SID
- `1`：修订版本（目前都是 1）
- `5`：Identifier Authority（标识符授权机构）。5 代表 SECURITY_NT_AUTHORITY，即 Windows NT 及之后的安全体系（扩展知识：其他值如 18=本地机构、32=域机构，知道即可）
- `21`：表示后面跟着的是「域/计算机生成的唯一标识」
- 三段长数字：域或本机生成的唯一部分（同一台电脑/同一个域的账户，这一段相同）
- 最后的 `1001`：**RID**（Relative Identifier，相对标识符），在同一台电脑上区分具体账户。常见 RID：500 = 内置 Administrator，501 = Guest，1000 起 = 普通用户（扩展知识）

**RID 与前面部分的关系**：前面部分回答「你属于哪台机器/哪个域」，RID 回答「你是这台机器上的哪一个」。两者拼起来才是一个完整的、全局唯一的身份。

> 提醒：理解结构即可，不要求死记每一个数字。

---

## 13. 为什么一台电脑上会有很多 SID（今天产生的疑问）

一台 Windows 电脑上存在很多「安全主体」，每一个都有自己的 SID：

- 当前用户
- 其他本地用户
- 内置账户（Administrator、Guest）
- 系统账户（SYSTEM、LocalService、NetworkService）
- 各种服务账户
- 各种组（Users、Administrators、Everyone……）

所以：注册表 HKU 里会有多个 SID 子键，文件/文件夹的权限列表里也会出现一串 SID。**「一台电脑只有一个 SID」是错误理解——一台电脑有很多身份，每个身份一个 SID。**

---

## 14. SID 与 HKU 的关系

```
Windows 用户
      ↓
SID
      ↓
HKEY_USERS（HKU）
      ↓
对应 SID 的用户配置
      ↓
HKCU（当前用户视角的便捷入口）
```

- **为什么 HKU 里能看到 SID 命名的键**：用户配置必须按「人」分开存放，而 Windows 里「人」的稳定标识就是 SID，所以直接用 SID 当键名。
- **HKCU 与 HKU 的关系**：HKCU 指向 HKU 中「当前用户 SID」那个子键，是同一份数据的便捷视图（见第 4 节）。

---

## 15. SID 与 Windows 权限

```
用户
 ↓
SID
 ↓
访问令牌（Access Token）
 ↓
文件 / 注册表的 ACL
 ↓
Windows 进行访问检查
 ↓
允许 / 拒绝
```

**流程**：登录时，Windows 把「你的 SID + 你所属各组的 SID」装进一个**访问令牌（Access Token）**；系统里的每个资源（文件、文件夹、注册表键）都有自己的 **ACL（Access Control List，访问控制列表）**，里面写着「哪个 SID 可以做什么」；你（以进程身份）去访问资源时，内核拿令牌里的 SID 去比对 ACL 里的 SID，命中且允许 → 放行，否则拒绝。

**例子**：给某个文件夹设置「Alice 可读」→ 实际是把 Alice 的 SID 写进了这个文件夹的 ACL。Alice 登录后，她的进程带着含这个 SID 的令牌去访问文件夹 → 内核比对：令牌里有这个 SID，ACL 允许读取 → 放行。把 Alice 改名成 Bob？SID 没变 → 依然能读。删掉再重建 Alice？SID 变了 → 旧权限不再属于新账户。

这就是第 10 节「为什么不能靠用户名」的完整答案。

---

## 16. 今天知识点之间的完整关系

**结构视角**（这些概念在 Windows 里的位置）：

```
Windows
                       │
            ┌──────────┴──────────┐
            │                     │
        PowerShell              注册表
            │                     │
            │          ┌──────────┼──────────┐
            │          │          │          │
            │         HKLM       HKU        HKCU
            │          │          │          │
            │       整台电脑    用户集合    当前用户
            │                     │
            │                     │
            │                    SID
            │                     │
            │                标识安全主体
            │
            └── Get-CimInstance
                    │
                    ↓
          查询 Windows 系统信息
                    │
                    ↓
          Win32_StartupCommand
                    │
                    ↓
                启动项
```

**探索路径**（今天是怎么顺着一条命令走到这里的）：

```
PowerShell
   ↓
Get-CimInstance
   ↓
Win32_StartupCommand
   ↓
查看 Windows 启动项
   ↓
Run
   ↓
Windows 注册表
   ↓
HKCU / HKLM
   ↓
用户与系统配置
   ↓
SID
   ↓
Windows 安全身份
   ↓
权限 / ACL
```

**通俗串讲**：我用 PowerShell 查启动项 → 启动项来自注册表的 Run 键 → 注册表把配置分成「机器的（HKLM）」和「用户的（HKCU）」→ 用户配置其实按 SID 存放在 HKU → SID 是 Windows 识别身份的根 → 一切权限（ACL、访问令牌）都建立在 SID 之上。一条查询启动项的命令，牵出了 Windows 身份与安全模型的整张网。

---

## 17. 常见误区

### 误区 1：用户名 = SID
错误。用户名是给人看的显示名，SID 是系统识别身份的唯一标识。改名不影响 SID。

### 误区 2：一台电脑只有一个 SID
错误。每个用户、组、系统账户都是一个安全主体，都有自己的 SID，一台电脑上存在很多个。

### 误区 3：HKCU 和 HKU 完全是两个毫无关系的东西
错误。HKCU 是 HKU 中「当前用户 SID 子键」的便捷视图，两者是同一份数据（对当前用户而言）。

### 误区 4：Run 就等于「所有开机启动程序」
错误。Run 只是 Windows 多种自动启动机制之一（还有 RunOnce、启动文件夹、服务、计划任务等）。Win32_StartupCommand 也只汇总了其中一部分来源。

### 误区 5：看到注册表就可以随便删
错误。注册表是系统核心配置，误删键值可能导致程序异常、系统功能损坏。实验只用只读命令；删除前必须确认那是什么。

### 误区 6：会执行命令 = 理解了命令
错误。执行只是开始。要能回答：这条命令是什么？每一部分什么意思？为什么这样写？数据从哪来到哪去？——这才是理解。

---

# 实践实验

以下实验全部是**只读**操作，安全。

## 实验 1：查看当前用户 SID

```cmd
whoami /user
```
**实验目的**：理解「当前用户」和 SID 的关系。
**应该看到**：User Name 一行是你，SID 一列是 `S-1-5-21-...-100x` 形式的标识。
**如何理解**：你以某个安全身份在运行，这个身份由 SID 唯一确定。

## 实验 2：查看启动项

```powershell
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User
```
**实验目的**：理解 Windows 启动项及其来源。
**应该看到**：每条记录有 Name（名字）、Command（实际执行的命令）、Location（来源位置）、User（影响谁）。
**如何理解**：观察 Location 列，能直接看到启动项分别来自注册表还是启动文件夹。

## 实验 3：查看 HKCU 下的 Run（只读）

```powershell
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
```
**实验目的**：观察 HKCU 的 Run 键里有什么。
**说明**：PowerShell 把注册表映射成驱动器（`HKCU:`、`HKLM:`），`Get-ItemProperty` 是只读查看某键下所有值的命令。
**如何理解**：这里每条「名称=数据」就是一条登录自启项，和 Get-CimInstance 查到的数据对得上。

## 实验 4：观察 HKCU 与 HKU 的关系

**做什么**：
1. `whoami /user` —— 记下你的 SID
2. `Get-ChildItem 'Registry::HKEY_USERS'` —— 列出 HKU 下已加载的用户配置（注意：HKU 没有默认的 `HKU:` 驱动器，需要用 `Registry::HKEY_USERS` 这种全路径访问）
3. 把命令里的 `<你的SID>` 换成第 1 步记下的 SID：

```powershell
Get-ItemProperty "Registry::HKEY_USERS\<你的SID>\Software\Microsoft\Windows\CurrentVersion\Run"
```

4. 与实验 3 的 HKCU 输出对比

**为什么**：HKU 按 SID 存放每个用户的配置；HKCU 是指向「当前用户 SID 子键」的便捷视图。
**应该看到什么**：第 3 步的输出和实验 3（HKCU）的输出一致——因为对当前用户来说，它们就是同一个位置。
**看到之后如何理解**：HKCU 不是独立数据，它就是 HKU 里属于你的那一格。

---

# 复习总结

## 今天最应该记住的 10 个结论

如果今天只允许记住 10 个东西，就是这 10 个：

1. **PowerShell** —— Windows 上用于命令行操作、系统管理和自动化的工具
2. **Get-CimInstance** —— 用来查询 Windows 系统对象信息
3. **Win32_StartupCommand** —— 可以用来查询启动项相关信息
4. **`|`（管道）** —— 把前一个命令的结果交给后一个命令处理
5. **注册表** —— Windows 保存大量系统、用户和软件配置的核心配置数据库式结构
6. **HKLM** —— HKEY_LOCAL_MACHINE，机器级配置
7. **HKCU** —— HKEY_CURRENT_USER，当前用户配置
8. **HKU** —— HKEY_USERS，不同用户/安全主体配置的集合
9. **SID** —— Security Identifier，Windows 用来标识安全主体身份的标识符
10. **Run** —— 注册表中常见的程序自动启动位置

## 我现在必须理解
- SID 是什么：Windows 标识安全主体的唯一标识
- 用户名和 SID 的区别：给人看 vs 给系统看；改名 SID 不变
- HKLM 是什么：本机级配置，影响整台电脑
- HKU 是什么：按 SID 存放的用户配置集合
- HKCU 是什么：当前用户配置的便捷视图
- HKCU 和 HKU 的关系：HKCU 指向 HKU 中当前用户 SID 的子键
- Run 是什么：注册表里的登录自启动键
- Get-CimInstance 是什么：查询 CIM 类实例的 cmdlet
- PowerShell 管道是什么：把前一个命令的输出对象交给后一个命令继续处理

## 现在不要求死记
- SID 每段数字的具体取值（Identifier Authority 的 18/32 等细节，用到再查）
- WMI/CIM 的类名大全（Win32_StartupCommand 之外还有很多类）
- 各种注册表键的具体路径（理解「机器/用户」两大类即可）

## 我还没完全搞懂
- SID → 访问令牌 → ACL 的权限链路：概念上已经理顺，但还没有亲手观察过真实的 ACL（留到下一步实验）

## 下一步实验
- 用 `icacls` 观察一个文件夹的 NTFS 权限（ACL），看看里面的 SID
- 用 `Get-LocalUser | Select-Object Name, SID` 看本机用户和它们的 SID
- 继续 Level 2：把「查启动项」写成自己的小程序

> 其中 ACL / Access Token / 有效权限的理论已继续学习：[Windows 权限基础（Day 2 笔记）](../security/01-windows-permissions-basics.md)，实战验证待做。
