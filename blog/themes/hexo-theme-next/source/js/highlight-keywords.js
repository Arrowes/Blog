function runHighlight() {
  const params = new URLSearchParams(window.location.search);
  const highlightQuery = params.get('highlight');

  if (highlightQuery) {
    // 选择你需要高亮内容的区域，Next主题通常是 .post-body
    const postBody = document.querySelector('.post-body');
    if (postBody) {
      try {
        const decodedQuery = decodeURIComponent(highlightQuery).trim();
        // 支持多个关键词高亮，用空格或短横线分隔
        const keywords = decodedQuery.split(/[-\s]+/).filter(word => word.length > 0);

        if (keywords.length > 0) {
          const regex = new RegExp(`(${keywords.join('|')})`, 'gi');

          // 遍历所有文本节点进行替换，这样更安全，不会破坏 HTML 结构
          const walk = document.createTreeWalker(postBody, NodeFilter.SHOW_TEXT, null, false);
          let node;
          // 创建一个数组来存储需要修改的节点，避免在遍历时直接修改DOM
          const nodesToReplace = [];
          while (node = walk.nextNode()) {
            if (node.nodeValue.match(regex)) {
              const span = document.createElement('span');
              span.innerHTML = node.nodeValue.replace(regex, '<b class="search-keyword">$1</b>');
              nodesToReplace.push({ oldNode: node, newNode: span });
            }
          }
          // 遍历结束后，统一进行DOM替换
          nodesToReplace.forEach(item => {
            if (item.oldNode.parentNode) {
              item.oldNode.parentNode.replaceChild(item.newNode, item.oldNode);
            }
          });
        }
      } catch (e) {
        console.error("Error highlighting keywords:", e);
      }
    }
  }
}

// 监听首次 DOM 加载
document.addEventListener('DOMContentLoaded', runHighlight);

// 监听 PJAX 导航完成事件
document.addEventListener('pjax:complete', runHighlight);