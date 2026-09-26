# 第8章 文件读写、CSV 与 JSON

> 来源：课程 PPT《第8章 文件读写》
> 复习目标：掌握普通文件读写和 CSV 读写，理解 JSON 数据格式与编码/解码。

## 一、知识地图

    文件读写
    ↓
    ⭐ open() 打开文件
    ├─ filename → 文件路径字符串
    ├─ mode → 打开模式
    └─ f → 文件对象
    ↓
    ⭐ 打开模式
    ├─ r → 只读
    ├─ w → 覆盖写
    ├─ x → 创建写
    ├─ a → 追加写
    ├─ b → 二进制
    ├─ t → 文本
    └─ + → 增加读写能力
    ↓
    文件关闭
    ├─ close()
    ├─ closed 属性
    └─ ⭐ with → 操作结束自动关闭
    ↓
    ⭐ 读取文件
    ├─ read() → 整体字符串
    ├─ readline() → 一行
    ├─ readlines() → 多行字符串列表
    └─ seek() → 移动文件读写位置
    ↓
    ⭐ 写文件
    ├─ write() → 写一个字符串 / 字节流
    ├─ writelines() → 写字符串列表
    ├─ w → 覆盖
    └─ a → 追加
    ↓
    ⭐ CSV
    ├─ 逗号分隔数据
    ├─ import csv
    ├─ csv.reader() → reader 对象
    ├─ csv.writer() → writer 对象
    ├─ writerow() → 写一行
    └─ writerows() → 写多行
    ↓
    ⭐ JSON
    ├─ 轻量级数据交换格式
    ├─ key:value 键值对
    ├─ {} → 对象
    ├─ [] → 数组
    ├─ import json
    ├─ dumps() → Python 对象 → JSON 字符串
    ├─ loads() → JSON 字符串 → Python 对象
    └─ ensure_ascii=False → 保留中文字符
    ↓
    综合实例
    ├─ split() 分割文本
    ├─ 正则提取数据
    ├─ 写入 CSV
    └─ 输出 JSON

> [!IMPORTANT]
> 本章重点：
> **⭐ r / w / a 三种最常用打开模式**
> **⭐ read / readline / readlines 的区别**
> **⭐ write / writelines 与覆盖写、追加写**
> **⭐ csv.reader / csv.writer / writerow / writerows**
> **⭐ JSON 的键值对结构，以及 dumps() / loads() 的方向**
## 二、打开文件

基本格式：

    f = open(filename, mode)

- filename：文件路径
- mode：打开方式
- f：文件对象

open() 是让程序获得文件访问能力，不等于弹出一个图形窗口。

## 三、常见打开模式

    r   只读，文件不存在会报 FileNotFoundError
    w   覆盖写；不存在就创建，存在就覆盖
    x   创建写；已存在会报 FileExistsError
    a   追加写；在文件末尾继续写
    b   二进制模式
    t   文本模式（默认）
    +   在基础模式上增加读写能力

最常用先记：

    r = read
    w = write
    a = append

## 四、关闭文件与 with

手动：

    f.close()

更常用：

    with open("data.txt", "r") as f:
        ...

with 语句完成文件操作后会自动关闭文件。

## 五、读取文件

    f.read(size)

读取整个文件；给 size 时读取指定长度。

    f.readline(size)

读取一行。

    f.readlines()

读取剩余所有行，每一行作为一个字符串组成列表。

记忆：

    read()       → 大字符串
    readline()   → 一行
    readlines()  → 多行列表

## 六、文件读写位置 seek()

读完整个文件后，文件位置会移动到结尾。

    f.seek(offset, whence)

PPT 中：

- whence=0：从文件开头算
- whence=1：从当前位置算
- whence=2：从文件末尾算

例如：

    f.seek(0)

回到文件开头。

## 七、写文件

写一个字符串：

    f.write(s)

写字符串列表：

    f.writelines(lines)

注意：

- w 会覆盖原内容。
- a 会在末尾追加。
- writelines() 的元素应为字符串。

## 八、CSV

CSV（Comma-Separated Values）是一种常见的一维 / 二维数据存储格式，通常用英文逗号分隔字段，扩展名 .csv。

导入：

    import csv

读取：

    r = csv.reader(f)

写入：

    w = csv.writer(f)

一行：

    w.writerow(...)

多行：

    w.writerows(...)

## 九、JSON

JSON（JavaScript Object Notation）是轻量级数据交换格式。

核心规则：

- 数据用键值对组织。
- 键值对之间用逗号分隔。
- {} 保存对象。
- [] 保存对象组成的数组。

例如：

    {
        "name": "Tom",
        "age": 18
    }

### 键值对

    "name": "Tom"

其中：

- name 是键 key。
- Tom 是值 value。

### JSON 字符串和普通字符串

JSON 在传输时本质上也是文本字符串，但它遵守固定结构规则，因此程序可以按统一方式解析其中的数据。

## 十、json 库

导入：

    import json

Python 对象 → JSON 字符串：

    s = json.dumps(data)

JSON 字符串 → Python 对象：

    data = json.loads(s)

中文数据常用：

    json.dumps(data, ensure_ascii=False)

PPT 还介绍：

- sort_keys
- indent
- ensure_ascii

## 十一、本章最该记住

    open()
    with open(...) as f
    read / readline / readlines
    write / writelines
    csv.reader / csv.writer
    writerow / writerows
    json.dumps / json.loads
