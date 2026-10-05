(function () {
  'use strict';
  var core = window.NoteSearch, repo = 'Tangxiinrui1119/AI-Windows-Security-Assistant';
  var cacheKey = 'ai-windows-notes-search-v1', documents = [], selected = '', allResults = [], syncing = false;
  var input = document.getElementById('query'), results = document.getElementById('results');
  var status = document.getElementById('sync-status'), retry = document.getElementById('retry');
  var cache = null, debounce, isReady = false;
  function valid(data) {
    return data && data.version === 1 && Array.isArray(data.documents) && data.documents.every(function (d) {
      return core.eligible(d.path) && typeof d.title === 'string' && Array.isArray(d.sections) &&
        d.sections.every(function (s) { return typeof s.heading === 'string' && typeof s.text === 'string'; });
    });
  }
  function save() {
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch (_) { /* Searching works without storage. */ }
  }
  async function request(url, json) {
    var controller = new AbortController(), timeout = setTimeout(function () { controller.abort(); }, 15000);
    try {
      var response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await (json ? response.json() : response.text());
    } finally { clearTimeout(timeout); }
  }
  function use(data) { cache = data; documents = data.documents; isReady = true; render(); }
  function updateAddress() {
    var params = new URLSearchParams();
    if (input.value.trim()) params.set('q', input.value.trim());
    if (selected) params.set('category', selected);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params.toString() : ''));
  }
  function categoryButtons() {
    var groups = new Map();
    documents.forEach(function (doc) { groups.set(doc.category, doc.label); });
    var order = Object.keys(core.labels);
    var entries = [['', '全部笔记']].concat(Array.from(groups).sort(function (a, b) { return order.indexOf(a[0]) - order.indexOf(b[0]); }));
    if (selected && !groups.has(selected)) selected = '';
    var filters = document.getElementById('filters'); filters.replaceChildren();
    entries.forEach(function (entry) {
      var source = input.value.trim() ? allResults.map(function (r) { return r.doc; }) : documents;
      var count = source.filter(function (d) { return !entry[0] || d.category === entry[0]; }).length;
      var button = document.createElement('button'); button.type = 'button'; button.className = 'search-filter';
      button.textContent = entry[1] + ' · ' + count;
      button.setAttribute('aria-pressed', String(selected === entry[0]));
      button.addEventListener('click', function () {
        selected = entry[0]; updateAddress(); render();
        document.querySelector('.search-filter[aria-pressed=true]').focus();
      });
      filters.appendChild(button);
    });
  }
  function line(parent, tag, className, text, terms) {
    var element = document.createElement(tag); element.className = className;
    core.highlight(element, text, terms); parent.appendChild(element); return element;
  }
  function render() {
    var query = input.value.trim(), terms = core.tokens(query);
    allResults = core.search(documents, query);
    categoryButtons(); results.replaceChildren();
    var matches = allResults.filter(function (r) { return !selected || r.doc.category === selected; });
    document.getElementById('result-count').textContent = !isReady ? '' : query ?
      '找到 ' + matches.length + ' 篇相关笔记' : '可搜索 ' + documents.length + ' 篇学习笔记';
    matches.forEach(function (match) {
      var li = document.createElement('li'), link = document.createElement('a');
      link.className = 'search-result';
      var params = new URLSearchParams({ f: match.doc.path, q: query, s: match.heading, v: match.doc.sha });
      if (Number.isInteger(match.headingIndex) && match.headingIndex >= 0) params.set('i', match.headingIndex);
      if (selected) params.set('category', selected);
      link.href = 'reader.html?' + params.toString();
      line(link, 'p', 'search-result-meta', match.doc.label + (match.doc.part ? ' / ' + match.doc.part : ''), []);
      line(link, 'h2', 'search-result-title', match.doc.title, terms);
      if (match.heading && match.heading !== match.doc.title) line(link, 'p', 'search-result-section', match.heading, terms);
      line(link, 'p', 'search-result-snippet', match.snippet, terms);
      line(link, 'span', 'search-result-open', '打开笔记，定位到相关内容 →', []);
      li.appendChild(link); results.appendChild(li);
    });
    var empty = document.getElementById('empty'); empty.hidden = matches.length > 0;
    document.getElementById('empty-title').textContent = query ? (isReady ? '暂时没有找到' : '正在准备搜索') : '从一个关键词开始';
    document.getElementById('empty-message').textContent = query ?
      (selected ? '可以切换到「全部笔记」，或换一个更短的关键词。' : '试试缩短关键词，或用另一种说法，例如「三次握手」「TGT」。') :
      '可以输入中文概念、英文术语或代码中的名字。';
    document.getElementById('examples').hidden = Boolean(query);
  }
  function fromAddress() {
    var params = new URLSearchParams(location.search); input.value = (params.get('q') || '').slice(0, 160);
    selected = params.get('category') || ''; render();
  }
  async function sync(force) {
    if (syncing) return;
    if (!force && cache && cache.checkedAt && Date.now() - cache.checkedAt < 300000) {
      status.textContent = '已载入 ' + documents.length + ' 篇笔记'; return;
    }
    syncing = true; retry.hidden = true;
    status.textContent = documents.length ? '已载入 ' + documents.length + ' 篇笔记，正在检查新内容…' : '正在载入笔记…';
    try {
      var catalog = await request('https://api.github.com/repos/' + repo + '/git/trees/main?recursive=1', true);
      if (!Array.isArray(catalog.tree) || catalog.truncated) throw new Error('Incomplete catalog');
      var entries = catalog.tree.filter(function (e) { return e.type === 'blob' && core.eligible(e.path); });
      var existing = new Map(documents.map(function (doc) { return [doc.path, doc]; }));
      var next = new Array(entries.length), cursor = 0, failed = 0;
      async function worker() {
        while (cursor < entries.length) {
          var i = cursor++, entry = entries[i], old = existing.get(entry.path);
          if (old && old.sha === entry.sha) { next[i] = old; continue; }
          try {
            var path = entry.path.split('/').map(encodeURIComponent).join('/');
            var markdown = await request('https://raw.githubusercontent.com/' + repo + '/main/' + path + '?v=' + entry.sha, false);
            next[i] = core.parse(entry.path, markdown, entry.sha);
          } catch (_) { failed++; next[i] = old; }
        }
      }
      await Promise.all([worker(), worker(), worker(), worker()]);
      use({ version: 1, generatedAt: new Date().toISOString(), checkedAt: failed ? 0 : Date.now(), documents: next.filter(Boolean) });
      save();
      status.textContent = '已载入 ' + documents.length + ' 篇笔记' + (failed ? '；部分新笔记暂未同步' : '，已是最新内容');
      retry.hidden = !failed;
    } catch (_) {
      status.textContent = documents.length ? '已载入 ' + documents.length + ' 篇笔记；最新内容暂未同步，现有笔记仍可搜索' : '暂时无法载入笔记，请重试';
      retry.hidden = false;
    } finally { syncing = false; }
  }
  input.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(function () { updateAddress(); render(); }, 150); });
  document.getElementById('search-form').addEventListener('submit', function (event) { event.preventDefault(); clearTimeout(debounce); updateAddress(); render(); });
  document.querySelectorAll('.search-example').forEach(function (button) {
    button.addEventListener('click', function () { input.value = button.textContent; selected = ''; updateAddress(); render(); input.focus(); });
  });
  retry.addEventListener('click', function () { sync(true); });
  window.addEventListener('popstate', fromAddress);
  fromAddress();
  (async function () {
    try { var saved = JSON.parse(localStorage.getItem(cacheKey)); if (valid(saved)) use(saved); } catch (_) {}
    try {
      var seed = await request('search-index.json', true);
      if (!valid(seed)) throw new Error('Invalid index');
      if (!cache || seed.generatedAt > cache.generatedAt) use(seed);
    } catch (_) { /* The live repository is the second source if the snapshot is unavailable. */ }
    await sync(false);
  })();
})();

