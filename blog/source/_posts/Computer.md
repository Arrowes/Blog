---
title: Computer：电脑及服务器折腾记录
date: 2023-06-09 11:36:00
tags:
- 技术
---
PC折腾及服务器相关搭建记录
<!--more-->

# 实验室服务器配置
```sh
型号: DELL R730XD 12盘3.5寸
处理器: E5-2683V4*2 2.1G主频 32核心/64线程
内存: 96G内存（16G*6）
硬盘: 3T SAS*4
阵列卡: H730卡
电源: 750W*1
```
<img alt="picture 0" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Computer-r730xd.jpg" />  

## 配置SSH
```sh
#更新软件
sudo apt update && sudo apt upgrade
#安装openssh-server
sudo apt install openssh-server
#check，其中 active(running) 是高亮的，则成功，若未运行：sudo systemctl enable --now ssh
service ssh status
#允许 SSH 通过防火墙
sudo ufw allow ssh
#查ip，10.99.1.55
ip a
```

## 使用SSH远程访问服务器
vscode安装插件：Remote - SSH
登录ubuntu用户：ssh username@10.99.1.55

>例如主用户lsg：
ssh lsg@10.99.1.55
密码：lsg204

# 拯救者R720-15IKBN
```sh
制造商: LENOVO 
设备型号: Lenovo R720-15IKBN
设备代号: 80WW
序列号: PF0S8CHZ
BIOS版本: 4KCN45WW
```
高中毕业17年暑假购入的拯救者R720-15IKBN，21年加过一条和原装同款的8G内存条组成双通道（155），网卡换成了Intel AX200（108），22年把原装的128g固态换成了闪迪的1T（619，现在价格都降一半了），硅脂换了2-3次，研一拿来跑深度学习，现在还用c口转dp连着一台2k144显示器，属实难为这个1050ti了；现在外壳都好几处开裂，屏幕好几条黑线，但是嫌换屏幕麻烦且贵，凑合着再用最后一年陪我写完毕业论文吧.

工具：
[拯救者工具箱 Lenovo Legion Toolkit](https://pan.leekarl.com/LLT)
[拯救者R720如何恢复原厂系统](https://www.bilibili.com/read/cv17598773/?spm_id_from=333.999.collection.opus.click)

<img alt="picture 1" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Computer-r720.jpg" />  
<img alt="picture 2" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Computer-r7202.jpg" />  

