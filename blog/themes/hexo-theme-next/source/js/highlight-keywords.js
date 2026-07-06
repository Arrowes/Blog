(() => {
  let currentIndex = 0;
  let keywordElements = [];
  let stabilizeTimer = null;

  const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const clearPreviousHighlight = postBody => {
    document.querySelector('.search-hit-nav')?.remove();
    postBody.querySelectorAll('b.search-keyword').forEach(element => {
      element.replaceWith(document.createTextNode(element.textContent));
    });
    postBody.normalize();
  };

  const buildKeywords = query => {
    const words = query.split(/[-\s]+/).filter(Boolean);
    if (words.length > 1) words.push(query);
    return [...new Set(words)].sort((left, right) => right.length - left.length);
  };

  const highlightTextNode = (node, regex) => {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

      const keyword = document.createElement('b');
      keyword.className = 'search-keyword';
      keyword.textContent = match[0];
      fragment.appendChild(keyword);

      lastIndex = match.index + match[0].length;
    }

    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    node.parentNode.replaceChild(fragment, node);
  };

  const markCurrent = () => {
    keywordElements.forEach(element => element.classList.remove('search-keyword-current'));
    keywordElements[currentIndex]?.classList.add('search-keyword-current');

    const counter = document.querySelector('.search-hit-count');
    if (counter) counter.textContent = `${currentIndex + 1} / ${keywordElements.length}`;
  };

  const scrollToCurrent = (behavior = 'smooth') => {
    const target = keywordElements[currentIndex];
    if (!target) return;

    markCurrent();
    target.scrollIntoView({ behavior, block: 'center' });
  };

  const stabilizeScroll = () => {
    clearTimeout(stabilizeTimer);
    scrollToCurrent('smooth');

    const startedAt = Date.now();
    let lastTop = null;
    let stableFrames = 0;

    const tick = () => {
      const target = keywordElements[currentIndex];
      if (!target) return;

      const top = Math.round(target.getBoundingClientRect().top);
      if (lastTop !== null && Math.abs(top - lastTop) <= 1) {
        stableFrames++;
      } else {
        stableFrames = 0;
        target.scrollIntoView({ behavior: 'auto', block: 'center' });
      }

      lastTop = Math.round(target.getBoundingClientRect().top);
      if (stableFrames < 6 && Date.now() - startedAt < 3500) {
        stabilizeTimer = setTimeout(tick, 120);
      }
    };

    stabilizeTimer = setTimeout(tick, 180);
  };

  const moveTo = nextIndex => {
    if (!keywordElements.length) return;
    currentIndex = (nextIndex + keywordElements.length) % keywordElements.length;
    stabilizeScroll();
  };

  const createNavigator = () => {
    if (!keywordElements.length) return;

    const nav = document.createElement('div');
    nav.className = 'search-hit-nav';
    nav.innerHTML = `
      <button class="search-hit-prev" type="button" title="上一个">‹</button>
      <span class="search-hit-count"></span>
      <button class="search-hit-next" type="button" title="下一个">›</button>
      <button class="search-hit-close" type="button" title="关闭">×</button>
    `;

    nav.querySelector('.search-hit-prev').addEventListener('click', () => moveTo(currentIndex - 1));
    nav.querySelector('.search-hit-next').addEventListener('click', () => moveTo(currentIndex + 1));
    nav.querySelector('.search-hit-close').addEventListener('click', () => {
      nav.remove();
      keywordElements.forEach(element => element.classList.remove('search-keyword-current'));
    });

    document.body.appendChild(nav);
    markCurrent();
  };

  const runHighlightAndScroll = () => {
    const params = new URLSearchParams(window.location.search);
    const highlightQuery = params.get('highlight');
    const highlightIndex = parseInt(params.get('index'), 10);
    const postBody = document.querySelector('.post-body');

    keywordElements = [];
    currentIndex = 0;
    clearTimeout(stabilizeTimer);
    document.querySelector('.search-hit-nav')?.remove();
    if (!highlightQuery || !postBody) return;

    try {
      const decodedQuery = decodeURIComponent(highlightQuery).trim();
      const keywords = buildKeywords(decodedQuery);
      if (!keywords.length) return;

      clearPreviousHighlight(postBody);

      const regex = new RegExp(keywords.map(escapeRegExp).join('|'), 'gi');
      const walk = document.createTreeWalker(postBody, NodeFilter.SHOW_TEXT, {
        acceptNode: node => {
          const parent = node.parentElement;
          if (!parent || parent.closest('script, style')) return NodeFilter.FILTER_REJECT;
          regex.lastIndex = 0;
          return regex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });

      const nodesToReplace = [];
      let node;
      while ((node = walk.nextNode())) nodesToReplace.push(node);
      nodesToReplace.forEach(textNode => highlightTextNode(textNode, regex));

      keywordElements = [...postBody.querySelectorAll('.search-keyword')];
      if (!keywordElements.length) return;

      if (!isNaN(highlightIndex) && highlightIndex >= 0 && highlightIndex < keywordElements.length) {
        currentIndex = highlightIndex;
      }

      createNavigator();
      stabilizeScroll();

      postBody.querySelectorAll('img').forEach(image => {
        if (!image.complete) image.addEventListener('load', stabilizeScroll, { once: true });
      });
      window.addEventListener('resize', stabilizeScroll, { passive: true });
      document.fonts?.ready?.then(stabilizeScroll);
    } catch (error) {
      console.error('Error highlighting keywords:', error);
    }
  };

  document.addEventListener('DOMContentLoaded', runHighlightAndScroll);
  document.addEventListener('pjax:complete', runHighlightAndScroll);
})();
