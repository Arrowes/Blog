---
title: Linux：Ubuntu，Git，Docker
date: 2022-11-28 10:32:42
tags:
- Linux
---
Linux常用指令，Ubuntu虚拟机使用指南，Git工作流，Docker基本概念
<!--more-->

# Code
[每天一个linux命令](https://www.cnblogs.com/peida/archive/2012/12/05/2803591.html)


 

```sh
#系统
lsb_release -a      #查ubuntu版本    
sudo passwd root    #更改root账户的密码
su                  #切换到root用户，$ 是普通权限， #是管理员权限
su username         #切换到其他用户
sudo usermod -aG sudo username   #添加用户为root
ps aux; kill [PID]  #查看进程; 根据进程号杀后台
free -,             #查内存
clear               #清空终端输出
ping XX.XX -t       #长ping
man XX                  #查看指令用法

#安装 换源
sudo apt-get install [] #安装 失败则换源
sudo gedit /ect/apt/source.list #最后一行加入其他源
sudo apt update	    #更新索引(源)

#文件
mkdir []            #新建文件夹  
rmdir []            #删除文件夹( rm -r XXX  
sudo nautilus       #以root进入文件夹     
touch [] []         #创建文件
rm []               #删除文件
mv file1 [dir]      #移动文件 (无dir则相当于重命名)
cp -r [] []         #复制文件
chmod u+x []        #添加可执行文件
ls -R               #展开子文件夹

cd -                #切换到上一工作目录
cd ~                #导航到主目录 /home/user1
cd 直接拖文件
#.当前目录 ..父目录； cd XX相对路径，cd /XX绝对路径
pwd                 #当前路径

ls                  #检索
tree []             #查看树状图
wget [url]          #下载, wget -O myfile.zip [url] 重命名文件
vi []               #命令行进入文件，按i进入插入模式，按Esc返回命令模式并输入:wq 保存退出, :q! 不保存退出
gedit []            #图形界面进入文件直接编辑
whereis []          #查找
find / -name "[]"   #查找 find *XXX*
ls -l | grep "^-" | wc -l   #统计当前目录下文件的个数（不包括目录）
find -name "*.jpg" | wc -l  #统计当前文件夹下指定类型的文件的数量
du -h --max-depth=1 #查磁盘占用情况
diskutil list           #显示现有磁盘状况

export 变量名=值     #设置或更新环境变量的值
#配置永久环境变量更方便，sudo gedit /etc/profile，末尾加入如上代码，然后source /etc/profile加载立即生效
echo []             #输出指定的字符串或变量的值,用于调试程序、输出信息
script -f log.txt   #输出terminal内容到文件 exit退出记录，或在指令后加入 > log.txt

#tar打包
tar -cvf XX.tar XX  #将XX文件夹打包为XX.tar文件
tar -tf XX.tar      #查看tar内容
tar -xf []          #解包 -C /path 
#tar压缩
tar -zcvf XX.tar.gz XX #压缩XX（ 排除：XX前加--exclude=dataset）
tar -xf XX.tar.gz XX   #解压 -C /path
#zip
zip -r XX.zip XX XX.txt #压缩XX以及XX.txt（排除：加-x "./XX/X"）
unzip *.zip -d /path    #解压
zip -sf test.zip        #预览压缩包内容

#ubuntu 7z解压
sudo apt-get install p7zip
#解压
7z x XX.7z -r -o/home/xx
#-o 是指定解压到的目录，注意-o后没有空格
#压缩
7z a -t7z -r XX.7z /home/XX/*
```
Ctrl + R 搜索历史命令
Ctrl + Backspace 删除整个单词
多个语句可以通过`;`分割 `&&` 表示上一句返回码0才会执行 `||` 表示上一句返回码非0才会执行 `;` 无论如何都执行




# Ubuntu
```sh
cat /proc/version   #查版本信息
lsb_release -a      #查ubuntu版本
free -m             #查内存使用情况
df -hl              #查看磁盘剩余空间
```
截图：1.screen截图应用程序   2.设置-设备-键盘-截图快捷键
## 单系统安装
下载：[Ubuntu中文官网](https://cn.ubuntu.com/download/desktop)
安装：使用[Rufus](https://rufus.ie/zh/)，创建启动盘
## 虚拟机
### Virtual Box
[Virtual Box](https://www.virtualbox.org/wiki/Downloads) + [Ubuntu 20.04](http://releases.ubuntu.com/20.04/), 或[18.04](https://releases.ubuntu.com/bionic/)（速度慢则换[镜像源](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.04/)）
> 新建 > 导入.iso镜像 > 配置（分4G内存,100G硬盘）
设置 > 共享文件夹 > 添加（自动挂载，固定分配）
设置 > 共享粘贴板、拖放 > 双向
挂载U盘：USB > USB设置 > 添加一个USB > 在ubuntu设备中勾选

Host 键:右ctrl，方向键上：获取上次的命令，Tab：自动补全
``Ctrl + alt + T``	Terminal
``Ctrl + H``	显示隐藏文件


**使用手机或其他USB设备提供网络**
VirtualBox设置 > USB设备 > 添加对应的USB口 > 重新启动虚拟机 > 右上角网络 > 连接USB以太网

> Debug:
VirtualBox安装 64位的Ubuntu系统，在安装时没有显示64位的Linux安装项: 1.CPU要是64位, 2.CPU开启了虚拟化 > `进入BOIS > Security> Virtualization > Enable` 还是不行则要查看Win10系统安装了自带的Hyper-V虚拟机是否占用了CPU虚拟化技术，将其卸载

### VMware Workstation
共享文件夹：将你本地的那个共享的文件夹 右击>属性>共享>高级共享 (需要安装VMware Tools)

> Debug:
Could not get lock /var/lib/dpkg/lock – open > 执行 ``sudo rm -rf /var/lib/dpkg/lock``
共享文件夹ubuntu中不显示 > 重新安装VMware tools ([VMware Tools的介绍及安装方法](https://blog.csdn.net/williamcsj/article/details/121019391))
共享剪切板失效：`sudo apt-get install open-vm-tools-desktop`,然后重启
安装VMware Tools选项显示灰色 > 关闭虚拟机 > 在虚拟机设置分别设置CD/DVD、CD/DVD2和软盘为自动检测
``sudo apt-get install`` failed > 换源
若打不开终端：系统设置修改语言后重新登陆
网络：虚拟机 > 设置 > 网络适配器 > NAT模式； 设置 > 虚拟网络编辑器 > 还原默认设置
连不上USB: Win键+R键打开“运行”程序，输入“services.msc”,点击开启VMware USB Arbitration Service服务，并设置为自动启动; 然后虚拟机 > 可移动设备 > 选择


## VScode
vscode远程访问：1.安装remote插件 2.连接服务器``ssh ywang85@she1-w50502`` 3.connect，打开terminal

上传文件：vscode直接拖拽到目录
下载文件：右键download

vscode插件离线安装：如装python插件，直接进[ marketplace ](https://marketplace.visualstudio.com/vscode)下好拖到扩展位置

**快捷键**
打开vscode左下角键盘快捷键设置，找到copy line down，即可查看当前默认快捷键为`shift + Alt + ↓`，双击快捷键，输入自己想要的快捷组合，如Ctrl+D，然后回车即可设置自己的组合了
```sh
Ctrl + /    #注释
alt + ↑/↓   #移动行
alt + ←/→   #光标跳到上/下一个单词
Ctrl + L    #选择整行
Ctrl + X    #删除整行
Ctrl + ~    #开关终端
Ctrl + B    #开关侧边栏
Ctrl + P    #快速打开文件(Ctrl + → 多开),?查看帮助文档,:跳行，>编辑器命令
Ctrl + D    #选词，多按选择多个
Ctrl + Backspace    #删除整个单词
Ctrl + Shift + D    #快速复制当前行
Ctrl + Shift + F    #全局搜索
Alt + Click         #多行编辑
```
网格布局：查看 > 编辑器布局 > 2x2 网格
插件：Prettier——自动化代码格式化工具，帮助保持代码的一致性和可读性。

调试代码是解决问题和优化代码的重要工具：
1. 设置断点：单击行号左侧的空白区域，可以设置或取消断点。
2. 启动调试会话：点击左侧的调试图标（或者使用快捷键F5），选择想要调试的环境（比如Node.js、Python等），然后启动调试会话。

 
# Git
下载 [Git](https://git-scm.com/downloads)，`sudo apt-get install git`
与 [TortoiseGit](https://tortoisegit.org/download/) 小乌龟配合使用可以少记很多指令，在目标文件夹右键可执行push、clone、commit等操作
## 主要流程
1. ``git clone <X>`` // 到本地
2. ``git checkout -b xxx`` 切换至新分支xxx，相当于复制了remote的仓库到本地的xxx分支上
3. 修改或者添加本地代码（部署在硬盘的源文件上）
4. ``git diff`` 查看自己对代码做出的改变
5. ``git add .`` 上传所有代码至暂存区 也可把 . 换成指定文件
6. ``git commit`` 可以将暂存区里更新后的代码更新到本地git
7. ``git push origin xxx`` 将本地的xxx git分支上传至github上的git

[Github要求使用基于令牌的身份验证](https://zhuanlan.zhihu.com/p/401978754)

如果在写自己的代码过程中发现远端GitHub上代码出现改变
1. ``git checkout main`` 切换回main分支
2. ``git pull origin master(main)`` 将远端修改过的代码再更新到本地
3. ``git checkout xxx`` 回到xxx分支
4. ``git rebase main`` 我在xxx分支上，先把main移过来，然后根据我的commit来修改成新的内容
（中途可能会出现，rebase conflict --> 手动选择保留哪段代码）
5. ``git push -f origin xxx`` 把rebase后并且更新过的代码再push到远端github上（-f --> 强行）
6. 原项目主人采用pull request 中的 squash and merge 合并所有不同的commit

远端完成更新后
1. ``git branch -d xxx`` 删除本地的git分支
2. ``git pull origin master`` 再把远端的最新代码拉至本地

[十分钟学会正确的github工作流，和开源作者们使用同一套流程](https://www.bilibili.com/video/BV19e4y1q7JJ)

<img src="https://www.ruanyifeng.com/blogimg/asset/2015/bg2015120901.png" width="100%">


```sh
#branch 与 tag：
git tag/branch  #查本地仓库所有的tag或branch -r:远程分支 -a:所有分支
git checkout [tag/branch]   #已有仓库切换 tag/branch
git checkout -b [branch]    #新建一个分支，并切换到该分支
git merge [branch]  #合并指定分支到当前分支
git tag [tag]       #新建一个 tag 在当前 commit
git describe --tag  #查当前tag
git show [tag]      #查看tag信息

#tag 对应某次 commit, 是一个点，是不可移动的。
#branch 对应一系列 commit，是很多点连成的一根线，有一个HEAD 指针，是可以依靠 HEAD 指针移动的。
#两者的区别决定了使用方式，改动代码用 branch ,不改动只查看用 tag
```


```sh
#常用指令：
git init [project-name] #新建一个目录，将其初始化为Git代码库
git status  #显示有变更的文件
git log     #显示当前分支的版本历史 commit id
git diff    #显示暂存区和工作区的差异
git reset --hard [commitId]  # 进行回溯

git config --list   #检查当前配置
# 配置全局信息 无global则是在项目中配置
git config --global user.name "[name]"
git config --global user.email "[email address]"

```

# Docker
`Docker`是一种开源的容器化平台，可以帮助开发者更高效地打包、部署和运行应用程序。它基于 `Linux` 容器（LXC）技术，通过将应用程序及其所有依赖项打包到一个容器中，从而消除了应用程序在不同环境之间迁移所面临的问题。使用Docker，开发者可以快速构建、测试和部署应用程序，减少了与操作系统和基础设施相关的问题，从而提高了开发、测试和发布的速度。

[🐳Docker概念，工作流和实践](https://www.bilibili.com/video/BV1MR4y1Q738/)
<img src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Linux1.png" width="80%">
<img src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Linux2.png" width="80%">

## 配置
```shell
# 查看当前运⾏的docker实例状态 
sudo docker ps -a 
# 在上⼀条指显示结果列表中，查看openharmony的STATUS
# 如为 Exited，则需要执⾏下⾯这条指令，再次启动 
# 如为 Up，则跳过下⾯这条指令 
sudo docker start openharmony
# 进⼊docker编译环境 
sudo docker exec -it openharmony bash 
# 执⾏后，出现类似如下信息，说明再次进⼊成功 
# root@bae85ba0f77c:/home/openharmony#
#退出
exit
```
启动docker的samba服务：``service smbd restart``
查看ip：``ifconfig``
连接：``\\192.168.174.128\docker``

## 文件拷贝
```shell
#1、主机拷贝文件到docker编译环境里：
sudo docker cp源文件openharmony:/目标文件
#参数解析：
#源文件：主机上的，可为文件或者目录
#盘目标文件：docker编译环境里的，通常为目录，表示将文件拷贝到该目录

#2、docker编译环境拷贝文件到主机：
sudo docker cp openharmony:/源文件目标文件
#源文件：docker编译环境里的，可为文件或者目录
#目标文件：主机上的，通常为目录，表示将文件拷贝到该目录下
#删除docker编译环境【谨慎操作，不可恢复】

#查看当前运行的docker实例状态
sudo docker ps -a
#在上一条指显示结果列表中，查看openharmony的STATUS
#如为Up，则需要执行下面这条指令，停止其运行
#如为Exited，则跳过下面这条指令
sudo docker stop openharmony
#删除
sudo docker rm openharmony

#提醒：
#删除前，请确保该运行环境内的有效数据都已拷贝到主机上
#删除后，该运行环境内的所有数据将被移除，不可恢复
```
vscode使用docker
1. 下载docker插件，Dev Containers插件
2. 连接到 Docker 容器：点击左下角的绿色按钮，选择 "Attach to Running Container"。
3. 连接后，VSCode将打开一个新的窗口，该窗口中包含了Docker容器的文件系统。在VSCode的资源管理器中，可以直接操作和管理容器中的文件。