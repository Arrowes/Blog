<!DOCTYPE html>
<html lang="{{ config.language }}">
<head>
  {{ partial('_partials/head/head.swig', {}, {cache: theme.cache.enable}) }}
  {% include '_partials/head/head-unique.swig' %}
  {{- next_inject('head') }}
  <title>{% block title %}{% endblock %}</title>
  {{ partial('_third-party/analytics/index.swig', {}, {cache: theme.cache.enable}) }}
  {{ partial('_scripts/noscript.swig', {}, {cache: theme.cache.enable}) }}
</head>

<body itemscope itemtype="http://schema.org/WebPage">
  <div class="container{%- if theme.motion.enable %} use-motion{%- endif %}">
    <div class="headband"></div>

    <header class="header" itemscope itemtype="http://schema.org/WPHeader">
      <div class="header-inner">{% include '_partials/header/index.swig' %}</div>
    </header>

    {{ partial('_partials/widgets.swig', {}, {cache: theme.cache.enable}) }}

    <main class="main">
      <div class="main-inner">
        <div class="content-wrap">
          {% include '_partials/header/sub-menu.swig' %}
          <div class="content {% block class %}{% endblock %}">
            {% block content %}{% endblock %}
          </div>
          {% include '_partials/comments.swig' %}
        </div>
        {%- if theme.sidebar.display !== 'remove' %}
          {% block sidebar %}{% endblock %}
        {%- endif %}
        {%- if site.posts.length > 0 %}
          <aside class="right-posts-card">
            <div class="right-posts-title">
              <i class="fa fa-list-ul fa-fw"></i>文章
            </div>
            <ol class="right-posts-list">
              {%- for post in site.posts.sort('-date').toArray() %}
                <li class="right-posts-item{% if page.path == post.path %} right-posts-item-active{% endif %}">
                  <a href="{{ url_for(post.path) }}" title="{{ post.title or __('post.untitled') }}">
                    {{ post.title or __('post.untitled') }}
                  </a>
                </li>
              {%- endfor %}
            </ol>
          </aside>
        {%- endif %}
      </div>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        {% include '_partials/languages.swig' %}
        {{ partial('_partials/footer.swig', {}, {cache: theme.cache.enable}) }}
        {{ partial('_third-party/statistics/index.swig', {}, {cache: theme.cache.enable}) }}
      </div>
    </footer>
  </div>

  {{ partial('_scripts/index.swig', {}, {cache: theme.cache.enable}) }}
  {{ partial('_third-party/index.swig', {}, {cache: theme.cache.enable}) }}

  {%- if theme.pjax %}
    <div id="pjax">
  {%- endif %}
  {% include '_third-party/math/index.swig' %}
  {% include '_third-party/quicklink.swig' %}

  {{- next_inject('bodyEnd') }}
  {%- if theme.pjax %}
    </div>
  {%- endif %}
<script src="https://awp-assets.meituan.net/thh/thh_feb_web_portal/js/jquery-3.6.0.min.js"></script>
<script src="{{ url_for('js/code-unfold.js') }}"></script>
<script src="/js/highlight-keywords.js"></script>
</body>
</html>
