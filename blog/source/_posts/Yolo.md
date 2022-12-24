---
title: Yolo：Colab，Config，Ideas
date: 2022-11-27 16:04:02
tags:
- python
- 深度学习
---
## Google Colab
查看GPU
```py
#修改>笔记本设置>GPU
import tensorflow as tf
tf.test.gpu_device_name()

!/opt/bin/nvidia-smi #详情
```
### 基本指令
```py
!unzip /content/yolov5-master.zip -d /content/yolov5-master #解压
%cd /content/yolov5-master #进入：
!pip install -r requirements.txt #安装
%load_ext tensorboard #加载
%tensorboard --logdir=runs/train #执行
!python train.py --rect #训练
!rm -rf /content/yolov5-master/mydata #删除
```

### 云盘
```py
 #指定Google Drive云端硬盘的根目录，名为drive
!mkdir -p drive
!google-drive-ocamlfuse drive

#connect to self drive
from google.colab import drive
drive.mount('/content/drive')
#云训练时还是要将盘里的文件拿出来再开始，否则容易直接断连!
```
续航插件：Colab Alive

## Yolo
### Detect参数
调用电脑摄像头:
``--view-img --source 0``
![图 1](/images/bce32bd51c230995cacfc6c64597d2551a7812527b4d38b5d68746a1c2282a31.png)  

调用手机摄像头：
DroidCamX App，关闭代理 连同一个网：
``http://192.168.0.102:4747/video`` 


### Train参数

``action='store_true' #触发了为true，否则为false 和 default=False 效果一样``

## Ideas
### 数据集
混合数据集：彩色+红外
开源驾驶员行为数据集：StateFarm-distracted-driver-detection
最好输入图像大小设置成和作者一样，输入图像的大小要求必须是32的倍数
针对红外图像优化
数据增强：抖动模糊
扩大数据集 旋转 偏移（数据量不够？）
各集种类分配不均，测试集用不同的人
测试集怎么用
WBF预处理
合成三通道

类别：c0：安全驾驶 c1：玩手机 c2：喝水c3:危险驾驶（双手脱离方向盘） c4：疲劳驾驶（打哈欠）

### anchor
设计——anchor的计算函数autoanchor
![图 2](/images/5fa9f11acfa0f2a400cb70630314bf87fb6670a72a3ddd3ed9a7071a4785d6ad.png)  

### 注意力模块
通道注意力机制
在上采样+concat之后接一个注意力机制可能会更好？
channel-wise比spatial-wise更好用？
backbone结尾使用一个注意力机制？
每个block（如residual block）结尾使用比每个Conv里使用更好？

transformer自注意力模块
CBAM注意力模块:很常用
CA注意力模块:这个模块没做过什么实验，可以做做消融实验，不同位置或者SE+CA结合等等。
SE注意力模块

### 激活函数 activations.py
FRELU激活函数（Funnel Activiation）
我比较看好的激活函数是 DyReLU和meta-AconC这两个激活函数

### 其他
构建一个初始模型：①YoloV5-XL ②图像的分辨率从3K调整为512

融合EfficientNet和YoloV5：主要思想是训练一个图像分类模型(EfficientNet)，它可以实现非常高的AUC(约0.99)，并找到一种方法将其与目标检测模型融合。这被称为“2 class filter”

加权框融合(WBF)后处理：对目标检测模型产生的框进行过滤，从而使结果更加准确和正确的技术。它的性能超过了现有的类似方法，如NMS和soft-NMS。

用5折交叉验证

矩形训练
![图 3](/images/1d0d9b858bfa9a9517a89072d8d201aa8d88dddfbedf616d86295a67bbaa343f.png)  

## Note
### 操作
safe重新标注√
通道压缩 *
Resize × 保持原始图像比例调整大小更安全
删mosic
删卷积层
把通道扩展图像增强工作流加入算法？
### 笔记
数据集扩大时，若显存不足，需要调小batchsize或分辨率
可以从小模型中学到的权重开始，对更大模型进行训练

大的batch_size往往建议可以相应取大点learning_rate, 因为梯度震荡小，大learning_rate可以加速收敛过程，也可以防止陷入到局部最小值，而小batch_size用小learning_rate迭代，防止错过最优点，一直上下震荡没法收敛

参数调优过程一般要反复多次进行微调<->训练<->测试，最终得出符合需求/较优的HyperPara，应用在项目中	``data/hyps/hyp.finetune.yaml``

