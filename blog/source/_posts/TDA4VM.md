---
title: TDA4VM, TIDL, OpenVX
date: 2023-05-10 17:00:00
tags:
- 嵌入式
- 深度学习
---
[TDA4VM官网](https://www.ti.com.cn/product/zh-cn/TDA4VM)， [TI e2e论坛](https://e2e.ti.com/support/processors-group/processors/f/processors-forum)
# TDA4VM芯片数据手册研读
[TDA4VM数据手册](https://www.ti.com.cn/cn/lit/ds/symlink/tda4vm.pdf)
适用于 ADAS 和自动驾驶汽车的TDA4VM Jacinto™ 处理器,具有深度学习、视觉功能和多媒体加速器的双核 Arm® Cortex®-A72 SoC 和 C7x DSP.
Jacinto 7系列架构芯片含两款汽车级芯片：TDA4VM 处理器和 DRA829V 处理器，前者应用于 ADAS，后者应用于网关系统，以及加速数据密集型任务的专用加速器，如计算机视觉和深度学习。二者都基于J721E平台开发。
## 整体架构
<img alt="图 3" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMedit.jpg" />  

## 处理器内核
* **C7x 浮点矢量 DSP，性能高达 1.0GHz、 80GFLOPS、256GOPS**：C7x是TI的一款高性能数字信号处理器，其中的浮点矢量 DSP 可以进行高效的信号处理、滤波和计算，大幅提高神经网络模型的计算效率。
*GHz-每秒钟执行10亿次计算，GFLOPS-每秒10亿次浮点运算，GOPS-每秒10亿次通用操作。*

* **深度学习矩阵乘法加速器 (MMA)，性能高达8TOPS (8b)（频率为1.0GHz）**：可以高效地执行矩阵乘法和卷积等运算。
*TOPS-每秒万亿次操作，8b-8位精度的运算。*

* **具有图像信号处理器 (ISP) 和多个视觉辅助加速器的视觉处理加速器 (VPAC)**：可以高效地执行图像处理、计算机视觉和感知任务。

* **深度和运动处理加速器(DMPAC)**：可以高效地执行深度计算和运动估计等任务。

* **双核 64 位 Arm® Cortex®-A72 微处理器子系统，性能高达 2.0GHz**：可以高效地执行复杂的应用程序。
    * 每个双核 Cortex®-A72 集群具有 1MB L2 共享缓存 
    * 每个 Cortex®-A72 内核具有 32KB L1 数据缓存 和 48KB L1 指令缓存
*L1缓存（一级缓存）：小而快，缓存CPU频繁使用的数据和指令，以提高内存访问速度；L2：大，帮助CPU更快地访问主内存中的数据。*

* **六个 Arm® Cortex®-R5F MCU，性能高达 1.0GHz**：一组小型、低功耗的微控制器单元，用于处理实时任务和控制应用程序
    * 16K 指令缓存，16K 数据缓存，64K L2 TCM（Tightly-Coupled Memory）
    * 隔离 MCU 子系统中有两个 Arm® Cortex®-R5F MCU
    * 通用计算分区中有四个 Arm® Cortex®-R5F MCU

* **两个 C66x 浮点 DSP，性能高达 1.35GHz、 40GFLOPS、160GOPS**：另一款高性能数字信号处理器，可以高效地执行信号处理、滤波和计算任务。

* **3D GPU PowerVR® Rogue 8XE GE8430，性能高达 750MHz、96GFLOPS、6Gpix/s**：专门用于图形处理的硬件单元，可以实现高效的图形渲染和计算。
*Gpix/s-每秒可以处理10亿像素数*

* **定制设计的互联结构，支持接近于最高的处理能力**：处理器内部的互连结构，用于连接各种硬件单元，并支持高效的数据传输和协议。


# SDK
Download：[PROCESSOR-SDK-J721E](https://www.ti.com.cn/tool/cn/PROCESSOR-SDK-J721E)，提供Linux SDK、QNX SDK和RTOS SDK
Document：[Linux SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-rt-jacinto7/08_06_00_11/exports/docs/devices/J7/linux/index.html)，[RTOS SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/index.html)（[Processor SDK Linux for Edge AI](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-sk-tda4vm/latest/exports/docs/index.html#)，[~~QNX SDK~~](https://software-dl.ti.com/jacinto7/esd/processor-sdk-qnx-jacinto7/08_06_00_07/exports/docs/index.html)）

*To run many of the demos in this SDK, the companion Processor SDK Linux(PSDK_Linux) for J721E also needs to be downloaded separately, together form a multi-processor software development kit for the J721E platform*


## Processor SDK RTOS (PSDK RTOS) 
**PSDK RTOS Block Diagram**
<img alt="图 4" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMSDKedit.png" />  

**Hardware**
Evaluation Module (EVM):Ti 推出的硬件开发板。用于快速原型设计和新产品开发，可以帮助开发人员在短时间内实现复杂的嵌入式系统功能, [EVM Setup for J721E](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/evm_setup_j721e.html)
JTAG:debug execution, load program via JTAG-*No Boot Mode*
uart:prints status of the application via the uart terminal.
**Software**
Recommend IDE:Code Composer Studio (CCS), [CCS Setup for J721E](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/ccs_setup_j721e.html#ccs-setup-j721e)
[**Demos**](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/getting_started_j721e.html#demo-applications)
Prebuilt Demos:直装
Build Demos from Source: Linux, Windows(很少)

### [SDK Components](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/sdk_components_j721e.html#vxlib)
The following table lists some of the top-level folders in the SDK package and the component it represents.

Folder|Component|User guide
------|---------|----------
vision_apps|Vision Apps|[Demos](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/vision_apps/docs/user_guide/index.html)
pdk_jacinto_*|Platform Development Kit|[PDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/pdk_jacinto_08_06_00_31/docs/pdk_introduction.html#Documentation)
~~mcusw~~|MCU Software|[MCU SW](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/mcusw/mcal_drv/docs/drv_docs/index.html)
tidl_j7_*|TI Deep learning Product|[TIDL](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/index.html)
tiovx|TI OpenVX|[TIOVX](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/index.html)
tiadalg|TI Autonomous Driving Algorithms|[TIADALG](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiadalg/TIAutonomousDrivingAlgorithmLibrary_ReleaseNotes.html#Documentation)


## TIDL
[TI Deep Learning Product User Guide](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/index.html)

TIDL（TI Deep Learning Library） 是TI平台基于深度学习算法的*软件生态系统*，可以将一些常见的深度学习算法模型快速的部署到TI嵌入式平台。TIDL is a fundamental software component of [TI’s Edge AI solution](https://www.ti.com/edgeai).

TI's Edge AI Tools：
+ [Edge AI Studio](https://dev.ti.com/edgeai/):Integrated development environment for development of AI applications for edge processors.（需授权）
+ [Model zoo](https://github.com/TexasInstruments/edgeai-modelzoo):A large collection of pre-trained models for data scientists,其中有[YOLO例程](https://github.com/TexasInstruments/edgeai-modelzoo/tree/master/models/vision/detection)
+ [Training and quantization tools](https://github.com/TexasInstruments/edgeai):make DNNs more suitable for TI devices.
+ [Edge AI Benchmark](https://github.com/TexasInstruments/edgeai-benchmark):perform accuracy and performance benchmark.
+ [Edge AI TIDL Tools](https://github.com/TexasInstruments/edgeai-tidl-tools#edgeai-tidl-tools):used for model compilation on X86. Artifacts from compilation process can used for Model inference. Model inference can happen on X86 machine (host emulation mode) or on development board with TI SOC. 
<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/dnn-workflow.png">

TIDL当前支持的训练框架有Tensorflow、Pytorch、Caffe等，用户可以根据需要选择合适的训练框架进行模型训练。TIDL可以将PC端训练好的模型导入编译生成TIDL可以识别的模型格式，同时在导入编译过程中进行层级合并以及量化等操作，方便导入编译后的模型高效的运行在具有高性能定点数据感知能力TDA4硬件加速器上。 TIDL提供了模型导入工具，模型可视化工具等，非常便捷地可以对训练好地模型进行导入。

RTOS SDK 中集成了众多的Demo展示TIDL在TDA4处理器上对实时的语义分割和 SSD 目标检测的能力。如下图,	Vision Apps User Guide 中 [AVP Demo](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/07_02_00_06/exports/docs/vision_apps/docs/user_guide/group_apps_dl_demos_app_tidl_avp3.html) 的展示了使用TIDL对泊车点、车辆的检测。[^1]
[^1]:[当深度学习遇上TDA4](https://e2echina.ti.com/blogs_/b/behindthewheel/posts/tda4), [Deep Learning with Jacinto™ 7 SoCs: TDA4x](https://www.ti.com.cn/cn/lit/ml/slyp667/slyp667.pdf)

<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/07_02_00_06/exports/docs/vision_apps/docs/user_guide/app_tidl_avp2_output.jpg">



### TIDL-RT(TIDL Runtime)
TIDL Runtime 是运行在TDA4端的实时推理单元，同时提供了TIDL的运行环境，对于input tensor，TIDL TIOVX Node 调用TIDL 的深度学习加速库进行感知，并将结果进行输出。 特点：互用性、高精度、高性能、可扩展。


<img src="https://e2echina.ti.com/resized-image/__size/320x240/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-78/pastedimage1655446934974v4.png">

如图所示是TIDL的软件框架。在TIDL上，深度学习网络应用开发主要分为三个大的步骤（以TI Jacinto7TM TDA4VM处理器为例）: [^2]
[^2]:[基于 Pytorch 训练并部署 ONNX 模型在TDA4](https://www.ti.com/cn/lit/an/zhcabs1/zhcabs1.pdf)

1. 基于Tensorflow、Pytorch、Caffe 等训练框架，训练模型：选择一个训练框，然后定义模型，最后使用相应的数据集训练出满足需求的模型。
2. 基于TI Jacinto7TM TDA4VM处理器导入模型： 训练好的模型，需要使用TIDL Importer工具导入成可在TIDL上运行的模型。导入的主要目的是对输入的模型进行量化、优化并保存为TIDL能够识别的网络模型和网络参数文件。
3. 基于TI Jacinto7TM SDK 验证模型，并在应用里面部署模型：
    * PC 上验证并部署
        * 在PC上使用TIDL推理引擎进行模型测试。
        * 在PC上使用OpenVX框架开发程序，在应用上进行验证。
    * EVM上验证并部署
        * 在EVM上使用TIDL推理引擎进行模型测试。
        * 在EVM上使用OpenVX框架开发程序，在应用上进行验证

<img alt="图 3" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/3step.png" />  

## OpenVX
[TIOVX User Guide](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/index.html)
[OpenVX](https://www.khronos.org/openvx/) 视觉加速中间件是芯片内部的硬件加速器与视觉应用间的桥梁(中间件:用于简化编程人员开发复杂度、抽象软硬件平台差异的软件抽象层)，是个由Khronos定义的API框架，包括：宏的定义与含义，结构体的定义与含义，函数的定义与行为。

### 基本概念
``Vx_context``：一个context就是一个运行环境，包含多种不同的功能，在不同场景下被调度。一般很少有使用到多context的场景；
``Vx_graph``：一个graph就是一个功能，是由多个步骤连接在一起的完整功能；
``Vx_node``：一个node就是一个最小的调度单元，可以是图像预处理算法，可以是边缘检测算法。
每个进程内可以有多个context（上下文），每个context内可以有多个graph（图，或连接关系），每个graph内可以有多个node（节点）。
### 基本数据结构
``Vx_image, Vx_tensor, Vx_matrix, Vx_array, Vx_user_object_data``
OpenVX规范了标准化的数据结构，基本满足了嵌入式系统的主要需求，尤其是这种数据结构的描述方法对嵌入式系统非常友好：支持虚拟地址、物理地址等异构内存；提供了数据在多种地址之间映射的接口；提供了统一化的自定义结构体的描述方法。
### OpenVX与TDA4VM
TIOVX是TI公司对OpenVX的实现,TIOVX Framework包含了官方OpenVX的标准API和TI扩展的API，其中包括
* public: Context, Parameter, Kernel, Node, Graph Array, Image, Scalar, Pyramid, ObjectArray ；
* TI: Target, Target Kernel, Obj Desc。TIOVX Platform提供了特定硬件(如TDAx, AM65x)的操作系统(如TI-RTOS, Linux)调用API。

**优势**
+ TI官方提供OpenVX的支持，提供标准算法的硬件加速实现，提供各个功能的Demo，能够简化开发调试工作。
+ 简化多核异构的开发，可以在X86模拟运行，所有的板级开发和调试都位于A72 Linux端，减少了对RTOS调试的工作量。
+ OpenVX提供了数据流调度机制，能够支持流水线运行，简化了多线程和并行调度的工作。结合RTOS的实时特性，减少Linux非实时操作系统带来的负面影响。[^3][^4]

[^3]:[OpenVX视觉加速中间件与TDA4VM平台上的应用](https://zhuanlan.zhihu.com/p/423179832)
[^4]:[TDA4横扫行泊一体市场与其背后的OpenVX](https://zhuanlan.zhihu.com/p/606584605)