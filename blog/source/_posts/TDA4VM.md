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
<img alt="图 3" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMedit.jpg"/>  

## 处理器内核
+ **C7x 浮点矢量 DSP，性能高达 1.0GHz、 80GFLOPS、256GOPS**：C7x是TI的一款高性能数字信号处理器，其中的浮点矢量 DSP 可以进行高效的信号处理、滤波和计算，大幅提高神经网络模型的计算效率。
*GHz-每秒钟执行10亿次计算，GFLOPS-每秒10亿次浮点运算，GOPS-每秒10亿次通用操作。*
+ **深度学习矩阵乘法加速器 (MMA)，性能高达8TOPS (8b)（频率为1.0GHz）**：可以高效地执行矩阵乘法和卷积等运算。
*TOPS-每秒万亿次操作，8b-8位精度的运算。*
+ **具有图像信号处理器(ISP)和多个视觉辅助加速器的视觉处理加速器（VPAC）**：可以高效地执行图像处理、计算机视觉和感知任务。
+ **深度和运动处理加速器（DMPAC）**：可以高效地执行深度计算和运动估计等任务。
+ **双核 64 位 Arm® Cortex®-A72 微处理器子系统，性能高达 2.0GHz**：可以高效地执行复杂的应用程序。
    * 每个双核 Cortex®-A72 集群具有 1MB L2 共享缓存 
    * 每个 Cortex®-A72 内核具有 32KB L1 数据缓存 和 48KB L1 指令缓存
*L1缓存（一级缓存）：小而快，缓存CPU频繁使用的数据和指令，以提高内存访问速度；L2：大，帮助CPU更快地访问主内存中的数据。*
+ **六个 Arm® Cortex®-R5F MCU，性能高达 1.0GHz**：一组小型、低功耗的微控制器单元，用于处理实时任务和控制应用程序
    * 16K 指令缓存，16K 数据缓存，64K L2 TCM（Tightly-Coupled Memory）
    * 隔离 MCU 子系统中有两个 Arm® Cortex®-R5F MCU
    * 通用计算分区中有四个 Arm® Cortex®-R5F MCU
+ **两个 C66x 浮点 DSP，性能高达 1.35GHz、 40GFLOPS、160GOPS**：另一款高性能数字信号处理器，可以高效地执行信号处理、滤波和计算任务。
+ **3D GPU PowerVR® Rogue 8XE GE8430，性能高达 750MHz、96GFLOPS、6Gpix/s**：专门用于图形处理的硬件单元，可以实现高效的图形渲染和计算。
*Gpix/s-每秒可以处理10亿像素数*
+ **定制设计的互联结构，支持接近于最高的处理能力**：处理器内部的互连结构，用于连接各种硬件单元，并支持高效的数据传输和协议。


# SDK
Download：[PROCESSOR-SDK-J721E](https://www.ti.com.cn/tool/cn/PROCESSOR-SDK-J721E)，提供Linux SDK、QNX SDK和RTOS SDK
Document：[RTOS SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/index.html)，[Linux SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-rt-jacinto7/08_06_00_11/exports/docs/devices/J7/linux/index.html)，[Edge AI SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-sk-tda4vm/latest/exports/docs/index.html#)，[~~QNX SDK~~](https://software-dl.ti.com/jacinto7/esd/processor-sdk-qnx-jacinto7/08_06_00_07/exports/docs/index.html)
*RTOS and Linux SDK work together as a multi-processor software development kit for the J721E platform
Edge AI SDK主要基于Linux开发，用于工业领域，工作量少但实时性差*[^0]
[^0]:[深度学习算法在ADAS处理器TDA4VM的应用与部署](https://www.ti.com.cn/zh-cn/video/6301563648001)

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

[**SDK Components**](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/sdk_components_j721e.html#vxlib)
The following table lists *part* of the top-level folders in the SDK package and the component it represents.

Folder|Component|User guide
------|---------|----------
vision_apps|Vision Apps|[Demos](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/vision_apps/docs/user_guide/index.html)
pdk_jacinto_*|Platform Development Kit|[PDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/pdk_jacinto_08_06_00_31/docs/pdk_introduction.html#Documentation)
~~mcusw~~|MCU Software|[MCU SW](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/mcusw/mcal_drv/docs/drv_docs/index.html)
tidl_j7_*|TI Deep learning Product|[TIDL Product](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/index.html)
tiovx|TI OpenVX|[TIOVX](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/index.html)
tiadalg|TI Autonomous Driving Algorithms|[TIADALG](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiadalg/TIAutonomousDrivingAlgorithmLibrary_ReleaseNotes.html#Documentation)

RTOS SDK 中集成了众多的Demo展示TIDL在TDA4处理器上对实时的语义分割和 SSD 目标检测的能力。如下图,	Vision Apps User Guide 中 [AVP Demo](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/07_02_00_06/exports/docs/vision_apps/docs/user_guide/group_apps_dl_demos_app_tidl_avp3.html) 的展示了使用TIDL对泊车点、车辆的检测。[^1]
[^1]:[Deep Learning with Jacinto™ 7 SoCs: TDA4x](https://www.ti.com.cn/cn/lit/ml/slyp667/slyp667.pdf?raw=true) | [当深度学习遇上TDA4](https://e2echina.ti.com/blogs_/b/behindthewheel/posts/tda4)

<img alt="图 7" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMAVP.jpg" />  

## Processor SDK Linux
<details>
  <summary>SDK Components</summary>

Folder|Component
------|---------
bin | 包含用于配置主机系统的帮助程序脚本和目标设备。这些脚本中的大多数都由setup.sh使用脚本。
board-support | 主要包含linux内核源码，uboot源码，及其他组件。
configs | yocto工具的构建链接（yocto构建大约需要十几个小时，一般情况下不会去编译yocto。）。
docs | 直接打开index.html，即可阅读整个SDK的官方文档。
example-applications | 包含一些benchmarks等app demo。
filesystem | 存放默认、最小的文件系统。
linux-devkit | 交叉编译工具链和库以加快目标设备的开发速度。
Makefile | 顶级编译脚本（make）。
patches | 补丁、预留目录。
Rules.make | 设置顶级生成文件使用的默认值以及子组件生成文件。
setup .sh | 配置用户主机系统和目标开发系统。
yocto-build | 此目录允许重建SDK组件和使用Yocto Bitbake的文件系统。
</details>

Linux SDK最主要是用于A72核心上的启动引导、操作系统、文件系统，一般只有在修改到这部分的时候才会使用到Linux SDK。

# TIDL
[TIDL](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/index.html)（TI Deep Learning Library）是TI平台基于深度学习算法的*软件生态系统*，其特性和支持[^2]可以将一些常见的深度学习算法模型快速的部署到TI嵌入式平台。
[^2]:[Embedded low-power deep learning with TIDL](https://www.ti.com.cn/cn/lit/wp/spry314/spry314.pdf?raw=true)

```
Features: Interoperability, High Compute, High Memory Bandwidth, Scalability
Popular operators supported: Convolution, Pooling, Element Wise, Inner-Product, Soft-Max, Bias Add, Concatenate, Scale, Batch Normalization, Re-size, Arg-max, Slice, Crop, Flatten, Shuffle Channel, Detection output, Deconvolution/Transpose convolution 
```
Functions: 
+ Import trained network models into ``.bin`` files that can be used by TIDL. formats supported:Caffe models (using .caffemodel and .prototxt files), Tensorflow models (using .pb or .tflite files), ONNX models (``.onnx`` files)
+ Run performance simulation tool on PC to estimate the expected performace of the network while executing the network for inference on TI Jacinto7 SoC
+ Execute the network on PC using the imported ``.bin`` files and validate the results
+ Execute the network on TI Jacinto7 SoC using the imported ``.bin`` files and validate the results

<img alt="图 14" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMTIDLppt.jpg" width="80%"/>  

TIDL当前支持的训练框架有Tensorflow、Pytorch、Caffe等，用户可以根据需要选择合适的训练框架进行模型训练。TIDL可以将PC端训练好的模型导入编译生成TIDL可以识别的模型格式，同时在导入编译过程中进行层级合并以及量化等操作，方便导入编译后的模型高效的运行在具有高性能定点数据感知能力TDA4硬件加速器上。 TIDL提供了 [TIDL Importer](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_model_import.html) 模型导入工具，模型可视化工具等，非常便捷地可以对训练好的模型进行导入。

<img alt="图 3" src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/TIDL_blockDiagram.png" />  
<img alt="图 4" src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/tidl_import_design.jpg" />  

导入工具将在内部运行quantization, network compilation, performance simulation internally, 并生成文件：
> Compiled network and I/O files used for inference
Performance simulation results for network analysis in .csv

在TIDL上，深度学习网络应用开发主要分为三个大的步骤: 
1. 基于Tensorflow、Pytorch、Caffe 等训练框架，训练模型
2. 基于TDA4VM处理器导入模型： 训练好的模型，需要使用TIDL Importer工具导入成可在TIDL上运行的模型。导入的主要目的是对输入的模型进行量化、优化并保存为TIDL能够识别的网络模型和网络参数文件
3. 基于TI Jacinto7TM SDK 验证模型，并在应用里面部署模型：
    * PC 上验证并部署
        * 在PC上使用TIDL推理引擎进行模型测试。
        * 在PC上使用OpenVX框架开发程序，在应用上进行验证。
    * EVM上验证并部署
        * 在EVM上使用TIDL推理引擎进行模型测试。
        * 在EVM上使用OpenVX框架开发程序，在应用上进行验证[^3]
[^3]:[基于Pytorch训练并在TDA4上部署ONNX模型](https://www.ti.com/cn/lit/an/zhcabs1/zhcabs1.pdf?raw=true)

## TI's Edge AI
TIDL is a fundamental software component of [TI’s Edge AI solution](https://www.ti.com/edgeai).
<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/dnn-workflow.png">

[TIDL Runtime](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/md_tidl_overview.html)（TIDL-RT）是运行在TDA4端的实时推理单元，同时提供了TIDL的运行环境，对于input tensor，TIDL TIOVX Node 调用TIDL 的深度学习加速库进行感知，并将结果进行输出。
<img alt="图 9" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMworkflow.png" width="60%"/>  

[**TI’s EdgeAI Tools**](https://github.com/TexasInstruments/edgeai):Training and quantization tools,make DNNs more suitable for TI devices.

+ [Model ZOO](https://github.com/TexasInstruments/edgeai-modelzoo):A large collection of pre-trained models for data scientists,其中有[YOLO例程](https://github.com/TexasInstruments/edgeai-modelzoo/tree/master/models/vision/detection)

+ [Edge AI TIDL Tools](https://github.com/TexasInstruments/edgeai-tidl-tools#edgeai-tidl-tools):used for model compilation on X86. Artifacts from compilation process can used for Model inference， which can happen on X86 machine or on development board with TI SOC.
+ [Edge AI Benchmark](https://github.com/TexasInstruments/edgeai-benchmark):provides higher level scripts for model compilation,and perform accuracy and performance benchmark.

+ [Edge AI Studio](https://dev.ti.com/edgeai/):Integrated development environment for development of AI applications for edge processors.（需授权）
+ [EdgeAI-ModelMaker](https://github.com/TexasInstruments/edgeai-modelmaker): Command line Integrated environment for training & compilation.
<img alt="图 9" src="https://raw.sevencdn.com/TexasInstruments/edgeai/blob/master/assets/workblocks_tools_software.png?raw=true" width="90%">  

## OpenVX
[OpenVX](https://www.khronos.org/openvx/) 视觉加速中间件是芯片内部的硬件加速器与视觉应用间的桥梁(中间件:用于简化编程人员开发复杂度、抽象软硬件平台差异的软件抽象层)，是个由Khronos定义的API框架，包括：宏的定义与含义，结构体的定义与含义，函数的定义与行为。

### 基本概念
``Vx_context``：一个context就是一个运行环境，包含多种不同的功能，在不同场景下被调度。一般很少有使用到多context的场景；
``Vx_graph``：一个graph就是一个功能，是由多个步骤连接在一起的完整功能；
``Vx_node``：一个node就是一个最小的调度单元，可以是图像预处理算法，可以是边缘检测算法。
每个进程内可以有多个context（上下文），每个context内可以有多个graph（图，或连接关系），每个graph内可以有多个node（节点）。[^4]
[^4]:[TIOVX – TI’s OpenVX Implementation](https://www.ti.com/content/dam/videos/external-videos/2/3816841626001/5624955361001.mp4/subassets/openvx-implementation-on-ti-tda-adas-socs-presentation.pdf)

<img alt="图 4" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMopenvxflow.png" />  

```c
//Example Program
vx_context context = vxCreateContext(); //创建 OpenVX 上下文,即整个应用程序的运行环境
vx_graph graph = vxCreateGraph( context ); //在上下文中创建一个图，表示图像处理的流程
vx_image input = vxCreateImage( context, 640, 480, VX_DF_IMAGE_U8 );
vx_image output = vxCreateImage( context, 640, 480, VX_DF_IMAGE_U8 ); //创建输入和输出图像，分别用于存储输入和处理后的图像。
vx_image intermediate = vxCreateVirtualImage( graph, 640, 480, VX_DF_IMAGE_U8 ); //创建虚拟图像，用于存储第一次处理后的结果，供下一步处理使用
vx_node F1 = vxF1Node( graph, input, intermediate );
vx_node F2 = vxF2Node( graph, intermediate, output ); //创建两个节点，分别表示两个不同的图像处理操作，并将它们添加到图中
vxVerifyGraph( graph ); //验证图的正确性
vxProcessGraph( graph ); //执行图像处理
```
<img alt="图 5" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMopenvxexample.png" width="80%"/>  

### 基本数据结构
``Vx_image, Vx_tensor, Vx_matrix, Vx_array, Vx_user_object_data``
OpenVX规范了标准化的数据结构，基本满足了嵌入式系统的主要需求，尤其是这种数据结构的描述方法对嵌入式系统非常友好：支持虚拟地址、物理地址等异构内存；提供了数据在多种地址之间映射的接口；提供了统一化的自定义结构体的描述方法。
### TIOVX
[TIOVX](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/index.html) 是TI公司对OpenVX的实现。
<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/tiovx_block_diagram_j7.png" width="80%">

TIOVX Platform提供了特定硬件(如TDAx, AM65x)的操作系统(如TI-RTOS, Linux)调用API。TIOVX Framework包含了官方OpenVX的标准API和TI扩展的API，其中包括
```
public: Context, Parameter, Kernel, Node, Graph Array, Image, Scalar, Pyramid, ObjectArray ；
TI: Target, Target Kernel, Obj Desc。
```

**优势**
+ TI官方提供OpenVX的支持，提供标准算法的硬件加速实现，提供各个功能的Demo，能够简化开发调试工作。
+ 简化多核异构的开发，可以在X86模拟运行，所有的板级开发和调试都位于A72 Linux端，减少了对RTOS调试的工作量。
+ OpenVX提供了数据流调度机制，能够支持流水线运行，简化了多线程和并行调度的工作。结合RTOS的实时特性，减少Linux非实时操作系统带来的负面影响[^5]
<img alt="图 6" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMtiovx.png" width="80%"/>  

[PyTIOVX](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tiovx/docs/user_guide/PYTIOVX.html): Automated OpenVX “C” Code Generation
[^5]:[OpenVX视觉加速中间件与TDA4VM平台上的应用](https://zhuanlan.zhihu.com/p/423179832) | [TDA4横扫行泊一体市场与其背后的OpenVX](https://zhuanlan.zhihu.com/p/606584605)