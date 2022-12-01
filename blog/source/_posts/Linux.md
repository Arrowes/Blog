---
title: Linux：Ubuntu，Docker
date: 2022-11-28 10:32:42
tags:
- 学习
- Linux
---
## Ubuntu
Virtual Box+Ubuntu 20.04
64bit:Bios enable intel virsualization
Host 键:右ctrl
换源：华为云，更新索引
### 指令
``Ctrl+alt+T``	Terminal
``sudo nautilu``	执行文件操作
``ls``	检索
``chmod u+x …``		添加可执行文件
``sudo apt update``	更新索引
``sudo passwd root；su``	权限
### Debug
Could not get lock /var/lib/dpkg/lock – open > 执行 ``sudo rm -rf /var/lib/dpkg/lock``
共享文件夹ubuntu中不显示>重新安装VMware tools
 

## Docker
### 配置
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

### 文件拷贝
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