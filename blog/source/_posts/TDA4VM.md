---
title: TDA4VM
date: 2023-05-10 17:00:00
tags:
- 嵌入式
- 深度学习
---
[Ti官网——TDA4VM](https://www.ti.com.cn/product/zh-cn/TDA4VM)
# TDA4VM数据手册研读
[TDA4VM数据手册](https://www.ti.com.cn/cn/lit/ds/symlink/tda4vm.pdf)
适用于 ADAS 和自动驾驶汽车的TDA4VM Jacinto™ 处理器,具有深度学习、视觉功能和多媒体加速器的双核 Arm® Cortex®-A72 SoC 和 C7x DSP.
Jacinto 7系列架构芯片含两款汽车级芯片：TDA4VM 处理器和 DRA829V 处理器，前者应用于 ADAS，后者应用于网关系统，以及加速数据密集型任务的专用加速器，如计算机视觉和深度学习。
## 整体架构
<img alt="图 2" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM1arch.png" />  

**处理器内核**
* C7x 浮点矢量 DSP，性能高达 1.0GHz、 80GFLOPS、256GOPS：C7x是TI的一款高性能数字信号处理器，其中的浮点矢量 DSP 可以进行高效的信号处理、滤波和计算，大幅提高神经网络模型的计算效率。
*GHz-每秒钟执行10亿次计算，GFLOPS-每秒10亿次浮点运算，GOPS-每秒10亿次通用操作。*
* 深度学习矩阵乘法加速器 (MMA)，性能高达8TOPS (8b)（频率为1.0GHz）：可以高效地执行矩阵乘法和卷积等运算。
*TOPS-每秒万亿次操作，8b-8位精度的运算。*
* 具有图像信号处理器 (ISP) 和多个视觉辅助加速器的视觉处理加速器 (VPAC)：可以高效地执行图像处理、计算机视觉和感知任务。
* 深度和运动处理加速器 (DMPAC)：可以高效地执行深度计算和运动估计等任务。
* 双核 64 位 Arm® Cortex®-A72 微处理器子系统，性能高达 2.0GHz：可以高效地执行复杂的应用程序。
    * 每个双核 Cortex®-A72 集群具有 1MB L2 共享缓存 
    * 每个 Cortex®-A72 内核具有 32KB L1 数据缓存 和 48KB L1 指令缓存
    *L1缓存（一级缓存）：小而快，缓存CPU频繁使用的数据和指令，以提高内存访问速度。L2：大，帮助CPU更快地访问主内存中的数据。*
* 六个 Arm® Cortex®-R5F MCU，性能高达 1.0GHz ：一组小型、低功耗的微控制器单元，用于处理实时任务和控制应用程序
    * 16K 指令缓存，16K 数据缓存，64K L2 TCM（Tightly-Coupled Memory）
    * 隔离 MCU 子系统中有两个 Arm® Cortex®-R5F MCU
    * 通用计算分区中有四个 Arm® Cortex®-R5F MCU
* 两个 C66x 浮点 DSP，性能高达 1.35GHz、 40GFLOPS、160GOPS：另一款高性能数字信号处理器，可以高效地执行信号处理、滤波和计算任务。
* 3D GPU PowerVR® Rogue 8XE GE8430，性能高达 750MHz、96GFLOPS、6Gpix/s：专门用于图形处理的硬件单元，可以实现高效的图形渲染和计算。
*Gpix/s-每秒可以处理10亿像素数*
* 定制设计的互联结构，支持接近于最高的处理能力：处理器内部的互连结构，用于连接各种硬件单元，并支持高效的数据传输和协议。

## DL部分
https://blog.csdn.net/Allen_Spring/article/details/123893928

## TiDL
(TIDL SW Framework
TIDL（TI Deep Learning  Library） 是TI平台基于深度学习算法的*软件生态系统*，可以将一些常见的深度学习算法模型快速的部署到TI嵌入式平台。
TDA4拥有TI最新一代的深度学习加速模块C7x DSP与MMA(Matrix Multiply Accelerator)矩阵乘法加速器，可以运行TIDL进行卷积计算、矩阵变换等基本深度学习算子，从而快速地进行前向推理，得到计算结果。
RTOS SDK 中集成了众多的Demo展示TIDL在TDA4处理器上对实时的语义分割和 SSD 目标检测的能力。如下图2：AVP的demo展示了使用TIDL对泊车点、车辆的检测。
(TIDL SW Framework demo

TIDL当前支持的训练框架有Tensorflow、Pytorch、Caffe等，用户可以根据需要选择合适的训练框架进行模型训练。TIDL可以将PC端训练好的模型导入编译生成TIDL可以识别的模型格式，同时在导入编译过程中进行层级合并以及量化等操作，方便导入编译后的模型高效的运行在具有高性能定点数据感知能力TDA4硬件加速器上。 TIDL提供了一些的工具，如模型导入工具，模型可视化工具等，非常便捷地可以对训练好地模型进行导入。
(图3. TIDL Tools

TIDL Runtime 是运行在TDA4端的实时推理单元，同时提供了TIDL的运行环境，对于input tensor，TIDL TIOVX Node 调用TIDL 的深度学习加速库进行感知，并将结果进行输出。 
(图4. TIDL Runtime

如图5所示，是TIDL的软件框架。在TIDL上，深度学习网络应用开发主要分为三个大的步骤（以TI Jacinto7TM TDA4VM处理器为例）：
(图5. TIDL SW Framework

1. 基于Tensorflow、Pytorch、Caffe 等训练框架，训练模型：选择一个训练框，然后定义模型，最后使用相应的数据集训练出满足需求的模型。
2. 基于TI Jacinto7TM TDA4VM处理器导入模型： 训练好的模型，需要使用TIDL Importer工具导入成可在TIDL上运行的模型。导入的主要目的是对输入的模型进行量化、优化并保存为TIDL能够识别的网络模型和网络参数文件。
3. 基于TI Jacinto7TM SDK 验证模型，并在应用里面部署模型：
    >PC 上验证并部署
    >>在PC上使用TIDL推理引擎进行模型测试。
    >>在PC上使用OpenVX框架开发程序，在应用上进行验证。

    >EVM上验证并部署
    >>在EVM上使用TIDL推理引擎进行模型测试。
在EVM上使用OpenVX框架开发程序，在应用上进行验证

https://e2echina.ti.com/blogs_/b/behindthewheel/posts/tda4

## OpenVX
https://zhuanlan.zhihu.com/p/606584605