# Windows 进程调查：路径、命令行与运行身份（Day 9）

> 📅 学习日期：2026-09-17  
> 📔 学习阶段：信息安全基础  
> 🔗 前置知识：Windows 进程 / PID / PPID / 进程树 / SID / Access Token / ACL  
> 🎯 今日目标：在 PID、PPID 和进程树的基础上，进一步通过 ExecutablePath、CommandLine 和 Owner 分析一个进程。

---

# 一、为什么只看进程名不够

例如看到：

    powershell.exe

仅凭这个名字，我们无法确定：

1. 它是不是真正的 Windows PowerShell。
2. 它对应的 exe 文件实际位于哪里。
3. 谁启动了它。
4. 它启动时执行了什么。
5. 它以哪个用户身份运行。

因此调查一个进程时，不能只看 Name。

今天主要学习以下信息：

    Name
    ProcessId
    ParentProcessId
    ExecutablePath
    CommandLine
    Owner

---

# 二、ExecutablePath

ExecutablePath 表示：

> 当前进程对应的 exe 程序文件实际位于哪里。

例如：

    Name:
    powershell.exe

    ExecutablePath:
    C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

这说明当前运行的 powershell.exe 对应的程序文件位于：

    C:\Windows\System32\WindowsPowerShell\v1.0\

ExecutablePath 主要回答：

> “这个程序本身在哪里？”

例如两个程序都可以叫：

    powershell.exe

但其中一个可能位于：

    C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

另一个可能位于：

    C:\Users\Alice\AppData\Roaming\powershell.exe

因此：

> 进程名相同，不代表它们一定是同一个程序。

但也不能只因为路径比较奇怪，就直接判断它是病毒。

路径只是一个调查线索，还需要继续结合父进程、CommandLine、Owner 等信息进行分析。

---

# 三、CommandLine

CommandLine 表示：

> 一个进程启动时使用的完整命令，以及启动时传给它的参数。

例如：

    powershell.exe -File C:\Users\Alice\Desktop\backup.ps1

可以拆成：

    powershell.exe

表示：

> 启动 PowerShell。

然后：

    -File

表示：

> 告诉 PowerShell 执行后面的 PowerShell 脚本文件。

最后：

    C:\Users\Alice\Desktop\backup.ps1

表示：

> PowerShell 要执行的脚本文件。

所以 ExecutablePath 和 CommandLine 的区别是：

    ExecutablePath
    → 程序本身在哪里？

    CommandLine
    → 启动这个程序时，让它干什么？

---

# 四、Python 示例

例如：

    ExecutablePath:
    C:\Python\python.exe

说明：

> Python 程序本身位于 C:\Python\python.exe。

如果：

    CommandLine:
    python.exe D:\study\hello.py

说明：

> 启动 Python 的同时，让 Python 执行 D:\study\hello.py 这个脚本。

因此：

    C:\Python\python.exe
    → Python 程序本身的位置

    D:\study\hello.py
    → Python 启动后要执行的脚本

这是今天非常重要的区别。

---

# 五、查询进程详细信息

今天使用的 PowerShell 命令：

    Get-CimInstance Win32_Process |
    Select-Object Name, ProcessId, ParentProcessId, ExecutablePath, CommandLine

其中：

    Get-CimInstance Win32_Process

作用：

> 获取当前 Windows 中所有进程的信息。

管道：

    |

作用：

> 把前一个命令产生的结果交给后面的命令继续处理。

然后：

    Select-Object

作用：

> 从大量进程属性中，只选择我们需要查看的信息。

今天选择：

    Name
    ProcessId
    ParentProcessId
    ExecutablePath
    CommandLine

---

# 六、本机 PowerShell 实例

实际查询得到：

    Name            : powershell.exe
    ProcessId       : 3992
    ParentProcessId : 3164
    ExecutablePath  : C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

这说明：

    Name
    → 进程叫 powershell.exe

    PID
    → 3992

    PPID
    → 3164

    ExecutablePath
    → C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe

CommandLine 中还出现：

    powershell.exe -noexit -command ...

以及：

    Microsoft VS Code
    shellIntegration.ps1

其中：

    -noexit

大致表示：

> 命令执行完成后不要退出 PowerShell。

而：

    -command

表示：

> PowerShell 启动后执行后面的命令。

由于 CommandLine 中出现了：

    VS Code
    shellIntegration.ps1

因此可以判断：

> 这个 PowerShell 与 VS Code 的集成终端有关。

也就是说，很可能是 VS Code 打开了一个 PowerShell 终端，并让 PowerShell 加载 VS Code 自己的终端集成脚本。

---

# 七、PowerShell → Python 的真实进程关系

实际还查询到：

    Name            : python.exe
    ProcessId       : 1056
    ParentProcessId : 3992
    ExecutablePath  : C:\Users\73360\AppData\Local\Programs\Python\Python314\python.exe

同时：

    powershell.exe
    PID = 3992

而：

    python.exe
    PPID = 3992

因为：

    python.exe 的 PPID
    =
    powershell.exe 的 PID

所以可以判断：

    powershell.exe
    PID 3992
        |
        └── python.exe
            PID 1056
            PPID 3992

也就是说：

> python.exe 是这个 powershell.exe 的子进程。

这就是利用 PID 和 PPID 还原真实的父子进程关系。

---

# 八、Python 的 CommandLine

本机查询到 Python 的 CommandLine 类似：

    "C:\Users\73360\AppData\Local\Programs\Python\Python314\python.exe"

这里后面没有出现：

    test.py

或者其他 Python 脚本。

所以从当前信息只能确定：

> 启动了 python.exe。

但不能从这条 CommandLine 判断它启动时指定执行了某个 .py 文件。

如果以后看到：

    python.exe C:\Users\73360\Desktop\test.py

那么就能进一步判断：

> Python 启动时被要求执行 test.py。

因此：

    ExecutablePath
    → Python 程序文件在哪里

    CommandLine
    → Python 启动时被要求执行什么

---

# 九、查询进程的运行用户

除了调查：

> 谁启动了这个进程？

还需要调查：

> 这个进程到底以谁的身份运行？

今天使用：

    Get-CimInstance Win32_Process -Filter "ProcessId = 3992" |
    Invoke-CimMethod -MethodName GetOwner

本机得到：

    Domain      : 难办叔叔的电脑
    User        : 73360
    ReturnValue : 0

这说明：

> PID 3992 的 powershell.exe 以本机账户“难办叔叔的电脑\73360”的身份运行。

其中：

    ReturnValue = 0

表示：

> 这次 GetOwner 查询成功。

---

# 十、Owner 是什么

Owner 可以理解为：

> 当前这个进程正在使用哪个用户身份运行。

例如：

    User:
    73360

说明：

> 这个进程以 73360 这个账户的身份运行。

但需要注意：

    73360

这里是：

> 用户名 / 账户名。

它不是 SID。

---

# 十一、用户名和 SID 的区别

例如：

    用户名：
    73360

Windows 真正用于唯一识别安全主体的是：

    SID

所以大致关系是：

    用户名 73360
        ↓
    对应一个 SID
        ↓
    Windows 使用 SID 识别这个安全主体

用户名是给人看的名称。

SID 才是 Windows 安全系统真正使用的重要身份标识。

---

# 十二、Owner 与 Access Token 的联系

进程以某个用户身份运行时，会处于对应的安全上下文中。

例如：

    用户 73360
        ↓
    对应安全身份
        ↓
    powershell.exe 以该身份运行
        ↓
    进程拥有相应的 Access Token

Access Token 中包含例如：

    用户 SID
    组 SID
    Privileges
    完整性级别
    等信息

当 PowerShell 想访问某个受保护的对象，例如：

    secret.txt

Windows 会进行访问检查。

大致过程：

    powershell.exe
        ↓
    Access Token

    secret.txt
        ↓
    ACL

然后：

    Access Token
        +
    ACL
        ↓
    Windows 访问检查
        ↓
    Allow / Deny

因此 Owner 对安全分析很重要。

因为 Owner 告诉我们：

> 这个进程是以哪个用户身份运行的。

然后我们可以进一步调查：

    这个用户的 SID 是什么？
    属于哪些组？
    Token 中有哪些 Privileges？
    拥有什么权限？

---

# 十三、父进程和运行身份不是一回事

需要区分：

    Parent Process
    → 谁创建了这个进程？

和：

    Owner
    → 这个进程现在以谁的身份运行？

父进程关系主要描述：

> 谁启动了谁。

Owner 主要描述：

> 当前进程使用哪个用户的安全身份运行。

因此不能只根据父进程判断一个进程拥有什么权限。

---

# 十四、今天形成的完整进程调查框架

以后调查一个进程，可以依次看：

    1. Name
       → 它叫什么？

    2. PID
       → 它自己的进程编号是什么？

    3. PPID
       → 谁创建了它？

    4. ExecutablePath
       → 它真正的 exe 文件在哪里？

    5. CommandLine
       → 启动它的时候，让它干什么？

    6. Owner
       → 它以哪个用户身份运行？

然后进一步联系：

    Owner
        ↓
    用户
        ↓
    SID
        ↓
    Access Token
        ↓
    ACL
        ↓
    权限判断

---

# 十五、今天最重要的知识链

今天需要真正记住：

    进程名
        ↓
    PID / PPID
        ↓
    父子进程关系
        ↓
    ExecutablePath
        ↓
    CommandLine
        ↓
    Owner
        ↓
    SID
        ↓
    Access Token
        ↓
    ACL
        ↓
    Windows 权限判断

---

# 十六、今天最容易混淆的几个点

## 1. ExecutablePath 和 CommandLine

ExecutablePath：

> 程序本身在哪里。

CommandLine：

> 启动这个程序时，让它执行什么。

---

## 2. 用户名和 SID

    73360
    → 用户名

    SID
    → Windows 用来唯一识别安全主体的重要标识

二者不是同一个东西。

---

## 3. 父进程和权限

父进程启动子进程：

> 只说明父子创建关系。

不代表：

> 父进程权限一定高于子进程。

权限分析仍然需要结合：

    Access Token
    ACL
    Privileges
    完整性级别
    等信息

---

# 十七、今日掌握结果

今天已经能够：

- 使用 Get-CimInstance 查看 Windows 进程。
- 理解 Name、PID、PPID。
- 理解 ExecutablePath。
- 理解 CommandLine。
- 区分“程序在哪里”和“程序启动时执行什么”。
- 根据 PID 和 PPID 判断父子进程关系。
- 根据 CommandLine 初步分析进程用途。
- 查询指定进程的 Owner。
- 理解 Owner 与用户身份的关系。
- 区分用户名与 SID。
- 把进程运行身份重新连接到 Access Token 和 ACL 权限模型。

今天已经从单纯的“看进程树”，进一步进入：

    Windows 进程基础调查
