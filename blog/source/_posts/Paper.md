---
title: Paper：科研方法总结
date: 2023-03-15 09:47:16
tags: 总结
---
# 论文工具
## 1.找论文
参考目标期刊相似论文的架构，搭框架，填内容
订阅论文：[文献鸟](https://www.storkapp.me/?ref=1003)，设置关键字订阅相关论文
下载论文：[SCI-Hub论文下载](https://tool.yovisun.com/scihub/), [中国专利下载](https://www.drugfuture.com/cnpat/cn_patent.asp)
查期刊：[LetPub](https://www.letpub.com.cn/index.php?page=journalapp)，有期刊的介绍及投稿人的讨论
下载书籍：[Z-library](https://lib-xg7r2un3uz6rivi4ibrvtfls.resist.tel/)
快速总结论文：Newbing，[ChatPaper](https://chatpaper.org/)

## 2.中译英
[DeepL翻译器](https://www.deepl.com/translator)
![图 1](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper1.png)  

## 3.润色
[ChatGPT](https://chat.openai.com/chat)，按照期刊风格润色，[ChatGPT提示词参考](https://ai.newzone.top/)
```
I want you to act as an academic journal editor. 
Please [proofreading] the [paragraph] from an academic angle based on the writing style of the [CVPR]: 
[text]
```
<img src="https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper2.png" width = "90%" />

## 4.语法
[Grammarly](https://www.grammarly.com/office-addin)，安装Word插件修正语法
![图 3](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper3.png)  

# 文献管理神器：Zotero
Zotero能管理个人文献库、插入引文、论文阅读和记笔记、pdf下载和翻译、查看论文分区、影响因子等信息
## 安装
[Zotero官网](https://www.zotero.org/)，安装软件后再装浏览器插件，可以很方便的在浏览器随时导入文献；
顺便在官网注册一个账号，用于同步,且可登陆官网在线查看自己的论文库； 
<img src="https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper4.png" width = "100%" />

## 配置
### 常规设置
``编辑 > 首选项 > 同步 > 登陆``
``编辑 > 首选项 > 高级 > 文件和文件夹 > 更改数据储存路径  #自选合适的位置存储本地文件``

### SCI-Hub抓取pdf 
1. 打开Zotero 首选项->高级->设置编辑器
2. 搜索 ``extensions.zotero.findPDFs.resolvers`` ，搜到之后双击打开，在对话框中填入：
```
{
    "name":"Sci-Hub",
    "method":"GET",
    "url":"https://sci-hub.ren/{doi}",
    "mode":"html",
    "selector":"#pdf",
    "attribute":"src",
    "automatic":true
}
```
3. 实现抓取任意文献pdf（知网和部分新文献不行）

### 配置搜索引擎
1. [下载 engines.json 文件](https://www.123pan.com/s/goS7Vv-kIKbd.html)
2. 打开数据储存路径,替换同名文件 ``...\Zotero\locate\engines.json``
3. 重启Zotero后，实现多搜索引擎，很方便 

### 安装Word插件
安装word插件，实现高效插入引文，并且可以根据期刊选择参考文献样式
``编辑 > 首选项 > 引用 > 文字处理软件 > 安装word插件`` 
<img src="https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper5.png" width = "80%" />

### 插件，让Zotero真正好用
[官方插件下载地址](https://www.zotero.org/support/plugins)
安装方法：下载.xpi 文件到你的电脑。然后，在 Zotero，点击“工具→插件（附加组件）”，然后拖动插件的 .xpi 文件到插件窗口打开，或者选择从文件中安装。安装完成后重新启动软件即可。

**下面是强烈推荐的5个必备插件，嫌麻烦可以直接安装我上传的，都是2023年最新的，5个全部拖进去即可，地址：[推荐插件下载](https://www.123pan.com/s/goS7Vv-mIKbd.html)**

**Zotero PDF Translate**
[zotero-pdf-translate 下载](https://github.com/windingwind/zotero-pdf-translate/releases)，实现划词翻译，但是需要在插件设置里配置翻译引擎（免费,推荐腾讯云），[配置方法文档](https://doc.tern.1c7.me/zh/folder/setting/#%E8%85%BE%E8%AE%AF%E4%BA%91) 

**Jasminum - 茉莉花**
[Jasminum 下载](https://github.com/l0o0/jasminum/releases)，一个简单的 Zotero 中文插件, 优化知网中文论文管理体验

**Zotero DOI Manager**
[Zotero DOI Manager 下载](https://github.com/bwiernik/zotero-shortdoi/releases)，更新抓取文献的DOI号，提高SCI-Hub抓取pdf成功率

**Zotero IF**
[Zotero IF百度云地址，提取码: apeh](https://pan.baidu.com/s/1-nIHvhRj_wK_t6LMsNF6rg#list/path=%2Fsharelink3626522904-21879764921069%2FZotero%20IF&parentPath=%2Fsharelink3626522904-21879764921069),为所抓取的文献更新影响因子

**Zotero Citation Counts Manager**
[Zotero Citation Counts Manager 下载](https://github.com/eschnett/zotero-citationcounts/releases)，抓取引用数，一般选Semantic Scholar citation count

<details>
  <summary>清空其它信息:工具-->开发者-->Run Javascript-->运行以下代码</summary>

    var fieldName = "extra";
    var newValue = "";

    var fieldID = Zotero.ItemFields.getID(fieldName);
    var s = new Zotero.Search();
    s.libraryID = ZoteroPane.getSelectedLibraryID();
    var ids = await s.search();
    if (!ids.length) {
    return "No items found";
    }
    await Zotero.DB.executeTransaction(async function () {
    for (let id of ids) {
    let item = await Zotero.Items.getAsync(id);
    let mappedFieldID = Zotero.ItemFields.getFieldIDFromTypeAndBase(item.itemTypeID, fieldName);
    item.setField(mappedFieldID ? mappedFieldID : fieldID, newValue);
    await item.save();
    }
    });
    return ids.length + " item(s) updated";
</details>

# LaTex
在线编辑器：[Overleaf](https://www.overleaf.com/)，可以多人在线共同编辑、批注；
将期刊提供的LaTex模板导入编辑器，直接在模板里写；
查询文档：[LaTeXdoc](https://github.com/sailist/LaTeXdoc), [Latex简明速查手册(8页)](https://zhuanlan.zhihu.com/p/508559139)

## 参考文献
### 单篇论文的参考文献引用
1. 使用``\begin{thebibliography}``开始参考文献的引用；使用``\end{thebibliography}``结束；
2. 使用``\bibitem{}``添加文献，在文章中只用使用``\cite{}``引用，需要自己改，比较麻烦；

### overleaf+zotero多篇论文.bib文件引用
1. 使用zotero，将文章所需参考文献导入至一个新文件夹中，选择导出分类，选择文件夹导出``ref.bib``格式的文件；
2. 打开overleaf，将刚刚的``ref.bib``文件导入
3. 接下来就是在文章中导入参考文献:

（1）首先导入如下命令，注意是在文章最后，``\end{document}``之前：
```
\bibliographystyle{ieicetr} %引文期刊格式
\bibliography{ref} %.bib文件名
```
(2)编译后还不能显示你的参考文献列表，只有在文章中添加了``\cite{}``之后才可以正常显示
![图 6](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Paper6.png)  
``\cite{liu_ceam-yolov7_2022}``

## 公式图表
### 公式
```
\begin{equation}
  x+y
\end{equation}
```
### 图片
```
%h: 表示浮动体尽可能地放在当前位置。t: 表示浮动体放在页面顶部。b: 表示浮动体放在页面底部。p: 表示浮动体放在一个单独的页面上。
\begin{figure}[htb]
\begin{center}
\includegraphics[width=1\columnwidth]{FEY-YOLOv7/figure/fig.1.png}
\end{center}
\caption{RGB-infrared Datasets.}
\label{fig:1}
\end{figure}
%跨栏显示：{figure*}
%若编译不显示图片：菜单>选择用XELATEX编译
%引用：shown in Fig.\ref{fig:2}
```
### 表格
```
\begin{table}[htb]
\caption{Effect of different datasets on the YOLOv7.}
\label{table:4}
\begin{center}
\begin{tabular}{ll}
    \hline
    \textbf{Dataset} & \textit{mAP}\\
    \hline
    IR dataset & 0.85 \\
    RGB dataset & 0.758 \\
    RGB-infrared dataset & 0.962 \\
    \hline
\end{tabular}%
\end{center}
\end{table} 
```

## Note
IEICE期刊论文投稿的LaTeX模板中提供了EUC、SJIS和UTF三种不同的模板。这些模板的区别在于它们所使用的字符编码方式，其中UTF-8是其中最为常用的一种编码方式。
``Ctrl + S 编译``
```sh
%分点
\begin{itemize}
  \item [1.]
  \item 
  \item 
\end{itemize}

空行：\\  下划线：\_{}  百分号:\%  加粗：\textbf{}
斜体：\textit{} 或 $x$  或公式斜体：\mathit{}  
高亮：\usepackage {soul}  \hl {xxx}

%文章结构
章：\section{}   节：\subsection{}   条：\subsubsection{}
```
# 论文规范
## 缩写
1. 一个词或词组在文中出现三次或以上才可以用缩写，否则需要写出全称。也就是说如果只出现一次或两次，每次都要写出全称，而缩略语就不需要给出了。
出现的次数是在摘要、正文(从前言到讨论)、每个图注以及每个表注中分别计算的。如果一个词在摘要中出现一次，正文中出现多次，图注中又出现一次，那么摘要中只要用全称，不要用缩写；正文中第一次出现时用全称，后面用缩写； 图注中用全称，不用缩写。
一些期刊只允许对正文中出现3次以上的术语使用缩写。
一些期刊禁止在标题和摘要中使用任何缩写词。
从写作风格上讲，大多数期刊都建议作者不要在句首使用缩写词。在这种情况下，作者要详细说明术语的含义，或者改用别的措辞重写句子。
在论文中，将摘要看做是独立的部分。因此，如果您需要在摘要和论文中同时使用一个缩写词时，您需要两次介绍这个缩写词：首次在摘要中使用时介绍一次；首次 在论文中使用时介绍一次。然而 ，如果您发现在摘要中介绍的一个缩写词仅仅出现了一两次，没必要缩写——可以考虑避免缩写，每次都用全拼代替（除非您认为读者更了解缩写词）

2. 缩略语在文中第一次出现时需要定义。这里所谓第一次，也是摘要、正文(从前言到讨论)、每个图注以及每个表注中分别计算的。如果摘要和正文都符合上面所说使用缩写的规则，那么摘要中需要定义一次，正文中还需要定义一次。定义就是写出全称并在括号中给出缩写。
The patient was diagnosed with pulmonary arterial hypertension (PAH).
如果图例或表格中为了节省空间出现了缩写，那么在图注或表注中要解释缩写。
PH: pulmonary hypertension, PAH: pulmonary arterial hypertension.
写全称时一般是全部用小写，除非是人名、地名等专有名词，而缩写一般是全大写，除非是约定俗成的写法，比如用ChIP 代表chromatin immunoprecipitation。
应该考虑到也许有其他领域或者新进入这门领域的读者会阅读这篇论文，所以期刊都规定缩略语要先定义再使用。有些期刊会列出该期刊中不需要定义就可以直接使用的缩略语，比如Journal of Clinical Investigation 就给出[标准缩略语列表](http://www.jci.org/kiosk/publish/abbreviations)并指出这些缩略语可以直接使用。如果期刊没有特别规定，应该每个缩略语使用时都要先定义。定义之后记得要一直使用缩略语，不要再使用全称。

3. 尽量避免使用缩略语。一篇文章完全不使用缩略语不见得可行，但是尽量少用为好，而且只使用比较常见的缩略语。使用缩略语的目的是为了便于读者对文章的阅读理解，比较长的词组如果反复出现，不便于读者的快速阅读，所以用缩写更合适。有些词可能多数读者对缩写更熟悉，这些词用缩写也便于读者理解。如果很多比较短的词也用缩写，而且不是普遍使用的缩写，读者就经常要停下来去查找缩写代表的词意，思路就会被打断，所以会影响对文章的理解。

4. 一个缩略语代表一个词或词组。在一篇文章中，一个缩略语只能代表一个词（组），而且一个词（组）也只能用一个缩略语代表。

5. 缩写相关的复数和冠词的用法。多数情况下，我们会用缩略语来代替一个名词，所以如果是可数名词也是有复数的。一般来说，缩略语代表的是名词的单数形式，我们在后面加s（或者加es如果缩略语的最后一个字母是s）来表示复数。定义缩写的时候通常就可以看出来，比如 endothelial cells (ECs)。
如果缩略语名词前面需要加不定冠词，要根据缩写的读音来决定是用a还是an。例如human immunodeficiency virus缩写成HIV时我们是念这三个字母，第一个字母H虽然是个辅音字母，念这个字母时却是元音开头，所以HIV这个词的第一个音是元音，前面要用an，例如 an HIV-positive test result。

6. 在技术写作中最常见的关于首字母缩写和缩略词的错误，就是大部分人以为缩写中出现的大写字母在缩写前的词组中也需要大写，实际上并不是这样的。例如，作为商业管理哲学的「total quality management」缩写为「TQM」，但它的全称却常常被错误地写成「Total Quality Management」，这有可能是因为部分作者忘记了这个词本身并不是专有名词，甚至是更糟糕的情况──作者根本从一开始就没有完全了解这个词的含意！请记住，在文章中缩写术语之前，首先了解该术语的含意和来源是很重要的，因为作者在论文中处理首字母缩写和缩略词的态度与方法常常反映了他们自己对于运用术语的了解程度。
掌握了上面这几个原则，我们就可以通过恰当地使用缩略语来增加文章的可读性。

## 字母
1. 什么时候用斜体(italic)？
> 1)变量(variables)应该用斜体表示：例如*T*表示温度(temperature)，*r*表示速率(rate)，*x*代表摩尔分数(molar fraction).
2)坐标轴(axes)：the *y* axis.
3)平面(planes)：plane *P*.
4)行列式(determinants)和矩阵(matrices)中的元素：*gn*.
5)常数(constants)符号: *g*, 重力加速度
6)描述变量的函数:*f(x)*.

2. 什么时候不用斜体，而采用罗马字体(Roman)?
这里的Roman字体指非特殊性字体，与每个期刊的正文字体一致
> 1)数字；
2)标点符号和括号；
3)大多数运算符；
4)量度单位和时间单位：毫克, mg; 帕斯卡, Pa; 毫米汞柱, mmHg.
5)非数学符号和数量：s, 原子轨道(atomic orbital);
6)变量的多字符缩写
7)数学常量(mathematical constants):自然对数,e;复数的虚部,i;圆周率,π.
8)矩阵的转置(transposes), **A**T(T是矩阵**A**的转置)
9)点(point)和线(line): point A, line AB.
10)行列式(determinants)： A是矩阵**A**的行列式
11)三角函数和其他数学函数:正弦函数sin;最大值max,极限lim;对数log等.

3. 什么时候用粗体(Boldface)？
> 1）向量(vectors)；
2）张量(tensors)；
3）矩阵(matrics);
4）多维物理量：磁场强度，**H**.

4. 什么时候使用希腊字母(Greek letters)?
> 任何拉丁字母可以使用的地方都可以，包括变量，常量，向量等。

5. 当上下标本身就是代表物理量或数字的符号时，用斜体(italic),如果上下标是缩写或者不是符号时，不用斜体，采用罗马字体(Roman).
> 举例：*Cp* for heat capacity at constant pressure常压比热（*p*是压力的符号，采用斜体）
*C*B for heat capacity of substance B 物质B的比热（B不是符号，不用斜体）
*C*g where g is gas 气体比热 (g是gas的缩写，不用斜体)
*Ei* for energy of the *i*th level, where *i* is a number(*i*是代表数字的符号)
*g*n where n is normal(n是气体normal的缩写，不用斜体)

[[GB 3102.11-93] 物理科学和技术中使用的数学符号](https://journal.cricaas.com.cn/attached/file/20210517/20210517161953_566.pdf)