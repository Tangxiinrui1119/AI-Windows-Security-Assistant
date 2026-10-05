const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../docs/search-core.js');
test('Chinese body terms locate the relevant heading, not the map', () => {
  const doc = core.parse('notes/network/01.md', '# 网络\n## 知识地图\n三次握手\n## 连接建立\n三次握手使用 SYN、ACK。', 'sha');
  assert.equal(core.search([doc], '三次握手')[0].heading, '连接建立');
});
test('A substantive section ranks above title metadata and headings keep their position', () => {
  const doc = core.parse('notes/cpp/01.md', '# new / delete\n> 目标：理解 new / delete\n## 知识地图\nnew delete\n## 内存释放\nnew int 对应 delete p。');
  const result = core.search([doc], 'new delete')[0];
  assert.equal(result.heading, '内存释放');
  assert.equal(result.headingIndex, 2);
});
test('Title matches rank above notes only mentioning the term', () => {
  const body = core.parse('notes/cpp/01.md', '# 指针\n## 其他\nnew delete 也会用到指针');
  const title = core.parse('notes/cpp/02.md', '# new / delete\n## 用法\n申请和释放内存');
  assert.equal(core.search([body, title], 'new delete')[0].doc.path, title.path);
});
test('Case, duplicate tokens, C++ and multiple keywords work', () => {
  const doc = core.parse('notes/cpp/01.md', '# C++\n## 内存\nnew 和 delete');
  assert.equal(core.search([doc], 'C++ NEW new delete').length, 1);
  assert.equal(core.search([doc], 'new 缺失词').length, 0);
  assert.equal(core.search([doc], '   ').length, 0);
});
test('Code fences do not create false section headings', () => {
  const doc = core.parse('notes/python/01.md', '# Python\n## 示例\n```python\n# 注释\nprint("hi")\n```\n## 总结\n内容');
  assert.deepEqual(doc.sections.map(s => s.heading), ['Python', '示例', '总结']);
  assert.ok(doc.sections[1].text.includes('注释'));
});
test('Only course note files are eligible and Part folders are labeled', () => {
  assert.equal(core.eligible('notes/python/README.md'), false);
  assert.equal(core.eligible('docs/devlog/2026/09.md'), false);
  assert.equal(core.eligible('../notes/cpp/01.md'), false);
  const doc = core.parse('notes/security/penetration-testing/07-active-directory-and-kerberos/01.md', '# Kerberos');
  assert.equal(doc.part, 'Part 07');
});
test('Overlapping highlights merge; metacharacters are literal', () => {
  assert.deepEqual(core.ranges('C++ new delete', ['c++', 'new', 'ne']), [[0, 3], [4, 7]]);
});
test('C++ pointer and arithmetic operators survive the text index', () => {
  const doc = core.parse('notes/cpp/01.md', '# 示例\n    int* p = new int;\n    int result = a * b;\n**释放**：delete p;');
  assert.ok(doc.sections[0].text.includes('int* p'));
  assert.ok(doc.sections[0].text.includes('a * b'));
  assert.ok(!doc.sections[0].text.includes('**释放**'));
});
test('Repeated section names retain the occurrence of the relevant section', () => {
  const doc = core.parse('notes/cpp/01.md', '# 示例\n## 第一次\n普通\n## 第一次\n特别关键词');
  assert.equal(core.search([doc], '特别关键词')[0].headingOccurrence, 1);
});
test('Snippets include distant body hits and strip Markdown link URLs', () => {
  const doc = core.parse('notes/cpp/01.md', '# 内存\n' + '普通文字'.repeat(100) + ' 悬空指针 [引用](https://example.com)');
  const result = core.search([doc], '悬空指针')[0];
  assert.ok(result.snippet.includes('悬空指针'));
  assert.ok(!doc.sections[0].text.includes('https://'));
});

