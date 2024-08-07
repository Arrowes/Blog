---
title: Car：相关笔记
date: 2024-07-23 22:12:00
tags:
- 技术
- 深度学习
---
相关笔记
<!--more-->

## 相机标定
[一文带你搞懂相机内参外参(Intrinsics & Extrinsics)](https://zhuanlan.zhihu.com/p/389653208)
[相机标定（Camera calibration）原理、步骤](https://blog.csdn.net/baidu_38172402/article/details/81949447)
相机标定：求出相机的内、外参数，以及畸变参数。
在图像测量过程以及机器视觉应用中，为确定空间物体表面某点的三维几何位置与其在图像中对应点之间的相互关系，必须建立相机成像的几何模型，这些几何模型参数就是相机参数。
1. 由于每个镜头的畸变程度各不相同，通过相机标定可以校正这种镜头畸变矫正畸变，生成矫正后的图像；
2. 根据获得的图像重构三维场景。

摄像机标定过程，可以简单的描述为通过标定板，得到n个对应的世界坐标三维点Xi和对应的图像坐标二维点xi，这些三维点到二维点的转换都可以通过相机内参K ，相机外参 R 和t，以及畸变参数 D ，经过一系列的矩阵变换得到。
相机标定方法有：传统相机标定法、主动视觉相机标定方法、相机自标定法。

> 常用术语
内参矩阵: Intrinsic Matrix
焦距: Focal Length
主点: Principal Point
径向畸变: Radial Distortion
切向畸变: Tangential Distortion
旋转矩阵: Rotation Matrices
平移向量: Translation Vectors
平均重投影误差: Mean Reprojection Error
重投影误差: Reprojection Errors
重投影点: Reprojected Points

![alt text](https://i-blog.csdnimg.cn/blog_migrate/489c65e0ae105cc930f09b778e0ea26e.png)

世界坐标系---(外参)--->相机坐标系---(内参)--->像素坐标系


## BEV bird's-eye-view 鸟瞰图
在自动驾驶领域，BEV 是指从车辆上方俯瞰的场景视图。BEV 图像可以提供车辆周围环境的完整视图，包括车辆前方、后方、两侧和顶部。
BEV 图像可以通过多种方式生成，包括：
+ 使用激光雷达：激光雷达可以直接测量物体在三维空间中的位置，然后将这些数据转换为 BEV 图像。
+ 使用摄像头：摄像头可以通过计算图像的透视投影来生成 BEV 图像。
+ 使用混合传感器：可以使用激光雷达和摄像头的组合来生成 BEV 图像，以获得更精确和完整的视图。

## SLAM
SLAM (Simultaneous Localization And Mapping，同步定位与地图构建)，主要为了解决移动机器人在未知环境运行时定位导航与地图构建的问题。SLAM根据不同的传感器类型和应用需求建立不同的地图。常见的有 2D 栅格地图、2D 拓扑地图、3D 点云地图等。VSLAM（Visual SLAM）一种基于视觉的同步定位与地图构建。


## 车载测试[[2]](https://www.51fusa.com/client/knowledge/knowledgedetail/id/2751.html)：
学术上，严谨的“闭环”概念是在控制论中出现的。较为抽象的定义是：当我们要准确控制一个系统的行为时，我们根据系统的输出来校正对它的输入，以达到较为准确的控制精度。因为系统的输出会导入到输入端的计算，形成一个不断往复的循环，称之为闭环(Closed Loop)。
+ MIL（Hardware-in-the-Loop模型在环）：主要用于在模拟环境中评估控制算法的功能性，确认模型是否能实现设计的需求。这通常在早期开发阶段进行，有助于及早发现设计问题。
+ SIL（Software-in-the-Loop软件在环）：在PC上验证代码实现的功能是否与模型一致。
+ PIL（Processer-in-the-Loop处理器在环）：在目标处理器上验证代码实现的功能是否与模型一致。
+ HIL（Hardware-in-the-Loop硬件在环）：在ECU/EPP/整套系统上验证代码实现的功能是否与需求定义一致。
<img alt="picture 1" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Car-Loop.png" />  


# 数据
## numpy
有些数据集会用更高效的npz格式存取：
NumPy：tofile、fromfile、load 和 save。将NumPy数组存储到文件中，以及从文件中加载数组。
1. tofile
tofile 函数将数组的内容写入到二进制文件中。它不保存数组的形状或数据类型，只是将数据以二进制格式存储。
```py
import numpy as np
# 创建一个示例数组
array = np.array([1, 2, 3, 4, 5])
# 将数组写入到文件中
array.tofile('array.bin')
```
2. fromfile
fromfile 函数从二进制文件中读取数据并将其转换为NumPy数组。它需要指定数据类型和形状，以便正确解析文件中的数据。
```py
# 从二进制文件中读取数据
array = np.fromfile('array.bin', dtype=np.int64)  # 确保 dtype 和文件内容一致
print(array)
```
3. save
save 函数将NumPy数组保存为 .npy 格式的文件，这种格式会保存数组的形状、数据类型等元数据。
```py
# 创建一个示例数组
array = np.array([1, 2, 3, 4, 5])
# 将数组保存到 .npy 文件
np.save('array.npy', array)
```
4. load
load 函数从 .npy 文件中加载数组，恢复保存时的形状和数据类型。
import numpy as np
```py
# 从 .npy 文件中加载数组
array = np.load('array.npy')
print(array)
tofile 和 fromfile 用于处理二进制数据文件，通常不保存数组的元数据（形状和数据类型）。
```
save 和 load 使用 NumPy 的 .npy 格式，保存和加载时会包括数组的形状和数据类型信息。
如果需要保存元数据并且确保数据的完整性，使用 .npy 格式是更好的选择；如果只是处理原始数据，使用二进制格式可能会更高效。

## 数据类型

常用到的图片数据类型包括rgb、bgr、gray、yuv444、nv12、featuremap。
数据输入格式 rgb/bgr/gray/featuremap/yuv444
+ NV12:nv12是常见的yuv420图像格式，通常用于视频编解码中。它将亮度信息（Y）与色度信息（UV）分开存储。(UINT8)
+ RGB: RGB是一种颜色表示方式，将颜色分为红色（R）、绿色（G）、蓝色（B）三个通道。（0-1）(UINT8)
+ BGR:BGR与RGB类似，区别在于通道顺序不同，分别表示蓝色（B）、绿色（G）、红色（R）。OpenCV等库中常用BGR格式表示图像数据，例如图像处理和计算机视觉任务中的输入图像。（0-255）(UINT8)
+ YUV444: YUV444也是一种YUV格式，与NV12不同，它将亮度（Y）、色度蓝（U）、色度红（V）三个通道分开存储，每个通道的采样率都是1:1。在视频编解码或者实时视频处理中，YUV444格式用于保留更多的色彩信息。(UINT8)
+ Gray:灰度图像只有一个通道，每个像素只有一个灰度值，通常在0到255之间。 在图像处理中，灰度图像常用于简化计算或者提取图像中的亮度信息，如人脸识别中的预处理步骤。(UINT8)
+ Feature Map: 特征图是深度学习网络中间层的输出，通常是各种滤波器对输入图像的响应。它们是网络中特征提取的结果。在卷积神经网络（CNN）中，每个卷积层都会输出多个特征图，代表不同的特征，如边缘、纹理等。(float32)

张量：也称Tensor，具备统一数据类型的多维数组，作为算子计算数据的容器，包含输入输出数据。 张量具体信息的载体，包含张量数据的名称、shape、数据排布、数据类型等内容。

数据排布：深度学习中，多维数据通过多维数组（张量）进行存储，通用的神经网络特征图通常使用四维数组（即4D）格式进行保存，即以下四个维度：
>N：Batch数量，如图片的数量。
H：Height，图片的高度。
W：Width，图片的宽度。
C：Channel，图片的通道数。

但是数据只能线性存储，因此四个维度有对应的顺序，不同的数据排布（format）方式，会显著影响计算性能。 常见的数据存储格式有NCHW和NHWC两种,是流行的深度学习框架不同的数据格式[[1]](https://blog.csdn.net/thl789/article/details/109037433?spm=1001.2014.3001.5506)：
NCHW：将同一通道的所有像素值按顺序进行存储。
NHWC：将不同通道的同一位置的像素值按顺序进行存储。
<img alt="picture 0" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Car-NCHW.png" />  