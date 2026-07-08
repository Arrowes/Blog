const assert = require('node:assert/strict');
const { protectMath, restoreMath } = require('../blog/themes/hexo-theme-next/scripts/mathjax-protect');

const source = String.raw`BEV:

$$
\mathbf{F}_{\text{BEV}} = \mathbf{M}_{\text{sparse}} \times \mathbf{F}_{\text{2D}}
$$

inline $G_i^{target}(t)$ stays math.`;

const state = {};
const protectedSource = protectMath({ source: 'test.md', content: source }, state).content;

assert(!protectedSource.includes(String.raw`\mathbf{F}_{\text{BEV}}`));
assert(protectedSource.includes('MATHJAXPROTECT'));

const rendered = protectedSource.replaceAll('_', '<em>');
const restored = restoreMath({ source: 'test.md', content: rendered }, state).content;

assert(restored.includes(String.raw`\mathbf{F}_{\text{BEV}} = \mathbf{M}_{\text{sparse}}`));
assert(restored.includes(String.raw`$G_i^{target}(t)$`));
assert(!restored.includes('<em>{\\text{BEV}}'));

console.log('mathjax protect ok');
