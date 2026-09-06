# Level 1 —— 查看 Windows 自启动项

# 这是整个项目的第一个脚本：
# 用 PowerShell 列出电脑开机时会自动运行的程序。
# 自启动项通常藏在这几个地方：
#   1. 注册表 Run 键（当前用户）
#   2. 注册表 Run 键（本机所有用户）
#   3. 注册表 Run 键（32 位程序在 64 位系统上）
#   4. 启动文件夹（当前用户 / 所有用户）

$results = @()

# 1~3. 注册表 Run 键
$runKeys = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run',
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run',
    'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run'
)

foreach ($key in $runKeys) {
    $props = Get-ItemProperty -Path $key -ErrorAction SilentlyContinue
    if ($null -eq $props) { continue }
    foreach ($name in $props.PSObject.Properties.Name) {
        if ($name -in 'PSPath', 'PSParentPath', 'PSChildName', 'PSDrive', 'PSProvider') { continue }
        $results += [PSCustomObject]@{
            来源 = $key -replace '^HKCU', '注册表(当前用户)' -replace '^HKLM', '注册表(本机)'
            名称 = $name
            命令 = $props.$name
        }
    }
}

# 4. 启动文件夹（快捷方式 .lnk）
$folders = @{
    '启动文件夹(当前用户)' = [Environment]::GetFolderPath('Startup')
    '启动文件夹(所有用户)' = [Environment]::GetFolderPath('CommonStartup')
}
foreach ($entry in $folders.GetEnumerator()) {
    if (Test-Path $entry.Value) {
        Get-ChildItem $entry.Value -Filter *.lnk -ErrorAction SilentlyContinue | ForEach-Object {
            $results += [PSCustomObject]@{
                来源 = $entry.Key
                名称 = $_.BaseName
                命令 = $_.FullName
            }
        }
    }
}

# 输出结果
if ($results.Count -eq 0) {
    Write-Host '没有发现自启动项。'
} else {
    Write-Host ('共发现 {0} 个自启动项：' -f $results.Count)
    $results | Format-Table -AutoSize -Wrap
}

# 思考题：
#   1. 每个自启动项的命令指向哪个程序？这个程序是干什么的？
#   2. 有没有你不认识、想不起来的条目？把它记到学习日志的「卡住的地方」。
#   3. 下一关（Level 2）：用 C++ 或 Python 把这个功能写成自己的程序。
