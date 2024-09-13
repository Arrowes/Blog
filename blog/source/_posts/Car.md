---
title: Car：Automobiles
date: 2024-07-23 22:12:00
tags:
- 技术
- 深度学习
---
汽车技术相关笔记
<!--more-->

# 相关概念
## CAN & CANoe
CAN（Controller Area Network, 控制器局域网络）是一种用于嵌入式系统的多主机局部网络串行通信协议，广泛应用于汽车、工业自动化、医疗设备等领域。由博世公司在1980年代为汽车应用开发，目的是使车辆内的电子控制单元（ECU）之间能够以高可靠性和低成本进行通信。
1. 数据传输速度相对较高，可达到1 Mbit/s。
2. 采用差分数据线，抗干扰能力强；
3. 多主通信模式，减少单点通信线束成本；
4. 具有错误侦听的自我诊断功能，通信可靠信较高。
<img alt="picture 2" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/Car-CAN.png" width=50%/>  
两根线CAN-H、CAN-L，所有的CAN节点连接到上面。每个CAN节点包含CAN收发器、CAN控制器、MCU、MCU应用电路(如控制电机)四大部分。
在发送数据时，CAN控制器把要发送的二进制编码通过CAN_Tx线发送到CAN收发器，然后由收发器把这个普通的逻辑电平信号转化成差分信号，通过差分线CAN_High和CAN_Low输出到CAN总线网络。接收数据过程则相反。采用双线差分信号，用两根信号线的电压差来表示逻辑0和逻辑1的传输方式，可以有效地抑制共模干扰
CAN收发器的作用则是把逻辑信号转换为差分信号。 CAN总线分高速CAN和低速CAN，收发器也分为高速CAN收发器（1Mbps）和低速CAN收发器（125Kbps）。低速CAN也叫Fault Tolerance CAN，指的是即使总线上一根线失效，总线依然可以通信。

CANoe是由德国公司Vector Informatik开发的一款强大的开发、测试和仿真工具，主要用于基于CAN总线的系统开发。它支持从早期设计到最终测试的整个开发过程。
  - **仿真与测试**：CANoe可以仿真整个CAN网络，帮助开发者在实际硬件出来之前进行开发和调试。此外，它还支持实时测试，可以连接到物理总线，进行实际环境中的测试。
  - **分析与诊断**：CANoe内置了丰富的分析工具，能够捕捉和分析总线上所有的消息，有助于开发者理解系统行为并排除故障。
  - **扩展性**：CANoe不仅支持CAN，还支持其他总线协议如LIN、FlexRay、MOST以及Ethernet等。这使得它非常适合用于复杂的多总线系统开发。
  - **自动化**：CANoe支持脚本编写和自动化测试，可以通过CAPL（CAN Access Programming Language）语言编写复杂的测试和仿真脚本，提高开发效率。

CAN和CANoe通常用于汽车电子系统的开发与测试。典型的应用包括ECU之间的通信测试、网络负载分析、故障诊断以及对系统行为的仿真验证。CANoe的强大功能使得它在汽车行业内非常受欢迎，特别是在复杂的电子系统开发中扮演着重要角色。

## Bootloader & UDS
单片机正常运行时总是从固定地方取指令，顺序运行，这将对编写程序的人产生巨大的挑战，程序更新时需要使用烧录器等工具烧录，于是有人将程序设计成，由一个程序跳转到另一个程序，这个程序通常称作**Bootloader**，另一个叫做APP。
Bootloader程序常常具有通信接口和擦写内部存储空间的功能，可将需要更新的APP擦除，写入新的APP。有时会设计成相互跳转，技术也是可以实现的。有些为了保证程序不丢失，单独预留出备份区和出厂版本，出现某些错误时可以恢复到出厂版本或使用其他APP均可。
ECU是MCU的一种，专门用在汽车上。ECU经常会用在汽车零部件中，零部件密封性等要求都比较苛刻，并且装车，如果想取下零部件可能需要将车拆解才可以做到，这种行为是不被允许的，成本极高，操作复杂，因此大多主机厂（厂商）要求ECU具有升级功能，并且通过多年的积淀制定了行业标准**UDS**。

UDS（Unified Diagnostic Services，统一诊断服务）诊断协议是用于汽车行业诊断通信的需求规范，由ISO 14229系列标准定义。UDS诊断通信用于建立诊断仪与ECU之间的通信连接，并负责将ECU中的诊断结果输送到诊断仪中。UDS的作用非常广泛，几乎跟随ECU软件开发的全过程。
ECU开发过程要用到它来构建bootloader，上传和下载数据，即软件刷写，控制器Reset；测试时要用它来读写存储，控制外设；产线上，要用它来校准机械件，控制例程，进行下线执行器测试，刷新软件，配置防盗，读取号码，下线配置等。在行驶过程中，要用它来监测各种故障，并记下故障码；4S店里，技师需要读取当前故障、历史故障，读取故障发生时刻环境信息状态，清除故障，判断故障发生点，还可以用来升级ECU程序。
汽车明确规定通过UDS进行更新程序，主机厂要求擦写内部存储的代码不可写入正常代码中。汽车电子中ECU一旦设计完成，装车量产就很难再拆卸并返回零部件供应商完成功能升级或补丁修复。一旦出现售后质量问题，如果召回的话，零部件供应商和整车厂将面临严重的经济损失，因此设计基于CAN总线的ECU在线程序更新Bootloader可以很好的解决这一问题，将零部件供应商和整车厂的损失降低到最小。目前大部分汽车整机厂（主机厂）都要求在其设计的ECU实现Bootloader功能。

## ASPICE
Automotive SPICE（Software Process Improvement and Capability dEtermination） 是由欧洲的主要汽车制造商共同策定的面向汽车行业的流程评估模型， 旨在改善和评估汽车电子控制器的系统和软件开发质量。0. Incomplete process
1. Performed process
2. Managed process
3. Established process
4. Predicatable process
5. Innovating process


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
  YUV420：包含 Y、U 和 V 分量。Y 分量通常是原始灰度数据，U 和 V 分量是下采样后的色彩数据。
YUV422：Y 分量和交替的 U 和 V 分量，通常用于更高的色彩保真度。
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