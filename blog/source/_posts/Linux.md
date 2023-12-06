---
title: Linux：Ubuntu，Git，Docker
date: 2022-11-28 10:32:42
tags:
- Linux
---
Linux常用指令，Ubuntu虚拟机使用指南，Git工作流，Docker基本概念
<!--more-->

# Code
```sh
#系统
lsb_release -a      #查ubuntu版本    
sudo passwd root    #更改root账户的密码
su                  #切换到root用户，$ 是普通权限， #是管理员权限
su username         #切换到其他用户
sudo usermod -aG sudo username   #添加用户为root
ps aux; kill [PID]  #查看进程; 根据进程号杀后台
free -,             #查内存

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

cd -    #切换到上一工作目录
cd ~    #导航到主目录 /home/user1
#.当前目录 ..父目录； cd XX相对路径，cd /XX绝对路径

ls                  #检索
tree []             #查看树状图
wget [url]          #下载, wget -O myfile.zip [url] 重命名文件
vi []               #命令行进入文件，按i进入插入模式，按Esc返回命令模式并输入:wq 保存退出, :q! 不保存退出
gedit []            #图形界面进入文件直接编辑
whereis []          #查找
find / -name "[]"   #查找 find *XXX*

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
```
# Ubuntu
```sh
cat /proc/version   #查版本信息
lsb_release -a      #查ubuntu版本
free -m             #查内存使用情况
df -hl              #查看磁盘剩余空间

```
截图：1.screen截图应用程序   2.设置-设备-键盘-截图快捷键

## 虚拟机
[Virtual Box](https://www.virtualbox.org/wiki/Downloads) + [Ubuntu 20.04](http://releases.ubuntu.com/20.04/), 或[18.04](https://releases.ubuntu.com/bionic/)（速度慢则换[镜像源](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.04/)）
> 新建 > 导入.iso镜像 > 配置（分4G内存,100G硬盘）
设置 > 共享文件夹 > 添加（自动挂载，固定分配）
设置 > 共享粘贴板、拖放 > 双向
挂载U盘：USB > USB设置 > 添加一个USB > 在ubuntu设备中勾选

Host 键:右ctrl，方向键上：获取上次的命令，Tab：自动补全
``Ctrl + alt + T``	Terminal
``Ctrl + H``	显示隐藏文件   
> Debug:
VirtualBox安装 64位的Ubuntu系统，在安装时没有显示64位的Linux安装项: 1.CPU要是64位, 2.CPU开启了虚拟化 > `进入BOIS > Security> Virtualization > Enable` 还是不行则要查看Win10系统安装了自带的Hyper-V虚拟机是否占用了CPU虚拟化技术，将其卸载
## 学术加速
### Windows
1. 找一个合适的梯子，建议直接买付费的，稳定快速，推荐 [SockBoom](sockboom.link), 购买后会得到一个订阅地址，类似于`https://sub.sockboom.pro/.../.ini`，之后把这个地址填进软件，即可成功挂上梯子
2. 下载软件：[Clash.for.Windows](https://github.com/Z-Siqi/Clash-for-Windows_Chinese/releases/download/CFW-V0.20.39_CN/Clash.for.Windows-0.20.39-win.7z)，解压后双击`Clash for Windows.exe`打开软件 (备用下载链接：[Clash](https://sockboomdownload.com/ssr-download/ClashforWindows.zip))
3. 点击左侧的 `配置`，在顶部的输入栏中粘贴你复制的Clash订阅地址后点击 `下载`, 显示绿色的成功之后，点击名字为 `Sockboom` 的地方
4. 点击左侧的`代理`，点击上方的`Rule`，一般选择`手动选择`内的节点即可，不同的节点名称代表不同地区的服务器，可以点右上方的WiFi图标进行测速，哪个延迟低选哪个节点（用ChatGPT不能选香港），节点有失效可能，注意切换
5. 点击左侧的`主页`，打开下面`系统代理`的开关，即**成功加速**，左上角会显示实时流量，建议在`设置>快捷键`中将系统代理设为`Ctrl+W`, 按需随时开关，节约流量
（注意：在`系统代理`的开关打开的情况下关闭软件，将会*出现电脑连不上网的情况*，此时重新打开Clash即可解决，因此，建议也打开`开机自启动`的开关，保持Clash后台常驻）

至此，即可流畅登录Github上传或下载代码，以及在终端中安装各种工具包，避免了换源等繁琐操作

### Android
下载[ClashforAndroid](https://sockboomdownload.com/ssr-download/clashforandroid.apk)
配置 > 右上角＋号 > URL > 填入订阅链接 > 保存 > 回主界面点*启动*
选代理，点一下右上角的⚡将进行测速，数字越小的节点延迟越低

### Linux
[Clash.for.Windows-x64-linux.tar.gz ](https://dl.gtk.pw/proxy/linux/)可用于Ubuntu，
解压缩，进入文件夹终端，运行`./cfw`,即可打开软件
Ubuntu设置-网络代理设为手动，将http/https代理指向clash默认端口7890：`HTTP代理：127.0.0.1 7890` `HTTPS代理：127.0.0.1 7890`

创建软件快捷方式(Optional)
```sh
wget https://github.com/Z-Siqi/Clash-for-Windows_Chinese/blob/main/image/image_clash.png    # 下载clash icon做为桌面图标
vim clash.desktop
# 输入下面的内容
[Desktop Entry]
 Name=clash
 Comment=Clash
 Exec=/home/.../clash/cfw
 Icon=/home/.../clash/image_clash.png
 Type=Application
 Categories=Development;
 StartupNotify=true
 NoDisplay=false

sudo mv clash.desktop /usr/share/applications/
```
最终就能实现通过图标打开

**使用手机或其他USB设备提供网络**
VirtualBox设置 > USB设备 > 添加对应的USB口 > 重新启动虚拟机 > 右上角网络 > 连接USB以太网

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
Ctrl + ~    #控制台终端显示与隐藏：
```


## Debug
+ Could not get lock /var/lib/dpkg/lock – open > 执行 ``sudo rm -rf /var/lib/dpkg/lock``
+ 共享文件夹ubuntu中不显示 > 重新安装VMware tools
+ ``sudo apt-get install`` failed > 换源
+ 若打不开终端：系统设置修改语言后重新登陆
 
# Git
下载 [Git](https://git-scm.com/downloads)，与 [TortoiseGit](https://tortoisegit.org/download/) 小乌龟配合使用可以少记很多指令，在目标文件夹右键可执行push、clone、commit等操作
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