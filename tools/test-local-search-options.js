const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class FakeClassList {
  constructor() {
    this.items = new Set();
  }

  add(name) {
    this.items.add(name);
  }

  remove(name) {
    this.items.delete(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.items.has(name) : Boolean(force);
    enabled ? this.add(name) : this.remove(name);
    return enabled;
  }
}

class FakeElement {
  constructor() {
    this.listeners = {};
    this.classList = new FakeClassList();
    this.style = { setProperty() {} };
    this.attributes = {};
    this.children = [];
    this.value = '';
    this._innerHTML = '';
    this.textContent = '';
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  appendChild(child) {
    this.children.push(child);
  }

  focus() {}

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  querySelector() {
    return new FakeElement();
  }

  closest(selector) {
    return selector === 'a[href]' ? this : null;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 100 };
  }

  set innerHTML(value) {
    this._innerHTML = value;
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

const elements = {
  '.search-input': new FakeElement(),
  '#search-result': new FakeElement(),
  '.search-history': new FakeElement(),
  '.search-icon': new FakeElement(),
  '.search-option-case': null,
  '.search-option-whole': null,
  '.search-pop-overlay': new FakeElement(),
  '.popup-btn-close': new FakeElement(),
  '#menu .menu-item-search': null,
  '#no-result': new FakeElement()
};

const template = fs.readFileSync(
  path.join(__dirname, '../blog/themes/hexo-theme-next/layout/_partials/search/localsearch.swig'),
  'utf8'
);
const scriptTemplate = fs.readFileSync(
  path.join(__dirname, '../blog/themes/hexo-theme-next/layout/_third-party/search/localsearch.swig'),
  'utf8'
);
const styles = fs.readFileSync(
  path.join(__dirname, '../blog/themes/hexo-theme-next/source/css/_common/components/third-party/search.styl'),
  'utf8'
);

const activeStyleBlocks = [...styles.matchAll(/search-option-active\s*{([^}]*)}/g)].map(match => match[1]).join('\n');
assert(!/background:/.test(activeStyleBlocks), 'active search option should not use a background color');
assert(!/\$red|#ff|rgba\(255/i.test(activeStyleBlocks), 'active search option should not use accent colors');
assert(/color:\s*\$black-deep/.test(activeStyleBlocks), 'active search option should use a darker text color');
assert(/font-weight:\s*bold/.test(activeStyleBlocks), 'active search option should be bold');
assert(/box-shadow:/.test(activeStyleBlocks), 'active search option should have a shadow');
assert(/p\.search-result\s*{[^}]*white-space:\s*pre-line/s.test(styles), 'search result snippets should display preserved line breaks');
assert(/local-search\.js\?v=/.test(scriptTemplate), 'local search script should use a version query to avoid stale search JS');

if (template.includes('search-option-case')) elements['.search-option-case'] = new FakeElement();
if (template.includes('search-option-whole')) elements['.search-option-whole'] = new FakeElement();

const document = {
  body: new FakeElement(),
  createElement() {
    return new FakeElement();
  },
  addEventListener(type, listener) {
    if (type === 'DOMContentLoaded') listener();
  },
  querySelector(selector) {
    return elements[selector] || null;
  },
  querySelectorAll(selector) {
    if (selector === '.popup-trigger') return [];
    return [];
  },
  getElementById(id) {
    return elements[`#${id}`] || null;
  }
};

const context = {
  CONFIG: {
    path: 'search.json',
    root: '/',
    localsearch: {
      preload: true,
      trigger: 'auto',
      top_n_per_article: 5,
      unescape: false
    }
  },
  document,
  window: {
    addEventListener() {},
    matchMedia: () => ({ matches: false }),
    pjax: null,
    scrollY: 0
  },
  localStorage: {
    getItem: () => null,
    setItem() {}
  },
  fetch: () => Promise.resolve({
    text: () => Promise.resolve(JSON.stringify([
      { title: 'Car Guide', content: 'car scar CAR carModel', url: '/car/' },
      {
        title: 'Code Guide',
        content: '<figure class="highlight"><table><tr><td class="gutter"><pre><span class="line">1</span><br><span class="line">2</span><br><span class="line">3</span></pre></td><td class="code"><pre><span class="line">const alpha = 1;</span><br><span class="line">const betaTarget = 2;</span><br><span class="line">const gamma = 3;</span></pre></td></tr></table></figure>',
        url: '/code/'
      }
    ]))
  }),
  DOMParser: function DOMParser() {},
  URLSearchParams,
  console
};

vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '../blog/themes/hexo-theme-next/source/js/local-search.js'), 'utf8'),
  context
);

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  for (let i = 0; i < 5; i++) await flushPromises();

  const input = elements['.search-input'];
  const result = elements['#search-result'];
  const caseButton = elements['.search-option-case'];
  const wholeButton = elements['.search-option-whole'];

  assert(caseButton, 'case-sensitive search option button should exist');
  assert(wholeButton, 'whole-word search option button should exist');

  input.value = 'car';
  input.listeners.input();
  assert(result.innerHTML.includes('search-result-title'), result.innerHTML);
  assert(result.innerHTML.includes('Guide'));
  assert(result.innerHTML.includes('s<b class="search-keyword">car</b>'));
  assert(result.innerHTML.includes('CAR'));

  wholeButton.listeners.click();
  input.listeners.input();
  assert(result.innerHTML.includes('search-result-title'));
  assert(result.innerHTML.includes('Guide'));
  assert(!result.innerHTML.includes('<b class="search-keyword">car</b>Model'));
  assert(!result.innerHTML.includes('s<b class="search-keyword">car</b>'));

  caseButton.listeners.click();
  input.listeners.input();
  assert(result.innerHTML.includes('search-result-title'));
  assert(result.innerHTML.includes('Guide'));
  assert(!result.innerHTML.includes('<b class="search-keyword">Car</b> Guide'));
  assert(!result.innerHTML.includes('<b class="search-keyword">CAR</b>'));
  assert(result.innerHTML.includes('<b class="search-keyword">car</b>'));

  caseButton.listeners.click();
  wholeButton.listeners.click();
  input.value = 'alpha';
  input.listeners.input();
  assert(result.innerHTML.includes('Code Guide'));
  assert(result.innerHTML.includes('<b class="search-keyword">alpha</b> = 1;'), result.innerHTML);
  assert(!result.innerHTML.includes('1\n'));
  assert(!result.innerHTML.includes('2\n'));
  assert(!result.innerHTML.includes('3\n'));

  console.log('local search options ok');
})();
