# Windows 启动项与用户身份探索

> Level 1 项目记录 · 日期：2026-09-06（Day 1）
> 本目录还有 Level 1 脚本 [Get-StartupItems.ps1](Get-StartupItems.ps1)（用注册表方式查询启动项），可与本文的 CIM 方式对照。
> 详细知识整理见笔记：[notes/powershell/01-windows-registry-startup-sid.md](../../notes/powershell/01-windows-registry-startup-sid.md)

## 项目目的
通过 PowerShell 和 Windows 注册表，探索 Windows 的启动项、用户配置和 SID，建立「机器 / 用户 / 身份 / 权限」的初步认识——这是整个 AI Windows 安全助手项目的第一块地基。

## 使用环境
- Windows 版本：（待补充 —— 运行 `Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion` 查看后填在这里）
- 工具：Windows PowerShell（本次以管理员身份运行，窗口标题「管理员: Windows PowerShell」）/ cmd

## 实验内容
- 查询启动项（`Get-CimInstance Win32_StartupCommand`）
- 查询 SID（`whoami /user`）
- 观察注册表（HKCU、HKU）
- 理解 HKLM / HKU / HKCU
- 理解 Run 启动项

## 使用命令

```powershell
# 查询启动项（CIM 方式，一条命令汇总注册表 Run 键 + 启动文件夹）
Get-CimInstance Win32_StartupCommand
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User

# 观察 HKCU 下的 Run（只读，注册表驱动器方式）
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'

# 列出 HKU 下已加载的用户配置（按 SID 分键）
Get-ChildItem 'Registry::HKEY_USERS'
```

```cmd
:: 查看当前用户与 SID
whoami /user
```

## 实验结果

### 实际观察（2026-09-06，管理员 PowerShell）

```powershell
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User | Format-Table -AutoSize
```

共 16 条启动项，按 Location 分类：

- `HKU\S-1-5-21-1384797912-1436548283-715639309-1001\...\Run`（我自己的用户 SID，RID=1001）：OneDrive、SoftwareBoxAutoStart、MuMuNxMain、MuMuPlayerService、Steam、doubao、CalendarPro、QuarkUpdaterTaskUser、quark、MicrosoftEdgeAutoLaunch 等
- `HKU\S-1-5-19\...\Run` 与 `HKU\S-1-5-20\...\Run`：各一条 OneDriveSetup（LocalService / NetworkService 账户）
- `HKU\S-1-5-80-...\...\Run`：OneDriveSetup（某服务账户）
- `HKLM\...\Run`：SecurityHealth、RtkAudUService、小米电脑管家

```powershell
Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
```

实际值（只有 2 条）：
- `OneDrive` : `"C:\Program Files\Microsoft OneDrive\OneDrive.exe" /background`
- `SoftwareBoxAutoStart` : `"D:\Program Files\DeepSurf\DeepSurf.exe" --no-startup-window`

### 这次实验最值钱的发现
1. 我的 SID 自己出现在了输出里：`S-1-5-21-1384797912-1436548283-715639309-1001`——HKCU 就是指向 HKU 里这个 SID 的配置，笔记第 14 节的理论在真实输出中得到了印证。
2. 启动项的来源不只是 HKLM/HKCU 两类：还看到了服务账户的 SID（S-1-5-19 / S-1-5-20 / S-1-5-80），一台电脑确实有很多 SID（笔记第 13 节）。
3. 遗留谜题：Win32_StartupCommand 里我的 SID 的 Run 有 10+ 条，但直接查 HKCU Run 只有 2 条（见「遇到的问题」）。

## 遇到的问题
- 为什么一台电脑上会有多个 SID？
- 用户名和 SID 到底是什么关系？
- HKCU 和 HKU 到底是什么关系？
- PowerShell 为什么可以直接访问 Windows 注册表？
- Run 为什么能够影响程序登录后的自动启动？
- Get-CimInstance 到底是什么？
- PowerShell 的 `|` 到底是什么？
- Windows 的用户、SID、注册表和权限之间有什么关系？
- （实验后新增）为什么 OneDriveSetup 会写进 HKU\S-1-5-19 / S-1-5-20（服务账户）的 Run 里？
- （实验后新增）Win32_StartupCommand 显示我的 SID 的 Run 键里有 10+ 条，但 Get-ItemProperty 直接查 HKCU Run 只有 2 条——它们应该是同一个位置，为什么数量对不上？（待查证）

## 问题解决
以上问题在笔记 [notes/powershell/01-windows-registry-startup-sid.md](../../notes/powershell/01-windows-registry-startup-sid.md) 中逐条整理，核心结论：

- 启动项 = 注册表 Run 键等位置的键值，登录时被 Windows 读取执行
- 注册表按「机器（HKLM）/ 用户（HKU 按 SID 分键）」组织，HKCU 是当前用户 SID 子键的便捷视图
- SID 是 Windows 识别安全主体的唯一标识，是权限（ACL / 访问令牌）体系的基础

实验后新增的两个问题还没有定论，排查思路（下一步实践）：
1. 把 Get-ItemProperty 的输出重定向到文件（`Get-ItemProperty 'HKCU:\...\Run' > 结果.txt`），确认是不是窗口显示不全
2. 直接用全路径查同一位置：`Get-ItemProperty "Registry::HKEY_USERS\S-1-5-21-1384797912-1436548283-715639309-1001\Software\Microsoft\Windows\CurrentVersion\Run"`
3. 对比 32 位程序的位置：`Get-ItemProperty "Registry::HKEY_USERS\S-1-5-21-...-1001\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run"`（Win32_StartupCommand 可能把 32 位 Run 键也汇总进来了）

## 当前成果
- 会用 PowerShell 查询启动项，并看懂 Name / Command / Location / User 字段
- 理解注册表三大根键（HKLM / HKU / HKCU）的关系
- 理解 SID 与用户名的区别，以及 SID 在 HKU 与权限体系中的作用
- 亲眼在自己的输出里看到了 SID（S-1-5-21-...-1001、S-1-5-19/20、S-1-5-80），「HKU 按 SID 分键」从理论变成了事实
- 能按 Location 区分启动项来源：我的用户配置 / 服务账户 / 全机（HKLM）

## 后续计划
- Windows 用户与组（Get-LocalUser、组与 SID）
- ACL / NTFS 权限 / icacls ← 理论已学（2026-09-07，见 [Day 2 笔记](../../notes/security/01-windows-permissions-basics.md)），实战验证待做
- Access Token 与 Windows 安全模型 ← 理论已学（同上）
- 注册表权限
- Windows 服务与更完整的启动机制
- Level 2：把「查启动项」写成自己的程序
