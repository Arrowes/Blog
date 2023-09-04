---
title: Linux：Ubuntu，Git，Docker
date: 2022-11-28 10:32:42
tags:
- Linux
---

# Code
```sh
#系统
lsb_release -a      #查ubuntu版本    
sudo passwd root    #更改root账户的密码
su                  #切换到root用户，$ 是普通权限， #是管理员权限
su username         #切换到其他用户
sudo usermod -aG sudo username   #添加用户为root
ps aux; kill [PID]  #查看进程; 根据进程号杀后台

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
tar -xf []          #解压
vi []               #命令行进入文件，按i进入插入模式，按Esc返回命令模式并输入:wq 保存退出, :q! 不保存退出
gedit []            #图形界面进入文件直接编辑
whereis []          #查找
find / -name "[]"   #查找 find *XXX*

export 变量名=值     #设置或更新环境变量的值
#配置永久环境变量更方便，sudo gedit /etc/profile，末尾加入如上代码，然后source /etc/profile加载立即生效
echo []             #输出指定的字符串或变量的值,用于调试程序、输出信息
```
# Ubuntu
```sh
cat /proc/version   #查版本信息
lsb_release -a      #查ubuntu版本
free -m             #查内存使用情况
df -hl              #查看磁盘剩余空间
```
## 虚拟机
[Virtual Box](https://www.virtualbox.org/wiki/Downloads) + [Ubuntu 20.04](http://releases.ubuntu.com/20.04/), 或[18.04](https://releases.ubuntu.com/bionic/)（速度慢则换[镜像源](https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.04/)）
> 新建 > 导入.iso镜像 > 配置（分4G内存,100G硬盘）
设置 > 共享文件夹 > 添加（自动挂载，固定分配）
设置 > 共享粘贴板、拖放 > 双向
挂载U盘：USB > USB设置 > 添加一个USB > 在ubuntu设备中勾选

Host 键:右ctrl，方向键上：获取上次的命令，Tab：自动补全
``Ctrl + alt + T``	Terminal
``Ctrl + H``	显示隐藏文件   

## 上网
[Clash.for.Windows-0.20.29-x64-linux.tar.gz ](https://github.com/Fndroid/clash_for_windows_pkg/releases/download/0.20.29/Clash.for.Windows-0.20.29-x64-linux.tar.gz)可用于Ubuntu，
解压缩，进入文件夹终端，运行`.cfw`,即可打开软件
Ubuntu设置-网络代理设为手动，将http/https代理指向clash默认端口7890：`HTTP代理：127.0.0.1 7890` `HTTPS代理：127.0.0.1 7890`

创建软件快捷方式(Optional)
```sh
wget https://cdn.jsdelivr.net/gh/Dreamacro/clash@master/docs/logo.png    # 下载clash icon做为桌面图标
vim clash.desktop
# 输入下面的内容
[Desktop Entry]
 Name=clash
 Comment=Clash
 Exec=/home/.../clash/cfw
 Icon=/home/.../clash/logo.png
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

## Debug
+ Could not get lock /var/lib/dpkg/lock – open > 执行 ``sudo rm -rf /var/lib/dpkg/lock``
+ 共享文件夹ubuntu中不显示 > 重新安装VMware tools
+ ``sudo apt-get install`` failed > 换源
+ 若打不开终端：系统设置修改语言后重新登陆
 
# Git
下载 [Git](https://git-scm.com/downloads)，与 [TortoiseGit](https://tortoisegit.org/download/) 小乌龟配合使用可以少记很多指令，在目标文件夹右键可执行push、clone、commit等操作
## 主要指令
1. ``git clone <X>`` // 到本地
2. ``git checkout -b xxx`` 切换至新分支xxx，相当于复制了remote的仓库到本地的xxx分支上
3. 修改或者添加本地代码（部署在硬盘的源文件上）
4. ``git diff`` 查看自己对代码做出的改变
5. ``git add`` 上传更新后的代码至暂存区
6. ``git commit`` 可以将暂存区里更新后的代码更新到本地git
7. ``git push origin xxx`` 将本地的xxxgit分支上传至github上的git

如果在写自己的代码过程中发现远端GitHub上代码出现改变
1. ``git checkout main`` 切换回main分支
2. ``git pull origin master(main)`` 将远端修改过的代码再更新到本地
3. ``git checkout xxx`` 回到xxx分支
4. ``git rebase main`` 我在xxx分支上，先把main移过来，然后根据我的commit来修改成新的内容
（中途可能会出现，rebase conflict --> 手动选择保留哪段代码）
5. ``git push -f origin xxx`` 把rebase后并且更新过的代码再push到远端github上
（-f --> 强行）
6. 原项目主人采用pull request 中的 squash and merge 合并所有不同的commit

远端完成更新后
1. ``git branch -d xxx`` 删除本地的git分支
2. ``git pull origin master`` 再把远端的最新代码拉至本地

[十分钟学会正确的github工作流，和开源作者们使用同一套流程](https://www.bilibili.com/video/BV19e4y1q7JJ)

---
branch 与 tag：
```sh
git tag/branch  #查仓库所有的tag或branch
git clone --branch [tag] [git地址]  #github clone 指定的tag
git checkout [tag/branch]  #已有仓库切换 tag/branch

#tag 对应某次 commit, 是一个点，是不可移动的。
#branch 对应一系列 commit，是很多点连成的一根线，有一个HEAD 指针，是可以依靠 HEAD 指针移动的。
#两者的区别决定了使用方式，改动代码用 branch ,不改动只查看用 tag
```


# Docker
`Docker`是一种开源的容器化平台，可以帮助开发者更高效地打包、部署和运行应用程序。它基于 `Linux` 容器（LXC）技术，通过将应用程序及其所有依赖项打包到一个容器中，从而消除了应用程序在不同环境之间迁移所面临的问题。使用Docker，开发者可以快速构建、测试和部署应用程序，减少了与操作系统和基础设施相关的问题，从而提高了开发、测试和发布的速度。

[🐳Docker概念，工作流和实践](https://www.bilibili.com/video/BV1MR4y1Q738/)
<img src="https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Linux1.png" width="80%">
<img src="https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Linux2.png" width="80%">

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