(function () {
  'use strict';
  var core = window.NoteSearch, params = new URLSearchParams(location.search), query = params.get('q') || '';
  var terms = core.tokens(query), section = params.get('s'), processed = new WeakSet();
  if (!terms.length) return;
  var input = document.querySelector('.search-input'); if (input) input.value = query.slice(0, 160);
  var context = document.getElementById('search-context'); context.hidden = false;
  var back = document.createElement('a'); back.textContent = '← 返回「' + query.slice(0, 160) + '」的搜索结果';
  var backParams = new URLSearchParams({ q: query });
  if (params.get('category')) backParams.set('category', params.get('category'));
  back.href = 'search.html?' + backParams; context.appendChild(back);
  var clear = document.createElement('a'); clear.textContent = '取消高亮';
  clear.href = 'reader.html?' + new URLSearchParams({ f: params.get('f') || '', v: params.get('v') || '' }); context.appendChild(clear);
  function locate() {
    var doc = document.querySelector('#doc .md');
    if (!doc || processed.has(doc)) return;
    processed.add(doc);
    var headings = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    var indexed = params.has('i') && headings[Number(params.get('i'))];
    var matching = headings.filter(function (h) { return core.normalize(h.textContent.trim()) === core.normalize(section); });
    var target = params.has('n') ? matching[Number(params.get('n')) || 0] :
      indexed && core.normalize(indexed.textContent.trim()) === core.normalize(section) ? indexed : matching[0];
    var walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT, { acceptNode: function (node) {
      return node.parentElement.closest('script,style,mark') || !core.ranges(node.nodeValue, terms).length ?
        NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    } });
    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (textNode) {
      var fragment = document.createDocumentFragment(); core.highlight(fragment, textNode.nodeValue, terms);
      textNode.replaceWith(fragment);
    });
    target = target || doc.querySelector('mark');
    if (target) requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
  }
  document.addEventListener('note-rendered', locate);
  locate();
})();

