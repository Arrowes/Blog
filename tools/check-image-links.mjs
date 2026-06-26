import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const postsDir = path.join(root, 'blog', 'source', '_posts');
const imagePattern = /!\[[^\]]*]\(([^)]+)\)|<img[^>]+src=["']([^"']+)["']|https?:\/\/[^\s)"'<>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s)"'<>]*)?/gi;
const timeoutMs = 15000;
const concurrency = 3;

function cleanUrl(raw) {
  return raw.trim().replace(/^<|>$/g, '').split(/\s+/)[0];
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listMarkdownFiles(full));
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

async function requestUrl(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 image-link-checker',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  const ownImagePrefix = 'https://raw.githubusercontent.com/Arrowes/Blog/main/images/';
  if (url.startsWith(ownImagePrefix)) {
    const fileName = decodeURIComponent(url.slice(ownImagePrefix.length));
    try {
      await access(path.join(root, 'images', fileName));
      return {
        url,
        ok: true,
        status: 'LOCAL',
        contentType: `local/${path.extname(fileName).slice(1).toLowerCase()}`,
        finalUrl: url
      };
    } catch {
      return {
        url,
        ok: false,
        status: 'LOCAL_MISSING',
        error: 'local image file is missing'
      };
    }
  }

  try {
    let response;
    let lastError;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await requestUrl(url, 'HEAD');
        if ([403, 405, 406, 429].includes(response.status) || response.status >= 500) {
          response = await requestUrl(url, 'GET');
        }
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!response) {
      throw lastError;
    }
    const contentType = response.headers.get('content-type') || '';
    const statusOk = response.status >= 200 && response.status < 400;
    const imageLike = contentType.startsWith('image/') || contentType === 'application/octet-stream';
    return {
      url,
      ok: statusOk && imageLike,
      status: response.status,
      contentType,
      finalUrl: response.url,
      error: statusOk && !imageLike ? 'not an image response' : undefined
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 'ERROR',
      error: error.name === 'AbortError' ? 'timeout' : error.message
    };