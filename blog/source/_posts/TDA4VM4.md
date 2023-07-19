---
title: TDA4④：部署自定义模型
date: 2023-07-07 10:40:00
tags:
- 嵌入式
- 深度学习
---
接上一篇：[TDA4③：YOLOX的模型转换与SK板端运行](https://wangyujie.site/TDA4VM3/)

TI文档中对yolo、mobilenet、resnet等主流深度学习模型支持十分完善，相关开箱即用的文件在 [Modelzoo](https://github.com/TexasInstruments/edgeai-modelzoo) 中，但有关自定义模型的编译和部署内容很少，只能利用例程和提供的工具进行尝试。

深度学习模型基于TI板端运行要有几个组件：
1.  **model**：这个目录包含了要进行推理的模型（.onnx, *.prototxt）
2.  **artifacts**：这个目录包含了模型编译后生成的文件。这些文件可以用Edge AI TIDL Tools来生成和验证
3.  **param.yaml**：配置文件，提供了模型的基本信息，以及相关的预处理和后处理参数
4.  \***dataset.yaml**：配置文件，说明了用于模型训练的数据集的细节
5.  \***run.log**：这是模型的运行日志

[edgeai-benchmark](https://github.com/TexasInstruments/edgeai-benchmark): Custom model benchmark can also be easily done (please refer to the documentation and example). Uses [edgeai-tidl-tools](https://github.com/TexasInstruments/edgeai-tidl-tools) for model compilation and inference


1. 首先，使用PyTorch训练模型并导出.onnx (& prototxt) 文件;
2. 其次，使用edgeai-benchmark来对.onnx和prototxt文件进行基准测试，以获取param.yaml文件。可以使用脚本[edgeai-benchmark/run_custom_pc.sh](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/run\_custom\_pc.sh)来调用[edgeai-benchmark/custom.py](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/scripts/benchmark\_custom.py)。如果模型不在该文件列出的类型之中，可以参考[edgeai-benchmark/configs](https://github.com/TexasInstruments/edgeai-benchmark/tree/master/configs)目录中的示例,
这一步将创建一个编译后的模型文件包（tar.gz文件）;
3. 第三步，通过flash手动将上述.tar.gz文件复制到SD卡中（或者在启动后，可以直接使用scp或其他工具进行复制）;
4. 最后，运行/opt/edge_ai_apps/apps_python/app_edgeai.py。

除了上述的第二步，也可以使用edgeai-tidl-tools。但是需要手动编辑param.yaml文件，以使其与edgeai-benchmark生成的文件相匹配。

# ONNX模型转换
使用`torch.onnx.export(model, input, "XXX.onnx", verbose=False, export_params=True, opset_version=13)`得到 `.onnx`；
> 注意要确保加载的模型是一个完整的PyTorch模型对象，而不是一个包含模型权重的字典, 否则会报错`'dict' object has no attribute 'modules'`；
因此需要在项目保存`.pth`模型文件时设置同时*保存网络结构*，或者在项目代码中*导入完整模型*后使用`torch.onnx.export`
opset_version只支持到13，导出默认14会报错

使用ONNX Runtime 运行推理，验证模型转换的正确性
```py
import numpy as np    
import onnxruntime    
from PIL import Image
import onnx
import cv2
import matplotlib.pyplot as plt
import torch

#导入模型和推理图片
model_path = "./XXX.onnx"
input_file="1.jpg"
session = onnxruntime.InferenceSession(model_path, None)

# get the name of the first input of the model
input_name = session.get_inputs()[0].name  
input_details  = session.get_inputs()
print("Model input details:")
for i in input_details:
    print(i)
output_details = session.get_outputs()
print("Model output details:", )
for i in output_details:
    print(i)

input_shape = input_details[0].shape
input_height, input_width = input_shape[2:]

# Pre-Process input
img_bgr = cv2.imread(input_file)
print("image size:", img_bgr.shape)
img_bgr2 = cv2.resize(img_bgr, ( input_width,input_height))
print("image resize:", img_bgr2.shape)
img_rgb = img_bgr2[:,:,::-1]
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
# 预处理-归一化
input_tensor = img_rgb / 255    # 预处理-构造输入 Tensor
input_tensor = np.expand_dims(input_tensor, axis=0) # 加 batch 维度
input_tensor = input_tensor.transpose((0, 3, 1, 2)) # N, C, H, W
input_tensor = np.ascontiguousarray(input_tensor)   # 将内存不连续存储的数组，转换为内存连续存储的数组，使得内存访问速度更快
input_tensor = torch.from_numpy(input_tensor).to(device).float() # 转 Pytorch Tensor
input_tensor = input_tensor[:, :1, :, :]    #[1, "1", 384, 128]
print(input_tensor.shape)

#Run inference session
raw_result = session.run([], {input_name: input_tensor.numpy()})
for result in raw_result:
    print("result shape:", result.shape)
```
`print(result)` :如果数值全都一样(-4.59512)，可能是没有检测到有效的目标或者模型效果太差

# TIDL编译
得到onnx相关文件后，使用ti提供的工具进行编译和推理，这里依然采用两种方法：[Edge AI Studio](https://dev.ti.com/edgeaistudio/) 和 [edgeai-tidl-tools](https://github.com/TexasInstruments/edgeai-tidl-tools/tree/08_06_00_05)

## Edge AI Studio
参考yolox的编译过程：[YOLOX的模型转换与SK板端运行](https://wangyujie.site/TDA4VM3/#b-%E4%BD%BF%E7%94%A8TIDL-Tools%EF%BC%88by-Edge-AI-Studio%EF%BC%89)

> **Debug:**
`[ONNXRuntimeError] : 6 ... `: compile_options中设置deny_list，剔除不支持的层，如`'Slice, Resize'`

打包下载编译生成的工件：
```py
#Pack.ipynb
import zipfile
import os

def zip_folder(folder_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, os.path.relpath(file_path, folder_path))

folder_path = './output' # 指定要下载的文件夹路径
zip_path = './output.zip' # 指定要保存的zip文件路径
zip_folder(folder_path, zip_path)

from IPython.display import FileLink
FileLink(zip_path) # 生成下载链接
```

## [EdgeAI-TIDL-Tools](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/08_06_00_05/docs/custom_model_evaluation.md)
环境搭建见：[TDA4②](https://wangyujie.site/TDA4VM2/#EdgeAI-TIDL-Tools)

研读 [edgeai-tidl-tools/examples/osrt_python/ort/onnxrt_ep.py](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/08_06_00_05/examples/osrt_python/ort/onnxrt_ep.py):
进入搭建好的环境：（例）`pyenv activate benchmark`
运行：`./scripts/run_python_examples.sh`
下面基于例程修改以编译运行自定义模型：
```sh
#新建运行脚本./script/run.sh
CURDIR=`pwd`
export SOC=am68pa
export TIDL_TOOLS_PATH=$(pwd)/tidl_tools
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$TIDL_TOOLS_PATH
export ARM64_GCC_PATH=$(pwd)/gcc-arm-9.2-2019.12-x86_64-aarch64-none-linux-gnu
    cd $CURDIR/examples/osrt_python/ort
    #python3 onnxrt_ep.py -c
    python3 onnxrt_ep.py
    #python3 onnxrt_ep.py -d

#修改examples/osrt_python/ort/onnxrt_ep.py
def infer_image(sess, image_files, config): #此处修改模型输入数据格式
models = ['custom_model_name']  #修改对应的模型名称

#修改examples/osrt_python/model_configs.py 导入并配置模型
    'custom_model_name' : {
        'model_path' : os.path.join(models_base_path, 'custom_model_name.onnx'),
        'source' : {'model_url': 'https.../.onnx', 'opt': True,  'infer_shape' : True},
        'mean': [123.675, 116.28, 103.53],
        'scale' : [0.017125, 0.017507, 0.017429],
        'num_images' : numImages,
        'num_classes': 1000,
        'session_name' : 'onnxrt' ,
        'model_type': 'classification'
    },

#examples/osrt_python/model_configs.py 配置编译选项
"deny_list":"Slice, Resize", #"MaxPool"

#运行编译
./scripts/run_seed.sh
```


> **Debug:**
有些模型可能要到model_configs中找到链接手动下载放入models/public
`'TIDLCompilationProvider' is not in available:`环境问题，没有进入配置好的环境，正常应该是: `Available execution providers :  ['TIDLExecutionProvider', 'TIDLCompilationProvider', 'CPUExecutionProvider']`



# [EdgeAI-Benchmark](https://github.com/TexasInstruments/edgeai-benchmark/tree/master)
EdgeAI-Benchmark提供了一系列针对不同图像识别任务的脚本，包括分类、分割、检测和关键点检测。（使用[edgeai-tidl-tools](https://github.com/TexasInstruments/edgeai-tidl-tools)用于模型编译和推理）

## 环境搭建
文档：[setup_instructions](https://github.com/TexasInstruments/edgeai-benchmark/blob/master/docs/setup_instructions.md)，其中`pyenv install 3.6`可能因为网络原因下载极慢，这时可以先从官网或镜像源下载所需要的包到 ~/.pyenv/cache 目录下，再执行安装命令
此后每次需要激活环境：`pyenv activate benchmark`

[edgeai-tidl-tools/docs/custom_model_evaluation.md](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/docs/custom_model_evaluation.md)










































---
[Efficient object detection using Yolov5 and TDA4x processors | Video | TI.com](https://www.ti.com/video/6286792047001)
[4. Deep learning models &mdash; Processor SDK Linux for SK-TDA4VM Documentation](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/common/inference_models.html)
> TDA4系列文章：
[TDA4①：SDK, TIDL, OpenVX](https://wangyujie.site/TDA4VM/)
[TDA4②：环境搭建、模型转换、Demo及Tools](https://wangyujie.site/TDA4VM2/)
[TDA4③：YOLOX的模型转换与SK板端运行](https://wangyujie.site/TDA4VM3/)
[TDA4④：部署自定义模型](https://wangyujie.site/TDA4VM4/)