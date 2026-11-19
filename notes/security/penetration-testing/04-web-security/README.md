# Part 04 · Web 安全

> 当前状态：📚 已建立学习地图，按题目驱动方式进行学习
> 📅 更新日期：2026-11-19
> 🎯 建议节奏：每天 30～60 分钟；考试周优先保证课内学习

## 学习目标

理解 Web 应用的请求处理机制、身份认证与访问控制，掌握常见漏洞的成因、防御和授权实验方法，并能独立分析入门 CTF Web 题目。

## 学习顺序

1. [01 · CTF Web 学习地图与题目驱动训练](01-web-security-learning-map.md)
2. Web 基础：HTTP、HTML、JavaScript、浏览器开发者工具
3. 身份与会话：Cookie、Session、Token、认证与授权
4. SQL 与数据库基础
5. Burp Suite 基础
6. 常见漏洞：SQL 注入、XSS、CSRF、访问控制、文件上传
7. 进阶漏洞：SSRF、XXE、SSTI、路径遍历、反序列化
8. CTF 综合题、源码阅读与 Writeup 复盘

## 主要学习资源

- [PortSwigger Web Security Academy](https://portswigger.net/web-security)：免费课程与交互式实验，作为主线。
- [The CTF Primer](https://primer.picoctf.org/)：补充 CTF 和 Web 基础。
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/)：开源教学靶场，理解漏洞与修复。
- [OWASP Juice Shop](https://owasp.org/projects/juice-shop)：开源 CTF 风格应用，后期综合练习。

## 学习方法

每次学习按以下流程进行：

    回忆旧知识
        ↓
    学习一个概念
        ↓
    在授权实验环境中完成练习
        ↓
    记录原理、证据和防御
        ↓
    隔天复述或做相似题

## 安全边界

只在自己的设备、虚拟机、公开教学靶场、CTF 或明确授权的环境中进行测试。不要对真实网站或未经授权的系统进行扫描、测试或利用。

[← 返回信息安全学习路线](../README.md)
