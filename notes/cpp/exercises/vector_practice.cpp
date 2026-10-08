// 2026-10-08: vector 成绩统计器。
// 根据当天练习的核心逻辑还原，非截图原文件逐字转录。
#include <iostream>
#include <vector>

using namespace std;

int main()
{
    vector<int> scores;

    // 输入 5 个整数，依次存入 vector。
    for (int i = 0; i < 5; i++) {
        int score;
        cin >> score;
        scores.push_back(score);
    }

    int sum = 0;

    // 遍历每个数字：累加，同时输出。
    for (int score : scores) {
        sum += score;
        cout << score << " ";
    }

    cout << endl;
    cout << "Sum: " << sum << endl;

    return 0;
}
