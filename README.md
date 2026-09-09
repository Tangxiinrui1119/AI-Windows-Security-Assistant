# 🛡️ AI Windows 安全助手

> 从一条 PowerShell 命令开始，用三年时间，把它做成一个真正的 Windows 安全软件。

🌐 **项目主页（访客入口）**：https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/

这是我在大学期间（**大二 → 大三 → 大四**）的长期项目仓库。
代码、学习笔记、开发日志全部记录在这里，一步一步从零成长为一个完整的「AI Windows 安全助手」。

## 我在做什么

| 阶段 | 核心目标 | 项目里程碑 |
|------|---------|-----------|
| 大二（现在） | C++ + Python + Git + PowerShell 基础 | Level 1~5：从 PowerShell 实验到可运行的 Windows 小工具 |
| 大三 | 计算机网络 + AI | 网络状态分析 → AI 解释扫描结果 |
| 大四 | 整合 + 完善 | 完整的 AI Windows 安全助手，加入真正的信息安全能力 |

完整的三年规划见 [docs/PLAN.md](docs/PLAN.md)。

## 项目等级（Level）

- **Level 1**：PowerShell 小实验（查看自启动项）← *现在在这里*
- **Level 2**：C++ / Python 小工具
- **Level 3**：Windows 信息检测工具
- **Level 4**：安全检查
- **Level 5**：真正的软件雏形

## 仓库结构

```
├── README.md            # 项目介绍（你在这里）
├── docs/
│   ├── PLAN.md          # 三年完整规划
│   └── devlog/          # 学习日志（按月记录）
│       ├── README.md    # 日志怎么写
│       ├── TEMPLATE.md  # 日志模板
│       └── 2026/        # 按年份归档
├── notes/               # 学习笔记（按主题分类）
│   ├── cpp/             # C++
│   ├── python/          # Python
│   ├── git/             # Git & GitHub
│   ├── powershell/      # PowerShell
│   ├── network/         # 计算机网络
│   ├── ai/              # AI 应用
│   └── security/        # 信息安全
└── project/             # 项目代码，从 Level 1 开始
    └── level1-powershell-startup/
```

## 学习方式

**碎片化学习**，不追求每天完成很多，追求**一直做**：

- 有 30 分钟 → 做一个小任务
- 有 1 小时 → 学一点 + 做一点
- 有 2 小时 → 学习 + 项目

**图书馆模式**：没法和 AI 语音时，新开聊天输入
「开始今天的任务，我今天有 X 分钟」，按三年规划安排当天任务。

## 下一步

1. 复习 Day 1~4：认证与授权两条线在 Access Token 处合流（笔记：`notes/security/` 下 01~03 篇）
2. 开始 C++：指针
3. Level 2：把「查启动项」写成自己的小程序
