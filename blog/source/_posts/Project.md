---
title: Project：多个项目汇总
date: 2023-02-15 16:59:22
tags:
- 总结
- 技术
---
车位检测算法开发与部署，FEY-YOLOv7，CEAM-YOLOv7，基于 STM32 的智能空压机状态监测系统，SE智厨，风功率密度便携式测量仪。
<!--more-->

# 目标检测算法开发与TDA4VM-SK板端部署
## 驾驶员行为检测算法
论文《基于YOLOv8的驾驶员行为检测算法及其实现》
项目地址：[DMS-YOLOv8](https://github.com/Arrowes/DMS-YOLOv8)

整体框架为之前两篇论文的整合：
+ 基于通道扩展与注意力机制的YOLOv7驾驶员分心行为检测
[CEAM-YOLOv7: Improved YOLOv7 Based on Channel Expansion and Attention Mechanism for Driver Distraction Behavior Detection](https://ieeexplore.ieee.org/document/9980374/metrics#metrics)
项目地址：[CEAM-YOLOv7](https://github.com/Arrowes/CEAM-YOLOv7)
+ 基于面部小目标动态追踪的YOLOv7驾驶员疲劳检测
[A Driver Fatigue Detection Algorithm Based on Dynamic Tracking of Small Facial Targets Using YOLOv7](https://www.jstage.jst.go.jp/article/transinf/E106.D/11/E106.D_2023EDP7093/_article)
项目地址：[FEY-YOLOv7](https://github.com/Arrowes/FEY-YOLOv7)

此外，加入算法部署实现部分，基于实习期间对TDA4的研究：
+ [TDA4①：SDK, TIDL, OpenVX](https://wangyujie.space/TDA4VM/)
+ [TDA4②：环境搭建、模型转换、Demo及Tools](https://wangyujie.space/TDA4VM2/)
+ [TDA4③：YOLOX的模型转换与SK板端运行](https://wangyujie.space/TDA4VM3/)
+ [TDA4④：部署自定义模型](https://wangyujie.space/TDA4VM4/)

训练数据：[exp](https://docs.qq.com/sheet/DWmV1TnhIdlBodW1C?tab=BB08J2&u=d859dabcd86a47b181e758b366a48fdc)
开发日志：[log](https://github.com/Arrowes/DMS-YOLOv8/blob/main/README.md)

论文框架
<img alt="图 6" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project_dms_framework.png" />  


### 部署流程
为验证本文提出算法的有效性，实现驾驶员危险行为检测算法的部署与应用，本研究依托于TDA4VM硬件平台和德州仪器（Texas Instruments, TI）软件平台，构建了实验平台，以将开发出的驾驶员危险行为检测算法有效部署至德州仪器的TDA4VM-SK开发板。此过程包括对经训练得到的模型进行的修改和量化，利用TI软件平台进行模型的转换，以及算法在实际车辆中的部署应用，并对算法的性能进行深入分析。
本研究选用TI提供的TDA4VM Edge AI Starter Kit (SK) 硬件开发平台进行算法的部署与实验，TDA4VM-SK是一款专为边缘人工智能应用设计的低成本、小尺寸的开发板，以大约20W的功耗提供高达8TOPS的深度学习算力。这款开发板搭载TDA4VM处理器，不仅提供了卓越的深度学习性能，而且能实现低功耗下的硬件加速，非常适合需要高效率边缘AI计算的场景。
TI部署相关修改：[DMS-YOLOv8: TI](https://github.com/Arrowes/DMS-YOLOv8/tree/main/TI)
```sh
#运行训练：
python -m yolox.tools.train -n yolox-s-ti-lite -d 0 -b 64 --fp16 -o --cache
#导出：
python3 tools/export_onnx.py --output-name yolox_s_ti_lite0.onnx -f exps/default/yolox_s_ti_lite.py -c YOLOX_outputs/yolox_s_ti_lite/best_ckpt.pth --export-det
#onnx推理：
python3 demo/ONNXRuntime/onnx_inference.py -m yolox_s_ti_lite0.onnx -i test.jpg -s 0.3 --input_shape 640,640 --export-det

#onnx拷贝到tool/models,/examples/osrt_python改model_configs的模型路径和类别数量
#tools根目录运行
./scripts/yolo_compile.sh
#模型结果在model-artifacts/模型名称

#挂载SD卡，model_zoo新建模型文件夹，拷贝模型
CEAM-YOLOv7/
├── artifacts
│   ├── allowedNode.txt
│   ├── detections_tidl_io_1.bin
│   ├── detections_tidl_net.bin
│   └── onnxrtMetaData.txt
├── dataset.yaml    #改
├── model
│   └── yolox_s_ti_lite0.onnx
├── param.yaml  #拷贝然后改
└── run.log

#dataset.yaml
categories:
- supercategory: distract
  id: 1
  name: cup
- supercategory: distract
  id: 2
  name: hand
- supercategory: distract
  id: 3
  name: phone
- supercategory: distract
  id: 4
  name: wheel

#param.yaml（copy from model_zoo_8220）
threshold: 0.2  #好像没用
model_path: model/yolox_s_ti_lite0.onnx

#rootfs/opt/edgeai-gst-apps/configs改yolo.yaml

#SD卡上板
sudo minicom -D /dev/ttyUSB2 -c on
#root登录，ctrl+A Z W换行，运行
cd /opt/edgeai-gst-apps/apps_cpp && ./bin/Release/app_edgeai ../configs/yolo.yaml
```
<img alt="图 2" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/PaperLogDeploy.gif" width="100%"/> 

<img alt="图 5" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project_DMS_car.gif" width='60%'/>  


## 车位线检测算法
[泊车辅助系统：智能泊车辅助 (valeo.com)](https://www.valeo.com/cn/catalogue/cda/%E6%B3%8A%E8%BD%A6%E8%BE%85%E5%8A%A9%E7%B3%BB%E7%BB%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88/)
[Arrowes/general\_parking\_slot\_detection (github.com)](https://github.com/Arrowes/general_parking_slot_detection)

<img alt="图 44" src="https://pic3.zhimg.com/80/v2-0d7c0fec251f5a24d4c24e4ffe7fe642_720w.webp" width='100%'/>  

<img alt="图 44" src="https://pic4.zhimg.com/80/v2-d9ffc679408c09c6ec4a77e74447eb8b_720w.webp" width='100%'/>  

基于YOLOX网络架构提取车位关键点位，实现车位的抽象表示
并部署于TDA4VM车载嵌入式板端

车位线准确、快速的识别是实现自动泊车系统功能的前提，但由于车位类型多样、光照条件多变、车位标线模糊、树叶或冰雪等物盖住停车线等诸多因素影响，现有应用的车位线识别方法在复杂环境下识别率较低、偏差较大，主流识别方法仅达60%-70%；而且识别速度较慢，基本未达到30 FPS的实时检测标准，严重影响自动泊车系统的推广应用。本项目将致力于实时识别车位的轻量化深度学习模型研究，借鉴高效、多尺度特征融合的YOLOv8主干网络结构，将车位角点、车位线与车位占用情况等多种特征相结合，同时把车位线抽象为角点间的线段，以避免车位线本身形态的影响，拟实现在复杂环境下高准确性和目标联合的车位线识别；随后，基于轻量化的思想对深度学习模型网络结构进行优化设计，引入Coordinate Attention (CA) 注意力机制模块，并优化损失函数，提高车位识别速度与精度，减少模型算力消耗；最后，为验证算法的有效性，研究该车位线识别算法在车载嵌入式移动终端的部署策略，通过对模型的剪枝、量化与转换，实现车位识别算法的低成本应用，推动自动泊车系统的智能化应用水平进一步提高。

<img alt="picture 4" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project_slot_project.png" />  

本项目的特色与创新之处包括以下几个方面：
1.	深度学习模型架构研究与优化：在车位识别的深度学习模型架构研究中，提出了一种全新的车位线特征提取网络结构，以提取复杂的道路车位线特征，将特征应用于设计的创新的车位线抽象算法中，把车位线抽象为角点间的线段，创新性的解决了车位形状多变、道路环境复杂的问题。
2.	车位识别模型优化设计：引入了CA注意力机制等模型优化方法，进行了数据集增强和消融实验，能有效提高车位识别的准确性和鲁棒性。此外，还注重模型的轻量化，利用剪枝算法减少模型的计算量，提高检测速度的同时为下一步的部署实现提供了可能，
3.	车位识别模型部署策略：采用了量化和转换等步骤进行模型调优，采用了ONNX模型在板端完成模型验证，拟选用TDA4硬件平台，确定了部署策略和硬件加速方法。本项目重视模型的工业应用，关注于深度学习模型应用于车载终端的实际可行性，有望推动相关领域的发展。
总之，本项目在深度学习模型架构研究、特征提取、数据处理、模型轻量化和部署等多个方面都展现了创新性，有望为道路车位识别领域带来重要的进展和改进。

<img alt="picture 3" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Projectslot.png" />

# FEY-YOLOv7：基于面部小目标动态追踪的驾驶员疲劳检测算法
+ SCI四区论文：[A Driver Fatigue Detection Algorithm Based on Dynamic Tracking of Small Facial Targets Using YOLOv7](https://search.ieice.org/bin/summary_advpub.php?id=2023EDP7093&category=D&lang=E&abst=)
+ Github: [FEY-YOLOv7](https://github.com/Arrowes/FEY-YOLOv7)

## 项目简介
在车辆安全技术中，驾驶员疲劳检测应用广泛，其准确性和实时性至关重要。在本文中，我们提出了一种基于人脸眼睛和嘴巴打哈欠动态追踪的YOLOv7驾驶员疲劳检测算法，其中YOLOv7针对眼睛和嘴巴小目标进行了优化，结合PERCLOS算法，称为FEY-YOLOv7。在YOLOv7中插入Coordinate Attention(CA)模块，将重点放在坐标信息上，以提高动态追踪的准确性；增加一个小目标检测头，使网络能够提取小目标特征，增强了对眼睛、嘴巴的检测性能，提高了检测的精度。对YOLOv7的网络架构进行了显著简化，以减少计算量，提高检测速度。通过提取视频中每一帧驾驶员睁眼、闭眼、张嘴、闭嘴四种面部行为状态，利用 PERYAWN 判定算法对驾驶员状态进行标注及检测。在RGB-infrared Datasets上使用Guided Image Filtering图像增强算法，并进行混合训练及验证，验证结果表明，FEY-YOLOv7的mAP达到了0.983，FPS达到101，说明FEY-YOLOv7在准确率和速度上都优于最先进的方法，为基于图像信息的驾驶员疲劳检测提供了一个有效和实用的方案。

## 技术点
<img alt="picture 2" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/ProjectFEY-network.png" />  

### CA注意力机制
CA模块在空间维度上自适应地对不同位置的特征进行加权，从而使得模型更加关注重要的空间位置，不仅捕获跨通道信息，还捕获方向感知和位置敏感信息，这有助于模型更准确地定位和识别感兴趣的对象。 
具体来说，Coordinate Attention引入了一个全局自注意力模块，该模块可以对输入特征图的每个位置进行自适应的加权。该加权由两个步骤完成：Coordinate信息嵌入和Coordinate Attention生成。
1.	通过两个全局平均池化操作，分别计算输入特征图在通道维度上和空间维度上的均值。这两个均值分别表示了输入特征图在每个通道和每个空间位置的重要性。
2.	将通道维度上的均值与空间维度上的均值进行相乘，得到一个权重矩阵，该权重矩阵表示了每个位置在通道和空间维度上的重要性，并将其应用于输入特征图中。最终，每个位置的特征将与其在通道和空间维度上的重要性相关联，从而使得模型更加关注重要的空间位置。
<img alt="图 43" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-CA.png" width='38%'/>  

### PERYAWN疲劳评估算法
$PERYAWN = E/(N - w · M)$

其中，E是闭眼帧数，N是单位时间内总帧数，M代表“张嘴”的帧数，w是加权因子。为了量化四个驾驶员特征（睁眼、闭眼、张嘴和闭嘴）的检测结果，我们采用公式4和5，并将权重w设置为0.15。基于本研究中数据集标签的实际情况，我们确定当单位时间内的PERYAWN值超过0.20时，驾驶员处于疲劳状态。

为了更直观地评估该算法在检测驾驶员状态方面的有效性，我们使用提出的PERYAWN参数作为定量指标来评估多个10秒的测试视频（每秒24帧）。如下图所示，如果PERYAWN值超过0.2，则将驾驶员分类为疲劳状态。如果该值超过0.5，则认为驾驶员处于严重疲劳状态。我们将检测到的状态与驾驶员的实际状态进行比较，并计算准确性。除了一些视频检测结果出现偏差外，所有结果都能够准确检测到三种状态：'正常'，'疲劳'和'严重疲劳'。
<img alt="图 44" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-PERYAWN.png" width='60%'/>  

### 数据增强
+ 引导滤波算法
引导滤波就是基于局部线性回归，用引导图像的信息来指导输入图像的滤波过程，通常用于图像处理中的去噪、平滑、增强等任务。
引导滤波器的基本思想是，对于输入图像p中的每个像素，使用引导图像I中与该像素相关的信息来进行滤波, 引导滤波器将输入图像p的每个像素表示为一个线性组合, 利用线性岭回归模型对线性系数ak,bk进行求解；本文利用原图的灰度图实现了图像的细节增强，优化了对眼睛、嘴巴的目标检测效果，实现过程如下图：
<img alt="图 45" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-GuidedImageFilter.png" width='80%'/>  

+ Static Crop+Mosaic预处理
对图像进行35-59% Horizontal Region, 25-75% Vertical Region的拆分，并进行4合1的Mosaic拼接，间接实现了面部特征的放大，将数据集重点偏向眼睛、嘴巴这类小目标，优化了算法对小目标的检测性能和鲁棒性。
<img alt="图 46" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-Mosaic.png" width='80%'/>  


## 实现效果
<img alt="图 48" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-FEYdetectResult.png" width='60%'/>  

<img alt="图 47" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project-FEYresult.png" width='80%'/>  

# CEAM-YOLOv7：基于通道扩展注意机制的改进YOLOv7驾驶员行为检测算法
+ [CEAM-YOLOv7:Improved YOLOv7 Based on Channel Expansion Attention Mechanism for Driver behavior detection](https://ieeexplore.ieee.org/document/9980374/metrics)
+ Github: [CEAM-YOLOv7](https://github.com/Arrowes/CEAM-YOLOv7)
## 项目简介
驾驶员的不规范行为易引发交通事故，因此，为规范驾驶员行为，减少交通事故的发生，对驾驶员行为进行检测至关重要。本文提出了一种改进的目标检测模型CEAM-YOLOv7，该模型利用GAM注意力模块和通道扩展数据增强算法来减少特征图生成过程中的信息丢失，提高检测精度。将YOLOv7架构的Backbone和Head部分加入GAM注意力模块，减少信息损失的同时放大全局维度交互特征，同时，使用剪枝算法，在保证实时检测的前提下，提高了YOLOv7网络的检测性能。此外，使用更适合于实际驾驶场景的红外图像数据集进行训练，结合inversion和CLAHE图像增强方法，提出了一种基于通道扩展的红外图像数据增强算法，改善针对红外图像的目标检测效果。经大量实验结果表明，与YOLOv7相比，CEAM-YOLOv7的map提升了20.26%，FPS达到了156，本文方法的有效性和优越性得到了验证。 
## 技术点
### 通道扩展算法
![图 1](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project1.png)  

```
inversion:通过域迁移的思想使得网络能够更加适应处理后的红外图像。一般用于目标检测所用的 RGB 图像都是白天所摄，通常情况是背景较亮，目标较暗。但驾驶员环境通常较暗，且红外图像成像为辐射特性，背景辐射较弱而目标辐射较强，因此选用 inversion 操作；
CLAHE:由于红外图像的对比度比较低，其灰度分布通常都是分布在较窄的区域，采用自适应直方图均衡化能够使红外图像的灰度分布更均匀，增强对比度的同时抑制噪声，从而达到增加图像细节信息的作用。
```
### GAM注意力机制
![图 2](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project2.png) 
GAM是一种能够捕捉所有三个维度的显著特征的注意机制，采用了CBAM中的顺序通道-空间注意机制，对通道-空间注意力子模块进行了重新设计，通道注意力子模块使用3D置换来跨三维保持信息，使用用两层感知器MLP（Multi-Layer Perceptron）放大跨维信道-空间相关性；空间注意力子模块采用了两个卷积层进行空间信息融合。由此，通过减少信息丢失和放大全局交互特征来提高深度神经网络的性能，提高了对于红外图像目标的识别能力，在识别速度和精度之间进行了有效的权衡，也与数据增强处理中的通道扩展算法相对应。
### 网络架构
![图 3](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project3.png)  

## 实现效果
 ![图 4](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project4.png)  

![图 5](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project5.png)  

# [基于 STM32 的智能空压机状态监测系统](https://oshwhub.com/Arrows/esp-kong-zhi-ji-dian-qi)
2020-2021
优秀毕设
## 项目简介
空气压缩机是一种把气体压缩，从而提升气体压力的设备，使用范围广，其运行时的稳定性与可靠性将直接影响到企业生产时的生命与财产安全。本设计以往复式活塞压缩机为研究对象，基于因特网实现了对空压机运行状态的实时监控。
## 技术点
本文所设计的监控系统以STM32F103C8T6单片机为主控芯片，利用BMP280温压传感器及ADXL335 三轴加速度传感器分别测得温度、气压以及XYZ三轴方向上的振动信号，实现了空压机工作数据的采集，并通过OLED显示屏显示，以便现场工作人员监测并及时检修；同时，用ESP8266 WiFi模块，将数据上传至阿里云，通过因特网传送至手机端及PC端，实现了运行状态的实时监测，为避免空压机状态异常进而运行失控造成严重后果，本设计增加了状态异常报警、停机功能，同时工作人员在手机app及PC端网页上可进行开、关机操作。本设计可基本实现对空气压缩机的实时状态监控功能。
## 系统设计
![图 6](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project6.png)  
### 电路设计
![图 7](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project7.png)  
### 程序设计
![图 8](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project8.png)  
## 实物制作
![图 9](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project9.png)  

# SE智厨：一种新型循环节能与安全防控的厨房智能仪器
2019-2020
湖南科技大学第六届“互联网+”大学生创新创业大赛 铜奖
## 项目简介
一款循环节能与安全防控的厨房智能产品，本装置利用炒菜或用火过程中炉火与外界的温差以及用太阳能板来发电储能在蓄电池中，以达到节约能源的目的；以STC15F2K60S2为主控，利用烟雾传感器MQ-2和温度传感器DS18B20的配合使用，监测现场火灾、煤气泄漏、漏电触电等厨房事故，并且该设备能对事故进行自动化处理，避免危害安全。
## 技术点
```
安全监测：
（1）利用烟雾传感器MQ-2和温度传感器DS18B20的配合使用,当达到预警设定时，立即进入报警处理，并通过电子阀门打开水闸开关，实现灭火处理；
（2）实时检测家中煤气是否泄漏，当出现煤气泄漏时，微处理器会立刻控制煤气电子阀门的关闭，通过GSM无线通信模块向用户发送短信，传送当前煤气状态以及厨房是否发生火灾状态，预防事故发生。
（3）当厨房插座存在漏电或人触电时，能及时将电源切断。
节能环保：
（1）系统能够将太阳能电压和温差发电输出的电压经过升压、降压、稳压电路稳定输出15V，并通过充电电路存储在蓄电池中，给厨房智能控制系统和节能灯等工作，如果电压不足则自动切换到交流电供电。
（2）当用户使用炉火时，通过烟雾传感器检测油烟的浓度并实现排风扇的无级调速控制以达到节省用电效果；
（3）当厨房内温度较高时，系统根据DS18B20温度传感器检测的温度高低实现电风扇的无级调速，为厨房工作人员降温，减少能源的浪费；
（4）厨房内通过光敏传感器与红外传感器相结合检测厨房的光线强度和是否有人，当厨房较暗时，则自动调节LED照明亮度，以达到节约能源的目的，同时延长设备的使用寿命。
```
## 系统设计
系统由K60主控模块、温差发电系统、太阳能发电系统、烟雾检测模块、温度检测模块、红外检测模块、电流检测模块、升压降压稳压模块、语音模块、驱动模块、电压检测模块、GSM模块组成。
![图 10](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project10.png)  

### 电路设计
![图 11](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project11.png)  

### 实物制作
![图 12](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project12.png)  

# 地球仓
2019-2020
实用新型专利：一种自适应旅居设备及控制系统
## 项目简介
地球仓，一种高度智能化的房子，灵活的用于景区休闲娱乐。本设计基于单片机控制地球仓的底盘控制系统，主要模拟地球仓遇到外界环节环境变化时地球仓底盘自动变化的工程。
## 技术点
根据温度传感器和光敏传感器实时采集的数据，STC89C52 芯片根据温度传感器DS18B20和灵敏型光敏电阻传感器的信号来做出反应。当光线过于强烈，LED灯就会亮起并输入一个脉冲信号给STC89C52让步进电机转动带动底盘旋转 180 度；而温度达到一定值时，也会给STC89C52输入脉冲信号，使步进电机转动带动底盘旋转 90 度，同时数码管也会显示温度值。就是经过这样的底盘旋转控制，让地球仓适应更复杂的自然环境。
### 电路设计
 ![图 13](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project13.png)  
### 实物制作
<img alt="图 14" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project14.png" width='60%'/>  

# 风功率密度便携式测量仪
2018-2019
第九届全国大学生电子商务“创新、创意及创业”挑战赛 校赛一等奖
第五届湖科大互联网+大赛 院赛金奖
“创青春”湖南科技大学大学生创业大赛 银奖
## 项目简介
本项目成果是一种新型风功率密度测量仪器，主要应用于风电场风功率密度测量，以实现风能电能的准确转化，提高电网运行的稳定性。传统风功率测量系统仍然停留在运用测风塔、雷达测出风速，然后将风速代入建模公式中计算得出结果，其过程繁琐，成本高昂。因此，团队成员在海内外知名教授的指导下设计出直接测量风功率的仪器，在将降低测量成本、提高预测准确度、增大使用便携度等方面具有独具一格的优势。
```
传统测风方法
超声波测风：运用超声波测风无法启用风速，不受环境的影响，测量精度高、性能稳定，测量对象为风速、风向、温度，但无法直接计算出风功率，必须将风速带入一系列的数学建模公式中计算得出，过程复杂，耗时漫长。
雷达测风：一次雷测风机具有足够大的发射频率，耗电量大，但是探测距离较近；距离远时回波信号弱；二次雷达具有探测精度高、采样速率快、使用方便等特点，但仍然无法直接测量出风功率。
激光测风：激光测风虽然测量精度高、范围广，且测量过程不受天气的影响，但它目前技术仅仅停留在测量风速水平上，依旧无法打破新型技术壁垒-----直接测量出瞬时风功率。
```
## 技术点
本实用新型专利是一种集风电场的风速、气压、温度和湿度的综合型风能功率密度便携式测试仪，用于风电场风电机组服役环境下风能功率密度的测量。该风能功率密度测试仪通过测量大气压中的压力、温度、湿度以及风速信号后，由51单片机计算出空气密度，再结合风速计算得到风能功率密度。

技术创新：
> ①面向工程实际问题，直接输出风功率密度
②数据存储，有利于风电资源评估
③提出剔除风速瞬态扰动的有效功率密度处理算法，提高测量准确性
④操作简单、功耗较低，可随身携带使用或固定在风电场某处
## 信号采集与处理
### 信号采集
测试仪所需要采集的信号为风速信号、大气压力信号、温度信号以及湿度信号，分别利用NPN脉冲型RS485风速传感器(±（0.2+0.03v）m/s)、BMP5大气压力传感器(±20Pa)、SHT21温湿度传感器(±0.3℃)(±2%RH)实现测量。
风速传感器采用输出为电压信号的机械式传感器，测量范围达到风电场风速变化的要求，需要信号调理电路输入到中央处理模块。大气压力、温湿度采用输出为数字量的模块化传感器对信号进行测量，可直接输入至单片机中进行处理。
### 信号调理
```
①幅值调理电路：由于风速传感器输出的电压信号比较微弱，无法满足后续测试的工作要求，利用运算放大器以及电阻构成的放大网络对输出信号进行幅值调理，将其幅值放大以便满足模-数转换电路的要求。
②信号滤波电路：由于环境以及人为影响，在输出的电压信号中，常伴有不必要的噪声信号。利用运算放大器和电阻等元件组成的有源滤波网络，对输出电压信号中的噪声信号进行剔除。
③模-数转换电路：单片机所能处理的是数字量，而风速传感器输出为模拟电压量。因此，设置一个模-数转换电路，将对应的模拟量转换成数字量并输入至单片机中，对其进行处理及显示。
```
### 信号处理
![图 15](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project15.png)  

## 电路设计
![图 16](https://raw.gitmirror.com/Arrowes/Blog/main/images/Project16.png)  

<img alt="图 47" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project17.png" width='60%'/>  
 
## 实物制作
<img alt="图 18" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project18.png" width='70%'/>  

<img alt="图 19" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Project19.png" width='70%'/>  