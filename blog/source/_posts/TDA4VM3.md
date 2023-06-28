---
title: TDA4③：YOLOX的模型转换与SK板端运行
date: 2023-06-15 09:40:00
tags:
- 嵌入式
- 深度学习
---
# YOLOX部署TDA4VM-SK流程
TI官方在[ ModelZOO ](https://github.com/TexasInstruments/edgeai-modelzoo)中提供了一系列预训练模型可以直接拿来转换，也提供了[ edgeai-YOLOv5 ](https://github.com/TexasInstruments/edgeai-yolov5)与[ edgeai-YOLOX ](https://github.com/TexasInstruments/edgeai-yolox)等优化的开源项目，可以直接下载提供的yolov7_s的[ onnx文件 ](http://software-dl.ti.com/jacinto7/esd/modelzoo/latest/models/vision/detection/coco/edgeai-yolox/yolox-s-ti-lite_39p1_57p9.onnx
)和[ prototxt文件 ](http://software-dl.ti.com/jacinto7/esd/modelzoo/latest/models/vision/detection/coco/edgeai-yolox/yolox_s_ti_lite_metaarch.prototxt
)，也可以在官方项目上训练自己的模型后再导入。

这里尝试跑通全流程，在 edgeai-YOLOX 项目中训练，得到 `.pth` 权重文件，使用 export_onnx.py 文件转换为 `.onnx` 模型文件和 `.prototxt` 架构配置文件，并导入TIDL，得到部署用的 `.bin` 文件。
主要参考[ edgeai-YOLOX文档 ](https://github.com/TexasInstruments/edgeai-yolox/blob/main/README_2d_od.md)以及[ YOLOX模型训练结果导入及平台移植应用 ](https://blog.csdn.net/AIRKernel/article/details/126222505)

<img alt="picture 1" src="https://github.com/TexasInstruments/edgeai-yolox/raw/main/yolox/utils/figures/Focus.png"/>  

## 1. 模型文件转ONNX
~~pycharm进入edgeai-yolox项目，根据提示额外安装requirements~~
Window中配置该环境需要安装visual studio build tools，而且很多包报错，因此转ubuntu用vscode搭pytorch环境，非常顺利（vscode插件离线安装：如装python插件，直接进[ marketplace ](https://marketplace.visualstudio.com/vscode)下好拖到扩展位置）拓展设置中把Python Default Path改成创建的环境 `/home/wyj/anaconda3/envs/pytorch/bin/python`，最后用vscode打开项目，F5运行py程序，将.pth转为 ``.onnx, .prototxt`` 文件。
```sh
pip3 install -U pip && pip3 install -r requirements.txt
pip3 install -v -e .  # or  python3 setup.py develop
#安装pycocotools
pip3 install cython
pip3 install 'git+https://github.com/cocodataset/cocoapi.git#subdirectory=PythonAPI'
#下载ti的yolox-s-ti-lite.pth放入项目文件夹，运行export，
python3 tools/export_onnx.py --output-name yolox_s_ti_lite.onnx -f exps/default/yolox_s_ti_lite.py -c yolox-s-ti-lite.pth

#Debug：
TypeError: Descriptors cannot not be created directly. > pip install protobuf==3.19.6;
AttributeError: module 'numpy' has no attribute 'object'. > pip install numpy==1.23.4
#成功，生成onnx文件
 __main__:main:245 - generated onnx model named yolox_s_ti_lite.onnx
 __main__:main:261 - generated simplified onnx model named yolox_s_ti_lite.onnx
 __main__:main:264 - generated prototxt yolox_s_ti_lite.prototxt
```
<details>
<summary>yolox_s_ti_lite.prototxt</summary>

```sh
name: "yolox"
tidl_yolo {
  yolo_param {
    input: "/head/Concat_output_0"
    anchor_width: 8.0
    anchor_height: 8.0}
  yolo_param {
    input: "/head/Concat_3_output_0"
    anchor_width: 16.0
    anchor_height: 16.0}
  yolo_param {
    input: "/head/Concat_6_output_0"
    anchor_width: 32.0
    anchor_height: 32.0}
detection_output_param {
    num_classes: 80
    share_location: true
    background_label_id: -1
    nms_param {
      nms_threshold: 0.4
      top_k: 500}
    code_type: CODE_TYPE_YOLO_X
    keep_top_k: 200
    confidence_threshold: 0.4}
  name: "yolox"
  in_width: 640
  in_height: 640
  output: "detections"}
```
</details>           

---
[ONNXRuntime inference](https://github.com/TexasInstruments/edgeai-yolox/tree/main/demo/ONNXRuntime#yolox-onnxruntime-in-python)
```sh
cd <YOLOX_HOME>
python3 demo/ONNXRuntime/onnx_inference.py -m yolox_s_ti_lite.onnx -i assets/dog.jpg -o output -s 0.3 --input_shape 640,640
#成功基于ONNXRuntime输出预测结果
```
<img alt="图 1" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM3onnxinference.jpg" width="50%"/>  

## 2. 使用TIDL编译ONNX并运行
### a. 使用[TIDL Importer](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_model_import.html) (by RTOS SDK)
1. 模型文件配置：拷贝 .onnx, .prototxt 文件至/ti_dl/test/testvecs/models/public/onnx/，**yolox_s_ti_lite.prototxt**中改in_width&height，根据情况改nms_threshold: 0.4，confidence_threshold: 0.4
2. 编写转换配置文件：在/testvecs/config/import/public/onnx下新建（或复制参考目录下yolov3例程）**tidl_import_yolox_s.txt**，参数配置见[文档](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_model_import.html), 元架构类型见 [Object detection meta architectures](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/docs/tidl_fsg_od_meta_arch.md)

*转换配置文件tidl_import_yolox_s.txt*
```sh
modelType       = 2     #模型类型，0: Caffe, 1: TensorFlow, 2: ONNX, 3: tfLite
numParamBits    = 8     #模型参数的位数，Bit depth for model parameters like Kernel, Bias etc.
numFeatureBits  = 8     #Bit depth for Layer activation
quantizationStyle = 3   #量化方法，Quantization method. 2: Linear Mode. 3: Power of 2 scales（2的幂次）
inputNetFile    = "../../test/testvecs/models/public/onnx/yolox-s-ti-lite.onnx" #Net definition from Training frames work
outputNetFile   = "../../test/testvecs/config/tidl_models/onnx/yolo/tidl_net_yolox_s.bin"   #Output TIDL model with Net and Parameters
outputParamsFile = "../../test/testvecs/config/tidl_models/onnx/yolo/tidl_io_yolox_s_"  #Input and output buffer descriptor file for TIDL ivision interface
inDataNorm      = 1     #1 Enable / 0 Disable Normalization on input tensor.
inMean          = 0 0 0 #Mean value needs to be subtracted for each channel of all input tensors
inScale         = 1.0 1.0 1.0   #Scale value needs to be multiplied after means subtract for each channel of all input tensors，yolov3是0.003921568627 0.003921568627 0.003921568627
inDataFormat    = 1     #Input tensor color format. 0: BGR planar, 1: RGB planar
inWidth         = 1024  #each input tensors Width (可以在.prototxt文件中查找到)
inHeight        = 512   #each input tensors Height
inNumChannels   = 3     #each input tensors Number of channels
numFrames       = 1     #Number of input tensors to be processed from the input file
inData          =   "../../test/testvecs/config/detection_list.txt" #Input tensors File for Reading
perfSimConfig   = ../../test/testvecs/config/import/device_config.cfg   #Network Compiler Configuration file
inElementType   = 0     #Format for each input feature, 0 : 8bit Unsigned, 1 : 8bit Signed
metaArchType    = 6     #网络使用的元架构类型，Meta Architecture used by the network，ssd mobilenetv2 = 3, yolov3 = 4, efficientdet tflite = 5, yolov5 yolox = 6
metaLayersNamesList =  "../../test/models/pubilc/onnx/yolox_s_ti_lite.prototxt" #架构配置文件，Configuration files describing the details of Meta Arch
postProcType    = 2     #后处理，Post processing on output tensor. 0 : Disable, 1- Classification top 1 and 5 accuracy, 2 – Draw bounding box for OD, 3 - Pixel level color blending
```

3. 模型导入
使用TIDL import tool，得到可执行文件 ``.bin``
```sh
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelImport
./out/tidl_model_import.out ${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/config/import/public/onnx/tidl_import_yolox_s.txt
#successful Memory allocation
#../../test/testvecs/config/tidl_models/onnx/生成的文件分析：
tidl_net_yolox_s.bin        #Compiled network file 网络模型数据
tidl_io_yolox_s_1.bin       #Compiled I/O file 网络输入配置文件
tidl_net_yolox_s.bin.svg    #tidlModelGraphviz tool生成的网络图
tidl_out.png, tidl_out.txt  #执行的目标检测测试结果，与第三步TIDL运行效果一致 txt:[class, source, confidence, Lower left point(x,y), upper right point(x,y) ]

#Debug，本来使用官方的yolox_s.pth转成onnx后导入，发现报错：
Step != 1 is NOT supported for Slice Operator -- /backbone/backbone/stem/Slice_3 
#因为"the slice operations in Focus layer are not embedded friendly"，因此ti提供yolox-s-ti-lite，优化后的才能直接导入
```

4. TIDL运行
```sh
#在文件ti_dl/test/testvecs/config/config_list.txt顶部加入:
1 testvecs/config/infer/public/onnx/tidl_infer_yolox.txt
0

#新建tidl_infer_yolox.txt:
inFileFormat    = 2
numFrames       = 1
netBinFile      = "testvecs/config/tidl_models/onnx/yolo/tidl_net_yolox_s.bin"
ioConfigFile    = "testvecs/config/tidl_models/onnx/yolo/tidl_io_yolox_s_1.bin"
inData  =   testvecs/config/detection_list.txt
outData =   testvecs/output/tidl_yolox_od.bin
inResizeMode    = 0
debugTraceLevel = 0
writeTraceLevel = 0
postProcType    = 2

#运行，结果在ti_dl/test/testvecs/output/
cd ${TIDL_INSTALL_PATH}/ti_dl/test
./PC_dsp_test_dl_algo.out
```
<img alt="图 2" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM3sdktidlyolox.png" width="50%"/>  

### b. 使用TIDL Tools（by [Edge AI Studio](https://dev.ti.com/edgeaistudio/)）
使用`Edge AI Studio > Model Analyzer > Custom models > ONNX runtime > custom-model-onnx.ipynb`例程, 并结合 `OD.ipynb` 例程进行修改

*YOLOX.ipynb*
```py
import os
import tqdm
import cv2
import numpy as np
import onnxruntime as rt
from PIL import Image
import matplotlib.pyplot as plt
#/notebooks/scripts/utils.py:
from scripts.utils import imagenet_class_to_name, download_model, loggerWritter, get_svg_path, get_preproc_props, single_img_visualise, det_box_overlay
```
其中scripts.utils中的代码细节在`/notebooks/scripts/utils.py`
```py
#预处理
def preprocess(image_path):
    img = cv2.imread(image_path) # 使用OpenCV读取图像
    print('原始图像：', img.shape, img.dtype)
    img = cv2.resize(img, (640, 640), interpolation=cv2.INTER_CUBIC)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype('float32') / 255.0
    img = (img * 255).astype('uint8')
    img = np.expand_dims(img, axis=0) # 扩展图片数组维度
    img = np.transpose(img, (0, 3, 1, 2)) # NHWC 格式（batch_size，height, width，channels）转换为 NCHW 格式
    print('处理后的图像：', img.shape, img.dtype)
    return img
```
图片的预处理十分重要，调试时注意print图片数据，避免处理出错
```py
#配置
images = [
'WYJ/dog.jpg',
]
output_dir = 'WYJ/output'#优化后的ONNX模型将保存的输出目录
onnx_model_path = 'WYJ/yolox_s_lite_640x640_20220221_model.onnx'
prototxt_path = 'WYJ/yolox_s_lite_640x640_20220221_model.prototxt'
with loggerWritter("WYJ/logs"):# stdout and stderr saved to a *.log file.
    compile_options = {
      'tidl_tools_path' : os.environ['TIDL_TOOLS_PATH'],
      'artifacts_folder' : output_dir,
      'tensor_bits' : 8,
      'accuracy_level' : 1,
      'advanced_options:calibration_frames' : len(images), 
      'advanced_options:calibration_iterations' : 3, # used if accuracy_level = 1
      'debug_level' : 1, # 设置调试级别，级别越高提供的调试信息越详细
      #'advanced_options:output_feature_16bit_names_list': '370, 680, 990, 1300',    
      #'deny_list': 'ScatterND', #' Conv, Relu, Add, Concat, Resize', # MaxPool
      'object_detection:meta_arch_type': 6,
      'object_detection:meta_layers_names_list': prototxt_path,    
    }
# create the output dir if not present & clear the directory
os.makedirs(output_dir, exist_ok=True)
for root, dirs, files in os.walk(output_dir, topdown=False):
    [os.remove(os.path.join(root, f)) for f in files]
    [os.rmdir(os.path.join(root, d)) for d in dirs]
```
object_detection:meta_arch_type、meta_layers_names_list两个参数在OD任务中必须配置，否则内核直接奔溃，参数配置文档中也有说明：[object-detection-model-specific-options](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/examples/osrt_python/README.md#object-detection-model-specific-options)

```py
#模型转换
so = rt.SessionOptions()
EP_list = ['TIDLCompilationProvider','CPUExecutionProvider']
sess = rt.InferenceSession(onnx_model_path ,providers=EP_list, provider_options=[compile_options, {}], sess_options=so)
# 获取所有输入输出详细信息
input_details = sess.get_inputs()
print("Model input details:")
for i in input_details:
    print(i)
output_details = sess.get_outputs()
print("Model output details:")
for i in output_details:
    print(i)
#运行
for i in tqdm.trange(len(images)):
    processed_image = preprocess(images[i])
    output=None
    output = list(sess.run(None, {input_details[0].name :processed_image }))
```
打印输入输出信息，运行编译

```py
#画框
from PIL import Image, ImageDraw
img = Image.open("WYJ/dog.jpg")

width_scale = 640 / img.size[0]
height_scale = 640 / img.size[1]
# 创建ImageDraw对象
draw = ImageDraw.Draw(img)
# 遍历所有边界框，画出矩形
for i in range(int(output[0][0][0].shape[0])):
    # 取出顶点坐标和置信度
    xmin, ymin, xmax, ymax, conf = tuple(output[0][0][0][i].tolist())
    if(conf > 0.4) :
        cls = int(output[1][0][0][0][i])  # 取出类别编号
        print('class:', cls, ', box:',output[0][0][0][i])
        color = (255, cls*10, cls*100)        # 选择不同颜色表示不同类别
        # 画出矩形框
        draw.rectangle(((xmin/ width_scale, ymin/ height_scale), (xmax/ width_scale, ymax/ height_scale)), outline=color, width=2)
img.show()  # 显示画好的图像
```
画框，引入了缩放比例，否则框的位置不对
<img alt="图 3" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM3studioyolox.png" width="50%"/>  

```py
#Subgraphs visualization
from pathlib import Path
from IPython.display import Markdown as md

subgraph_link =get_svg_path(output_dir) 
for sg in subgraph_link:
    hl_text = os.path.join(*Path(sg).parts[4:])
    sg_rel = os.path.join('../', sg)
    display(md("[{}]({})".format(hl_text,sg_rel)))
```
生成两个.svg网络可视化图的链接

```py
#模型推理
EP_list = ['TIDLExecutionProvider','CPUExecutionProvider']
sess = rt.InferenceSession(onnx_model_path ,providers=EP_list, provider_options=[compile_options, {}], sess_options=so)

input_details = sess.get_inputs()
for i in range(5):#Running inference several times to get an stable performance output
    output = list(sess.run(None, {input_details[0].name : preprocess('WYJ/dog.jpg')}))

from scripts.utils import plot_TI_performance_data, plot_TI_DDRBW_data, get_benchmark_output
stats = sess.get_TI_benchmark_data()
fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(10,5))
plot_TI_performance_data(stats, axis=ax)
plt.show()

tt, st, rb, wb = get_benchmark_output(stats)
print(f'Statistics : \n Inferences Per Second   : {1000.0/tt :7.2f} fps')
print(f' Inference Time Per Image : {tt :7.2f} ms  \n DDR BW Per Image        : {rb+ wb : 7.2f} MB')
```
推理，注意`TIDLCompilationProvider`和`TIDLExecutionProvider`的区别
<img alt="图 2" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM3yoloxs.png" width="80%"/>  

> Statistics : 
  Inferences Per Second   :  104.44 fps
  Inference Time Per Image :    9.57 ms  
  DDR BW Per Image        :   16.22 MB

**Debug**:
+ 将custom-model-onnx 替换为自己的模型后报错，且内核经常挂掉，这不是服务器的问题，而是代码中有错误引发 Jupyter 中的某种内存分配问题并kill内核.（如，索引路径错误，模型不存在，config参数配置错误）—— [E2E:Kills Kernel in Edge AI Studio](https://e2e.ti.com/support/processors-group/processors/f/processors-forum/1214094/tda4vm-inference-with-custom-artifacts-kills-kernel-in-edge-ai-studio/4658432?tisearch=e2e-sitesearch&keymatch=edge%252520ai%252520studio#4658432)
+ 在My Workspace中， 右上角`New > Terminal` 可以打开终端，便于进一步的调试
+ prebuilt-models中的预训练模型每次重启EVM都要先重新解压:
`cd notebooks/prebuilt-models/8bits/`
`find . -name "*.tar.gz" -exec tar --one-top-level -zxvf "{}" \;`


## 4. 板端运行(TDA4VM-SK)
连接SK板进入minicom串口通讯传输模型文件(失败)（若能连网线通过jupyternotebook配置更方便）
通过SD卡配置，object_detection.yaml修改模型，注意索引的模型是一个完整的文件夹：`artifacts  dataset.yaml  model  param.yaml  run.log`
```sh
sudo minicom -D /dev/ttyUSB2 -c on

cd /opt/edgeai-gst-apps/apps_cpp
./bin/Release/app_edgeai ../configs/object_detection.yaml
```   

### 性能评估
```sh
#构建工具
cd /opt/edgeai-gst-apps/scripts/perf_stats
mkdir build && cd build
cmake .. && make 
#运行
cd /opt/edgeai-gst-apps/scripts/perf_stats/build
../bin/Release/perf_stats -l
```