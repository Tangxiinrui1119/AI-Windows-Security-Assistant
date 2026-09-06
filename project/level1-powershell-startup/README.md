# Windows 启动项与用户身份探索

> Level 1 项目记录 · 日期：2026-09-06（Day 1）
> 本目录还有 Level 1 脚本 [Get-StartupItems.ps1](Get-StartupItems.ps1)（用注册表方式查询启动项），可与本文的 CIM 方式对照。
> 详细知识整理见笔记：[notes/powershell/01-windows-registry-startup-sid.md](../../notes/powershell/01-windows-registry-startup-sid.md)

## 项目目的
通过 PowerShell 和 Windows 注册表，探索 Windows 的启动项、用户配置和 SID，建立「机器 / 用户 / 身份 / 权限」的初步认识——这是整个 AI Windows 安全助手项目的第一块地基。

## 使用环境
- Windows 版本：（待补充 —— 运行 `Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion` 查看后填在这里）
- 工具：Windows PowerShell / cmd

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
（待补充：把实际输出粘贴在这里。建议保存一份 Get-CimInstance 的完整输出，以后 Level 4 做「安全检查」时会再回来对照。）

## 遇到的问题
- 为什么一台电脑上会有多个 SID？
- 用户名和 SID 到底是什么关系？
- HKCU 和 HKU 到底是什么关系？
- PowerShell 为什么可以直接访问 Windows 注册表？
- Run 为什么能够影响程序登录后的自动启动？
- Get-CimInstance 到底是什么？
- PowerShell 的 `|` 到底是什么？
- Windows 的用户、SID、注册表和权限之间有什么关系？

## 问题解决
以上问题在笔记 [notes/powershell/01-windows-registry-startup-sid.md](../../notes/powershell/01-windows-registry-startup-sid.md) 中逐条整理，核心结论：

- 启动项 = 注册表 Run 键等位置的键值，登录时被 Windows 读取执行
- 注册表按「机器（HKLM）/ 用户（HKU 按 SID 分键）」组织，HKCU 是当前用户 SID 子键的便捷视图
- SID 是 Windows 识别安全主体的唯一标识，是权限（ACL / 访问令牌）体系的基础

## 当前成果
- 会用 PowerShell 查询启动项，并看懂 Name / Command / Location / User 字段
- 理解注册表三大根键（HKLM / HKU / HKCU）的关系
- 理解 SID 与用户名的区别，以及 SID 在 HKU 与权限体系中的作用

## 后续计划
- Windows 用户与组（Get-LocalUser、组与 SID）
- ACL / NTFS 权限 / icacls
- Access Token 与 Windows 安全模型
- 注册表权限
- Windows 服务与更完整的启动机制
- Level 2：把「查启动项」写成自己的程序
