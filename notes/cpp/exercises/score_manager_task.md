# C++ 成绩分析器 · 独立练习任务书

> 日期：2026-10-15  
> 对应课堂笔记：[05 · STL 迭代器与成绩分析器](../05-stl-iterators-and-score-manager.md)  
> 状态：已在本机 VS Code 完成、编译并验收；本文是**题目与框架**，不是本机源码副本。

## 学习目标

综合使用 `vector`、`begin/end` 迭代器、`auto`、解引用、函数、引用、`const`、`if`、`for`。

## 初始数据与四道题

```cpp
vector<int> scores = {58, 72, 90, 45, 83};
```

1. `void showScores(const vector<int>& scores)`：用迭代器按顺序输出所有成绩。
2. `void addBonus(vector<int>& scores)`：所有成绩加 5 分，但不能超过 100，必须改原 vector。
3. `double averageScore(const vector<int>& scores)`：计算均分（可假设 vector 非空），避免整数除法丢失小数。
4. `int countPassed(const vector<int>& scores)`：统计成绩 >= 60 的人数。

## 原始 TODO 框架（保留让自己独立完成）

```cpp
#include <iostream>
#include <vector>
using namespace std;

void showScores(const vector<int>& scores) {
    // TODO：迭代器遍历输出
}
void addBonus(vector<int>& scores) {
    // TODO：全部加5分，最高100
}
double averageScore(const vector<int>& scores) {
    // TODO：计算double平均分
    return 0;
}
int countPassed(const vector<int>& scores) {
    // TODO：统计及格人数
    return 0;
}

int main() {
    vector<int> scores = {58, 72, 90, 45, 83};
    cout << "原始成绩：" << endl;
    showScores(scores);
    cout << "原始平均分：" << averageScore(scores) << endl;
    cout << "原始及格人数：" << countPassed(scores) << endl;

    addBonus(scores);
    scores.push_back(96);
    cout << "更新后的成绩：" << endl;
    showScores(scores);
    cout << "更新后的平均分：" << averageScore(scores) << endl;
    cout << "更新后的及格人数：" << countPassed(scores) << endl;
}
```

## 验收

| 项目 | 预期 |
|---|---|
| 原始成绩 | 58 72 90 45 83 |
| 原始均分 | 69.6 |
| 原始及格人数 | 3 |
| 更新后成绩 | 63 77 95 50 88 96 |
| 更新后均分 | 78.1667（约） |
| 更新后及格人数 | 5 |
| 98 分加 5 分的边界测试 | 100，不是 103 |

课堂验收：最终截图显示原始均分 69.6、及格人数 3、更新成绩及均分 78.1667、及格人数 5；Codex 反馈边界测试通过。

## 给 Codex 的指导规则

- 用户先独立写；不要提前替用户补全 TODO。
- 出问题时先提示错因（例如迭代器与元素值、变量作用域、整数除法），再逐步提示。
- 明确要求验收时才检查全部功能和边界测试。
- 不要把该 TODO 框架当作用户已完成的实际源码。

> 本机已完成的 `D:\learn\score_manager.cpp` 仍应由用户从实际工作区上传，不能根据截图声称获得精确源码。
