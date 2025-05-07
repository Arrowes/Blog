---
title: AI：Deepseek,DeepLive,sd,chat-on-wechat
date: 2025-02-07 23:36:00
tags:
- AI
- 深度学习
---
AI相关折腾记录: LLM-Deepseek,chat-on-wechat, AI绘画-StableDiffusion, 音视频-DeepLive,F5-TTS
<!--more-->

# LLM
## Deepseek
[DeepSeek：从入门到精通](https://www.kdocs.cn/l/caFUbVZSt40Q?f=201&share_style=h5_card)

### 使用 ollama + Deepseek 本地部署
1. 下载并安装ollama： https://ollama.com/download （关闭开机自启动：C:\Users\Arrow\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup 删除快捷方式）
2. 修改模型下载路径，避免占C盘：设置>系统>系统信息>高级系统设置>环境变量>在系统变量中新建：OLLAMA_MODELS D:\XXX\models 重启电脑（默认在C:\Users\XX\.Ollama\models）（顺便加一下OLLAMA_HOST 0.0.0.0）
3. 搜索模型：https://ollama.com/search （注意显存要求，我使用的笔记本端4060 8G大概能跑7-14B，其中名字带uncensored或abliterated是未限制版本的, Q是量化精度，最低q4, 影响不大，优先考虑B）
4. 下载：`ollama run deepseek-r1:14b` `ollama run huihui_ai/deepseek-r1-abliterated:14b`
https://ollama.com/huihui_ai/deepseek-r1-abliterated
如果速度很慢，是未走VPN,需要开全局模式， 
---
或者改用**Hugging Face**：https://huggingface.co/models?p=1&sort=trending&search=deepseek ，需要下载GGUF版本才能在ollama中导入

>GGUF格式是GPT-Generated Unified Format，由Georgi Gerganov定义发布的一种大模型文件格式。GGUF是GGML的继任者，旨在克服GGML的限制，提升用户体验，可扩展性和稳定性。它设计用于快速加载和保存模型，支持各种模型，并允许添加新功能同时保持兼容性。GGUF文件格式专为存储推断模型而设计，特别适用于语言模型如GPT。

下载： [mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF](https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF)

导入：模型文件放到models文件夹，在该文件夹下新建一个文件，可命名为deepseek14B.mf，用文本编辑器编辑文件，写入内容：
```sh
FROM ./DeepSeek-R1-Distill-Qwen-14B-Uncensored.Q4_K_M.gguf
# 下面可以忽略 最新的ollama会自动分配最佳参数
PARAMETER num_gpu 8
PARAMETER num_ctx 2048
PARAMETER temperature 0.6
TEMPLATE "<｜User｜>{{ .Prompt }}<｜Assistant｜>"
```
num_gpu：加载至 GPU 的模型层数。会影响显存占用，也可以直接配置：/set parameter num_gpu 5
num_ctx：上下文窗口的大小（默认值为 2048），建议从较小值开始逐步增加，直至触发内存不足的错误。
```sh
cd D:\XXX\models
ollama create deepseek:14B-Uncensored.Q4_K_M -f deepseek14B.mf
ollama run deepseek:14B-Uncensored.Q4_K_M --verbose

ollama rm deepseek:14B  # 卸载模型（还需要到文件路径下删除模型文件）
ollama list
ollama ps
```
ollama: http://192.168.15.195:11434/

---

`deepseek-r1:14b`： 10.08 tokens/s, 用到了8G显存+4G共享GPU内存，尝试了三种14B：
   + `ollama run deepseek-r1:14b`，最聪明也最常用，
   + `huihui_ai/deepseek-r1-abliterated:14b`，有一定程度的破限，但很有限，舍弃
   + Hugging Face的`mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF`，Uncensored破限程度更高，且可以通过.mf进行个性化配置，优于abliterated

`deepseek-r1:32b`：3.04 tokens/s, 8G显存+16G共享GPU内存基本全部吃满，风扇转的飞起，确实更聪明

### Deepseek + Open WebUI Web页面

Open WebUI依赖[Microsoft C++ 生成工具](https://visualstudio.microsoft.com/zh-hans/visual-cpp-build-tools/)，安装“使用C++的桌面开发”并确保安装详细信息的前两项勾选（否则报错Microsoft Visual C++ 14.0 is required. Get it with “Microsoft Visual C++ Build Tools）
```sh

pip install open-webui
open-webui serve
```
http://localhost:8080/
ipconfig查看自己的ipv4地址，比如192.168.15.195，那么我的web网址为：
http://192.168.15.195:8080/
使用 Windows 防火墙开放端口，使局域网能成功访问：
`netsh advfirewall firewall add rule name="Allow Port 8080" dir=in action=allow protocol=TCP localport=8080`

系统提示词
温度：温度越高 模型越会自由发挥
上下文长度
num_gpu, num_thread

可以通过修改回答记录进行破甲

### Deepseek + AnythingLLM 自建知识库
1. 下载[nomic-embed-text](https://ollama.com/library/nomic-embed-text)：`ollama pull nomic-embed-text`，一个具有大型 token 上下文窗口的高性能开放嵌入模型。
2. 下载安装AnythingLLM：https://anythingllm.com/desktop
选ollama(先要打开ollama)>选模型>一直下一步,即可开始聊天
3. 数据投喂：
   + 设置>⼈⼯智能提供商>Embedder⾸选项，提供商选择“Ollama”，模型选择“nomic-embed-text:latest”，保存更改
   + 点击⼯作区旁边的上传按钮；然后点击上传⽂件，再选择⽂件，移动到右侧⼯作区，最后点击保存
   + 最后验证⼀下，点击NewThread，问它个相关的问题，看到回答的最下⽅显⽰有引⽤就OK

### Deepseek API + SillyTavern
Node.js环境：https://nodejs.org/en/download
酒馆：https://github.com/SillyTavern/ Release - Source code下载 - Start.bat
打开SillyTavern网址，点插头图标，选聊天补全， Deepseek, 填入自己的API密钥
右上角创建角色或导入角色卡，中间世界信息，左边导入预设

手机端连接：config.yaml：listen: true; whitelist: - 192.168.*.*
http://192.168.15.195:8000/
`netsh advfirewall firewall add rule name="Allow Port 8000" dir=in action=allow protocol=TCP localport=8000`

连本地ollama: ollama 打开后，选文本补全-ollama Api填http://192.168.15.195:11434/ - 连接

Gemini API: 注意并非可以访问gemini的网站就代表梯子正常。对于PC用户而言，需要打开CLASH中的“TUN模式”才可以正常链接API使用。

[小白也能看懂的本地文生图](https://docs.google.com/document/d/11vPOdz_4q_DrAhdL3fLP61FkzRZSppyCuqpLps4qIkA/edit?tab=t.0#heading=h.suwlqsio29mz)

## chat-on-wechat
https://github.com/zhayujie/chatgpt-on-wechat
config example:
```log
 "channel_type": "wx",
  "model": "xunfei",
  "xunfei_app_id": "2c706062",
  "xunfei_api_key": "99da3dd9feaf65eXXX",
  "xunfei_api_secret": "ZTg3MmMyODJkZmQyXXX9b98ad41989a47e97XXXNzQ5M2YzM2M1YzYy",
  "xunfei_domain": "generalv3.5",
  "xunfei_spark_url": "wss://spark-api.xf-yun.com/v3.5/chat",  
```
# AI绘画
[秋葉aaaki](https://space.bilibili.com/12566101)：
   - [Stable Diffusion整合包](https://www.bilibili.com/video/BV1iM4y1y7oA/?spm_id_from=333.1387.homepage.video_card.click&vd_source=b530b63b4657d68926b54a618d047d04)
   - [ComfyUI整合包](https://www.bilibili.com/video/BV1Ew411776J/?spm_id_from=333.1387.homepage.video_card.click&vd_source=b530b63b4657d68926b54a618d047d04)

# AI音视频
## DeepLive
[Deep-Live-Cam](https://github.com/hacksider/Deep-Live-Cam)
注意图片不能有中文路径
## F5-TTS
[F5-TTS](https://github.com/SWivid/F5-TTS)
安装cuda以加速