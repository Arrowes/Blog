/* global CONFIG */

document.addEventListener('DOMContentLoaded', () => {
  // Popup Window
  let isfetched = false;
  let datas;
  let isXml = true;
  // Search DB path
  let searchPath = CONFIG.path;
  if (searchPath.length === 0) {
    searchPath = 'search.xml';
  } else if (searchPath.endsWith('json')) {
    isXml = false;
  }
  const input = document.querySelector('.search-input');
  const resultContent = document.getElementById('search-result');
  const historyContent = document.querySelector('.search-history');
  const caseOption = document.querySelector('.search-option-case');
  const wholeOption = document.querySelector('.search-option-whole');
  const historyKey = 'local-search-history';

  const isAsciiWordChar = char => Boolean(char && /[A-Za-z0-9_]/.test(char));

  const isWholeWordMatch = (text, position, word) => {
    if (!/[A-Za-z0-9_]/.test(word)) return true;
    return !isAsciiWordChar(text[position - 1]) && !isAsciiWordChar(text[position + word.length]);
  };

  const getIndexByWord = (word, text, caseSensitive, wholeWord) => {
    if (CONFIG.localsearch.unescape) {
      let div = document.createElement('div');
      div.innerText = word;
      word = div.innerHTML;
    }
    let wordLen = word.length;
    if (wordLen === 0) return [];
    let startPosition = 0;
    let position = [];
    let index = [];
    if (!caseSensitive) {
      text = text.toLowerCase();
      word = word.toLowerCase();
    }
    while ((position = text.indexOf(word, startPosition)) > -1) {
      if (!wholeWord || isWholeWordMatch(text, position, word)) {
        index.push({ position, word });
      }
      startPosition = position + wordLen;
    }
    return index;
  };

  // Merge hits into slices
  const mergeIntoSlice = (start, end, index, searchText) => {
    let item = index[index.length - 1];
    let { position, word } = item;
    let hits = [];
    let searchTextCountInSlice = 0;
    while (position + word.length <= end && index.length !== 0) {
      if (word === searchText) {
        searchTextCountInSlice++;
      }
      hits.push({
        position,
        length: word.length
      });
      let wordEnd = position + word.length;

      // Move to next position of hit
      index.pop();
      while (index.length !== 0) {
        item = index[index.length - 1];
        position = item.position;
        word = item.word;
        if (wordEnd > position) {
          index.pop();
        } else {
          break;
        }
      }
    }
    return {
      hits,
      start,
      end,
      searchTextCount: searchTextCountInSlice
    };
  };

  // Highlight title and content
  const highlightKeyword = (text, slice) => {
    let result = '';
    let prevEnd = slice.start;
    slice.hits.forEach(hit => {
      result += text.substring(prevEnd, hit.position);
      let end = hit.position + hit.length;
      result += `<b class="search-keyword">${text.substring(hit.position, end)}</b>`;
      prevEnd = end;
    });
    result += text.substring(prevEnd, slice.end);
    return result;
  };

  const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const getHighlightIndex = (text, position, keywordList, caseSensitive, wholeWord) => {
    const highlightWords = [...new Set(keywordList.filter(Boolean))].sort((left, right) => right.length - left.length);
    if (!highlightWords.length) return 0;

    const regex = new RegExp(highlightWords.map(escapeRegExp).join('|'), caseSensitive ? 'g' : 'gi');
    let index = 0;
    let match;
    while ((match = regex.exec(text)) !== null && match.index < position) {
      if (!wholeWord || isWholeWordMatch(text, match.index, match[0])) {
        index++;
      }
    }
    return index;
  };

  const isSearchOptionEnabled = button => button?.getAttribute('aria-pressed') === 'true';

  const setSearchOptionState = (button, enabled) => {
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    button.classList.toggle('search-option-active', enabled);
  };

  const bindSearchOption = button => {
    if (!button) return;
    button.addEventListener('click', () => {
      setSearchOptionState(button, !isSearchOptionEnabled(button));
      inputEventFunction();
    });
  };

  const getSearchHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (error) {
      return [];
    }
  };

  const renderSearchHistory = () => {
    if (!historyContent) return;
    const history = getSearchHistory();
    historyContent.innerHTML = '';
    historyContent.classList.toggle('search-history-empty', history.length === 0);
    if (history.length === 0) return;

    history.forEach(keyword => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'search-history-item';
      button.textContent = keyword;
      button.addEventListener('click', () => {
        input.value = keyword;
        isfetched ? inputEventFunction() : fetchData();
        input.focus();
      });
      historyContent.appendChild(button);
    });
  };

  const saveSearchHistory = keyword => {
    keyword = keyword.trim();
    if (!keyword) return;

    const lowerKeyword = keyword.toLowerCase();
    const history = getSearchHistory().filter(item => item.toLowerCase() !== lowerKeyword);
    history.unshift(keyword);
    try {
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 6)));
    } catch (error) {
      return;
    }
    renderSearchHistory();
  };

  const inputEventFunction = () => {
    if (!isfetched) return;
    const rawSearchText = input.value.trim();
    const caseSensitive = isSearchOptionEnabled(caseOption);
    const wholeWord = isSearchOptionEnabled(wholeOption);
    let searchText = caseSensitive ? rawSearchText : rawSearchText.toLowerCase();
    let keywords = searchText.split(/[-\s]+/);
    if (keywords.length > 1) {
      keywords.push(searchText);
    }
    let resultItems = [];
    if (searchText.length > 0) {
      // Perform local searching
      datas.forEach(({ title, content, url }) => {
        let indexOfTitle = [];
        let indexOfContent = [];
        let searchTextCount = 0;
        keywords.forEach(keyword => {
          indexOfTitle = indexOfTitle.concat(getIndexByWord(keyword, title, caseSensitive, wholeWord));
          indexOfContent = indexOfContent.concat(getIndexByWord(keyword, content, caseSensitive, wholeWord));
        });

        // Show search results
        if (indexOfTitle.length > 0 || indexOfContent.length > 0) {
          const searchOptions = `${caseSensitive ? '&case=1' : ''}${wholeWord ? '&whole=1' : ''}`;
          const finalUrl = `${url}?highlight=${encodeURIComponent(rawSearchText)}${searchOptions}`;
          const titleUrl = `${finalUrl}&index=0`;

          let hitCount = indexOfTitle.length + indexOfContent.length;
          // Sort index by position of keyword
          [indexOfTitle, indexOfContent].forEach(index => {
            index.sort((itemLeft, itemRight) => {
              if (itemRight.position !== itemLeft.position) {
                return itemRight.position - itemLeft.position;
              }
              return itemLeft.word.length - itemRight.word.length;
            });
          });

          let slicesOfTitle = [];
          if (indexOfTitle.length !== 0) {
            let tmp = mergeIntoSlice(0, title.length, indexOfTitle, searchText);
            searchTextCount += tmp.searchTextCount;
            slicesOfTitle.push(tmp);
          }

          let slicesOfContent = [];
          while (indexOfContent.length !== 0) {
            let item = indexOfContent[indexOfContent.length - 1];
            let { position, word } = item;
            // Cut out 100 characters
            let start = position - 20;
            let end = position + 80;
            if (start < 0) {
              start = 0;
            }
            if (end < position + word.length) {
              end = position + word.length;
            }
            if (end > content.length) {
              end = content.length;
            }
            let tmp = mergeIntoSlice(start, end, indexOfContent, searchText);
            searchTextCount += tmp.searchTextCount;
            slicesOfContent.push(tmp);
          }

          // Sort slices in content by search text's count and hits' count
          slicesOfContent.sort((sliceLeft, sliceRight) => {
            if (sliceLeft.searchTextCount !== sliceRight.searchTextCount) {
              return sliceRight.searchTextCount - sliceLeft.searchTextCount;
            } else if (sliceLeft.hits.length !== sliceRight.hits.length) {
              return sliceRight.hits.length - sliceLeft.hits.length;
            }
            return sliceLeft.start - sliceRight.start;
          });

          // Select top N slices in content
          let upperBound = parseInt(CONFIG.localsearch.top_n_per_article, 10);
          if (upperBound >= 0) {
            slicesOfContent = slicesOfContent.slice(0, upperBound);
          }

          let resultItem = '';

          if (slicesOfTitle.length !== 0) {
            resultItem += `<li><a href="${titleUrl}" class="search-result-title">${highlightKeyword(title, slicesOfTitle[0])}</a>`;
          } else {
            resultItem += `<li><a href="${titleUrl}" class="search-result-title">${title}</a>`;
          }

          slicesOfContent.forEach(slice => {
            const hitPosition = slice.hits[0]?.position ?? slice.start;
            const snippetUrl = `${finalUrl}&index=${getHighlightIndex(content, hitPosition, keywords, caseSensitive, wholeWord)}`;
            resultItem += `<a href="${snippetUrl}"><p class="search-result">${highlightKeyword(content, slice)}...</p></a>`;
          });

          resultItem += '</li>';
          resultItems.push({
            item: resultItem,
            id  : resultItems.length,
            hitCount,
            searchTextCount
          });
        }
      });
    }
    if (keywords.length === 1 && keywords[0] === '') {
      resultContent.innerHTML = '<div id="no-result"><i class="fa fa-search fa-5x"></i></div>';
    } else if (resultItems.length === 0) {
      resultContent.innerHTML = '<div id="no-result"><i class="far fa-frown fa-5x"></i></div>';
    } else {
      resultItems.sort((resultLeft, resultRight) => {
        if (resultLeft.searchTextCount !== resultRight.searchTextCount) {
          return resultRight.searchTextCount - resultLeft.searchTextCount;
        } else if (resultLeft.hitCount !== resultRight.hitCount) {
          return resultRight.hitCount - resultLeft.hitCount;
        }
        return resultRight.id - resultLeft.id;
      });
      resultContent.innerHTML = `<ul class="search-result-list">${resultItems.map(result => result.item).join('')}</ul>`;
      window.pjax && window.pjax.refresh(resultContent);
    }
  };

  bindSearchOption(caseOption);
  bindSearchOption(wholeOption);

  const fetchData = () => {
    fetch(CONFIG.root + searchPath)
      .then(response => response.text())
      .then(res => {
        // Get the contents from search data
        isfetched = true;
        datas = isXml ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => {
          return {
            title  : element.querySelector('title').textContent,
            content: element.querySelector('content').textContent,
            url    : element.querySelector('url').textContent
          };
        }) : JSON.parse(res);
        // Only match articles with not empty titles
        datas = datas.filter(data => data.title).map(data => {
          data.title = data.title.trim();
          data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : '';
          data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/');
          return data;
        });
        // Remove loading animation
        document.getElementById('no-result').innerHTML = '<i class="fa fa-search fa-5x"></i>';
        inputEventFunction();
      });
  };

  if (CONFIG.localsearch.preload) {
    fetchData();
  }

  if (CONFIG.localsearch.trigger === 'auto') {
    input.addEventListener('input', inputEventFunction);
  } else {
    document.querySelector('.search-icon').addEventListener('click', () => {
      saveSearchHistory(input.value);
      inputEventFunction();
    });
    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        saveSearchHistory(input.value);
        inputEventFunction();
      }
    });
  }

  resultContent.addEventListener('click', event => {
    if (event.target.closest('a[href]')) {
      saveSearchHistory(input.value);
    }
  });

  renderSearchHistory();

  const ensurePersistentSearchTrigger = () => {
    if (document.querySelector('.persistent-search-trigger-mobile')) return;

    const mobileTrigger = document.createElement('button');
    mobileTrigger.type = 'button';
    mobileTrigger.className = 'persistent-search-trigger persistent-search-trigger-mobile popup-trigger';
    mobileTrigger.setAttribute('aria-label', '打开搜索');
    mobileTrigger.title = '搜索';
    mobileTrigger.innerHTML = '<i class="fa fa-search"></i><span>搜索</span>';
    document.body.appendChild(mobileTrigger);
  };

  ensurePersistentSearchTrigger();

  const keepDesktopSearchVisible = () => {
    const searchItem = document.querySelector('#menu .menu-item-search');
    if (!searchItem) return;

    const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;
    let anchorTop = 0;

    const updateAnchor = () => {
      searchItem.classList.remove('menu-item-search-fixed');
      document.body.classList.remove('search-menu-fixed');
      if (!isDesktop()) return;

      const rect = searchItem.getBoundingClientRect();
      anchorTop = rect.top + window.scrollY;
      searchItem.style.setProperty('--search-fixed-left', `${rect.left}px`);
      searchItem.style.setProperty('--search-fixed-width', `${rect.width}px`);
    };

    const updateFixedState = () => {
      if (!isDesktop()) {
        searchItem.classList.remove('menu-item-search-fixed');
        document.body.classList.remove('search-menu-fixed');
        return;
      }
      const shouldFix = window.scrollY > anchorTop;
      searchItem.classList.toggle('menu-item-search-fixed', shouldFix);
      document.body.classList.toggle('search-menu-fixed', shouldFix);
    };

    updateAnchor();
    updateFixedState();
    window.addEventListener('scroll', updateFixedState, { passive: true });
    window.addEventListener('resize', () => {
      updateAnchor();
      updateFixedState();
    }, { passive: true });
  };

  keepDesktopSearchVisible();

  // Handle and trigger popup window
  document.querySelectorAll('.popup-trigger').forEach(element => {
    element.addEventListener('click', () => {
      document.body.style.overflow = 'hidden';
      document.querySelector('.search-pop-overlay').classList.add('search-active');
      renderSearchHistory();
      input.focus();
      if (!isfetched) fetchData();
    });
  });

  // Monitor main search box
  const onPopupClose = () => {
    document.body.style.overflow = '';
    document.querySelector('.search-pop-overlay').classList.remove('search-active');
  };

  document.querySelector('.search-pop-overlay').addEventListener('click', event => {
    if (event.target === document.querySelector('.search-pop-overlay')) {
      onPopupClose();
    }
  });
  document.querySelector('.popup-btn-close').addEventListener('click', onPopupClose);
  window.addEventListener('pjax:success', onPopupClose);
  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });
});
