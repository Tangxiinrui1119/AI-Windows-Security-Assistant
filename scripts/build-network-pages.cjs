// Rebuild crawlable chapter pages. Requires the marked package on Node's module path.
const fs = require('node:fs');
const path = require('node:path');
const { marked } = require('marked');
const root = path.resolve(__dirname, '..');
const base = 'https://tangxiinrui1119.github.io/AI-Windows-Security-Assistant/';
const chapters = [
  { slug: '03-data-link-layer', title: '第3章 数据链路层', description: '计算机网络第3章中文复习笔记：帧、CRC、PPP、CSMA/CD、MAC地址、以太网交换机、VLAN与高速以太网。' },
  { slug: '04-network-layer', title: '第4章 网络层', description: '计算机网络第4章中文复习笔记：IP与CIDR、ARP、IPv4首部和分片、最长前缀匹配、ICMP、IPv6、RIP、OSPF、BGP、VPN与NAT。' }
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
const style = `body{margin:0;background:#f4f7fb;color:#172238;font:17px/1.85 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1000px;margin:auto;padding:28px 24px 70px}article{background:white;border:1px solid #d9e2ee;border-radius:16px;padding:clamp(18px,4vw,48px)}a{color:#075fb5}nav{display:flex;flex-wrap:wrap;gap:18px;margin-bottom:24px}h1{font-size:2em}h2{margin-top:2em;border-bottom:1px solid #dae3ed;padding-bottom:8px}h3{margin-top:1.6em}table{display:block;overflow:auto;border-collapse:collapse;max-width:100%;margin:22px 0;font-size:.92em}td,th{border:1px solid #cad5e3;padding:9px 13px;text-align:left}th{background:#eaf2fc}pre{overflow:auto;padding:18px;background:#eef3f9;border-radius:8px}code{font-family:Consolas,monospace;overflow-wrap:anywhere}blockquote{border-left:4px solid #2475ba;margin:18px 0;padding:1px 18px;background:#f2f7fd;color:#40526a}.search{display:flex;gap:8px;margin:18px 0}input{min-width:0;flex:1;padding:10px;font:inherit}button{padding:8px 16px;font:inherit}footer{margin-top:28px;color:#52647a}li{margin:5px 0}html{scroll-behavior:smooth}@media(max-width:600px){main{padding:16px 10px}body{font-size:16px}h1{font-size:1.6em}}`;
function page(title, description, relative, body) {
 return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · 计算机网络复习笔记</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow"><link rel="canonical" href="${base+relative}"><link rel="sitemap" type="application/xml" href="../sitemap.xml"><style>${style}</style></head><body><main><nav><a href="../index.html">网站首页</a><a href="index.html">网络课程目录</a><a href="../reader.html?f=notes/README.md">全部学习笔记</a><a href="../search.html">知识点搜索</a></nav><form class="search" action="../search.html" role="search"><input type="search" name="q" aria-label="搜索全部学习笔记" placeholder="搜索知识点"><button>搜索</button></form><article>${body}</article><footer>依据用户提供课件整理 · Markdown为内容源，静态正文可直接抓取 · <a href="../SEARCH-ENGINES.md">搜索引擎说明</a></footer></main></body></html>\n`;
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
const body = '<h1>计算机网络复习笔记</h1><p>按课件章节复习，先理解链路层传帧，再理解网络层逐跳转发。第3、4章提供不依赖JavaScript的静态全文。</p><ul>'+['01-network-overview','02-physical-layer'].map((s,i)=>`<li><a href="../reader.html?f=notes/network/${s}.md">第${i+1}章 ${i?'物理层':'计算机网络概述'}</a></li>`).join('')+chapters.map(c=>`<li><a href="${c.slug}.html">${c.title}</a>：${c.description}</li>`).join('')+'</ul><p>整理日期：2026-10-22。第4章未展开的小节和课件勘误已在正文明确标注。</p>';
fs.writeFileSync(path.join(root,'docs/network/index.html'),page('计算机网络课程目录','计算机网络第1至4章复习入口，第3章数据链路层与第4章网络层中文笔记、公式、对比与例题。','network/index.html',body));
const urls = ['', 'network/index.html', ...chapters.map(c=>'network/'+c.slug+'.html')];
fs.writeFileSync(path.join(root,'docs/sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`  <url><loc>${base+u}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log('Built 3 network pages and sitemap.xml.');
