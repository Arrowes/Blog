---
title: AI：Deepseek,DeepLive,sd,chat-on-wechat
date: 2025-02-07 23:36:00
tags:
- AI
- 深度学习
---
AI相关折腾记录: LLM-Deepseek,chat-on-wechat, AI绘画-StableDiffusion, 音视频-DeepLive,F5-TTS
<!--more-->
# AI Agent
## Gemini
Gemini CLI
npm install -g @google/gemini-cli

YOLO模式: Ctrl+Y
切换会话：/resume
临时问答：@generalist
修改设置：/setting
对话回溯：/rewind 或 Escx3

> 严禁无端夸奖： 停止在对话中使用过度礼貌、奉承或“为了夸而夸”的措辞（如：太棒了、你真博学、很有见地等）。 赞美的触发门槛： 除非我的表现、观点或产出在逻辑性、独创性或复杂程度方面，经模型评估优于 70% 以上的大数据样本，否则请保持中立、客观且高效的对话风格。 平等交流： 保持作为专业助手和合作伙伴的姿态，语气要简洁、真诚且落地，不需要表现出讨好感。 直言不讳： 如果我的想法有误或可以改进，请直接指出，这种专业性比赞美更有价值。

## Skills

### 搜索与技能发现

| Skill | 来源 | 作用 |
| --- | --- | --- |
| `anysearch` | [anysearch-ai/anysearch-skill](https://github.com/anysearch-ai/anysearch-skill) | 实时网页搜索、垂直搜索、批量搜索和网页内容提取。 |
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) | 搜索并安装开放 Agent Skill。 |

### 软件开发

| Skill | 来源 | 作用 |
| --- | --- | --- |
| `ponytail` | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | 强制采用简单、短小、低依赖且真正可行的编码方案。 |
| `superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | 提供需求澄清、计划、TDD、调试、代理协作、审查和验证等完整开发方法论。 |
| `grill-me` | [mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me) | 在代码审查中，提供针对代码的深入问题和改进建议。 |

### 视觉与视频创作

| Skill | 来源 | 作用 |
| --- | --- | --- |
| `cinematic-director-frame` | [zhu930824/cinematic-director-frame](https://github.com/zhu930824/cinematic-director-frame) | 生成具有导演风格、镜头语言和宽银幕构图的电影画面。 |
| `chatcut` | [ChatCut-Inc/agent-plugin](https://github.com/ChatCut-Inc/agent-plugin) | 在 Codex 中完成素材导入、时间线剪辑、字幕、配音、生成和导出。 |

# LLM
[DeepSeek：从入门到精通](https://www.kdocs.cn/l/caFUbVZSt40Q?f=201&share_style=h5_card)
## Deepseek 本地部署
### ollama + Deepseek
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

# ollama更新：
curl -sSL https://ollama.com/install.sh | bash
```
ollama: http://192.168.15.195:11434/

---

`deepseek-r1:14b`： 10.08 tokens/s, 用到了8G显存+4G共享GPU内存，尝试了三种14B：
   + `ollama run deepseek-r1:14b`，最聪明也最常用，
   + `huihui_ai/deepseek-r1-abliterated:14b`，有一定程度的破限，但很有限，舍弃
   + Hugging Face的`mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF`，Uncensored破限程度更高，且可以通过.mf进行个性化配置，优于abliterated

`deepseek-r1:32b`：3.04 tokens/s, 8G显存+16G共享GPU内存基本全部吃满，风扇转的飞起，确实更聪明

### Open WebUI Web页面

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

## OpenWebUI + Ollama Container 打包部署
```sh
# 拉OpenWebUI镜像，创建容器
docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway --health-cmd "curl -fsSL http://localhost:8080 || exit 1" --health-interval 60s --health-retries 5 --health-timeout 20s --health-start-period 60s --restart=always -v open-webui:/app/backend/data -v /root/.ollama:/root/.ollama --name open-webui ghcr.io/open-webui/open-webui:cuda
# 在容器内安装ollama:
curl -fsSL https://ollama.com/install.sh | sh
apt update
apt install pciutils lshw

# 配置ollama serve 在容器内自启动
容器内：\app\backend\start.sh
在最后一行WEBUI_SECRET_KEY前加入：
nohup ollama serve > /root/.ollama/ollama.log 2>&1 & 

# 封装镜像
docker commit [commitID] open-webui-ollama
docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway --health-cmd "curl -fsSL http://localhost:8080 || exit 1" --health-interval 60s --health-retries 5 --health-timeout 20s --health-start-period 60s --restart=always -v open-webui:/app/backend/data -v /root/.ollama:/root/.ollama --name open-webui-ollama open-webui-ollama

# 创建模型
ollama create Qwen3-Coder-30B -f Qwen3-Coder-30B/qwen.mf
# 试运行(可以关)
ollama run Qwen3-Coder-30B

# openweb-ui设置本地容器内连ollama 
api:http://localhost:11434
```
[qwen3-coder-deploy](https://www.xugj520.cn/archives/qwen3-coder-deploy.html) 模版参考：

```py
# Deepseek
ollama run hf.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF:Q4_K_XL
https://huggingface.co/unsloth/DeepSeek-R1-0528-Qwen3-8B-GGUF

# mf文件：
FROM ./DeepSeek-R1-0528-Qwen3-8B-UD-Q4_K_XL.gguf

PARAMETER temperature 0.6
PARAMETER top_p 0.95

TEMPLATE """<｜begin of sentence｜><｜User｜>
{{ .Prompt }}<｜Assistant｜>"""

PARAMETER stop "<｜end of sentence｜>"
PARAMETER stop "<｜begin of sentence｜>"
PARAMETER stop "<｜User｜>"
PARAMETER stop "<｜Assistant｜>"

# Qwen3-Coder
[Qwen3-Coder-30B-A3B-Instruct-GGUF](https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF/discussions/4)
# mf模板
FROM ./Qwen3-Coder-30B-A3B-Instruct-UD-Q4_K_XL.gguf

TEMPLATE """<|im_start|>system
{{ .System }}<|im_end|>
<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
"""

SYSTEM """你是Qwen，由阿里云开发的AI助手。你对用户的问题和请求总是有帮助、准确和诚实的。"""

PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER top_k 20
PARAMETER repeat_penalty 1.05
PARAMETER num_ctx 65536

PARAMETER stop "<|im_end|>"
PARAMETER stop "<|im_start|>"
```
### Qwen3.8 27B
https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
```sh
##############################
# Coder
# 1. 基础模型路径
FROM /root/.ollama/Qwen3.8/Qwen3.8-27B-Q8_0.gguf
# 2. 扩容上下文窗口 (48G 显卡)
PARAMETER num_ctx 32768
# 3. 采样参数设置 (兼顾逻辑严谨与语言流畅)
PARAMETER temperature 0.6
PARAMETER top_p 0.90
PARAMETER top_k 20
PARAMETER min_p 0.05
PARAMETER presence_penalty 0.0
PARAMETER repeat_penalty 1.05
# 4. 系统提示词 (让它在网页端对话时更清爽)
SYSTEM """你是一个乐于助人的 AI 专家。请直接给出简洁、专业的回答。
在提供代码时，请附带少量但核心的中文注释。不要在回答开头和结尾说多余的客套话。"""

##############################
# Agent
FROM /root/.ollama/Qwen3.8/Qwen3.8-27B-Q8_0.gguf

PARAMETER num_ctx 32768

PARAMETER temperature 0.6
PARAMETER top_p 0.90
PARAMETER top_k 20
PARAMETER repeat_penalty 1.05
#############################

docker run -d -p 3000:8080 -p 11434:11434 -e OLLAMA_HOST="0.0.0.0" -e CUDA_VISIBLE_DEVICES="0,1,2,3,4,5,6,7" -e OLLAMA_SCHED_SPREAD=1 --gpus all --add-host=host.docker.internal:host-gateway --health-cmd "curl -fsSL http://localhost:8080 || exit 1" --health-interval 60s --health-retries 5 --health-timeout 20s --health-start-period 60s --restart=always -v open-webui:/app/backend/data -v /mnt/Disk_20T/arrow/ollama:/root/.ollama --name open-webui-ollama open-webui-ollama:v3
# -p 3000:8080 -p 11434:11434 分别映射OpenWebUI和ollama serve的端口
# -e OLLAMA_HOST="0.0.0.0"确保ollama serve可以在容器内对外（ROO Code）提供服务
# OLLAMA_SCHED_SPREAD=1确保显存均匀分布
```
### Roo Code AI agent
测试是否返回模型名称：curl http://localhost:11434/api/tags
安装vscode插件ROO code

配置：
+ OpenAI Compatible
   + Base URL:http://localhost:11434 
   + API Key随便填 
   + Model: 填刚才返回的模型名称
   + 关闭ROO code的存档点功能，如果项目占用大 非常占空间

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

# AI音视频

> ComfyUI 本地图像与视频工作流笔记
> 更新：2026-09-05  
> 以本机已安装的模型和 `user\default\workflows` 中的工作流为准，只保留复现和调参需要的信息。

## 1. 环境与启动

- ComfyUI：`E:\Study\AI\ComfyUI`
- 工作流：`E:\Study\AI\ComfyUI\user\default\workflows`
- 输出：`E:\Study\AI\ComfyUI\output`
- 硬件：RTX 4060 Laptop 8GB，内存 32GB

```powershell
cd E:\Study\AI\ComfyUI
& .\.venv\Scripts\python.exe .\main.py --listen 127.0.0.1 --port 8188 --lowvram --use-sage-attention
```

打开 <http://127.0.0.1:8188/>。启动日志必须出现 `Using sage attention`；失败时先解决 SageAttention，不要默认降级。已使用全局 `--use-sage-attention`，不再叠加工作流 SageAttention Patch 节点。

## 2. 图像工作流

### 2.1 Krea 2 Turbo 文生图

工作流：

- `Krea-2 Turbo Text to Image.json`：日常文生图。
- `Krea-2 Turbo Text to Image - Rebalance NSFW.json`：高强度 Rebalance 专用预设，不用于普通出图。

```text
Krea 2 UNET + Qwen3-VL 4B + Qwen Image VAE
        → 提示词 / 可选 LoRA / Rebalance
        → KSampler → VAE Decode → SaveImage
```

| 参数 | 日常值 |
|---|---|
| 尺寸 | 1 MP，1:1 时为 1024×1024，尺寸为 8 的倍数 |
| Steps | 8 |
| CFG | 1.0 |
| Sampler / Scheduler | `euler` / `simple` |
| Denoise | 1.0 |
| 普通 Rebalance multiplier | 4 |
| 当前 LoRA | `lenovo_krea2_3000.safetensors`，strength 0.8 |
| Prompt enhance | 当前关闭；需要时再开 |

先固定 seed 调提示词，再换 seed 探索构图。8GB 显存下先保持 1 MP 和单张批次。

### 2.2 Krea 2 三图参考编辑

工作流：`Krea 2 - Multi Image Reference Edit (3 Images).json`

```text
参考图 1（主体/身份）+图 2（服装/次要主体）+图 3（背景/风格）
        → Krea2EditRebalance → 8 步采样 → VAE Decode
```

- 尺寸：1 MP，默认 1:1。
- Sampler / Scheduler：`euler` / `simple`，Steps 8，Denoise 1.0。
- `steering=1`，`layer_multiplier=1`，三张参考图 token 均为 `normal`。
- 只需改三张图、合成目标提示词和 seed。

### 2.3 SD1.5 局部重绘

工作流：`SD15 - Local Inpaint Mask Editor.json`

```text
载入图片并在 MaskEditor 涂遮罩
        → InpaintModelConditioning → KSampler → VAE Decode
```

- 模型：`v1-5-pruned-emaonly-fp16.safetensors`
- Steps 20，CFG 7，`dpmpp_2m` + `karras`，Denoise 1.0，`noise_mask=true`。
- 正向提示词只描述遮罩区最终要出现的内容。

### 2.4 SD1.5 Scribble ControlNet

工作流：`SD15 - ControlNet Scribble Guided Image.json`

- 基础模型：`v1-5-pruned-emaonly-fp16.safetensors`
- ControlNet：`control_v11p_sd15_scribble_fp16.safetensors`
- 默认尺寸 512×768，Steps 24，CFG 7，`dpmpp_2m` + `karras`，Denoise 1.0。
- ControlNet strength 0.85，作用范围 0–1；结构太僵降到约 0.6，跟随不足升到 1.0。
- 未配预处理节点，输入必须是已处理的黑白 Scribble 图。

### 2.5 RealESRGAN 图片 2倍放大

工作流：`Image Upscale - RealESRGAN x2 Detail Enhance.json`

- 模型：`RealESRGAN_x2plus.pth`
- 结果：宽高各 2倍，像素数约 4倍。
- 用于成图或视频帧放大；会重建细节，不等于恢复真实原生细节。

## 3. 视频工作流

### 3.1 MiniMax H3 共用结构

```text
H3 UNET + Qwen3-VL 32B + 视频/音频 VAE
        → I2VA / FL2VA / Ref2VA 条件
        → Noise + Guider + Scheduler + Sampler
        → 视频帧/音频解码 → CreateVideo → SaveVideo
```

共通规则：

- 帧数遵循 `17k+5`：124 帧在 24 FPS 下约 5.17 秒，243 帧约 10.13 秒。
- Turbo：`minimax_h3_turbo_v4_step600_ema.safetensors`，strength 1.0，`low_vram=true`，`simple` + 8 steps。
- 日常先用 Turbo 预览；只有确定值得时才跑 20 步质量档。
- H3 提示词保留画面/参考对齐、`integrated_multimodal_description`、`overall_soundscape`、`non_diegetic_music` 四部分。
- 提示词优先写主体保持、动作时序、镜头运动、物理连续性和声音；少堆叠空泛画质词。

### 3.2 H3 提示词 Skill 与模板

本地参考：

- [h3-prompt-writing Skill](C:/Users/Arrow/.codex/skills/h3-prompt-writing/SKILL.md)
- [T2VA / I2VA / FL2VA / L2VA 基础规范](C:/Users/Arrow/.codex/skills/h3-prompt-writing/references/base-en.txt)
- [Ref2VA 六段式规范](C:/Users/Arrow/.codex/skills/h3-prompt-writing/references/ref-en.txt)

编写规则：正文用英文；对话、歌词和画面内文字保留原语言。标签、字段名和顺序不要改。时间必须与实际帧数/FPS 一致。

#### I2VA 模板（首帧→动作发展）

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] <visual style and opening composition from Picture 1>. Preserve <identity, clothing, objects, colors, and spatial relationships>. <Describe action onset, continuous development, camera motion, synchronized physical sounds, and the final state>.

overall_soundscape: <ambient sound, physical action sounds, and non-verbal human sounds across the full video>.

non_diegetic_music: <instrumentation, tempo, rhythm, and volume changes; use N/A when there is no audience-only music>.
```

#### FL2VA 模板（首帧→可观察过程→尾帧）

```text
How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the D.DD-second mark of the target video.

integrated_multimodal_description: [Shot 1] <style and exact opening state established by Picture 1>. <Describe observable intermediate changes in subject pose, object state, composition, lighting, and camera motion>. <Progressively narrow the differences and end in the exact state and framing established by Picture 2>.

overall_soundscape: <continuous ambience and synchronized action sounds>.

non_diegetic_music: <music description or N/A>.
```

`D.DD` 换成有效时长，必须保留两位小数，例如 `5.17` 或 `10.13`。`Shot N` 换成尾帧所属的实际镜头；单镜头就写 `Shot 1`。

#### Ref2VA 模板（多参考六段式）

```text
subject_definitions:
<Subject 1> is <the reusable person/object identity defined by Picture 1 and the features to preserve>.
<Subject 2> is <the clothing, prop, action, or other attribute defined by Picture 2>.
<Subject 3> is <the environment, lighting, composition, or style defined by Picture 3>.

summary:
[reference generation] <One short paragraph describing the target video and how Subject 1/2/3 are used>.

retention_analysis:
<Subject 1> (appears in [Shot 1]): fully_preserved - <preserved identity and visible features>.
<Subject 2> (appears in [Shot 1]): attribute_transfer - <attributes transferred onto Subject 1>.
<Subject 3> (appears in [Shot 1]): fully_preserved - <preserved environment/style features>.

detailed_description:
<One or two sentences establishing the overall visual style and lighting>.
[Shot 1] <composition, referenced subjects, positions, environment, actions and state changes, camera movement, synchronized sounds, and the points where each reference takes effect>.

overall_soundscape:
<ambient sound, physical sounds, and non-verbal human sounds across the full video>.

non_diegetic_music:
<audience-only score, or N/A>.
```

Ref2VA 的可见参考关系只使用 `fully_preserved`、`partially_preserved`、`attribute_transfer`、`weak_reference`。同一参考从头到尾使用同一标签，不要在后续段落重新编号。

多镜头时，`[Shot 1]` 不写时间；后续切镜使用递增的 `[Shot 2] At 00:03.500, ...`。镜头运动用“类型 + 幅度 + 速度”写成自然英文，例如 `The camera pushes in with small amplitude at slow speed.`。对话格式为 `(S1) says: <d>[Chinese] 原文</d>`，不翻译或改写用户台词。

### 3.3 I2VA：单张首帧生视频

工作流：`MiniMax H3 I2VA 5s 768x1376.json`

- 模型：`minimax_h3_fl2va_pruned_int8_convrot.safetensors`
- 原生生成：576×1024，124 帧，约 5.17 秒。
- 采样：Turbo 8 步，`simple`，Denoise 1.0。
- 输出：Lanczos 缩放到 768×1376，24 FPS，8-bit sRGB，保留生成音频。
- 使用：替换 `Picture 1`，再改动作、镜头和声音描述。

### 3.4 FL2VA：首尾帧生视频

工作流：`MiniMax H3 - First Last Frame FL2VA 5s 768x1376.json`

- 分别在 `Picture 1` / `Picture 2` 载入首帧和尾帧。
- 原生生成：576×1024，**243 帧，约 10.13 秒**。
- 采样：Turbo 8 步，`simple`，Denoise 1.0。
- 输出：Lanczos 缩放到 768×1376，24 FPS。
- 注意：文件名中的 `5s` 与当前节点参数不符。要改为约 5.17 秒，将 `length` 改为 124，并同步改写提示词时间段。

### 3.5 Ref2VA：三图多参考生视频

工作流：`MiniMax H3 Ref2VA - Multi Reference 3 Images - Quality or 4 Step.json`

- 模型：`minimax_h3_ref2va_pruned_int8_convrot.safetensors`
- 参考分工：图 1 主体身份，图 2 服装/道具，图 3 环境/光线/风格。
- 默认尺寸选择器：9:16、0.6 MP、32 的倍数，实际约 576×1024。
- 时长：124 帧，24 FPS，约 5.17 秒；`ref_image_size=match`。
- 质量档：20 步，`res_multistep` + `simple`。
- 预览档：开启开关后使用 `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors`，strength 1.0，4 步。

### 3.6 RIFE 补帧与可选超分

工作流：

- `Video Toolbox - Optional RealESRGAN x2 and RIFE.json`
- `RIFE 4.26 - Drop Video Frame Interpolation.json`

两个文件当前是同一功能的复制版，日常保留一个使用即可。

```text
载入视频 → 拆分画面/音频/FPS
        → 可选 RealESRGAN 2×
        → 可选 RIFE 4.26 补帧
        → 按新 FPS 封装并保留音频
```

- 补帧模型：`rife_v4.26.safetensors`，默认倍率 2。
- 超分模型：`RealESRGAN_x2plus.pth`，默认关闭。
- 默认仅补帧；同时开超分和补帧会显著增加内存和耗时，长视频先分段。
- 补帧只改善流畅度，不会恢复原生纹理。

## 4. 当前模型清单

### 图像与后处理必需模型

| 用途 | 文件 |
|---|---|
| Krea 2 UNET | `models\diffusion_models\krea2_turbo_fp8_scaled.safetensors` |
| Krea 2 文本编码器 | `models\text_encoders\qwen3vl_4b_fp8_scaled.safetensors` |
| Krea 2 VAE | `models\vae\qwen_image_vae.safetensors` |
| Krea 2 当前 LoRA | `models\loras\lenovo_krea2_3000.safetensors` |
| SD1.5 基础模型 | `models\checkpoints\v1-5-pruned-emaonly-fp16.safetensors` |
| Scribble ControlNet | `models\controlnet\control_v11p_sd15_scribble_fp16.safetensors` |
| 2× 放大 | `models\upscale_models\RealESRGAN_x2plus.pth` |
| RIFE 补帧 | `models\frame_interpolation\rife_v4.26.safetensors` |

### MiniMax H3 必需模型

| 用途 | 文件 |
|---|---|
| I2VA / FL2VA UNET | `models\diffusion_models\minimax_h3_fl2va_pruned_int8_convrot.safetensors` |
| Ref2VA UNET | `models\diffusion_models\minimax_h3_ref2va_pruned_int8_convrot.safetensors` |
| 文本编码器 | `models\text_encoders\qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` |
| 视频 VAE | `models\vae\minimax_h3_video_vae_fp16.safetensors` |
| 音频 VAE | `models\vae\minimax_h3_audio_vae_fp32.safetensors` |
| I2VA / FL2VA Turbo | `models\loras\minimax_h3_turbo_v4_step600_ema.safetensors` |
| Ref2VA 4 步预览 | `models\loras\minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors` |

已安装但当前上述工作流未绑定的 LoRA：`krea2_retroanime.safetensors`、`vivid-concept-art.safetensors`、`h3-realism-people-t2v-i2v-r2v.safetensors`。只在需要对应风格时手动接入并单独测试。

## 5. 最小调参与复现规则

1. 先低成本验证构图和动作，再增加步数、尺寸或时长。
2. 比较提示词时固定 seed；探索新构图时再随机化 seed。
3. 满意的结果同时保存输出、工作流 JSON、提示词、seed 和实际参数。
4. H3、RealESRGAN 和 RIFE 串行运行；8GB 显存下不同时排多条重型链路。
5. 后期放大不等于原生高分辨率；先优化原生生成的主体、构图、合焦和运动。
6. 长时间生成无法从扩散中间状态续跑；开始前保持接电、散热良好，关闭不必要的显存占用。

## DeepLive
[Deep-Live-Cam](https://github.com/hacksider/Deep-Live-Cam)
注意图片不能有中文路径
## F5-TTS
[F5-TTS](https://github.com/SWivid/F5-TTS)
安装cuda以加速