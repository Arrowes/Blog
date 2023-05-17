---
title: Linux：Ubuntu，Docker
date: 2022-11-28 10:32:42
tags:
- Linux
---
# Ubuntu
Virtual Box+Ubuntu 20.04
64bit:Bios enable intel virsualization
Host 键:右ctrl
换源：华为云，更新索引
``Ctrl+alt+T``	Terminal
``Ctrl+h``	显示隐藏文件   
方向键上：可以获取上次的命令
Tab：自动补全
## Code
```sh
#系统
lsb_release -a  #查ubuntu版本    
sudo passwd root；su	#权限
ps aux; kill [PID]  #查看进程; 根据进程号杀后台
sudo apt update	#更新索引

#文件
mkdir []   #新建文件夹  
rmdir [] #删除文件夹    
touch [] [] #创建文件
rm []   #删除文件
mv [file] [dir] #移动文件
sudo nautilu	#执行文件操作    
chmod u+x [] #添加可执行文件

#cd
cd - #切换到上一工作目录
cd ~ #导航到家目录
#.当前目录 ..父目录 cd XX相对路径，cd /XX绝对路径

ls	#检索
wget [url]  #下载
tar -xf []  #解压
vi []   #进入文件，编辑完按Esc返回命令模式，输入：x 退出
```
## VScode
vscode远程访问：1.安装remote插件 2.连接服务器``ssh ywang85@she1-w50502`` 3.connect，打开terminal
上传文件：vscode直接拖拽到目录

## Debug
Could not get lock /var/lib/dpkg/lock – open > 执行 ``sudo rm -rf /var/lib/dpkg/lock``
共享文件夹ubuntu中不显示>重新安装VMware tools
 

# Docker
`Docker`是一种开源的容器化平台，可以帮助开发者更高效地打包、部署和运行应用程序。它基于 `Linux` 容器（LXC）技术，通过将应用程序及其所有依赖项打包到一个容器中，从而消除了应用程序在不同环境之间迁移所面临的问题。使用Docker，开发者可以快速构建、测试和部署应用程序，减少了与操作系统和基础设施相关的问题，从而提高了开发、测试和发布的速度。

[🐳Docker概念，工作流和实践](https://www.bilibili.com/video/BV1MR4y1Q738/)
![图 1](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Linux1.png)  
![图 2](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Linux2.png)  

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