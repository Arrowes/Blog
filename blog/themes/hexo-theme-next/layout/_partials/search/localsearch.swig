<div class="search-header">
  <span class="search-icon">
    <i class="fa fa-search"></i>
  </span>
  <div class="search-input-container">
    <input autocomplete="off" autocapitalize="off"
           placeholder="{{ __('search.placeholder') }}" spellcheck="false"
           type="search" class="search-input">
  </div>
  <div class="search-options" aria-label="搜索选项">
    <button class="search-option search-option-case" type="button" aria-pressed="false" title="区分大小写" aria-label="区分大小写">
      Aa
    </button>
    <button class="search-option search-option-whole" type="button" aria-pressed="false" title="完整选词" aria-label="完整选词">
      W
    </button>
  </div>
  <span class="popup-btn-close">
    <i class="fa fa-times-circle"></i>
  </span>
</div>
<div class="search-history" aria-label="最近搜索"></div>
<div id="search-result">
  <div id="no-result">
    <i class="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
  </div>
</div>
