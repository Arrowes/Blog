const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const template = fs.readFileSync(
  path.join(__dirname, '../blog/themes/hexo-theme-next/layout/_scripts/pjax.swig'),
  'utf8'
);

assert(template.includes("window.addEventListener('pjax:success'"));
assert(template.includes('MathJax'));
assert(/MathJax\.(typesetPromise|typeset)\(/.test(template));
assert(template.includes('MathJax.texReset()'));

console.log('pjax mathjax rerender ok');
