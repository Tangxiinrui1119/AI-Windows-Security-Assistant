(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NoteSearch = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var labels = { cpp: 'C++', python: 'Python', network: '计算机网络',
    'data-structures': '数据结构', 'security-mathematics': '信息安全数学基础',
    security: '信息安全', git: 'Git & GitHub', ai: 'AI 应用' };

  function normalize(text) { return String(text || '').normalize('NFKC').toLowerCase(); }
  function tokens(query) {
    return Array.from(new Set(normalize(query).trim().slice(0, 160).split(/\s+/).filter(Boolean)));
  }
  function eligible(path) {
    return /^notes\/(?:[\w-]+\/)+[\w.-]+\.md$/i.test(path) && !/\/readme\.md$/i.test(path);
  }
  function plain(text) {
    return String(text).replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/^\s*(?:`{3,}|~{3,}).*$/gm, '')
      .replace(/^[ \t]*(?:#{1,6}\s+|>\s*|[-*+]\s+)/gm, '')
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')
      .replace(/`/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\s+/g, ' ').trim();
  }
  function parse(path, markdown, sha) {
    var parts = path.split('/'), category = parts[1], title = '';
    var sections = [], heading = '', headingIndex = -1, lines = [], fence = null;
    function flush() {
      var text = plain(lines.join('\n'));
      if (text || heading) sections.push({ heading: heading, headingIndex: headingIndex, text: text });
      lines = [];
    }
    String(markdown).replace(/\r\n?/g, '\n').split('\n').forEach(function (line) {
      var delimiter = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (delimiter) {
        if (!fence) fence = delimiter[1];
        else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length) fence = null;
        return;
      }
      var h = !fence && line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (h) {
        flush(); heading = plain(h[2]); headingIndex++;
        if (!title && h[1] === '#') title = heading;
      } else lines.push(line);
    });
    flush();
    var part = category === 'security' && parts[3] && parts[3].match(/^\d{2}/);
    return { path: path, sha: sha || '', title: title || parts[parts.length - 1].replace(/\.md$/, ''),
      category: category, label: labels[category] || category,
      part: part ? 'Part ' + part[0] : '', sections: sections };
  }
  function snippet(text, terms, length) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    length = length || 180;
    var lower = normalize(text), positions = terms.map(function (term) { return lower.indexOf(term); })
      .filter(function (pos) { return pos >= 0; });
    var at = positions.length ? Math.min.apply(null, positions) : 0;
    var start = Math.max(0, at - 45), end = Math.min(text.length, start + length);
    return (start ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }
  function search(documents, query) {
    var terms = tokens(query);
    if (!terms.length) return [];
    return documents.reduce(function (results, doc) {
      var title = normalize(doc.title), sections = doc.sections || [];
      var haystack = title + ' ' + sections.map(function (s) { return normalize(s.heading + ' ' + s.text); }).join(' ');
      if (!terms.every(function (t) { return haystack.includes(t); })) return results;
      var best = null, bestScore = -Infinity;
      sections.forEach(function (s) {
        var heading = normalize(s.heading), body = normalize(s.text);
        var score = terms.reduce(function (sum, term) {
          var intro = s.heading === doc.title;
          return sum + (heading.includes(term) && !intro ? 8 : 0) + (body.includes(term) ? (intro ? 2 : 4) : 0);
        }, 0);
        if (/知识地图|核心知识链|必须掌握/.test(s.heading)) score -= 2;
        if (score > bestScore) { best = s; bestScore = score; }
      });
      best = best || { heading: '', text: '' };
      var score = terms.reduce(function (sum, term) { return sum + (title.includes(term) ? 20 : 0); }, 0) + bestScore;
      results.push({ doc: doc, score: score, heading: best.heading, headingIndex: best.headingIndex,
        snippet: snippet(best.text || best.heading || doc.title, terms) });
      return results;
    }, []).sort(function (a, b) { return b.score - a.score || a.doc.path.localeCompare(b.doc.path); });
  }
  // Match ranges are merged before rendering with DOM text nodes, never HTML strings.
  function ranges(text, terms) {
    var lower = String(text).toLowerCase(), matches = [];
    terms.forEach(function (term) {
      var from = 0, at;
      while (term && (at = lower.indexOf(term, from)) !== -1) {
        matches.push([at, at + term.length]); from = at + term.length;
      }
    });
    matches.sort(function (a, b) { return a[0] - b[0]; });
    return matches.reduce(function (merged, pair) {
      var last = merged[merged.length - 1];
      if (last && pair[0] <= last[1]) last[1] = Math.max(last[1], pair[1]);
      else merged.push(pair.slice());
      return merged;
    }, []);
  }
  function highlight(element, text, terms) {
    var owner = element.ownerDocument, offset = 0;
    ranges(text, terms).forEach(function (range) {
      element.appendChild(owner.createTextNode(text.slice(offset, range[0])));
      var mark = owner.createElement('mark'); mark.textContent = text.slice(range[0], range[1]);
      element.appendChild(mark); offset = range[1];
    });
    element.appendChild(owner.createTextNode(text.slice(offset)));
  }
  return { labels: labels, normalize: normalize, tokens: tokens, eligible: eligible,
    parse: parse, search: search, snippet: snippet, ranges: ranges, highlight: highlight };
});

