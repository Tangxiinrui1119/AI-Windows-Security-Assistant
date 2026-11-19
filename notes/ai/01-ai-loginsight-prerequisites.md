# 01 · AI-LogInsight 前置知识地图

> 📅 整理日期：2026-11-19
> 📔 关联日志：[docs/devlog/2026/11.md](../../docs/devlog/2026/11.md)
> 📚 学习阶段：AI 应用与安全 · 终端日志智能研判
> 🎯 当前状态：前置知识整理；考试结束、时间允许后再启动开发

> 本笔记用于明确 AI-LogInsight 的知识依赖，不代表系统已经开始开发。第一版只聚焦 Windows 终端日志的解析、关联和辅助研判，不处理实验室共享 IP 的完整定位链路。

---

# 一、项目目标与范围

暂定项目名称：

**AI-LogInsight：AI 辅助 Windows 终端安全日志分析与告警研判系统**

初步目标：

1. 导入自己实验环境产生的 Windows Security Log 和 Sysmon 日志。
2. 解析原始事件，转成统一的数据结构。
3. 根据时间、主机、用户、进程等字段关联事件。
4. 使用规则识别需要进一步调查的事件组合。
5. 将结构化证据交给大语言模型，生成带证据引用的报告草稿。
6. 将事实、推测和未知信息分开，最终由人工复核。

第一版暂不做：

- 实验室共享 IP / NAT 历史定位。
- 大规模多主机实时采集。
- 自动隔离终端或自动删除文件。
- 训练自己的大模型。
- 多智能体复杂编排。
- 完整 SIEM 平台替代品。

[!IMPORTANT]
AI 不负责凭空判定“这台电脑被攻击了”。系统必须先提取和关联可核验的日志证据，模型只能基于这些证据辅助解释；没有证据时必须明确标记未知。

---

# 二、知识地图

    AI-LogInsight
    │
    ├── 01 Windows 日志基础
    │   ├── Windows Event Log
    │   ├── Channel / Provider / Event ID
    │   ├── EventRecordID / TimeCreated
    │   ├── EventData / XML
    │   ├── Security Log
    │   └── Sysmon
    │
    ├── 02 Python 数据处理
    │   ├── list / dict / set
    │   ├── 函数 / 模块 / 异常
    │   ├── 文件读写
    │   ├── XML / JSON / CSV
    │   ├── datetime / 时区
    │   ├── pathlib / logging
    │   └── 单元测试
    │
    ├── 03 数据标准化
    │   ├── 统一字段结构
    │   ├── 时间格式统一
    │   ├── 主机与用户标识
    │   ├── 缺失值与重复记录
    │   └── 原始证据来源
    │
    ├── 04 事件关联
    │   ├── Process ID / Parent Process ID
    │   ├── Process GUID
    │   ├── Logon ID
    │   ├── 时间窗口
    │   ├── 进程树
    │   └── 网络连接与进程关联
    │
    ├── 05 规则分析
    │   ├── 规则条件
    │   ├── 多事件组合
    │   ├── 时间窗口
    │   ├── 误报 / 漏报
    │   └── 规则命中解释
    │
    ├── 06 AI 辅助研判
    │   ├── LLM API
    │   ├── Prompt 设计
    │   ├── 结构化输出
    │   ├── 证据引用
    │   ├── RAG（后续）
    │   └── 不确定性表达
    │
    └── 07 实验评估
        ├── 测试样本与人工标签
        ├── 规则基线
        ├── LLM 基线
        ├── 混合方案
        ├── Precision / Recall / F1
        ├── 证据正确性
        └── 无依据结论与分析耗时

---

# 三、第一部分：Windows Event Log

## 1. Windows Event Log 是什么

Windows Event Log 是 Windows 的事件记录机制。系统组件、应用程序和安全审计功能可以将事件写入不同日志通道，供管理员和安全分析工具检查。

需要认识：

| 概念 | 含义 |
|---|---|
| Channel | 日志通道，例如 Security、System、Application |
| Provider | 产生事件的组件或程序 |
| Event ID | 事件类型编号 |
| EventRecordID | 某个日志通道中的记录编号 |
| TimeCreated | 事件时间 |
| EventData | 事件携带的字段数据 |
| Computer | 事件关联的计算机 |
| User / SID | 用户身份相关信息 |

常见通道：

- Security：安全审计事件。
- System：系统组件事件。
- Application：应用程序事件。
- Microsoft-Windows-Sysmon/Operational：Sysmon 运行日志。

## 2. 之前学过的 Windows 安全事件

| Event ID | 含义 | 需要关注的字段 |
|---|---|---|
| 4624 | 成功登录 | TargetUser、LogonType、TargetLogonId |
| 4625 | 登录失败 | TargetUser、Status、SubStatus |
| 4634 | 注销 | TargetLogonId |
| 4688 | 创建进程 | NewProcessId、NewProcessName、ParentProcessName |

这些事件字段可能受到 Windows 版本、审计策略和日志配置影响，不能假设每台设备都记录了全部字段。

## 3. Sysmon

Sysmon 是 Microsoft Sysinternals 提供的系统监控工具，可以把更细粒度的系统活动写入 Windows Event Log。

重点认识：

| Sysmon Event ID | 主要内容 | 项目用途 |
|---|---|---|
| 1 | Process Create | 进程创建与父进程关系 |
| 3 | Network Connect | 进程网络连接 |
| 5 | Process Terminated | 进程结束 |
| 11 | File Create | 文件创建 |
| 22 | DNS Query | DNS 查询 |

注意：

- Sysmon 记录的是观察到的系统行为，不会自动替你判定恶意。
- Event ID 3 网络连接事件默认不一定启用，需要检查配置。
- Sysmon 时间戳使用 UTC，分析时要统一时区。
- Event ID 1 中的 ProcessGUID 有助于跨事件关联进程；只依赖 PID 可能受到 PID 重用影响。
- 单条事件不能直接等同于一次攻击，需要结合上下文和其他证据。

---

# 四、第二部分：Python 数据处理能力

用户已有 Python 基础课程经历：变量、容器、函数、文件、JSON、正则表达式、NumPy、面向对象和 CSV。这里不建议重新顺序学完整套 Python，而是通过小练习复习实际需要的能力。

## 1. 必须能熟练使用

| 知识 | 在项目中的用途 |
|---|---|
| list / dict / set | 保存和整理事件记录 |
| 函数 | 拆分解析、清洗、关联逻辑 |
| 模块与包 | 组织项目代码 |
| 异常处理 | 处理格式错误和缺失字段 |
| 文件读写 | 读取日志、保存结果 |
| JSON | 结构化交换数据 |
| XML | 解析 Windows 事件 XML |
| CSV | 导入导出分析结果 |
| 正则表达式 | 处理部分非结构化文本 |
| datetime | 解析时间、排序、时间窗口 |
| pathlib | 统一处理文件路径 |
| logging | 记录程序运行过程 |
| unittest / pytest | 验证解析和关联结果 |

## 2. 后续再补充

- pandas：批量数据整理与统计。
- SQLite：保存事件、索引和查询结果。
- argparse：命令行参数。
- FastAPI：需要提供接口时再学。
- Streamlit：需要可视化演示时再学。

第一版不要求全部掌握。

## 3. 建议的 Python 小练习

1. 读取 JSON 文件并统计不同事件类型的数量。
2. 读取 CSV 并按用户分组。
3. 解析时间字符串并统一成 UTC。
4. 解析一份 XML 事件记录并提取指定字段。
5. 按时间排序一组事件。
6. 按主机和用户筛选记录。
7. 根据进程标识整理进程关系。
8. 将解析结果输出为 JSONL。
9. 对缺失字段、错误格式进行异常处理。
10. 为解析函数编写测试用例。

---

# 五、第三部分：日志标准化与数据质量

不同日志来源的字段名称、格式和时间表示可能不同，因此需要先统一数据结构。

建议每条标准化事件尽量包含：

| 字段 | 说明 |
|---|---|
| event_time_utc | 统一后的 UTC 时间 |
| computer | 主机名或设备标识 |
| channel | 日志通道 |
| provider | 事件来源 |
| event_id | 事件编号 |
| record_id | 原始记录编号 |
| user | 用户标识 |
| logon_id | 登录会话标识（如果有） |
| process_id | 进程 PID（如果有） |
| process_guid | Sysmon 进程 GUID（如果有） |
| parent_process_id | 父进程 PID（如果有） |
| source_file | 原始文件来源 |
| raw_event | 原始事件或其可追溯引用 |

注意：

1. 不同日志不一定拥有全部字段。
2. 缺失字段应保留为空或标记未知，不要编造。
3. 原始记录应保留，标准化结果不能替代原始证据。
4. 时间统一前要明确原始时间的时区。
5. 重复记录需要识别，但不能随意删除原始证据。

---

# 六、第四部分：事件关联

事件关联是系统的核心工程能力之一。

## 1. 为什么需要事件关联

单条日志通常只描述一个动作。

例如：

- 某用户成功登录。
- 某个进程被创建。
- 某个进程建立网络连接。

单独看每条记录，信息有限；把相关事件按照设备、时间、用户和进程联系起来，才可能形成事件经过。

## 2. 重点关联标识

| 标识 | 作用 | 注意事项 |
|---|---|---|
| PID | 标识进程 | 可能被重复使用 |
| PPID | 标识父进程 | 需要结合时间和设备 |
| ProcessGUID | Sysmon 进程唯一标识 | 适合关联同一进程的相关事件 |
| Logon ID | 关联登录会话 | 需要结合主机和时间上下文 |
| Computer | 区分设备 | 不能跨主机直接混用 PID |
| Timestamp | 建立事件先后关系 | 注意 UTC、本地时区和时钟偏差 |

## 3. 关联时必须避免的错误

- 不能只因为两个事件 PID 相同就认为它们属于同一个进程实例。
- 不能只凭时间相近就断定存在因果关系。
- 不能假设所有事件都有完整的进程或用户字段。
- 不能把缺失日志解释成“行为没有发生”。
- 不能忽略设备时间不同步的问题。

---

# 七、第五部分：规则分析

第一版先实现少量可解释规则，不需要自己开发复杂的检测引擎。

需要理解：

- 规则条件：哪些字段和条件组合才算命中。
- 时间窗口：在多长时间范围内关联事件。
- 事件序列：多个事件按什么顺序出现。
- 白名单：哪些正常行为需要排除或降噪。
- 严重程度：规则命中不等于事件已经确认。
- 误报与漏报：规则可能把正常行为判为可疑，也可能漏掉真实异常。

可以调研 Sigma 和 Hayabusa：

- Sigma：https://github.com/SigmaHQ/sigma
- Hayabusa：https://github.com/Yamato-Security/hayabusa
- Hayabusa 文档：https://yamato-security.github.io/hayabusa/

Hayabusa 可以把 Windows 事件日志整理成 CSV、JSON 或 JSONL 时间线，并使用 Sigma 风格规则进行分析。适合研究现有工具如何组织字段、规则和结果，但第一版不必重新实现它的全部能力。

注意：复用第三方代码、规则或数据前，要先阅读对应许可证与使用条件。

---

# 八、第六部分：LLM 辅助研判

## 1. 先学什么

- LLM API 的基本调用方式。
- Prompt 的角色与任务边界。
- JSON / Structured Output。
- 输入长度与上下文组织。
- 错误输出和模型不确定性。
- API 异常、超时和重试的基本处理。

## 2. AI 应该接收什么

优先接收已经标准化、关联并筛选过的事件摘要和证据引用，而不是无边界地把所有原始日志塞给模型。

## 3. AI 应该输出什么

建议结构：

1. 事件概述。
2. 事件时间线。
3. 关联证据列表。
4. 可能原因。
5. 已证实事实。
6. 尚未证实的推测。
7. 缺失信息。
8. 建议人工核查的事项。

## 4. 必须考虑的风险

- 模型可能生成没有证据支持的结论。
- 日志中的文本可能由外部用户控制，必须当作数据而不是模型指令。
- 不要把真实用户的敏感日志直接发送给未经批准的外部模型服务。
- 关键结论必须能回溯到原始事件。
- 第一版只生成报告草稿，不自动隔离设备或执行处置。

RAG、Agent 和多智能体编排都可以后续研究，不是 V1.0 的前置条件。

---

# 九、第七部分：实验设计与评价

科研价值来自可验证的研究问题，而不是界面是否漂亮。

建议至少设置三种对照方案：

| 方案 | 方法 |
|---|---|
| A | 规则分析 |
| B | LLM 直接分析输入日志 |
| C | 结构化事件关联 + 规则 + LLM |

使用同一批经过人工标注的测试样本，比较：

| 指标 | 关注点 |
|---|---|
| Precision | 系统报告的可疑事件中有多少是真的 |
| Recall | 已标注事件中系统找到了多少 |
| F1 | Precision 与 Recall 的综合表现 |
| Evidence Accuracy | 报告引用的证据是否真实且相关 |
| Unsupported Claim Rate | 没有证据支持的结论比例 |
| Analysis Time | 完成分析需要的时间 |

实验需要记录样本来源、标签标准、模型版本、提示词版本和测试配置，避免只保留表现好的案例。

---

# 十、学习顺序与暂缓事项

## 推荐顺序

1. Windows Event Log 与 Sysmon 基础。
2. Python 文件、XML、JSON、CSV 和时间处理。
3. 日志标准化。
4. PID、ProcessGUID、Logon ID 和时间关联。
5. 规则分析与证据管理。
6. LLM API 和结构化输出。
7. 实验评估。
8. 最后考虑 RAG、FastAPI、Streamlit 和 Agent。

## 当前已有基础

- 已学习 Windows 注册表、NTFS/ACL、认证与安全日志。
- 已接触 4624、4625、4634、4688、Logon ID 和进程父子关系。
- 已学习 Python 基础、文件、JSON、正则、OOP 和 CSV。
- 已参与 CVE 信息抓取与管理项目。
- 已接触 LLM、Agent、Planner、Orchestrator、LangGraph 和多智能体协作。

## 需要重点复习或补齐

- Sysmon 事件字段与配置。
- Windows Event Log XML 结构。
- Python XML 解析与时间处理。
- 事件标准化和关联算法。
- 规则分析与实验评估。
- LLM API 与结构化输出。

## 暂时不学

- Go。
- Kubernetes。
- 模型微调。
- 大规模分布式日志平台。
- 复杂多智能体系统。
- 自动化响应与处置。

---

# 十一、参考资料

1. Microsoft Sysmon：https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon
2. Microsoft Sysmon Events：https://learn.microsoft.com/en-us/windows/security/operating-system-security/sysmon/sysmon-events
3. Microsoft Sysmon Overview：https://learn.microsoft.com/en-us/windows/security/operating-system-security/sysmon/overview
4. Python Tutorial：https://docs.python.org/3/tutorial/
5. Hayabusa：https://github.com/Yamato-Security/hayabusa
6. Hayabusa Rules：https://github.com/Yamato-Security/hayabusa-rules
7. Sigma：https://github.com/SigmaHQ/sigma

> 第一阶段只学习和调研，不要求立即开发。先完成当前学期考试，再根据实际时间逐步补齐前置知识。
