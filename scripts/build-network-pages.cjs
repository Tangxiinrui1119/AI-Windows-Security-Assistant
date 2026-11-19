// Rebuild crawlable chapter pages. Requires the marked package on Node's module path.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');
const root = path.resolve(__dirname, '..');
const base = 'https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/';
const chapters = [
  { slug: '03-data-link-layer', title: '第3章 数据链路层', description: '计算机网络第3章中文复习笔记：帧、CRC、PPP、CSMA/CD、MAC地址、以太网交换机、VLAN与高速以太网。' },
  { slug: '04-network-layer', title: '第4章 网络层', description: '计算机网络第4章中文复习笔记：IP与CIDR、ARP、IPv4首部和分片、最长前缀匹配、ICMP、IPv6、RIP、OSPF、BGP、VPN与NAT。' },
  { slug: '05-transport-layer', title: '第5章 运输层', description: '计算机网络第5章中文复习笔记：端口、UDP与TCP、可靠传输、滑动窗口、流量控制、拥塞控制、三次握手与四次挥手。' },
  { slug: '06-application-layer', title: '第6章 应用层', description: '计算机网络第6章中文复习笔记：DNS、FTP、TELNET、WWW、URL、HTTP、电子邮件、DHCP与SNMP。' }
];
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const renderer = new marked.Renderer();
// Use the token-based API of marked 17+.
renderer.link = function (token) {
  let href = token.href;
  if (!/^(https?:|#)/i.test(href)) {
    const [target, hash] = href.split('#');
    if (target === 'README.md') href = 'index.html';
    else if (chapters.some(c => target === c.slug + '.md')) href = target.replace(/\.md$/, '.html');
    else {
      const file = path.posix.normalize('notes/network/' + target);
      href = '../reader.html?f=' + encodeURIComponent(file);
    }
    if (hash) href += '#' + hash;
  }
  return `<a href="${esc(href)}">${this.parser.parseInline(token.tokens)}</a>`;
};
const style = `
:root{--bg:#06090f;--panel:#0a1120;--panel2:#0d1626;--border:#1b2a45;--text:#dbe7f5;--dim:#8596b3;--cyan:#53c8ff;--green:#3df5b0}
body{margin:0;background:radial-gradient(ellipse at 50% 0,rgba(83,200,255,.12),transparent 65%),var(--bg);color:var(--text);font:17px/1.85 -apple-system,"PingFang SC","Microsoft YaHei","Segoe UI",sans-serif;min-height:100vh}
main{max-width:940px;margin:auto;padding:28px 24px 70px}
article{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:clamp(18px,4vw,48px)}
a{color:var(--cyan)}a:hover{color:var(--green)}
nav{display:flex;flex-wrap:wrap;gap:12px 18px;margin-bottom:24px}
h1{font-size:clamp(24px,4.5vw,36px);line-height:1.3;background:linear-gradient(92deg,#53c8ff,#3df5b0,#9d7bff);background-clip:text;color:transparent}
h2{margin-top:2em;border-bottom:1px solid var(--border);padding-bottom:8px}h3{margin-top:1.6em;color:var(--cyan)}
table{display:block;overflow:auto;border-collapse:collapse;max-width:100%;margin:22px 0;font-size:.92em}
td,th{border:1px solid var(--border);padding:9px 13px;text-align:left}th{background:rgba(83,200,255,.09);color:var(--cyan)}
pre{overflow:auto;padding:18px;background:var(--panel2);border:1px solid var(--border);border-radius:12px}
code{font-family:"Cascadia Code",Consolas,monospace;overflow-wrap:anywhere}
blockquote{border-left:3px solid var(--green);padding:8px 16px;background:rgba(61,245,176,.05);color:var(--dim)}
.search{display:flex;gap:8px;margin:18px 0}
input,button{padding:8px 12px;font:inherit;color:inherit;background:var(--panel);border:1px solid var(--border);border-radius:8px}
input{min-width:0;flex:1}button{color:var(--green);cursor:pointer}
footer{margin-top:28px;color:var(--dim)}li{margin:5px 0}
@media(max-width:600px){main{padding:16px 10px}body{font-size:16px}}
`;
function page(title, description, relative, body) {
 return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · 计算机网络复习笔记</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${base+relative}"><link rel="sitemap" type="application/xml" href="../sitemap.xml"><style>${style}</style></head><body><main><nav><a href="../index.html">网站首页</a><a href="index.html">网络课程目录</a><a href="../reader.html?f=notes/courses/README.md">课内学习</a><a href="../search.html">知识点搜索</a></nav><form class="search" action="../search.html" role="search"><input type="search" name="q" aria-label="搜索笔记与项目" placeholder="搜索知识点"><button>搜索</button></form><article>${body}</article><footer>依据用户提供课件整理 · Markdown为内容源，静态正文可直接抓取 · <a href="../SEARCH-ENGINES.md">搜索引擎说明</a></footer></main></body></html>\n`;
}
fs.mkdirSync(path.join(root,'docs/network'), {recursive:true});
for (const c of chapters) {
 let md = fs.readFileSync(path.join(root,'notes/network',c.slug+'.md'),'utf8');
 let html = marked.parse(md, {renderer, gfm:true});
 let count = 0;
 html = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_,level,text) => `<h${level} id="section-${count++}">${text}</h${level}>`);
 const headings = Array.from(html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g));
 const toc = '<nav aria-label="章节目录">'+headings.map(m=>`<a href="#${m[1]}">${m[2]}</a>`).join('')+'</nav>';
 fs.writeFileSync(path.join(root,'docs/network',c.slug+'.html'),page(c.title,c.description,'network/'+c.slug+'.html',toc+html));
}
const body = '<h1>计算机网络复习笔记</h1><p>按课件章节复习，从链路层传帧、网络层逐跳转发，串起运输层的进程通信。第3～6章提供不依赖JavaScript的静态全文。</p><ul>'+['01-network-overview','02-physical-layer'].map((s,i)=>`<li><a href="../reader.html?f=notes/network/${s}.md">第${i+1}章 ${i?'物理层':'计算机网络概述'}</a></li>`).join('')+chapters.map(c=>`<li><a href="${c.slug}.html">${c.title}</a>：${c.description}</li>`).join('')+'</ul><p>第3、4章整理于2026-10-22；第5章整理于2026-11-01；第6章整理于2026-11-05。课件覆盖范围与内部勘误均在各章正文标注。</p>';
fs.writeFileSync(path.join(root,'docs/network/index.html'),page('计算机网络课程目录','计算机网络第1至6章复习入口，第3章数据链路层、第4章网络层、第5章运输层与第6章应用层中文笔记、公式、对比与例题。','network/index.html',body));
const urls = ['', 'network/index.html', ...chapters.map(c=>'network/'+c.slug+'.html')];
fs.writeFileSync(path.join(root,'docs/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${base+u}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log('Built ' + (chapters.length + 1) + ' network pages and sitemap.xml.');
