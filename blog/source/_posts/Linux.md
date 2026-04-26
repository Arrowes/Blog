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


 
## 常用命令
```sh
#系统
lsb_release -a      #查ubuntu版本    
sudo passwd root    #更改root账户的密码, 改其他用户换为用户名即可
su                  #切换到root用户，$ 是普通权限， #是管理员权限
su username         #切换到其他用户
sudo usermod -aG sudo username   #添加用户为root
ps aux; kill [PID]  #查看进程; 根据进程号杀后台
free -,             #查内存
clear               #清空终端输出
ping XX.XX -t       #长ping
man XX              #查看指令用法
sudo reboot         #重启
sudo chmod -R 777 /home -R  #赋予权限

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
rm -rf []           #删除文件夹
mv file1 [dir]      #移动文件 (无dir则相当于重命名)
cp -r [] []         #复制文件
chmod u+x []        #添加可执行文件
chmod +x ./XX.sh    #若直接执行被deny，添加执行权限
find . -name "[]"   #查找
find . -type d -name "foldername" #搜索文件夹(/所有目录 .为当前目录)
find . -name "*_inpaint.npz" -exec rm {} \;
find . -name "*_inpaint.npz" -delete
ln -s /path/to/file link  # 创建软链接
mount /dev/sda1 /mnt      # 将 /dev/sda1 分区挂载到 /mnt 目录
umount /mnt              # 卸载挂载点
scp username@asd-123:/path/to/file /path/to/destination #复制文件夹：scp -r /folder/
#rsync 其实就是"远程同步"（remote sync）的意思。与其他文件传输工具（如 FTP 或 scp）不同，rsync 的最大特点是会检查发送方和接收方已有的文件，仅传输有变动的部分（默认规则是文件大小或修改时间有变动）。
rsync -avz user@remote_host:/path/to/source/ destination/
rsync -av --exclude='*.log' source/ destination/

cd -                #切换到上一工作目录
cd ~                #导航到主目录 /home/user1
cd 直接拖文件
#.当前目录 ..父目录； cd XX相对路径，cd /XX绝对路径
pwd                 #当前路径

ls                  #检索
ls -R               #展开子文件夹 加-l列出所有详细信息
ll                  #ls -l命令的一个别名，列出当前目录下文件和目录的详细信息
tree []             #查看树状图 tree /F #windows下查看树状图  
wget [url]          #下载, wget -O myfile.zip [url] 重命名文件
vi []               #命令行进入文件，按i进入插入模式，按Esc返回命令模式并输入:wq 保存退出, :q! 不保存退出
gedit []            #图形界面进入文件直接编辑
whereis []          #查找
ls -l | grep "^-" | wc -l   #统计当前目录下文件的个数（不包括目录）
find -name "*.jpg" | wc -l  #统计当前文件夹下指定类型的文件的数量
du -h --max-depth=1 #查磁盘占用情况
du -sh ./*          #查看当前目录下每个文件和子目录占用的总空间
diskutil list       #显示现有磁盘状况

export 变量名=值     #设置或更新环境变量的值
#配置永久环境变量更方便，sudo gedit /etc/profile，末尾加入如上代码，然后source /etc/profile加载立即生效
echo []             #输出指定的字符串或变量的值,用于调试程序、输出信息
script -f log.txt   #输出terminal内容到文件 exit退出记录，或在指令后加入 > log.txt
bash XX.sh          #运行sh脚本

#tar
tar -czvf XX.tar.gz XX  # 压缩 XX 文件夹为 XX.tar.gz （排除：--exclude=dataset ）
tar -xzvf XX.tar.gz     # 解压 XX.tar.gz （ -C /path ）
tar -tf XX.tar      #查看tar内容
#分包打包和解压
tar -cf - /path/to/source_folder | pigz -p 8 | split -b 50G -d - output.tar.gz.
cat output.tar.gz.* | pigz -d | tar -xf -

#zip
zip -r XX.zip XX XX.txt #压缩XX以及XX.txt（排除：加-x "./XX/X"）
unzip *.zip -d /path    #解压
zip -sf test.zip        #预览压缩包内容

#ubuntu 7z解压
sudo apt-get install p7zip
#解压 -o 是指定解压到的目录，注意-o后没有空格
7z x XX.7z -o/home/xx
#压缩
7z a XX.7z /home/XX/


# 硬盘制作与挂载
df -h #查看所有挂载 
fdisk -l #查看所有硬盘 找到未挂载的 如/dev/nvme4n1
fdisk /dev/nvme4n1
g
n
w
mkfs.ext4 /dev/nvme4n1p1 #格式化
mount /dev/nvme3n1p1 /root/7T_1
mount /dev/nvme4n1p1 /root/7T_2  #挂载

#配置硬盘开机自动挂载的步骤
#1. 获取分区的 UUID
blkid /dev/nvme3n1p1
#2. 编辑 /etc/fstab
vi /etc/fstab
#在文件末尾添加：
UUID=abcd-1234   /root/7T_1   ext4   defaults   0 0
#3. 测试配置是否正确 如果没有报错，说明配置正确。
mount -a
```
## 终端快捷键
Ctrl + R 搜索历史命令 或者使用命令：`history | grep XXX`
Ctrl + S：挂起，类似于暂停
Ctrl + Q：退出挂起
Ctrl + C：中断并杀死，程序终止。
Ctrl + Z：中断程序放到后台，唤醒使用“fg”命令。
Ctrl + Backspace 删除整个单词
多个语句可以通过`;`分割 `&&` 表示上一句返回码0才会执行 `||` 表示上一句返回码非0才会执行 `;` 无论如何都执行

# Ubuntu
```sh
cat /proc/version   #查版本信息
lsb_release -a      #查ubuntu版本
free -m             #查内存使用情况
df -h              #查看磁盘剩余空间
```
截图：1.screen截图应用程序   2.设置-设备-键盘-截图快捷键
## 单系统安装
下载：[Ubuntu中文官网](https://cn.ubuntu.com/download/desktop)
安装：使用[Rufus](https://rufus.ie/zh/)，创建启动盘
...


> Debug
DELL主板，装系统进入时，报错ACPI Error，表示计算机上的ACPI与该版本的ubuntu不兼容。
1.在开机选中ubuntu时按e, 找到Linux...quite splash那一行，末尾加上acpi=off
2.成功开机后，更改grub 修改grub文件：sudo vim /etc/default/grub 把GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"改为GRUB_CMDLINE_LINUX_DEFAULT="quiet splash acpi=off"
3.sudo update-grub
4.发现安装显卡驱动会报错，因为惠普主板的acpi模块和ubuntu兼容不好，需要把acpi=off配置改为noapic

### 显卡驱动
```sh
sudo apt upgrade  # 更新所有可更新的软件包
lspci -k | grep -A 2 -i "VGA" #查显卡型号
ubuntu-drivers devices    # ubuntu检测n卡的可选驱动
sudo apt install nvidia-driver-510  # 根据自己的n卡可选驱动下载显卡驱动
sudo reboot
```
> Debug
执行nvidia-smi报错：Failed to initialize NVML: Driver/library version mismatch
NVML library version: 560.35
是Ubuntu自动更新导致NVIDIA 驱动与 NVML 库版本不匹配所致，重启可解决
最好关闭ubuntu自动更新：
```
echo -e "APT::Periodic::Update-Package-Lists \"0\";\nAPT::Periodic::Download-Upgradeable-Packages \"0\";\nAPT::Periodic::AutocleanInterval \"0\";\nAPT::Periodic::Unattended-Upgrade \"0\";" | sudo tee /etc/apt/apt.conf.d/10periodic
echo -e "APT::Periodic::Update-Package-Lists \"0\";\nAPT::Periodic::Unattended-Upgrade \"0\";" | sudo tee /etc/apt/apt.conf.d/20auto-upgrades
```

N卡多卡训练时会挂死的问题（现象是显存各占一点点，GPU utils占满 max， 训练卡住），临时方法是通过配置export NCCL_P2P_DISABLE=1或backend='gloo'，现在发现可以手动关闭PCI bridge的ACS来解决，因为服务器没有ACS的BIOS配置, 需要把这个脚本配置为开机运行：
```bash
#!/bin/bash
for BDF in `lspci -d "*:*:*" | awk '{print $1}'`; do
  # skip if it doesn't support ACS
  setpci -v -s ${BDF} ECAP_ACS+0x6.w > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    continue
  fi
  setpci -v -s ${BDF} ECAP_ACS+0x6.w=0000
done
```
参考文档：[nvidia-troubleshooting](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/troubleshooting.html#pci-access-control-services-acs)
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


# VScode
vscode远程访问：1.安装remote插件 2.连接服务器``ssh username@server-ip`` 3.connect，打开terminal

上传文件：vscode直接拖拽到目录
下载文件：右键download

vscode插件离线安装：如装python插件，直接进[ marketplace ](https://marketplace.visualstudio.com/vscode)下好拖到扩展位置

**快捷键**
打开vscode左下角键盘快捷键设置，找到copy line down，即可查看当前默认快捷键为`shift + Alt + ↓`，双击快捷键，输入自己想要的快捷组合，如Ctrl+D，然后回车即可设置自己的组合了
在文件夹中，终端输入``code .`` 即可用vscode打开当前文件夹
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
shift + tab         #批量取消缩进
```
网格布局：查看 > 编辑器布局 > 2x2 网格
vscode 文件标签栏多行显示：文件 > 首选项 > 设置 > workbench.editor.wrapTabs
竖向选中：按住 Alt + Shift，然后使用鼠标左键拖动进行选择。

插件：
+ Prettier——自动化代码格式化工具，帮助保持代码的一致性和可读性。
+ GitLens——查看git历史，快速定位代码作者
+ Remote - SSH——远程连接服务器
+ Chinese (Simplified) Language Pack for Visual Studio Code——中文语言包

调试代码是解决问题和优化代码的重要工具：
1. 设置断点：单击行号左侧的空白区域，可以设置或取消断点。
2. 启动调试会话：点击左侧的调试图标（或者使用快捷键F5），选择想要调试的环境（比如Node.js、Python等），然后启动调试会话。
3. Run and Debug - Add configuration - .vscode/launch.json
 
# Git
下载 [Git](https://git-scm.com/downloads)，`sudo apt-get install git`
与 [TortoiseGit](https://tortoisegit.org/download/) 小乌龟配合使用可以少记很多指令，在目标文件夹右键可执行push、clone、commit等操作
## 主要流程
1. ``git clone X`` // 到本地
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
[rebase和merge](https://blog.csdn.net/weixin_42310154/article/details/119004977)

<img src="https://www.ruanyifeng.com/blogimg/asset/2015/bg2015120901.png" width="100%">

## branch 与 tag
```sh
git tag/branch  #查本地仓库所有的tag或branch -r:远程分支 -a:所有分支
git checkout [tag/branch]   #已有仓库切换 tag/branch
git checkout -b [branch]    #新建一个分支，并切换到该分支
git merge [branch]  #合并指定分支到当前分支
git tag [tag]       #新建一个 tag 在当前 commit
git describe --tag  #查当前tag
git show [tag]      #查看tag信息

#tag 对应某次 commit, 是一个点，是不可移动的。用来代替复杂的commit id
#branch 对应一系列 commit，是很多点连成的一根线，有一个HEAD 指针，是可以依靠 HEAD 指针移动的。
#两者的区别决定了使用方式，改动代码用 branch ,不改动只查看用 tag
```
## 常用命令
```sh
git init [project-name] #新建一个目录，将其初始化为Git代码库
git branch -r       #输出你的分支名称
git fetch           #git pull = git fetch + git merge
git submodule sync    #同步子模块
git submodule update  #更新子模块
git submodule update --init --recursive --remote # 初始化所有子模块（递归），并强制更新到远程仓库的最新版本。
git submodule deinit -f . #撤销子模块在本地的初始化状态，然后可以重新update
git config --list   #检查当前配置
git config --global user.name "[name]"    #配置全局信息 无global则是在项目中配置
git config --global user.email "[email address]" 

git log     #显示当前分支的版本历史 commit id
git status          #查看当前状态
git reflog          #查看历史命令
git diff    #显示暂存区和工作区的差异(git diff branch1 branch2)
git reset --hard [commitId]  # 进行回溯

git reset --soft HEAD^  #回退commit
git commit --amend      #重新写commit信息
git branch -d branches  #删除分支
git stash               #备份当前工作区的内容，保存到git栈中，从最近的一次commit中读取相关内容
git stash pop           #恢复工作区的内容(git stash list, git stash apply stash@{1})

# 不要把工具文件上传到公共仓库
# origin：远程

# Merge develop：
git fetch origin
git merge origin/develop
# 手动解决冲突
git add . 
git merge --continue

# git patch 导出最近 N 个 commit（例如最近 5 个）
git format-patch -n 5
git am *.patch
# git bundle
git bundle create xxxx.bundle HEAD~2..HEAD  #最近两次commit
git bundle create xxxx.bundle old_commit..new_commit #包含 old_commit 之后到 new_commit 的提交。
git pull ../xxxx.bundle HEAD
```
## 公钥和私钥
```sh
# 按提示选择密钥存储路径（默认是 ~/.ssh/id_rsa），并设置密码短语（可选）。
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 将公钥添加到远程服务器，如果 ssh-copy-id 不可用，可以手动将公钥内容（~/.ssh/id_rsa.pub）复制到远程服务器的 ~/.ssh/authorized_keys 文件中
ssh-copy-id user@remote_host
# 密钥权限设置，确保私钥文件权限为600，公钥文件权限为644
chmod 600 /home/jthaler/.ssh/id_rsa
chmod 644 /home/jthaler/.ssh/id_rsa.pub
```
通过SSH隧道实现本地端口到远程服务器端口的转发:
`ssh -L PORT:localhost:PORT awang13@10.168.60.59`
相当于在本地和远程服务器之间建立了一条加密的“管道”，把本地的请求“传送”到远程服务器的目标服务，实现安全的远程访问。
## Debug
### ping不通
如果发现github ping不通，但网站可以正常访问，则需要配置host:
1. 在 https://www.ipaddress.com/ 查询 `github.com`与`github.global.ssl.fastly.net`的IP
2. 打开hosts文件:`C:\Windows\System32\drivers\etc`
3. 配置Host,在文件最后加入查到的IP, 如：
   ```sh
    #github地址
    140.82.114.4 github.com
    151.101.1.194 github.global.ssl.fastly.net
   ```
### 全部显示changes
git仓全部显示changes修改问题，需要git windows 和linux 统一换行符和权限，
```sh
git config core.fileMode false
git submodule foreach 'git config core.fileMode false' #对所有子仓进行操作
git config --global core.autocrlf false
#或者修正用户名

# 文件级修复
# 1. 将 Windows 换行符转换为 Linux 换行符 (如果没有安装 dos2unix，可以通过 apt/yum 安装)
dos2unix XXX.sh
# 2. 将文件中所有不间断空格替换为标准空格
sed -i 's/\xc2\xa0/ /g' XXX.sh
```
### git clone频繁失败
git clone频繁失败：配置Git专用代理
如果上网工具有提供HTTP代理端口（例如Clash 127.0.0.1:7890），可以为Git单独设置代理，这样就不需要开启全局代理了。在命令行中输入以下命令：
```sh
# 将 "http://127.0.0.1:7890" 替换成你自己的代理地址和端口
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

# Docker
`Docker`是一种开源的容器化平台，可以帮助开发者更高效地打包、部署和运行应用程序。它基于 `Linux` 容器（LXC）技术，通过将应用程序及其所有依赖项打包到一个容器中，从而消除了应用程序在不同环境之间迁移所面临的问题。使用Docker，开发者可以快速构建、测试和部署应用程序，减少了与操作系统和基础设施相关的问题，从而提高了开发、测试和发布的速度。

[🐳Docker概念，工作流和实践](https://www.bilibili.com/video/BV1MR4y1Q738/)
<img src="https://raw.github.com/Arrowes/Blog/main/images/Linux1.png" width="80%">
<img src="https://raw.github.com/Arrowes/Blog/main/images/Linux2.png" width="80%">

1. 容器（Container）
容器是一种轻量级、可移植的、独立的环境，它包含应用程序及其所有依赖项。与传统的虚拟机不同，容器共享主机操作系统的内核，但具有隔离的用户空间。
2. 镜像（Image）
镜像是一个只读的模板，用于创建容器。镜像包含了应用程序运行所需的一切，比如代码、运行时、库和环境变量等。镜像可以通过 Dockerfile 定义并构建。
3. 仓库（Registry）
Docker 镜像存储在仓库中。Docker Hub 是一个公共的 Docker 镜像仓库，用户可以从中下载和上传镜像。你也可以设置私有仓库来存储公司内部的镜像。
4. Docker 引擎（Docker Engine），Docker 引擎是一个客户端-服务器应用程序，包含以下主要组件：
    1. 服务器：一种长期运行的守护进程（dockerd），负责管理容器。
    2. REST API：用于与守护进程进行交互的接口。
    3. 客户端（Client）：用户与 Docker 进行交互的命令行工具（docker）
5. Dockerfile
Dockerfile 是一个文本文件，包含了一系列指令，用于构建 Docker 镜像。每一条指令都在镜像中创建一个新的层次。例如，FROM 指令指定了基础镜像，COPY 指令将文件复制到镜像中，RUN 指令执行命令。


[Ubuntu 22.04下Docker安装（最全指引）](https://blog.csdn.net/u011278722/article/details/137673353)

```bash
# Container
docker ps       # 查看运行中的容器列表  
docker ps -a    # 查看所有容器（包括已停止的）  
docker start container_name_or_id     # 启动容器  
docker stop container_name_or_id      # 停止容器  
docker restart container_name_or_id   # 重启容器  
docker logs container_name_or_id      # 查看容器日志  
docker exec -it container_name_or_id /bin/bash    # 进入容器交互式命令行  
docker rm container_name_or_id    # 删除容器
docker run options image_name    # 运行一个容器  --shm-size=8g[分配共享内存,默认64MB] [df -h] 查看共享内存
# 示例：后台运行 Nginx 容器，将主机的8080端口映射到容器的80端口  
docker run -d -p 8080:80 nginx  
docker run --restart always --gpus all --shm-size=32g -it -w /root/ -p 2003:22 -p 2026:2026 -v /mnt:/mnt -v /root:/root --name container_name image:name

service ssh restart #重启整个docker服务

# Image
docker images    # 查看本地镜像  
docker pull image_name    # 从远程仓库拉取镜像  
docker rmi image_name_or_id    # 删除镜像  
docker build -t image_name path_to_dockerfile    # 构建镜像  
docker history image_name    # 查看镜像历史  

docker info    # 查看 Docker 的系统信息  
docker --version    # 查看 Docker 版本  
docker top container_name_or_id    # 查看容器的进程  
docker diff container_name_or_id    # 查看容器的文件系统改动 

# Docker用户组
sudo groupadd docker            # 1. 创建docker用户组
sudo usermod -aG docker ${USER} # 2. 添加当前用户加入docker用户组
sudo systemctl restart docker   # 3. 重启docker服务
sudo newgrp docker              # 4. 生效配置
docker info                     # 5. 验证 Docker 组成员身份

#打包镜像
docker images
docker save -o output-file.tar image-name:tag
#打包容器
docker ps -a
docker commit container-id new-image-name
docker save -o output-file.tar new-image-name
# 使用
docker load -i output-file.tar
docker run -d --name new_container new-image-name
docker run --restart always --gpus all --shm-size=128g -it --ulimit nofile=40960 -w /mnt -p 2006:22 -p 2026:2026 -v /root:/root -v /mnt:/mnt -v /home:/home -e TZ=Asia/Shanghai --name XXXX2026 imagename
```

## Docker Compose
docker compose 是 Docker 的内置命令，随着 Docker 的安装自动安装, 与 Docker CLI 集成更紧密。是对 docker-compose 的进化和集成
```bash
#确保已经安装了 Docker 和 Docker Compose：
docker --version
docker-compose --version
#在终端中进入到存放 docker-compose.yml 文件的目录，运行以下命令来启动服务：
docker-compose up
#该命令会自动根据配置文件中的内容拉取所需的镜像（如果本地没有缓存），并启动配置的服务。
#如果你需要以后台模式启动（不占用当前终端窗口），可以加上 -d 参数

docker-compose ps       #查看正在运行的容器状态
docker-compose down     #停止所有正在运行的容器，加上 -v 同时删除持久化卷中的数据
docker-compose logs     #查看容器的输出日志
docker-compose exec 服务名称 bash #进入容器
docker-compose build    #重建镜像
```

## Docker Registry
```sh
#在训练服务器上启动 Docker Registry 服务容器：
docker run -d -p 5000:5000 --name registry --restart always registry:latest

#编辑 Docker 的配置文件，允许使用不安全的 registry：打开/创建 /etc/docker/daemon.json 文件，加入：
{
  "insecure-registries": ["wuh7-sdc003:5000"]
}
#重新启动 Docker 服务：
sudo systemctl restart docker
#关闭防火墙，防火墙可能导致push失败：
sudo systomctl stop firewalld
#可以通过访问 http://ipxxxx:5000/v2/_catalog 查看镜像列表

# Build image:
docker build -t ipxxxx:5000/Imagename:1.0.0  -f docker/Dockerfile .

#为现有镜像赋个别名，可以方便管理镜像，尤其是在推送到远程仓库时
docker tag ipxxxx:5000/Imagename:1.0.0 ipxxxx2:5000/Imagename:1.0.0
#Docker 会根据推送的镜像名称来确定推送的目标 IP 地址和端口号，格式为：registry/repository:tag：
docker push ipxxxx:5000/Imagename:1.0.0

#手动run image:
docker run -v /mnt/:/mnt/ -w /workspath --rm ipxxxx:5000/Imagename:1.0.0 python xxx.py
```

vscode使用docker
1. 下载docker插件，Dev Containers插件
2. 连接到 Docker 容器：点击左下角的绿色按钮，选择 "Attach to Running Container"。
3. 连接后，VSCode将打开一个新的窗口，该窗口中包含了Docker容器的文件系统。在VSCode的资源管理器中，可以直接操作和管理容器中的文件。

> Debug
1.VSCode连接docker失败 Failed to connect. Is docker running?:
sudo chmod 777 /var/run/docker.sock
2.could not select device driver "" with capabilities: [[gpu]] ，是NVIDIA Docker 组件未安装：
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker