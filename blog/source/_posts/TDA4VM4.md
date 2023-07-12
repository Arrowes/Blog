---
title: TDA4④：部署自定义模型
date: 2023-07-07 10:40:00
tags:
- 嵌入式
- 深度学习
---
OD model
```mermaid
graph LR
A(Encoder ) -->B(Feature Fusion)-->c(Detection Heads)-->d(Detection Layer)
```
An important step of compiling an OD model is defining prototxt.
Prototxt file contains all relevant information of the detection layer.
[Efficient object detection using Yolov5 and TDA4x processors | Video | TI.com](https://www.ti.com/video/6286792047001)
[4. Deep learning models &mdash; Processor SDK Linux for SK-TDA4VM Documentation](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/common/inference_models.html)

Each Deep Neural Network has few components:
1.  **model**: This directory contains the DNN being targeted to infer
2.  **artifacts**: This directory contains the artifacts generated after the compilation of DNN for SDK. These artifacts can be generated and validated with simple file based examples provided in Edge AI TIDL Tools
3.  **param.yaml**: A configuration file in yaml format to provide basic information about DNN, and associated pre and post processing parameters
4.  ***dataset.yaml :** This configuration file in yaml format illustrate the details of dataset used for model training.
5.  ***run.log :** This is run log of model.

[edgeai-benchmark](https://github.com/TexasInstruments/edgeai-benchmark): Custom model benchmark can also be easily done (please refer to the documentation and example). Uses [edgeai-tidl-tools](https://github.com/TexasInstruments/edgeai-tidl-tools) for model compilation and inference


1. 首先，使用PyTorch训练模型并导出.onnx和prototxt文件;
2. 其次，使用edgeai-benchmark来对.onnx和prototxt文件进行基准测试，以获取param.yaml文件。可以使用脚本[edgeai-benchmark/run_custom_pc.sh](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/run\_custom\_pc.sh)来调用[edgeai-benchmark/custom.py](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/scripts/benchmark\_custom.py)。如果模型不在该文件列出的类型之中，可以参考[edgeai-benchmark/configs](https://github.com/TexasInstruments/edgeai-benchmark/tree/master/configs)目录中的示例,
这一步将创建一个编译后的模型文件包（tar.gz文件）;
3. 第三步，通过flash手动将上述.tar.gz文件复制到SD卡中（或者在启动后，可以直接使用scp或其他工具进行复制）;
4. 最后，运行/opt/edge_ai_apps/apps_python/app_edgeai.py。

除了上述的第二步，也可以使用edgeai-tidl-tools。但是需要手动编辑param.yaml文件，以使其与edgeai-benchmark生成的文件相匹配。 

# [EdgeAI-TIDL-Tools](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/08_06_00_05/docs/custom_model_evaluation.md)
环境搭建见：[TDA4②](https://wangyujie.site/TDA4VM2/#EdgeAI-TIDL-Tools)



# [EdgeAI-Benchmark](https://github.com/TexasInstruments/edgeai-benchmark/tree/master)
EdgeAI-Benchmark提供了一系列针对不同图像识别任务的脚本，包括分类、分割、检测和关键点检测。（使用[edgeai-tidl-tools](https://github.com/TexasInstruments/edgeai-tidl-tools)用于模型编译和推理）

## 环境搭建
文档：[setup_instructions](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/docs/setup_instructions.md)，其中`pyenv install 3.6`可能因为网络原因下载极慢，这时可以先从官网或镜像源下载所需要的包到 ~/.pyenv/cache 目录下，再执行安装命令
此后每次需要激活环境：`pyenv activate benchmark`

[edgeai-tidl-tools/docs/custom_model_evaluation.md](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/docs/custom_model_evaluation.md)


