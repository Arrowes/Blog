---
title: Hello Blog! 从零开始搭建自己的博客网站
date: 2022-11-22 19:36:45
tags: 
- 技术
---
第一篇博客用来记录搭建该网站并成功发表这篇博客的流程，使用Hexo静态博客框架，托管于Github，参考了多篇文章[^1]，项目地址：[Blog](https://github.com/Arrowes/Blog)
<!--more-->
<img alt="图 1" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Hello-blogBlogPhoto.png" width = "30%"/>  

### 总体流程
其中主流程参考[知乎：GitHub+Hexo 搭建个人网站详细教程](https://zhuanlan.zhihu.com/p/26625249)，虽然是老文章，但每一步都非常详细，框架搭建过程存在问题可以看文章的评论区或[Hexo官方文档](https://hexo.io/zh-cn/docs/)进行补充；

域名在[阿里云](https://dc.console.aliyun.com/next/index?spm=5176.12818093.ProductAndResource--ali--widget-product-recent.dre1.265516d0P13nxv&accounttraceid=b4a1b2c1dcab4588a55aa2f5926041aazltv#/overview)购买,买的 *wangyujie.site* 首年6元，这也是唯一的开销，如果愿意使用原网站 *<arrowes.github.io>* ,这一步甚至可以省略；

选用了Next主题，主题优化参考了[Next主题官方文档](http://theme-next.iissnan.com/getting-started.html)以及[知乎：hexo的next主题个性化教程:打造炫酷网站](https://zhuanlan.zhihu.com/p/28128674)（其中访问量、统计功能教程已过期,很多配置next主题已内置），可以把网站搭建的花里胡哨；

编写博客使用的Markdown语言通过看[菜鸟教程：Markdown 教程](https://www.runoob.com/markdown/md-tutorial.html)非常简单，可以边学边写，使用VScode，安装``Markdown Preview Enhanced``及``markdown image``插件；

其他工具有：logo下载：[iconfont](https://www.iconfont.cn/)，Next默认的icon网站（灰色为收费图标）：[Font Awesome](https://fontawesome.com/icons)，图床url链接生成：[SM.MS](https://sm.ms/)，此外，大多数网站需要用到~~科学上网~~。

Github网站项目地址：[Arrowes.github.io](https://github.com/Arrowes/Arrowes.github.io)

用关键词在谷歌里搜到自己的网页：[让Google搜索到自己的博客](https://zoharandroid.github.io/2019-08-03-%E8%AE%A9%E8%B0%B7%E6%AD%8C%E6%90%9C%E7%B4%A2%E5%88%B0%E8%87%AA%E5%B7%B1%E7%9A%84%E5%8D%9A%E5%AE%A2/)

### 网站配置
#### 添加动态背景，以动态线条为例：
1. themes/next/layout/_layout 在`</body>`末尾添加如下代码：
     ```html
     {% if theme.canvas_nest %}
     <script type="text/javascript" src="//cdn.bootcss.com/canvas-nest.js/1.0.0/canvas-nest.min.js"></script>
     {% endif %}
     ```
2. /next/_config.yml,在里面添加如下代码：(可以放在最后面)
     ```css
     #是否打开动态背景
     canvas_nest: true
     ```

#### 统计功能
统计人数、阅读次数：/next/_config：找到busuanzi_count进行配置
统计字数、阅读时间： /next/_config:设置item_text_total为true

#### 配置网站超链接颜色
打开 `Blog\themes\next\source\css\_common\components\post` 路径下的post.styl , 并在底部添加如下代码:
```css
a:not(.btn){
  color:; //超链接显示颜色
  border-bottom: none;
  &:hover {
	color: #469FF1;  //鼠标移动上去后超链接颜色
	font-weight: none;
	text-decoration: none;
	}
  }
```
配置博客链接：_config中``permalink: :title/``

#### 搜索功能
更改主题配置文件 /next/_config 将local_search下的enable改为true

#### 评论功能
创建一个 Github Application 用来授权登录，如果没有 [点击这里申请](https://github.com/settings/applications/new), url都填`https://github.com/Arrowes/Arrowes.github.io`
```css
# Gitalk
# For more information: https://gitalk.github.io
gitalk:
  enable: true
  github_id: Arrowes # GitHub repo owner
  repo: Arrowes.github.io # Repository name to store issues
  client_id: 0cf14e51c1582cf64289 # GitHub Application Client ID
  client_secret: 5e8273d27714e40495267c73e607c******** # GitHub Application Client Secret
  admin_user: Arrowes # GitHub repo owner and collaborators, only these guys can initialize gitHub issues
  distraction_free_mode: true # Facebook-like distraction free mode
  proxy: https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token # This is official proxy address
  language: zh-CN
```

#### 首页展示文章数
```css
#Hexo-config文件修改
index_generator:
  path: ''
  per_page: 0 #不分页
```

#### 设置阅读全文
1. 在项目根目录下执行 ``npm install hexo-excerpt --save``
2. 在站点配置文件/hexo/_config.yml添加:
    ```css
    excerpt:			# 一定要顶格写，注意格式
      depth: 1			# 他的大小就是全文阅读预览长度设置
      excerpt_excludes: []
      more_excludes: []
      hideWholePostExcerpts: true
      ```

3. 在主题配置文件theme/next/_config中 excerpt_description 改为false

#### 添加标签
1. 配置：主题配置文件中删掉tags的注释
2. 文件：新建tags文件 ``hexo new page "tags"``
3. 文章：``tags: - XXX``

#### 公式
[markdown公式符号大全](https://blog.csdn.net/konglongdanfo1/article/details/85204312)
主题配置文件：`math:
  every_page: true
  mathjax:  enable: true`

#### hexo 添加自定义单静态页面 跳过hexo渲染，以resume为例:
1. 将resume文件夹放进Theme主题文件夹下的/source
2. Hexo-config: skip_render: resume/** （可省略）
3. 引用时直接 /resume/

#### 流程图
``npm install hexo-filter-mermaid-diagrams``
主题配置文件：``mermaid:  enable: true``

### markdown插件
``npm install hexo-reference --save`` 支持Markdown脚注
``npm install hexo-wordcount --save`` 字数统计

**Markdown Preview Enhanced** markdown预览插件（vs code）
如果无法正常导出：Chrome Puppeteer导出PDF > 搜索“chrome”，在相应选项中填入你的浏览器的“chrome.exe”文件的地址即可
``C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe``

**Markdown 粘贴插件**
Markdown paste 右键智能粘贴
Paste URL Ctrl+Alt+P快速粘贴链接

**markdown image** 图片插件（vs code）
 ```
Local
E:\Github\Blog\blog\node_modules\hexo-theme-next\source\images\ #Path
/images/ #Reference Path

Github
main #Branch
/images #Path
https://github.com/Arrowes/Blog #Repository
github_pat_11AV245NA0ZkjSgYjmtK5T_fyxLh1yhNVlT13FFsC #TokenMjaEB4LKd

#使用raw.gitmirror.com代替raw.githubusercontent.com,实现github图片加速
https://raw.gitmirror.com/${username}/${repository}/${branch}/${filepath} #Github: Cdn
q3mbRZwwnnKUXHcibZg6UN8ulCHE2UDXMjaEB4LKd
 ```

### 常用[Hexo指令](https://hexo.io/zh-cn/docs/commands)
`hexo init [folder]` 新建一个网站
`hexo new "title"` 新建一篇文章
`hexo clean` 清除缓存文件 (db.json) 和已生成的静态文件 (public)
`hexo g` 生成静态文件
`hexo s` 生成本地预览 <localhost:4000>
`hexo d` 部署网站

`hexo clean && hexo g && hexo s` 快速预览
`hexo clean && hexo g && hexo d` 快速部署


### Bug
√ 网站底部的图标不显示:Font Awesome部分图标收费
√ 访客数、文章字数没有数据：busuanzi链接过期
√ 生成的文章目录结构混乱：避免写跨级结构
部署经常超时 error：spawn failed，多试几次


### 总结
熟悉了搭建网站流程，想起本科打电子商务比赛花钱请人做网站，还是本地的静态网站，有点冤种；
对Github的工作流有了一定了解，比一键*Download ZIP*有所进步；
看了很多人写的教程才完成，花了整整两天，还是有点费时间的，除了瞎折腾，更多的其实是想搭建一个**输出**的平台，锻炼一下自己的表达、总结能力，改善一下自己学了就忘，忘了就废的情况，希望自己能继续坚持，多写几篇！



[^1]:[知乎：GitHub+Hexo 搭建个人网站详细教程](https://zhuanlan.zhihu.com/p/26625249)|
[Hexo官方文档](https://hexo.io/zh-cn/docs/)|
[Next主题官方文档](http://theme-next.iissnan.com/getting-started.html)|
[知乎：hexo的next主题个性化教程:打造炫酷网站](https://zhuanlan.zhihu.com/p/28128674)|
[菜鸟教程：Markdown 教程](https://www.runoob.com/markdown/md-tutorial.html)|
[个人网站：Arrow的笔记本](http://wangyujie.site/)