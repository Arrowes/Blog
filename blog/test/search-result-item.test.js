const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sourcePath = path.join(__dirname, '..', 'themes', 'hexo-theme-next', 'source', 'js', 'local-search.js');
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nmodule.exports = typeof renderSearchResultItem === 'function' ? renderSearchResultItem : null;`;
const sandbox = {
  document: { addEventListener() {} },
  module: { exports: {} }
};
vm.runInNewContext(source, sandbox);

test('renders an expanded article with a linked sticky header and collapsible snippets', () => {
  const renderSearchResultItem = sandbox.module.exports;
  assert.equal(typeof renderSearchResultItem, 'function', 'search result renderer is missing');

  const html = renderSearchResultItem('/post?index=0', 'Article title', [
    '<a href="/post?index=1"><p class="search-result">First match</p></a>',
    '<a href="/post?index=2"><p class="search-result">Second match</p></a>'
  ]);

  assert.match(html, /^<li><details class="search-result-article" open>/);
  assert.match(html, /<summary class="search-result-header"><a href="\/post\?index=0" class="search-result-title">Article title<\/a><\/summary>/);
  assert.match(html, /First match[\s\S]*Second match/);
  assert.match(html, /<\/details><\/li>$/);
});

test('uses fresh search script and stylesheet cache versions', () => {
  const searchLoader = fs.readFileSync(path.join(__dirname, '..', 'themes', 'hexo-theme-next', 'layout', '_third-party', 'search', 'localsearch.swig'), 'utf8');
  const head = fs.readFileSync(path.join(__dirname, '..', 'themes', 'hexo-theme-next', 'layout', '_partials', 'head', 'head.swig'), 'utf8');

  assert.match(searchLoader, /local-search\.js\?v=20260919/);
  assert.match(head, /main\.css\?v=20260919/);
});
