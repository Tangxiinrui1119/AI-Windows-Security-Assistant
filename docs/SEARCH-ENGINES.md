# 搜索引擎收录与网站维护

本仓库已提供GitHub Pages网站。第3、4章的Markdown源在`notes/network/`，可抓取的完整HTML正文在`docs/network/`。HTML不依赖客户端取回Markdown，包含中文标题、描述、规范链接、章节导航与首页入口。

- [网络课程入口](https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/network/index.html)
- [站点地图](https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/sitemap.xml)
- [站内知识点搜索](https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/search.html)

## robots的实际范围

这是项目站，路径为`/AI-Windows-Security-Assistant/`。爬虫只把域名根路径`https://tangxiinrui1119.github.io/robots.txt`当作robots规则；在本项目的docs里放robots.txt只会发布到项目子路径，不能控制整个域名。

本次不伪造已设置有效robots规则。检查时域名根robots返回404；404本身不禁止抓取。本项目HTML声明index,follow，并通过普通可跟踪链接发现页面。若以后创建或管理`Tangxiinrui1119.github.io`用户站仓库，可在其站点根目录放入：

```text
User-agent: *
Allow: /
Sitemap: https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/sitemap.xml
```

## 用户可执行的收录步骤

1. 在Google Search Console添加网址前缀资源`https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/`，按平台提示完成所有权验证（例如提供HTML验证文件后，将其发布到docs下）。不要编造验证令牌。
2. 提交上述sitemap.xml；用网址检查分别检查两章静态页，按需请求编入索引。
3. 使用Bing或百度时，在其站长平台分别验证站点并提交页面/站点地图；不同平台可用提交方式以其界面为准。
4. 查看平台后续抓取和索引报告。站内搜索可用不代表外部搜索引擎已经收录。

搜索引擎可能数天至数周后处理，也可能不收录；提交、sitemap、robots及公开200响应均不保证收录或排名。[Google抓取请求说明](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)、[站点地图说明](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)、[robots规则作用](https://developers.google.com/search/docs/crawling-indexing/robots/intro)。本次未代用户登录站长平台，也未声称已被索引。

## 内容更新

1. 修改对应Markdown；用`node scripts/build-search-index.cjs`重建全部站内索引。
2. 使用Node.js和marked 17或更新的兼容token接口版本运行`node scripts/build-network-pages.cjs`，重建两章静态正文、课程目录和sitemap。marked需在Node模块解析路径中；可使用现有工具环境，若新装工具依赖按个人偏好放D盘，不必放入仓库或提交node_modules。
3. 运行`node --test tests/search.test.cjs`，检查静态页面链接及标题，将源与生成文件一起提交。

静态生成器目前覆盖这两章，新增章节时应更新生成器中的章节清单；它不声称已为其他全部课程生成静态页面。
