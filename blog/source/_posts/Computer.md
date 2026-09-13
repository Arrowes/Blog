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
wget https://raw.githubusercontent.com/Z-Siqi/Clash-for-Windows_Chinese/main/image/image_clash.png    # 下载clash icon做为桌面图标
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

sunshine如果启动后打不开https://localhost:47990，需要在安装目录以管理员方式运行
如果忘记账号密码，在安装目录运行：`.\sunshine.exe --creds admin admin`，重设账号密码

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

# Redmi K30 Ultra 闲置手机服务器

> 记录时间：2026-09-14。设备为 Redmi K30 至尊纪念版（`cezanne`），Android 12，局域网地址暂为 `192.168.15.153`。地址可能随 DHCP 变化，长期使用应在路由器中为手机设置静态租约。

## 当前方案

保留原厂 Android，通过 Termux 运行服务，不需要 Root，也不需要安装完整 Ubuntu：

```text
Redmi K30 Ultra
├── OpenSSH             8022  SSH 远程管理
├── ttyd + tmux         7681  浏览器终端
├── copyparty           3923  全部内部存储文件管理
├── aria2 RPC           6800  下载后端
│   └── AriaNg          6880  下载管理网页
└── Termux:API                电池、通知、相机、传感器等 Android API
```

| 服务 | 局域网入口 | 用途 |
|---|---|---|
| SSH | `ssh -p 8022 u0_a363@192.168.15.153` | 主要远程管理入口，推荐使用密钥登录 |
| ttyd | `http://192.168.15.153:7681` | 在浏览器中打开 Termux Shell |
| copyparty | `http://192.168.15.153:3923` | 管理 `/storage/emulated/0`，包括相册、下载、音乐等全部共享内部存储 |
| AriaNg | `http://192.168.15.153:6880` | 添加和管理 HTTP、BT、磁力链接任务 |
| aria2 JSON-RPC | `http://192.168.15.153:6800/jsonrpc` | 供 AriaNg 或其他程序控制 aria2，不直接在浏览器中使用 |

当前已验证 SSH、copyparty、AriaNg、ttyd 和 aria2 RPC 均能访问。ttyd 未登录时返回 HTTP `401` 是正常的鉴权行为。

这套方案适合低功耗常驻服务，也能利用手机自带的电池、屏幕、摄像头、GPS 和传感器；但 Android/Termux 不是完整 Linux，不能直接提供 Docker、内核模块和常规 `systemd`。无 Root 的 Termux 也不能绑定 DNS 的 53 端口。

## 准备 Android 应用

从同一来源安装以下应用，推荐统一使用 [F-Droid](https://f-droid.org/packages/com.termux/) 版本，避免签名不一致：

- Termux：Linux 命令行环境。
- Termux:Boot：重启后执行 `~/.termux/boot/` 中的脚本。
- [Termux:API](https://f-droid.org/packages/com.termux.api/)：把 Android 功能暴露给 Termux 命令。

安装 Termux:Boot 后至少手动打开一次，并在 MIUI 中允许自启动、后台运行，将省电策略设为“不限制”。先给 Termux 授予内部存储权限：

```bash
termux-setup-storage
```

## 安装基础组件

```bash
pkg update && pkg upgrade -y
pkg install openssh python aria2 ttyd tmux unzip curl btop termux-api -y

mkdir -p ~/server/logs ~/server/ariang
mkdir -p ~/.aria2 ~/.config/copyparty ~/.termux/boot
mkdir -p ~/storage/shared/Download/aria2
touch ~/.aria2/aria2.session
```

### SSH

```bash
sshd
whoami
```

Termux 的 SSH 默认端口为 `8022`。密码登录可用 `passwd` 设置密码，但长期使用更推荐把电脑的 SSH 公钥写入：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

这里只能放公钥；私钥必须留在电脑上，不能上传到手机或博客。

### copyparty 文件服务器

当前使用 copyparty 的单文件 SFX 版本：

```bash
curl -fL https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py \
  -o ~/server/copyparty-sfx.py
python ~/server/copyparty-sfx.py --version
```

创建 `~/.config/copyparty/copyparty.conf`：

```ini
[global]
  p: 3923
  usernames

[accounts]
  arrow: CHANGE_ME_FILE_PASSWORD

[/]
  /storage/emulated/0
  accs:
    A: arrow
```

根卷 `/` 映射到 `/storage/emulated/0`，所以登录后能管理全部共享内部存储。`A` 是完整管理权限，包含读取、上传、移动和删除；重要照片仍应另做备份。

手动测试：

```bash
python ~/server/copyparty-sfx.py -c ~/.config/copyparty/copyparty.conf
```

浏览器打开 `http://192.168.15.153:3923`，使用账户 `arrow` 和配置文件中的密码登录。

### aria2 下载器

创建 `~/.aria2/aria2.conf`：

```ini
dir=/storage/emulated/0/Download/aria2
continue=true
max-concurrent-downloads=3
split=8
max-connection-per-server=8
min-split-size=5M
file-allocation=none

enable-rpc=true
rpc-listen-all=true
rpc-listen-port=6800
rpc-allow-origin-all=true
rpc-secret=CHANGE_ME_RPC_SECRET

input-file=/data/data/com.termux/files/home/.aria2/aria2.session
save-session=/data/data/com.termux/files/home/.aria2/aria2.session
save-session-interval=60
```

`rpc-secret` 应使用随机长密码，不能省略。手动启动并检查：

```bash
aria2c --conf-path="$HOME/.aria2/aria2.conf" -D
pgrep -a aria2c
```

BT 没速度不一定是配置故障，常见原因是资源无做种者、DHT 尚未找到节点或运营商网络限制。可使用 Ubuntu 官网提供的合法 `.torrent` 验证 BT 链路；本机已经通过 Ubuntu 官方镜像测试，能够取得元数据、连接做种者并下载。

当前配置还加入了 [ngosang/trackerslist](https://github.com/ngosang/trackerslist) 的公共 Tracker。需要刷新时：

```bash
trackers=$(curl -fsSL https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt \
  | sed '/^$/d' | paste -sd, -)
sed -i '/^bt-tracker=/d' ~/.aria2/aria2.conf
printf 'bt-tracker=%s\n' "$trackers" >> ~/.aria2/aria2.conf
pkill aria2c
aria2c --conf-path="$HOME/.aria2/aria2.conf" -D
```

公共 Tracker 只能帮助发现 Peer，不能让本来无人做种的资源凭空产生速度。

### AriaNg 下载管理网页

从 [AriaNg Releases](https://github.com/mayswind/AriaNg/releases) 下载 `AllInOne.zip`，解压到固定目录：

```bash
unzip -o ~/storage/shared/Download/AriaNg-*-AllInOne.zip -d ~/server/ariang
python -m http.server 6880 --bind 0.0.0.0 --directory ~/server/ariang
```

浏览器打开 `http://192.168.15.153:6880`，在“AriaNg 设置 → RPC”中填写：

```text
协议：HTTP
地址：192.168.15.153
端口：6800
接口：jsonrpc
RPC Secret：与 aria2.conf 中一致
```

显示“已连接”后，下载链路为：

```text
浏览器 AriaNg → aria2 RPC → 手机后台下载 → /storage/emulated/0/Download/aria2
```

### ttyd 网页终端

```bash
ttyd -W -p 7681 -c "arrow:CHANGE_ME_WEB_PASSWORD" \
  tmux new-session -A -s web
```

`-W` 允许在网页终端中输入命令。网页终端具有接近 SSH 的高权限，只能在可信局域网或 Tailscale 中使用，不能直接做公网端口映射。

### Termux:API

Termux:API 由 Android 插件和 Termux 命令包两部分组成，两者都必须安装。若通过 Termux 打开 APK 时出现 `TermuxContentProvider requires allow-external-apps...`，编辑 `~/.termux/termux.properties`：

```properties
allow-external-apps = true
```

然后执行：

```bash
termux-reload-settings
termux-api-start
termux-battery-status
```

确认安装结束且不需要外部应用调用 Termux 后，可以把 `allow-external-apps` 改回 `false`，缩小攻击面。调用相机、定位、通知或短信时，还要在 Android 设置中授予对应权限。

常用玩法：

```bash
termux-battery-status
termux-notification --title "服务器" --content "服务运行正常"
termux-tts-speak "下载已经完成"
termux-camera-photo -c 0 ~/storage/shared/DCIM/server-test.jpg
termux-sensor -s accelerometer -n 5
termux-torch on
termux-torch off
```

它适合实现电池温度报警、下载完成通知、定时拍照、GPS/传感器记录和语音播报。无 Root 时只能监测电池并报警，不能真正切断充电。

## 开机自启

创建 `~/.termux/boot/start-server`：

```bash
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock >/dev/null 2>&1 || true
termux-api-start >/dev/null 2>&1 || true
sshd
sleep 2

mkdir -p "$HOME/server/logs" "$HOME/storage/shared/Download/aria2"
touch "$HOME/.aria2/aria2.session"

if ! pgrep -x aria2c >/dev/null; then
  aria2c --conf-path="$HOME/.aria2/aria2.conf" -D
fi

if ! pgrep -f '[c]opyparty-sfx.py' >/dev/null; then
  nohup python "$HOME/server/copyparty-sfx.py" \
    -c "$HOME/.config/copyparty/copyparty.conf" \
    </dev/null >"$HOME/server/logs/copyparty.log" 2>&1 &
fi

if ! pgrep -f '[t]tyd.*7681' >/dev/null; then
  nohup ttyd -W -p 7681 -c "arrow:CHANGE_ME_WEB_PASSWORD" \
    tmux new-session -A -s web \
    </dev/null >"$HOME/server/logs/ttyd.log" 2>&1 &
fi

if ! pgrep -f '[h]ttp.server 6880' >/dev/null; then
  nohup python -m http.server 6880 --bind 0.0.0.0 \
    --directory "$HOME/server/ariang" \
    </dev/null >"$HOME/server/logs/ariang.log" 2>&1 &
fi
```

启用并立即测试：

```bash
chmod 700 ~/.termux/boot/start-server
~/.termux/boot/start-server

pgrep -a aria2c
pgrep -af copyparty
pgrep -af ttyd
pgrep -af 'http.server 6880'
termux-battery-status
```

重启手机后通常需要先解锁一次屏幕，Android 才会允许访问加密存储。

## 运维与安全

```bash
# 查看资源
btop
df -h /storage/emulated/0

# 查看日志
tail -f ~/server/logs/copyparty.log
tail -f ~/server/logs/ttyd.log
tail -f ~/server/logs/ariang.log

# 检查监听端口
ss -lntup
```

安全注意事项：

1. 不要把 `3923`、`6800`、`6880`、`7681`、`8022` 直接映射到公网，远程访问优先使用 Tailscale。
2. copyparty 账户密码、ttyd 密码和 aria2 RPC Secret 必须各自使用随机长密码，不能写入公开博客。
3. `rpc-listen-all=true` 和 `rpc-allow-origin-all=true` 方便局域网管理，但必须配合 RPC Secret。
4. copyparty 当前能删除整个内部存储中的文件，重要资料需要保留第二份副本。
5. MIUI 系统升级、清理后台或更换 Wi-Fi 后，重新检查自启动、IP 地址和存储权限。

修改配置后，备份到内部存储：

```bash
tar -czf ~/storage/shared/Download/k30-server-config-$(date +%F).tar.gz \
  ~/.aria2 ~/.config/copyparty ~/.termux/boot ~/server/logs
```

生成后还要把压缩包复制到电脑或其他设备；解锁 Bootloader 会连内部存储一起清空。不要把包含真实密码的配置备份上传到公开仓库。

## 还能扩展的服务

无需 Root 可以继续增加：

- Tailscale：在外网安全访问 SSH、文件和下载管理页面。
- Syncthing：电脑、笔记本和手机之间自动同步目录。
- FastAPI/Flask/Node.js：部署个人网页、Webhook 和轻量 API。
- Git：建立裸仓库，作为局域网私人 Remote。
- MQTT：作为 Home Assistant 的传感器或自动化节点。
- 摄像头与 Termux:API：定时拍照、延时摄影、宠物监控和简单视觉推理。
- 下载完成钩子：通知、震动、媒体扫描或自动归档。

需要 Root 的功能：

- ACC 充电保护：按电量或温度真正暂停/恢复充电。
- AdGuard Home 标准 DNS：监听局域网 DNS 使用的 53 端口。
- chroot、底层网络规则和更深层的系统控制。

Redmi K30 Ultra 成功解锁 Bootloader 会清除全部用户数据，包括 Termux 环境和内部存储。只为当前文件/下载服务器没有必要 Root；确实需要 ACC 或标准 53 端口 DNS 时，应先完成整机和 Termux 配置备份，再解锁和安装 Magisk。

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

<img alt="picture 1" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/Computer-r720.jpg" />  
<img alt="picture 2" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/Computer-r7202.jpg" />  

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
我的配置：<img alt="图 0" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/Computer_VoiceMeeter.png" width="80%"/>  
配置延迟：Menu > System Settings > OUT A1(音箱)=80ms, OUT A2(Y27q-30)=100ms

# 语音唤醒小爱同学
实现任何电脑语音唤醒小爱同学PC版，参考[【小爱同学】任何电脑语音唤醒小爱同学PC版 彻底无需点击 解放双手！](https://www.bilibili.com/video/BV1uj411e7dT/?share_source=copy_web&vd_source=b148fb6f311bfe6f3870ad8f4dfda92a)
1. 源码: https://github.com/chhc007/OneClickXiaoai/releases
2. 配置语音唤醒key: https://console.picovoice.ai/
