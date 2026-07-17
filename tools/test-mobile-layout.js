const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const styles = fs.readFileSync(path.join(__dirname, '../blog/source/_data/styles.styl'), 'utf8');
const rightPostsOverride = styles.indexOf('@media (max-width: 1420px)');
const tabletMobileOverride = styles.indexOf('+tablet-mobile()', rightPostsOverride);

assert(rightPostsOverride > -1, 'right posts desktop width override should exist');
assert(tabletMobileOverride > rightPostsOverride, 'tablet/mobile override should follow right posts width override');

const tabletMobileBlock = styles.slice(tabletMobileOverride);
assert(
  /\.content-wrap\s+width:\s*100%/.test(tabletMobileBlock),
  'tablet/mobile layout should restore content-wrap to full width'
);

console.log('mobile layout ok');
