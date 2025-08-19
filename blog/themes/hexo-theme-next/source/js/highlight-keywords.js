function runHighlightAndScroll() {
  const params = new URLSearchParams(window.location.search);
  const highlightQuery = params.get('highlight');
  const highlightIndex = parseInt(params.get('index'), 10);

  if (highlightQuery) {
    const postBody = document.querySelector('.post-body');
    if (postBody) {
      try {
        const decodedQuery = decodeURIComponent(highlightQuery).trim();
        const keywords = decodedQuery.split(/[-\s]+/).filter(word => word.length > 0);

        if (keywords.length > 0) {
          const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
          const walk = document.createTreeWalker(postBody, NodeFilter.SHOW_TEXT, null, false);
          let node;
          const nodesToReplace = [];
          while (node = walk.nextNode()) {
            if (node.nodeValue.match(regex)) {
              const span = document.createElement('span');
              span.innerHTML = node.nodeValue.replace(regex, '<b class="search-keyword">$1</b>');
              nodesToReplace.push({ oldNode: node, newNode: span });
            }
          }
          nodesToReplace.forEach(item => {
            if (item.oldNode.parentNode) {
              item.oldNode.parentNode.replaceChild(item.newNode, item.oldNode);
            }
          });

          const allKeywords = document.querySelectorAll('.post-body .search-keyword');
          let targetElement = null;
          if (!isNaN(highlightIndex) && highlightIndex >= 0 && highlightIndex < allKeywords.length) {
            targetElement = allKeywords[highlightIndex];
          } else if (allKeywords.length > 0) {
            targetElement = allKeywords[0];
          }

          if (targetElement) {
            // --- 【核心修改】二次校准滚动 ---

            // 第一次滚动：立即执行，快速定位，应对没有图片或图片已缓存的情况
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);

            // 第二次滚动：延迟较长时间后执行，用于校准因图片懒加载引起的布局偏移
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1200); // 延迟 1.2 秒，给图片足够的时间加载

            // --- 修改结束 ---
          }
        }
      } catch (e) {
        console.error("Error highlighting keywords:", e);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', runHighlightAndScroll);
document.addEventListener('pjax:complete', runHighlightAndScroll);