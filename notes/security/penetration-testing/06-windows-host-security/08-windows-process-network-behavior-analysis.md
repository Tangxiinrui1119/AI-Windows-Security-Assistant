# Windows 主机安全：进程与网络行为联合分析

> 📅 学习日期：2026-10-06  
> 📔 学习阶段：信息安全基础 → Part 06 · Windows 主机安全（衔接补充）  
> 🔗 前置知识：进程路径 / PID / PPID / 父子进程 / CommandLine / TCP 端口与状态  
> 🎯 今日目标：把进程信息与网络连接放在一起分析，区分程序路径、启动参数、连接状态与安全结论。
> 📔 关联日志：[2026 年 10 月](../../../../docs/devlog/2026/10.md)

---

# 知识地图

```text
网络记录
↓
PID → 对应哪个具体进程
↓
进程名 / ExecutablePath → 程序叫什么、文件在哪里
↓
PPID / 父进程 → 谁创建了它
↓
CommandLine → 启动时传了什么命令和参数
↓
Local / Remote + LISTENING / ESTABLISHED → 两端地址、端口与 TCP 状态
↓
多字段联合分析
↓
观察到的事实 → 可能的解释 → 继续寻找证据
```

---

# 一、已有基础与今天的衔接

以下内容已经有专门笔记，今天直接用于案例，不重复展开定义和命令：

- [06 · Windows 进程、PID、PPID 与进程树](06-windows-processes-pid-ppid-process-tree.md)：区分进程实例，根据 PPID 寻找父进程。
- [07 · Windows 进程调查：路径、命令行与运行身份](07-windows-process-investigation-path-commandline-owner.md)：读取 ExecutablePath、CommandLine 和 Owner。
- [网络基础 03 · 端口、监听与网络连接](../01-network-basics/03-ports-listening-and-network-connections.md)：读懂 netstat -ano、两端 IP:端口、TCP 状态和按 PID 查询进程的方法。
- [05 · Windows 事件日志与安全审计](05-windows-event-log-security-audit.md)：区分日志事实与猜测；今天把这个原则应用到进程和网络记录。

今天的新增重点是：

> 正常程序路径 ≠ 正常行为；连接远端端口 ≠ 本机监听该端口；事实 ≠ 推测。

---

# 二、联合分析案例

下面的进程、PID、脚本路径、IP 和端口都是教学示例，不是今天在自己电脑上采集到的结果。假设进程与网络信息来自同一主机、相近的观察时间，并已核对进程创建时间。

```text
父进程：
Name            : WINWORD.EXE
ProcessId       : 4000

子进程：
Name            : powershell.exe
ProcessId       : 7000
ParentProcessId : 4000
ExecutablePath  : C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
CommandLine     : powershell.exe -ExecutionPolicy Bypass -File C:\Users\Tom\AppData\Local\Temp\a.ps1

网络记录：
Proto           : TCP
PID             : 7000
Local           : 192.168.1.8:54231
Remote          : 203.0.113.55:443
State           : ESTABLISHED
```

先把关系串起来：

```text
WINWORD.EXE（PID 4000）
        ↓ 父子进程关系
powershell.exe（PID 7000，PPID 4000）
        ├─ 程序位于常见的 Windows PowerShell 路径
        ├─ 启动参数指定 Bypass，并要求执行 Temp\a.ps1
        └─ PID 7000 对应一条 TCP 已建立连接
           本机 192.168.1.8:54231 ↔ 对端 203.0.113.55:443
```

网络记录中的 PID 指向子进程。不能因为它的父进程是 Word，就把这条连接直接写成“Word 的连接”。

PID 可以被复用，父进程也可能已经退出。若查询时间相隔较远，需要结合创建时间或进程创建日志核对，不能只凭数字相同拼接关系。字段边界参考 [微软 Win32_Process 文档](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process)。

---

# 三、正常路径与父子进程关系

## 1. 正常程序路径 ≠ 正常行为

案例中的路径是常见的 Windows PowerShell 路径，但路径只说明程序文件在哪里，不能证明这次运行安全。

即使运行的确实是正常系统工具，它也可能被用来执行有风险的脚本。因此还要结合父进程、启动参数、脚本内容与网络行为判断。

## 2. WINWORD.EXE → powershell.exe 为什么值得调查

Word 主要用于处理文档。它创建 PowerShell 进程，是值得进一步调查的父子关系。

在这个案例中，再结合临时目录脚本和网络连接，可以形成调查线索，但仍然不能直接确认恶意行为：

```text
值得调查
≠
已经证明是病毒或攻击
```

下一步应核对文档来源、启动时间、宏或加载项、用户操作，以及是否存在有解释的自动化任务。

---

# 四、CommandLine 能确认到哪一步

案例中的命令行包含：

```text
-ExecutionPolicy Bypass
-File C:\Users\Tom\AppData\Local\Temp\a.ps1
```

可以观察到：启动参数指定了 Bypass，并要求 PowerShell 执行这个脚本文件。

`-ExecutionPolicy` 参数设置当前会话的执行策略，不等于永久修改系统执行策略；仅看到这个参数，也不能证明已经绕过所有安全控制。参数含义参考 [微软 powershell.exe 参数文档](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_powershell_exe?view=powershell-5.1)。

仅靠 CommandLine，不能确定：

- a.ps1 的具体内容。
- 脚本是否成功执行、是否执行完成。
- 这条网络连接是否由脚本中的某条命令触发。
- 是否下载文件、窃取数据或执行其他恶意行为。

因此准确的记录是：

> 启动命令指定执行 a.ps1；脚本实际内容和执行结果需要继续核实。

下一步检查脚本内容，并结合可用的 PowerShell 日志、进程日志和网络记录寻找证据。

---

# 五、Local / Remote 与连接、监听的区别

## 1. 本机这一端与对端

案例可以拆成：

| 字段 | 案例值 | 在这条记录中的含义 |
|---|---|---|
| Local | `192.168.1.8:54231` | 本机 IP 为 192.168.1.8，本地端口为 54231 |
| Remote | `203.0.113.55:443` | 对端 IP 为 203.0.113.55，对端端口为 443 |
| State | `ESTABLISHED` | 两端 TCP 连接已经建立 |
| PID | `7000` | 这条网络记录对应的具体进程编号 |

`netstat` 中的远程地址列叫 `Foreign Address`，这里用 Remote 表示同一侧的地址。Local / Remote 都以观察主机为参照。

## 2. 连接远端 443 ≠ 本机监听 443

```text
Local:  192.168.1.8:54231
Remote: 203.0.113.55:443
State:  ESTABLISHED
```

说明本机 54231 端口与对端 443 端口之间存在已建立连接。这里的 443 属于对端，不能据此写成“本机 PowerShell 监听 443”。

如果有一条独立的监听记录：

```text
Local: 0.0.0.0:443
State: LISTENING
PID:   7000
```

才表示对应进程在本机所有 IPv4 接口的 TCP 443 端口等待连接。判断监听要看 `LISTENING` 和 **Local 后面的端口**。列与状态含义参考 [微软 netstat 文档](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat)。

一条 ESTABLISHED 记录不能证明这个进程没有其他监听端口，需要查看它的其他网络记录。

## 3. 状态和端口不能直接变成安全结论

- `ESTABLISHED` 说明连接已建立，不证明正在传输什么数据。
- 远端 443 符合常见 HTTPS 服务的形式，但不能仅凭端口确认协议、加密状态或通信安全性。
- 单条已建立连接不能严格证明最初由哪一端发起，更不能证明“主动上传了数据”。连接发起方向还需要日志或抓包等证据。

---

# 六、把事实、推测与下一步分开记录

下面的“事实”仅指教学案例中给定的信息，不表示自己电脑上发生了这些行为。

| 观察到的事实 | 可能的解释 / 待验证推测 | 下一步需要什么证据 |
|---|---|---|
| PowerShell 的 PPID 对应 Word 的 PID | 文档、宏或加载项可能触发了 PowerShell | 文档来源、用户操作、进程创建日志 |
| 路径是常见的 PowerShell 路径 | 可能是正常系统工具被用于某项任务 | 文件签名、来源及实际行为 |
| CommandLine 指定 Bypass 与 Temp\a.ps1 | 可能是自动化任务，也可能是可疑脚本 | 脚本内容、执行日志与结果 |
| PID 7000 有一条与对端 443 的已建立连接 | 可能与脚本联网有关 | 对端背景、连接时间、网络日志与脚本逻辑 |

不能把这些线索直接升级成：

```text
Word 打开了恶意文档
↓
成功执行恶意脚本
↓
连接攻击者服务器并上传数据
```

这条叙述中的“恶意”“成功执行”“攻击者服务器”“上传数据”都需要额外证据。

目前更准确的结论是：

> 示例中的 Word → PowerShell 父子关系、临时目录脚本参数与网络连接值得联合调查；现有字段还不足以确认脚本具体行为或判断为恶意通信。

---

# 七、今日掌握结果与复习

今天需要记住的判断方法：

1. 用 PID 把网络记录对应到具体进程，再用 PPID 关联父进程，并核对时间。
2. 正常路径不能替代行为分析，Word → PowerShell 是调查线索。
3. CommandLine 提供启动参数，不能代替脚本内容和执行结果。
4. Local 是本机这一端，Remote 是对端；远端 443 不等于本机监听 443。
5. LISTENING 看本地监听入口，ESTABLISHED 看已经建立的连接。
6. 先记录事实，再提出可能解释，最后说明还需要哪些证据。

复习时，试着回答：

- 案例中的 443 属于本机还是对端？本地端口是多少？
- 哪两个编号把 Word 和 PowerShell 联系起来？
- 为什么不能仅凭 CommandLine 写“a.ps1 已成功执行并上传数据”？

参考答案：443 属于对端，本地端口为 54231；PowerShell 的 PPID 4000 对应 Word 的 PID 4000；命令行只给出启动请求，脚本内容、执行结果和数据传输仍需证据。

今天归档的是网络基础到 Windows 主机安全的衔接内容，正式学习路线仍按已有规划推进。

[← 返回 Windows 主机安全目录](README.md)
