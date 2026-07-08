'use strict';

const STORE_KEY = '__mathjaxProtectStore';

function keyFor(data) {
  return data.source || data.path || data.slug || 'default';
}

function stash(content, bucket, pattern) {
  return content.replace(pattern, match => {
    const token = `MATHJAXPROTECT${bucket.length}END`;
    bucket.push(match);
    return token;
  });
}

function protectMath(data, state) {
  const content = data.content;

  if (typeof content !== 'string' || (!content.includes('$') && !content.includes('\\'))) {
    return data;
  }

  const key = keyFor(data);
  const bucket = [];

  let protectedContent = content;
  protectedContent = stash(protectedContent, bucket, /\$\$[\s\S]+?\$\$/g);
  protectedContent = stash(protectedContent, bucket, /\\\[[\s\S]+?\\\]/g);
  protectedContent = stash(protectedContent, bucket, /\\\([\s\S]+?\\\)/g);
  protectedContent = protectedContent.replace(/(^|[^\\$])\$([^\n$]+?[^\\$])\$(?!\$)/g, (match, prefix, body) => {
    const token = `MATHJAXPROTECT${bucket.length}END`;
    bucket.push(`$${body}$`);
    return `${prefix}${token}`;
  });

  if (bucket.length) {
    state[key] = bucket;
    data.content = protectedContent;
  }

  return data;
}

function restoreMath(data, state) {
  const key = keyFor(data);
  const bucket = state[key];

  if (!bucket || typeof data.content !== 'string') {
    return data;
  }

  data.content = data.content.replace(/MATHJAXPROTECT(\d+)END/g, (match, index) => {
    return bucket[Number(index)] || match;
  });
  delete state[key];

  return data;
}

if (typeof hexo !== 'undefined') {
  hexo.env[STORE_KEY] = hexo.env[STORE_KEY] || {};
  hexo.extend.filter.register('before_post_render', data => protectMath(data, hexo.env[STORE_KEY]), 1);
  hexo.extend.filter.register('after_post_render', data => restoreMath(data, hexo.env[STORE_KEY]), 99);
}

module.exports = {
  protectMath,
  restoreMath
};
