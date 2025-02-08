---
title: AI: Deepseek,DeepLive,sd,chat-on-wechat
date: 2025-02-07 11:36:00
tags:
- AI
- 深度学习
---
AI相关折腾记录: LLM-Deepseek,chat-on-wechat, AI绘画-StableDiffusion, 音视频-DeepLive,F5-TTS
<!--more-->
# LLM
## Deepseek
[DeepSeek：从入门到精通](https://www.kdocs.cn/l/caFUbVZSt40Q?f=201&share_style=h5_card)

### 使用ollama + Deepseek
下载并安装ollama： https://ollama.com/download （关闭开机自启动：C:\Users\Arrow\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup 删除快捷方式）
修改模型下载路径，避免占C盘：设置>系统>系统信息>高级系统设置>环境变量>在系统变量中新建：OLLAMA_MODELS D:\XXX\models（默认在C:\Users\XX\.Ollama\models）
搜索模型：https://ollama.com/search （注意显存要求，我使用的笔记本端4060 8G大概能跑7-14B）
下载：`ollama run thirdeyeai/DeepSeek-R1-Distill-Qwen-7B-uncensored`4
速度很慢，疑似未走VPN, 改用Hugging Face：https://huggingface.co/models?p=1&sort=trending&search=deepseek ，需要下载GGUF版本才能在ollama中导入
>GGUF格式是GPT-Generated Unified Format，由Georgi Gerganov定义发布的一种大模型文件格式。GGUF是GGML的继任者，旨在克服GGML的限制，提升用户体验，可扩展性和稳定性。它设计用于快速加载和保存模型，支持各种模型，并允许添加新功能同时保持兼容性。GGUF文件格式专为存储推断模型而设计，特别适用于语言模型如GPT。

下载： [mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF](https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF)

导入：模型文件放到models文件夹，在该文件夹下新建一个文件，可命名为deepseek14B.mf，用文本编辑器编辑文件，写入内容`FROM ./DeepSeek-R1-Distill-Qwen-14B-Uncensored.Q4_K_S.gguf`
```sh
cd D:\XXX\models
ollama create deepseek:14B -f deepseek14B.mf
ollama run deepseek:14B --verbose
# 卸载模型（还需要到文件路径下删除模型文件）
ollama rm deepseek:14B
```

### 使用AnythingLLM自建知识库
1. 下载[nomic-embed-text](https://ollama.com/library/nomic-embed-text)：`ollama pull nomic-embed-text`，一个具有大型 token 上下文窗口的高性能开放嵌入模型。
2. 下载安装AnythingLLM：https://anythingllm.com/desktop
选ollama(先要打开ollama)>选模型>一直下一步,即可开始聊天
3. 数据投喂：
   + 设置>⼈⼯智能提供商>Embedder⾸选项，提供商选择“Ollama”，模型选择“nomic-embed-text:latest”，保存更改
   + 点击⼯作区旁边的上传按钮；然后点击上传⽂件，再选择⽂件，移动到右侧⼯作区，最后点击保存
   + 最后验证⼀下，点击NewThread，问它个相关的问题，看到回答的最下⽅显⽰有引⽤就OK


## chat-on-wechat

# AI绘画
sd-webui-aki

# AI音视频
## DeepLive

## F5-TTS