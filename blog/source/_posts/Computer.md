---
title: Computer：电脑及服务器折腾记录
date: 2023-11-09 11:36:00
tags:
- 技术
---
PC折腾及服务器相关搭建记录
<!--more-->
# 网络
## X-WRT 路由器配置
小米R3G路由器 刷了不死和X-WRT的固件

### USB接随身Wifi
http://192.168.15.1/ 进入后台
网络 > 接口 > 添加新接口 > 名称：随便填 > 协议：DHCP客户端 > 设备：以太网适配器：“eth2”
防火墙设备 > WAN > 保存
### IPv6加载问题
路由器的接口配置中，发现如果打开了WAN6,也就是IPV6, 使用时部分图片加载不出来，部分网页卡顿，可以直接**停止WAN6口**，对网速基本没有影响，除非有NAS,内网穿透等特殊需求，也可以尝试三种方法：
+ 用光猫拨号（宽带安装员默认采用），路由器连接光猫，路由器的IPV6应该选择“桥接”
+ 光猫设置为桥接，路由器连接光猫，用路由器拨号，路由器的IPV6应该选择“宽带拨号上网”，并勾选“复用IPv4拨号链路”
+ 网络 > 接口 > LAN > 编辑 > DCHP服务器 > IPv6配置 > 三个服务都改成中继模式
网络 > 接口 > WAN > 编辑 > DCHP服务器 > IPv6配置 > 指定的主接口:勾选 > 三个服务都改成中继模式
网络 > 防火墙 > 全部选接受
然后无线设备也可以使用ipv6了

对于中国电信智能网关，光猫的管理页面有两个地址都是192.168.1.1，但是端口不同，一个是80端口的，不能使用高级设置,另外一个地址的端口是8080端口的，即地址为192.168.1.1:8080，也可以直接点登录页面的快速装维入口
[ipv6诸多问题&解决办法](https://post.smzdm.com/p/apvnl2r0/)


## 学术加速
### Windows
1. 找一个合适的梯子，建议直接买付费的，稳定快速，推荐 [SpaPort](https://front.spaport.cc/#/dashboard)或[yctf](https://tf233.top/#/home), 购买后会得到一个订阅地址，类似于`https://.../.../.ini`，之后把这个地址填进软件，即可成功挂上梯子
2. 下载软件：[Clash.for.Windows](https://github.com/Z-Siqi/Clash-for-Windows_Chinese/releases/download/CFW-V0.20.39_CN/Clash.for.Windows-0.20.39-win.7z)，解压后双击`Clash for Windows.exe`打开软件 (备用下载链接：[Clash](https://www.123pan.com/s/goS7Vv-fWSbd.html)，解压密码12345)
3. 点击左侧的 `配置`，在顶部的输入栏中粘贴你复制的Clash订阅地址后点击 `下载`, 显示绿色的成功之后，点击你刚导入的配置（名字一般是梯子的名称，如SpaPort）
4. 点击左侧的`代理`，点击上方的`Rule`，一般选择`手动选择`内的节点即可，不同的节点名称代表不同地区的服务器，可以点右上方的WiFi图标进行测速，哪个延迟低选哪个节点（用ChatGPT不能选香港），超时就是那个节点挂了，节点随时有失效可能，注意切换
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
# 输入下面的内容(注意用户名和路径)
[Desktop Entry]
 Name=clash
 Comment=Clash
 Exec=/home/arrow/clash/cfw
 Icon=/home/arrow/clash/image_clash.png
 Type=Application
 Categories=Development;
 StartupNotify=true
 NoDisplay=false

sudo mv clash.desktop /usr/share/applications/
```
最终就能实现通过图标打开

## 远程串流
使用Sunshine + Moonlight 来实现毫秒级延迟的远程串流
PC端安装[Sunshine](https://github.com/LizardByte/Sunshine/releases)
远控端安装[MoonLight](https://github.com/moonlight-stream/moonlight-android/releases) (安卓)
然后连接同一个网络即可

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

vscode安装插件：Remote - SSH
登录ubuntu用户：ssh username@10.99.1.55

>例如主用户XXX：
ssh XXX@10.99.1.55
密码：XXX204

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

[珂芝863(K75)说明书中文-更新7-28 (kzzi.com)](http://www.kzzi.com/media/files/20220825/20220825161014_9187.pdf)

# 电脑小技巧
+ win10定时任务
win+r打开运行框，输入`taskschd.msc`,回车进入任务计划程序
例如打开特定的网页：
程序/脚本：`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
添加参数（可选）：`https://live.douyin.com/473159801229?camera_id=0`

+ 开机启动
win+r 输入`shell:startup`
例如开机即打开校园网：右键空白处——新建快捷方式，输入`http://login.hnust.cn/`,命名随意

+ Microsoft-Activation-Scripts激活
`irm https://get.activated.win | iex`

+ windows 步骤记录器
Win + R > PSR，打开步骤记录器页面。
点击【开始记录】按钮，录制步骤



# Debug
> 桌面闪烁，底部任务栏跟着刷新，造成的因素有许多可能，硬件显卡驱动的问题，以及刷新率,explorer资源管理器,注册列表问题,病毒问题
初步测试：win+R一直在闪烁，输入一个字母，然后又不能输入了，需要重新在下次刷新前点击，抢在刷新前，点击接着输入。意味着只要点的快，还是可以打开点东西的。Ctrl键+Alt键+Delete键，可以进入管控，打开任务资源管理器，重启explorer资源管理器，毫无效果。
打开任务资源管理器 > 运行新任务 > 输入`cmd` > `sfc /scannow`（扫描修复系统文件）解决


# Windows使用VoiceMeeter实现音频多路输出
如果有多组音箱，可以用VoiceMeeter的虚拟输出实现多声道输出
下载：[Voicemeeter-banana](https://vb-audio.com/Voicemeeter/banana.htm)
参考视频：[VoiceMeeter组多设备详细教程](https://www.bilibili.com/video/BV1Hj421d7j3/?p=1)
我的配置：<img alt="图 0" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Computer_VoiceMeeter.png" width="80%"/>  
