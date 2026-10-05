// Run from any directory: node scripts/build-search-index.cjs
// GitHub Pages serves the snapshot immediately; search.js also discovers later notes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const core = require('../docs/search-core.js');
const root = path.resolve(__dirname, '..');
const sourcesFile = path.join(root, '.search-sources.json');
const sources = fs.existsSync(sourcesFile) ? JSON.parse(fs.readFileSync(sourcesFile, 'utf8')) : {};
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const file = path.join(dir, e.name);
    return e.isDirectory() ? walk(file) : [file];
  });
}
const documents = walk(path.join(root, 'notes')).map(file => {
  const relative = path.relative(root, file).split(path.sep).join('/');
  if (!core.eligible(relative)) return null;
  const content = fs.readFileSync(file);
  const sha = sources[relative] || crypto.createHash('sha1').update(Buffer.concat([
    Buffer.from('blob ' + content.length + '\0'), content
  ])).digest('hex');
  return core.parse(relative, content.toString('utf8'), sha);
}).filter(Boolean).sort((a, b) => a.path.localeCompare(b.path));
fs.writeFileSync(path.join(root, 'docs/search-index.json'), JSON.stringify({
  version: 1, generatedAt: new Date().toISOString(), documents
}));
console.log('Indexed ' + documents.length + ' notes.');

