---
title: DLdeploy：torch > onnx > deploy
date: 2023-06-09 11:36:00
updated: 2026-09-12
tags:
- 嵌入式
- 深度学习
- 模型部署
---
从 PyTorch 模型到 ONNX、压缩量化、端侧编译和 SDK 集成的部署笔记。项目地址：[DLpractice](https://github.com/Arrowes/DLpractice)
<!--more-->

## 学习路线与速查

| 顺序 | 主题 | 复习重点 |
| --- | --- | --- |
| 1 | [部署总览](#deployment-overview) | 场景、指标、硬件和完整链路 |
| 2 | [压缩与量化工作流](#compression-workflow) | 结构化剪枝、PTQ、QAT 如何衔接 |
| 3 | [量化原理与案例](#quantization) | Scale、Zero-point、校准和混合精度 |
| 4 | [剪枝实践](#pruning) | 重要性评分、依赖图和物理通道裁剪 |
| 5 | [ONNX 转换与优化](#onnx) | 导出、校验、算子兼容和改写 |
| 6 | [部署框架与 SDK](#deployment-sdk) | 转换器、前后处理、runtime 和封装 |
| 7 | [部署验收清单](#deployment-checklist) | 精度、性能、内存、功耗与可回退性 |

核心链路：模型选择与训练 → 结构/算子优化 → 模型转换 → 压缩与量化 → 目标后端编译 → 端侧验证 → SDK 集成。

<img alt="图 1" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>

Netron神经网络可视化: [软件下载](https://github.com/lutzroeder/netron/releases/tag/v7.0.0), [在线网站](https://netron.app/)

[MMDeploy中文文档](https://mmdeploy.readthedocs.io/zh-cn/latest/)


---

<span id="deployment-overview"></span>

# 部署总览
[AI 框架部署方案之模型部署概述](https://zhuanlan.zhihu.com/p/367042545)
[AI 框架部署方案之模型转换](https://zhuanlan.zhihu.com/p/396781295)

模型部署需要把训练框架中的模型转换成目标运行时可执行的计算图，并对齐前处理、后处理和数值精度。部署阶段仍可能反向影响网络结构与训练方式，例如用部署友好算子替换不支持算子，或通过 QAT 恢复量化精度。

## 模型部署场景
+ 云端部署：模型部署在云端服务器，用户通过网页访问或者 API 接口调用等形式向云端服务器发出请求，云端收到请求后处理并返回结果。 
+ **边缘部署**：主要用于嵌入式设备，主要通过将模型打包封装到 SDK，集成到嵌入式设备，数据的处理和模型推理都在终端设备上执行。

## 模型部署方式
+ Service 部署：主要用于中心服务器云端部署，一般直接以训练的引擎库作为推理服务模式。
+ **SDK 部署**：主要用于嵌入式端部署场景，以 C++ 等语言实现一套高效的前后处理和推理引擎库（高效推理模式下的 Operation/Layer/Module 的实现），用于提供高性能推理能力。此种方式一般需要考虑模型转换（动态图静态化）、模型联合编译等进行深度优化。


|           | SDK部署 | Service部署 |
| --------- | ------- | ------------ |
| 部署环境 | SDK引擎 | 训练框架 |
| 模型语义转换 | 需要进行前后处理和模型的算子重实现 | 一般框架内部负责语义转换 |
| 前后处理对齐算子 | 训练和部署对应两套实现，需要进行算子数值对齐 | 共用算子 |
| 计算优化 | 偏向于挖掘芯片编译器的深度优化能力 | 利用引擎已有训练优化能力 |

<img alt="图 3" src="https://pic2.zhimg.com/80/v2-ffd5625be23ba4fa8a56f5232a3f9c95_720w.webp" width="80%"/>  

## 部署优化指标

部署优化通常同时考虑：任务 KPI、端到端延迟、吞吐量、峰值内存、模型大小、功耗、成本、冷启动时间和稳定性。TOPS 只是理论算力指标，不能替代目标模型在真实输入、编译器和频率配置下的测量。

下表是早期硬件资料快照，只用于理解数据中心与边缘设备的功耗/算力定位；规格可能随工作模式和厂商口径变化，选型时应查询当前官方手册。

| 芯片型号          | 算力                                    | 功耗          |
| ---------------- | --------------------------------------- | ------------- |
| Snapdragon 855   | 7 TOPS (DSP) + 954.7 GFLOPs(GPU FP32)   | 10 W          |
| Snapdragon 865   | 15 TOPS (DSP) + 1372.1 GFLOPs(GPU FP32) | 10 W          |
| MLU220           | 8 TOPS (INT8)                           | 8.25 W        |
| MLU270-S4        | 128 TOPS (INT8)                         | 70 W          |
| Jetson-TX2       | 1.30 TOPS (FP16)                        | 7.5 W / 15 W  |
| T4               | 130 TOPS (INT8)                         | 70 W          |

云端服务通常更关注多路吞吐、资源利用率和成本；边缘设备通常更关注单路延迟、峰值内存、功耗和热设计。INT8、INT4、FP16 或混合精度是否更合适，取决于模型类型、目标硬件支持和精度容忍度，必须通过实测选择。

## 部署流程
模型转换、模型量化压缩、模型打包封装 SDK。

**模型转换**:主要用于模型在不同框架之间的流转，常用于训练和推理场景的连接。目前主流的框架都以 ONNX 或者 caffe 为模型的交换格式；模型转换主要分为计算图生成和计算图转换两大步骤，另外，根据需要，还可以在中间插入计算图优化，对计算机进行推理加速（诸如常见的 CONV/BN 的算子融合），例如去除冗余 op，计算合并等。

+ 计算图生成：通过一次 inference 并追踪记录的方式，将用户的模型完整地翻译成静态的表达。在模型 inference 的过程中，框架会记录执行算子的类型、输入输出、超参、参数和调用该算子的模型层次，最后把 inference 过程中得到的算子信息和模型信息结合得到最终的静态计算图。
目前使用广泛的训练框架 PyTorch 使用的都是动态图，这是由于动态图的表达形式更易于用户快速实现并迭代算法。 动态图框架会逐条解释，逐条执行模型代码来运行模型，而计算图生成的本质是**把动态图模型静态表达出来**。 PyTorch 的torchscript、ONNX、fx 模块都是基于模型静态表达来开发的。目前常见的建立模型静态表达的方法有以下三种：
    + 代码语义分析：通过分析用户代码来解析模型结构，建立模型静态表达。
    + 模型对象分析：通过模型对象中包含的成员变量，来确定模型算子组成，建立模型静态表达。
    + **模型运行追踪**：运行模型并记录过程中的算子信息、数据流动，建立模型静态表达。
    上面这三种方法在适用范围、静态抽象能力等方面各有优劣。目前训练框架都主要使用模型运行追踪的方式来生成计算图：在模型inference 的过程中，框架会记录执行算子的类型、输入输出、超参、参数等算子信息，最后把 inference 过程中得到的算子节点信息和模型信息结合得到最终的静态计算图。
    然而，很多时候，用户的一段代码可能涉及非框架底层的计算，涉及外部库的计算，训练框架自身是无法追踪记录到的。这个时候我们可以把这部分代码作为一个**自定义算子**，由用户定义这个算子在计算图中作为一个节点所记录的信息。实际实现时，这些计算会被写到一个 Function 或者 Module 中，然后用户在 Function 或者 Module 中定义这个计算对应的计算节点的信息表达，这样每次调用这个定义好的 Function 或者 Module，就能对应在计算图中记录相应的算子信息。此外，还有很多其他场景会产生这种需要，例如你的几个计算组成了一个常见的函数，可以有更高层的表达，这个时候也可以使用自定义算子来简化计算图的表达。

+ 计算图转换：计算图转换到目标格式就是去解析静态计算图，根据计算图的定义和目标格式的定义，去做转换和对齐。这里的主要的工作就是通用的优化和转换，以及大量特殊情况的处理。
    + **计算图转换到 ONNX**：ONNX 官方定义了算子集 opset，并且随着 ONNX 的演进，opset 版本的迭代伴随着算子支持列表和算子表达形式的改动，因此针对不同的 opset 也需要有多后端 ONNX 的支持。另一方面，对于在 opset 之外的算子，用户需要自己注册定义算子在 ONNX 的表达信息（输入、输出、超参等）。
    另一方面，推理框架对于 ONNX 官方 opset 往往也不是完全支持，会有自己的一些取舍。所以对于 ONNX 模型，往往需要用相关的 simplifier 进行模型预处理优化，围绕这一方面模型转换或者部署框架的工程侧也有不少的相关工作。

和五花八门的芯片等端侧硬件相比，x86 和 CUDA 平台是普及率最高的平台，因此如果是出于部署测试、转换精度确认、量化等需要，一个能够在 x86 或者 CUDA 平台运行的 runtime 是非常必要的。对此，支持 ONNX 格式的部署框架一般会基于 onnxruntime（微软出品的一个具有 ONNX 执行能力的框架）进行扩展，支持 caffe 格式的部署框架一般会基于原生 caffe 进行扩展。通过 onnxruntime 和 caffe 的推理运行能力，来提供在 x86 或者 CUDA 平台上和硬件平台相同算子表达层次的运行能力。当然还有一些生态较好的部署框架，他们自己提供算子表达能力和计算精度与硬件一致的 x86 或 CUDA 平台的模拟器。


**模型量化压缩**：终端场景中，一般会有内存和速度的考虑，因此会要求模型尽量小，同时保证较高的吞吐率。除了人工针对嵌入式设备设计合适的模型，如 MobileNet 系列，通过 NAS(Neural Architecture Search) 自动搜索小模型，以及通过蒸馏/剪枝的方式压缩模型外，一般还会使用量化来达到减小模型规模和加速的目的。

量化把权重或激活映射到 INT8、INT4 等低位宽表示，以减少模型存储和内存带宽，并在目标硬件支持时加速计算。裸 FP32 权重转换为 INT8 后理论大小约为四分之一，但完整模型大小和速度还受图结构、量化参数及算子支持影响。
另外，大部分终端设备都会有专用的定点计算单元，通过低比特指令实现的低精度算子，速度上会有很大的提升，当然，这部分还依赖协同体系结构和算法来获得更大的加速。
+ 量化训练（QAT, Quantization Aware Training）：即量化感知训练方案，在浮点训练的时候，就先对浮点模型结构进行干预，使得模型能够感知到量化带来的损失，减少量化损失精度的方案。通过对模型插入伪量化算子（这些算子用来模拟低精度运算的逻辑），通过梯度下降等优化方式在原始浮点模型上进行微调，从来调整参数得到精度符合预期的模型。量化训练基于原始浮点模型的训练逻辑进行训练，理论上更能保证收敛到原始模型的精度，但需要精细调参且生产周期较长；
+ 离线量化（PTQ）：即训练后量化方案，先训练浮点模型，然后使用校准图片计算量化参数，将浮点模型转为量化模型的量化方法。主要是通过少量校准数据集（从原始数据集中挑选 100-1000 张图，不需要训练样本的标签）获得网络的 activation 分布，通过统计手段或者优化浮点和定点输出的分布来获得量化参数，从而获取最终部署的模型。离线量化只需要基于少量校准数据，因此生产周期短且更加灵活，缺点是精度可能略逊于量化训练。
实际流程通常先尝试 PTQ；若验证集 KPI 不达标，再分析敏感层、调整校准或使用 QAT。精度损失没有通用的固定百分比。

两大难点：一是如何平衡模型的吞吐率和精度，二是如何结合推理引擎充分挖掘芯片的能力。 比特数越低其吞吐率可能会越大，但其精度损失可能也会越大，因此，如何通过算法提升精度至关重要，这也是组内的主要工作之一。另外，压缩到低比特，某些情况下吞吐率未必会提升，还需要结合推理引擎优化一起对模型进行图优化，甚至有时候会反馈如何进行网络设计，因此会是一个算法与工程迭代的过程。

**模型打包封装 SDK**：实际业务落地过程中，模型可能只是产品流程中的一环，用于实现某些特定功能，其输出可能会用于流程的下一环。因此，模型打包会将模型的前后处理，一个或者多个模型整合到一起，再加入描述性的文件（前后处理的参数、模型相关参数、模型格式和版本等）来实现一个完整的功能。因此，SDK 除了需要一些通用前后处理的高效实现，对齐训练时的前后处理逻辑，还需要具有足够好的扩展性来应对不同的场景，方便业务线扩展新的功能。可以看到，模型打包过程更多是模型的进一步组装，将不同模型组装在一起，当需要使用的时候将这些内容解析成整个流程（pipeline）的不同阶段（stage），从而实现整个产品功能。

另外，考虑到模型很大程度是研究员的研究成果，对外涉及保密问题，因此会对模型进行加密，以保证其安全性。加密算法的选择需要根据实际业务需求来决定，诸如不同加密算法其加解密效率不一样，加解密是否有中心验证服务器，其核心都是为了保护研究成果。

## CPU、GPU 与 NPU
CPU 是通用处理器，控制能力强，适合复杂逻辑、分支判断、系统调度和少量串行计算，但大规模矩阵并行计算效率不如 GPU/NPU。

GPU 是通用并行计算处理器，核心数量多，擅长大规模浮点矩阵运算、卷积、图形渲染和深度学习训练/推理。优点是灵活、生态成熟，支持算子多；缺点是功耗和成本较高。

NPU 是面向神经网络推理的专用加速器，通常对 INT8/FP16 卷积、矩阵乘法等算子做硬件优化，能效比高，适合边缘端部署。缺点是灵活性较弱，算子支持受平台工具链限制，遇到 scatter、grid_sample、动态 shape、复杂 attention 等算子时可能不支持，需要改网络或 CPU fallback。

工程上常见分工是：CPU 做前后处理和调度，NPU/GPU 做模型推理，ISP 做图像信号处理，DSP 有时做传统视觉或部分前处理

产生这些区别的根本原因在于**芯片架构设计上的取舍（Trade-off）**，即硅片面积（晶体管）的分配策略和最初的设计目标不同：
1. CPU：低延迟与通用性优先

* **设计初衷：** 以较低延迟执行复杂控制流和通用任务。
* **架构取舍：** 芯片上绝大部分面积被分配给了**控制单元（Control Unit）**和**大容量缓存（Cache）**。通过复杂的乱序执行、分支预测和数据预取来降低延迟。
* **结果：** 真正用于算术运算的单元（ALU）占比较小。这解释了为什么它控制能力极强、能处理各种复杂逻辑，但在面对需要海量并发的矩阵计算时显得力不从心。

2. GPU：高吞吐量与数据并行优先

* **设计初衷：** 最初为图形渲染设计，这类任务需要同时对几百万个像素执行相同的简单计算（单指令多数据流，SIMD/SIMT）。
* **架构取舍：** 砍掉了 CPU 那种复杂的控制单元和庞大的缓存结构，将绝大部分硅片面积全部用来堆砌**成百上千个运算单元（ALU）**。
* **结果：** 并行计算能力极强，非常契合深度学习中的大规模矩阵乘法。但也正是因为缺乏复杂的控制电路，一旦遇到复杂的逻辑分支（If-Else），它的并行效率就会大幅衰减。

3. NPU：领域定制架构（DSA）与极致能效

* **设计初衷：** 深度学习爆发后，为了解决 GPU 功耗过高和数据搬运瓶颈，专门为神经网络定制的加速架构。
* **架构取舍：** 以部分通用性换取特定神经网络算子的能效，常提供矩阵乘加专用电路；具体架构并不都采用同一种脉动阵列。
* **结果：** 因为算子是“硬连线”在物理电路上的，数据流动路径极短，所以它在处理常规卷积和矩阵运算时能效比极高、功耗极低。但代价是灵活性被锁死在硬件层面——一旦遇到芯片设计之初没有预料到的新算子或动态结构，硬件就无法直接处理，只能交回给 CPU（Fallback）或重新进行硬件迭代。


CPU 将空间用来做**复杂控制**，GPU 将空间用来堆砌**通用计算核心**，而 NPU 将空间用来打造执行特定数学公式的**专用物理电路**。

---

<span id="compression-workflow"></span>

# 模型压缩与量化部署工作流

结构化剪枝、训练后量化（PTQ）和量化感知训练（QAT）可以组成一条可重复的模型压缩管线：

$$
\text{FP32 基线}
\xrightarrow{\text{结构化剪枝}}
\text{通道裁剪模型}
\xrightarrow{\text{微调}}
\text{精度恢复}
\xrightarrow{\text{PTQ；不足时 QAT}}
\text{量化模型}
\xrightarrow{\text{ONNX / 后端编译}}
\text{端侧模型}
$$

推荐按以下顺序执行，每一步都保存模型、配置和评估结果，避免最后只知道“精度掉了”，却无法定位从哪一步开始偏离。

1. **冻结 FP32 基线**：记录代码版本、权重、输入预处理、数据集版本和 KPI。
2. **建立目标端基准**：确认算子支持、精度类型、静态/动态 shape、内存和延迟预算。
3. **结构化剪枝**：按依赖关系删除通道或分组，重新统计参数量和 MACs。
4. **微调恢复**：逐步提高剪枝率，每轮微调并在验证集检查 KPI。
5. **优先尝试 PTQ**：使用有代表性的校准集生成量化参数，并分析逐层误差。
6. **必要时进行 QAT**：在前向中模拟量化噪声，通过微调恢复精度。
7. **导出和编译**：根据 runtime 选择 QDQ ONNX、浮点图 + Encodings，或厂商中间格式。
8. **端侧验收**：比较训练框架、ONNX Runtime、后端模拟器和真机输出，并测量端到端性能。

## 1. 结构化剪枝

非结构化剪枝虽然能将权重稀疏化，但在没有专门稀疏算子支持的端侧芯片上，无法带来实质上的算力释放。因此我们采用结构化剪枝，直接在物理通道维度上进行裁剪，从而降低内存带宽和计算开销。

**通道重要性评估**
裁剪通道前需要评估它们对输出特征的贡献。主要实现了三种评估算法：

* **量级剪枝（Magnitude Pruning）**：它基于“小权重贡献小”的假设，直接计算卷积核权重 $W \in \mathbb{R}^{C_{out} \times C_{in} \times K \times K}$ 的范数。对于第 $i$ 个输出通道的权重 $W_i$，其 $L_1$ 范数评分为 $S(i) = \sum |W_i|$，而 $L_2$ 范数评分则为其元素的平方和开根。若某个通道的权重范数极小，说明其输出特征图的幅值也极小，对后层特征的贡献微乎其微，因此可以安全剪裁。
* **BN 缩放因子剪枝（BN Scale Pruning）**：Batch Normalization 层的公式为 $y = \gamma \cdot \hat{x} + \beta$。其中可学习的缩放因子 $\gamma$ 直接决定了该通道输出的幅值。在训练时，我们在损失函数中引入关于 $\gamma$ 的 $L_1$ 稀疏惩罚项（$\mathcal{L}_{\text{total}} = \mathcal{L} + \lambda \sum |\gamma|$），强迫不重要通道的 $\gamma$ 趋近于 0。剪枝时，直接将 $\gamma_i$ 接近 0 的通道整条裁掉。这种方法比单纯看权重大小更直接地反映了激活流的信息量。
* **二阶梯度与泰勒展开剪枝（Group-based Hessian Pruning）**：有些通道虽然权重幅值偏小，但损失函数对它的微小变化却极度敏感。为了解决量级剪枝的这一盲区，我们评估裁剪掉参数 $\Delta \theta$ 后损失函数 $\mathcal{L}$ 的变化量。通过在收敛状态下进行二阶泰勒展开，由于此时一阶梯度趋近于 0，损失的变化量 $\Delta \mathcal{L}$ 可以近似为：
  $$\Delta \mathcal{L} \approx \frac{1}{2} \Delta \theta^T H \Delta \theta$$
  如果我们强行裁剪参数 $\theta_i$（即令其变化量为 $\Delta \theta_i = -\theta_i$），该参数的重要性评分可以近似表示为 $S(i) \approx \frac{1}{2} \theta_i^2 H_{ii}$。这里 $H_{ii}$ 是 Hessian 矩阵的对角线元素。该方法引入了表示曲率的二阶偏导数，即便权重很小，只要其所在方向的曲率极高，也会被强制保留。
> 什么是 Hessian 矩阵与曲率？
Hessian 矩阵是损失函数对模型权重的二阶偏导数组成的方阵。在机器学习中，它描述了损失函数在参数空间中的“曲率”（Curvature）。
曲率小（平坦区域）：即使权重发生较大变化，损失函数的上升也非常缓慢，说明该参数对最终精度不敏感，可以被安全剪掉。
曲率大（陡峭区域）：权重哪怕只有极其微小的改变，也会导致损失函数剧烈飙升，说明该参数非常关键，必须保留。
泰勒展开剪枝正是利用了这一几何特性，保护了那些“体量虽小，但处于陡峭峡谷区”的核心参数。

**依赖图感知**
在复杂的泊车网络（如带有 ResNet 残差连接或 FPN 特征金字塔）中，前一个卷积的输出通道必须与后一个卷积的输入通道严格一致，残差相加分支的通道也必须对齐。
为解决层与层之间的拓扑耦合，利用 `torch_pruning` 库构建了**依赖图（Dependency Graph）**。当决定裁剪某一层时，依赖图会将所有相互关联的层打包成一个“剪枝群组（Pruning Group）”，并将裁剪指令在群组内进行拓扑传递。这确保了通道裁剪在整个计算图中的同步性，避免了维度不匹配导致的运行时崩溃。
> 什么是依赖图？
神经网络本质上是一个有向无环图（DAG）。当你剪掉 Conv A 的 10 个输出通道时，紧跟在其后的 BatchNorm A、ReLU 以及 Conv B 的 10 个输入通道必须同时被剪掉。如果在残差网络中，Conv A 还要和 Conv C 进行相加（Add），那么 Conv C 的输出通道也必须同步裁剪。
依赖图就是一种拓扑排序工具，它能自动追踪这些网络结构的绑定关系，将关联的层打包成一个“剪枝群组”，保证“一剪全剪”，避免张量形状不匹配引发内存崩溃。
## 2. 低比特量化

量化是将浮点数值（FP32）映射到窄带宽定点数值（INT8/INT4）的过程，能够大幅缩减内存占用并激活 DSP/NPU 的 SIMD 或张量硬件加速。

采用均匀线性量化，其数学表达为：
* **量化 (FP32 $\to$ INT8)**：
  $$q = \text{clamp}\left( \text{round}\left( \frac{x}{S} \right) + Z, \, q_{\min}, \, q_{\max} \right)$$
* **反量化 (INT8 $\to$ FP32)**：
  $$\hat{x} = S \cdot (q - Z)$$
> 反量化 (Dequantization, INT8 $\to$ FP32)：由于部分算子（如 Softmax 或最终的检测框解码）必须在浮点空间运行，我们需要将 INT8 整数重新乘以缩放因子 $S$，还原成 FP32 格式。注意：反量化回来的 FP32 并不等于原始的 FP32，它带有量化噪声。

其中 $S$ (Scale) 是缩放因子，代表定点格点之间的最小物理间距；$Z$ (Zero-Point) 是零点，代表 FP32 中的 $0$ 在量化空间的整型映射值。根据硬件平台的特点，量化可以分为对称与非对称两类：
* **对称量化（HTP 常用）**：强制令零点 $Z = 0$，量化边界关于 0 完全对称。缩放因子计算为 $S = \max(|x_{\min}|, |x_{\max}|) / q_{\max}$。由于在反量化时无需减去非零零点，它极大地节省了车端加速器的通用寄存器带宽。
* **非对称量化（TDA4 常用）**：允许 $Z \neq 0$，量化区间自适应贴合浮点分布，公式为 $S = \frac{x_{\max} - x_{\min}}{q_{\max} - q_{\min}}$。这种方式量化误差更低，但端侧推理时需要多进行一步减去偏置的整型加法。

确定缩放因子 $S$ 与零点 $Z$ 的本质，是在**截断误差**（超出量化范围的值被饱和截断导致的信号丢失）与**取整误差**（量化范围过大导致格点变粗、分辨率下降）之间取得平衡。代码底层调用了两种校准算法来寻找最佳截断点 $[x_{\min}, x_{\max}]$：
* **Min-Max 校准**：直接收集校准批次中激活值的物理绝对极值作为边界。这种方式容易受到激活值中个别噪点（Outliers）的干扰，导致量化范围被异常拉大，拉低主体数据的数值分辨率。
* **KL 散度校准（Entropy Calibration）**：将量化前后的特征分布 $P$ 和 $Q$ 视为概率密度函数，通过最小化两者的相对熵（Kullback-Leibler Divergence），寻找让整体分布最匹配的截断点 $T$：
  $$D_{\text{KL}}(P \parallel Q) = \sum_{i} P(i) \log \frac{P(i)}{Q(i)}$$
  这种方法在数学上保证了核心特征分布的一致性，能够有效消除极少数噪点对量化范围的干扰，是自动驾驶泊车网络的首选。

## 3. 从静态校准到感知训练：PTQ 与 QAT 的工程实现

在模型最终烧录进端侧定点芯片前，我们必须在服务器上提前模拟定点化带来的数值截断与溢出。这就是为什么即使在不需要反向梯度更新的 **训练后量化（PTQ）** 中，也需要插入量化模拟节点（QuantSim/QDQ 算子）的原因。若不插入这些节点，前向推理依旧是全浮点计算，无法评估校准参数和低比特精度的表现。

### 训练后量化（PTQ）
PTQ 是一种超快的模型压缩技术，无需基于梯度的微调，通常在几分钟内即可完成。其基本工作流如下：
1. **加载 FP32 权重**：获取已收敛的全精度浮点模型。
2. **算子合并（BatchNorm Folding）**：在数学上将紧密相邻的卷积层与 BN 层折叠融合，消除部署时的多余计算层。
3. **注入模拟节点**：在特征图和权重的输入输出端包装伪量化算子，在模拟前向传播时引入低比特精度截断。
4. **运行动态校准**：输入一小批真实样本（500 到 1000 张图像）跑前向传播（不计算梯度），收集激活特征图的统计范围，利用 Min-Max 或 KL 散度算法计算出每一层的最优缩放因子与零点（Encodings）。
5. **精度评估与敏感度剖析**：在测试集上测试量化后的 KPI。泊车网络中的车位多边形角点回归和三维深度映射对低比特量化非常敏感，我们使用 `QuantAnalyzer` 进行逐层 MSE 损失分析。若发现关键层崩溃，则将其加入 `modules_to_ignore` 中维持 FP32/FP16 精度，其余大部分算子依然保持 INT8 运行，以此实现混合精度部署。
6. **导出部署包**：剥离无用模拟节点，生成带有标准 QDQ 算子的部署 ONNX 计算图和 Encodings JSON 描述文件。

### 量化感知训练（QAT）
如果 PTQ 无法挽回精度损失，就需要使用 QAT。它在前向传播时引入模拟量化噪声，在反向传播时微调底层浮点权重，从而补偿精度损失。QAT 能够成功运作，依赖两个数学原理：
* **BatchNorm 折叠原理**：在推理时，BN 层会被合并到卷积层权重 $W$ 和偏置 $b$ 中：
  $$W_{\text{fold}} = W \cdot \frac{\gamma}{\sqrt{\sigma^2 + \epsilon}}, \quad b_{\text{fold}} = (b - \mu) \cdot \frac{\gamma}{\sqrt{\sigma^2 + \epsilon}} + \beta$$
  如果在微调时先量化再融合，BN 参数的微小抖动会在部署融合时被放大，导致量化失配（Quantization Mismatch）。为此，我们在初始化时先进行数学折叠，再对融合后的 $W_{\text{fold}}$ 进行量化节点模拟，确保训练与车端运行时计算逻辑高度等价。
* **直通估计器（STE）**：取整操作 $\text{round}(\cdot)$ 的导数在非整数点处为 0，会导致反向传播时梯度流断流。STE 方案强制将量化节点的偏导数设为 1（等价于恒等映射），使误差梯度顺利流回前层的浮点权重：
  $$\frac{\partial \, \text{round}(x)}{\partial x} \approx 1 \implies \frac{\partial \mathcal{L}}{\partial x} \approx \frac{\partial \mathcal{L}}{\partial \hat{x}}$$
  这使得网络能够不断微调底层的 FP32 权重，使其收敛到能够天然容忍 INT8 误差的最优参数空间。

在工程实现中，`QATHook` 串联起了完整的闭环：在训练启动前，Hook 自动将 `Conv -> BN` 以及 `ConvTranspose -> BN` 结构进行数学折叠。接着，使用 `QuantizationSimModel` 在每个支持量化的算子输入输出端包装一层 `QcQuantizeWrapper` 伪量化节点。随后，使用小批数据运行前向传播，利用 KL 散度初始化所有节点的 Scale 与 Offset。
在微调训练中，数据流经每个节点时执行伪量化 $\hat{x} = \text{Dequantize}(\text{Quantize}(x))$，主动注入量化噪声。反向传播时激活 STE 机制，更新底层的 FP32 参数。训练结束后，剥离量化模拟节点，导出纠偏后的纯浮点权重文件（`_without_quant_nodes.pth`），以及内嵌 QDQ 节点的 ONNX 部署计算图与 Encodings JSON 文件。

### 自动化流水线的产物

每次运行至少保存：

* FP32、剪枝后、微调后和 QAT 后权重；
* 剪枝配置、通道依赖与模型结构描述；
* 校准集清单、量化 scheme、位宽、scale/zero-point 或 encodings；
* ONNX/后端模型、编译日志、fallback 算子清单；
* 每个阶段的 KPI、延迟、内存与功耗报告。

---

<span id="quantization"></span>

# 量化原理与案例
量化使用较低位宽表示权重和激活。若权重都从 FP32 存为 INT8，裸权重体积理论上可降到约四分之一；实际模型文件还包含图结构、量化参数和可能保留的高精度张量。运行速度取决于硬件是否提供相应低精度内核，以及量化/反量化和数据搬运开销。

浮点数格式 (float32)：$$V = (-1)^s×M×2^E$$
符号位s|阶码E|尾数M|
---|--|--
1|8|23|

定点数格式 (int8)：
符号位|整数位（设定）|小数位(量化系数)|
---|--|--
1|4|3|

若整数位占4位，小数位占3位，则其最大精度为0.125，最大值为15.875
若整数位占5位，小数位占2位，则其最大精度为0.250，最大值为31.750
$$int8=float32∗2^3$$
$$float32=int8/2^3$$


浮点运算在运算过程中，小数点的位置是变动的，而定点运算则是固定不变。如果将浮点数转换成定点数，就可以实现一次读取多个数进行计算（1 float32 = 4 int8），提高了运算效率。

> 8位和16位是指量化的位深度，表示用多少个二进制位来表示每个权重或激活值。在量化时，8位会将每个权重或激活值分成256个不同的离散值，而16位则分为65536个离散值，因此16位的表示范围更广，可以更精确地表示模型中的参数和激活值。但是，使用较高的位深度会增加存储要求和计算成本，因此需要在预测精度和计算开销之间进行权衡。

<img alt="picture 1" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DLdeploy-16to8bit.png" width="70%"/>  



乘一个系数把float类型的小数部分转换成整数部分，然后用这个转换出来的整数进行计算，计算结果再还原成float

<img alt="图 3" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DLdeployquantized.png" width="80%"/>  

[A White Paper on Neural Network Quantization](https://arxiv.org/pdf/2106.08295.pdf)

[AI 框架部署方案之模型量化概述](https://zhuanlan.zhihu.com/p/354921065)
[AI 框架部署方案之模型量化的损失分析](https://zhuanlan.zhihu.com/p/400927037)

## 校准
由于模型的权重是静态的，而每一层的激活值（Activations）会随着输入数据的变化而变化，校准（Calibration）的核心目的就是通过运行少量具有代表性的样本（校准集），统计并估算每一层激活值的数值分布，从而寻找一个最优的截断范围（Clipping Range）$[-|\max|, |\max|]$，进而计算出量化所需的缩放因子（Scale）和零点（Zero-point）。

激活值的分布往往存在极端的长尾现象（Outliers）。
+ 如果截断范围过大，绝大多数集中分布的数值在映射到 INT8 时会丢失精度（分辨率不足）；
+ 如果截断范围过小，则超出范围的极大值被强行截断，会产生截断误差。

校准算法本质上就是在量化分辨率和截断误差之间寻找最优解: 最完美的截断阈值（Clipping Threshold, $T_{clip}$）。

  因为 FP32 的数值动态范围极大（比如 $[-1000.0, 1500.0]$），但 INT8 只能表达 $[-128, 127]$（共 256 个台阶）。如果我们直接把最大值 $1500.0$ 作为边界，由于代表单个台阶的缩放因子 $Δ = (1500 - (-1000))/(255) ≈ 9.8$，那么大部分分布在 $[-1.0, 1.0]$ 之间的微弱车位特征，其数值直接会被除以 $9.8$ 并四舍五入归零，发生严重的“欠量化”特征消失。

  所以我们必须在远端“截断（Clip）”极少数异常极大值（Outliers），将截断阈值 $T_{clip}$ 收缩到一个更小的区间（如 $[-5.0, 5.0]$），使大部分核心特征在 $[-5.0, 5.0]$ 之间获得高达 (10)/(255) ≈ 0.039 级的极高分辨率。

### 均方误差校准算法（MSE Calibration）

MSE（Mean Squared Error）校准，是通过最小化“原始 FP32 张量”与“量化后反量化（Fake-Quantized）的 INT8 张量”之间的 L2 范数（均方误差），来逆向求解出最佳截断值 T。

  设输入特征张量为 X，我们在设定一个截断值 T 后：
   1. 截断（Clamp）：将 X 中超出 $[-T, T]$ 的值强制归并为 $-T$ 或 T，得到截断张量 X_{clip}。
   2. 量化与反量化（Fake Quantization）：将其转为 INT8 后再转回 FP32，模拟定点化带来的精度损失，得到重建张量 $\hat{X}$：$\hat{X} = Dequantize\left(Quantize\left(X_{clip}, Δ\right)\right)$
   3. 计算目标函数（L2 损失）：
     我们的目标是寻找一个 T，使得 X 与 $\hat{X}$ 之间的均方误差最小：
     $argmin_{T} MSE(T) = argmin_{T} (1)/(N) ∑ᵢ₌₁^{N} \left( Xᵢ - \hat{X}_i(T) \right)²$

  MSE 目标同时反映两类误差：
  Total Error = Clipping Error (截断误差) + Rounding Error (舍入误差)
```
    1           ▲ 概率密度
    2           │
    3           │         ┌──Rounding Error (缩尺太宽，小特征舍入归零)
    4           │         ▼
    5           │       ┌─┴─┐
    6           │      /│   │\
    7           │     / │   │ \  ◄─── 寻找最佳截断点 T_opt 
    8           │____/  │   │  \____
    9         ──┴───────┼───┼───────┼───────► 数值
   10                  -T_opt       T_max 
   11                           └───┬───┘
   12                               ▼
   13                         Clipping Error (缩尺太窄，大特征截断失真)
```
MSE 校准可通过网格搜索等方式比较候选阈值。搜索区间和算法由实现决定，不固定为 $[0.5T_{max},T_{max}]$。

### 绝对最大值校准（MinMax Calibration）
   * 原理：最简单直接的校准方法。不裁剪任何数据，直接将校准数据集中出现过的绝对最大值作为截断阈值：
    $T_{clip} = max\left(|Xₘᵢₙ|, |Xₘₐₓ|\right)$
   * 优点：计算极其简单，几乎不需要任何校准数据集，耗时为 0。
   * 缺点：对异常极大值（Outliers）极度敏感。只要数据集里有一帧由于反光、噪声产生了一个很大的异常激活值，量化精度就会发生雪崩（产生严重的欠量化）。
   * 适用场景：仅适用于数值分布非常均匀、没有异常偏离点的浅层卷积层。

### KL 散度/信息熵校准（Kullback-Leibler Divergence / Entropy Calibration）
  这是 NVIDIA TensorRT 默认推荐并被行业极为广泛使用的算法。
   * 原理：它将 FP32 特征值和 INT8 特征值看作两个概率分布（Probability Distributions） P 和 Q。它通过计算 KL 散度（相对熵），来衡量这两个概率分布之间的相似度。通过搜索一个截断阈值 T，使得截断前后的信息失真（相对熵损失）达到最小：
    $argmin_{T} D_{KL}(P || Q(T)) = ∑ᵢ Pᵢ log\left((Pᵢ)/(Qᵢ(T))\right)$
   * 优点：从信息论角度出发，它不仅平衡了误差，而且最大程度地保留了特征图的原始概率特征和信息分布。
   * 缺点：结果依赖直方图分桶、候选阈值和实现细节，不保证任务 KPI 最优。
### 百分比校准（Percentile Calibration）
   * 原理：非常简单粗暴但异常有效的工程方案。通过直接统计校准数据集中的特征值分布，强行将排在最远端的固定百分比（如 99.9% 或 99.99%）的数据保留，其余 0.01% 的极大值直接切掉：
    $T_{clip} = Percentile(X, 99.99\%)$
   * 优点：计算速度极快，远快于 KL 散度和 MSE。
   * 缺点：百分比参数（例如是 99.9% 还是 99.99%）需要工程师凭经验进行繁琐的手动超参调优（Hyper-parameter Tuning）。
   * 适用场景：目标检测中的边界框回归层，或者需要快速输出量化结果的敏捷开发交付。

## QAT量化优化案例

以下是特定泊车 BEV 项目的排查记录。张量形状、14 个深度格、95%/5% 算力占比和精度变化都属于当时配置，复用前应重新测量。

### 空间特征累加导致的定点数溢出 (Integer Overflow)
   * 问题描述：在 VoxelPooling 的矩阵乘法投影阶段，由于我们使用的是 Uniform Depth（均匀深度），同一个 2D 像素的特征会被投射到射线穿过的 14 个深度格子里。在矩阵乘法进行特征累加（Pooling）时：$F{BEV} = Mₛₚₐᵣₛₑ × F{2D}$
    由于稀疏映射矩阵 mapper_matrix 里的数值是非零整数或浮点，数千个 2D 像素特征在同一个 BEV 网格相加累计。在 INT8 量化中，这会导致累加后的激活值（Activation）急剧变大，直接超出 INT8 最大值 127
  限制，发生严重的饱和溢出或数值截断（Clipping），导致量化后的 BEV 特征图出现大面积噪声，车位检测精度直接雪崩。
   * 对策:QAT 中的权重归一化：
    在量化感知训练（QAT）时，对映射稀疏矩阵的行进行归一化缩放（Scaling）,将每行（即每个 BEV 栅格所接收的 2D 像素映射总数）进行均值缩放。使稀疏投影矩阵的所有行之和严格等于 1,彻底防止了定点数乘加运算时的溢出，将量化后的 BEV 目标检测精度（mAP）损失控制在了极其优秀的 0.5% 以内。
   * 数学原理：原始的稀疏映射矩阵 Mₛₚₐᵣₛₑ 里面只有 0 和 1（1 代表映射，0 代表无映射）。当执行矩阵相乘时，BEV 的某个栅格 i 会有 Kᵢ 个 2D 像素对其做等强度贡献，使得物理特征在相加后，数值瞬间放大了 Kᵢ 倍。
   * 优化收益：将稀疏投影矩阵的所有行之和严格限制为 1.0（即每一个 BEV 网格接收的特征能量均值化）。这从源头上保证了特征投影前后的激活值动态范围高度一致，彻底杜绝了乘加运算（GEMM）在 NPU 内部累加器中发生 INT8/INT32饱和溢出的硬件风险。

### YUV 输入端定点化精度丢失
   * 问题描述：我们的 Backbone 输入是 YUV 格式数据（亮度 x_y 为 1 通道，色度 x_uv 为 2 通道）。由于 YUV 数据中亮度和色度的动态数值范围（Dynamic Range）差异极大，直接使用统一的 Scale
     进行量化会导致色度特征丢失。
   * 对策：为 `x_y` 和 `x_uv` 分别注册量化观察器，使用独立的 scale 和 zero-point，避免两个分布共享同一组量化参数。
    在训练时，模型使用 HistogramObserver（直方图观察器）分别收集 x_y 和 x_uv 在数万帧数据中的激活值分布。对于噪声多、动态范围广的色度通道，计算出专属的 $Scale_{uv}$ 和 $Zero_Point_{uv}$。
   * 优化收益：使色度通道的微弱特征（如暗色泊车位线、暗光地标特征）在经过 INT8 定点化后依然能够保留其完整的对比度信息，彻底消除了在暗光或地标边缘区域的漏检和抖动。

### BEV 特征图边界的量化区间校准与截断（Quant Clamping & Calibration）
  在 VoxelPooling 完成、多个相机的特征拼合到全局网格 grid 时，由于相交视野区域（如 FV 与 MVL 交叠区）会有多个相机的特征做物理累加，而单相机区域（如 FV 正前方远端）只有单路特征。这会导致 BEV
  特征图的局部数值分布出现极强的不均匀性。
    我们在 BevEncoder 的前向传播输入端，强行插入了显式的量化截断层（Quant Clamping Layer）。
    在 QAT 训练中，我们使用 MSE (Mean Squared Error) Calibration（均方误差校准算法）来搜索最完美的 Clipping 边界值 T_{clip}：$F{Quant} = Clamp\left(F{BEV}, -T_{clip}, T_{clip}\right)$
    它放弃了极少数异常极大值（Outliers，如高反光带带来的特征暴增），将 99.9% 核心 BEV 特征的 INT8 表示精度聚焦在 [-T_{clip}, T_{clip}] 区间。
   * 优化收益：这极大地提高了量化阶（Quantization Scale）的精度。由于截断了异常噪声值，定点数的分辨率（每一个定点阶数代表的实际浮点大小 $Δ = \frac{2 × T_{clip}}{255}）$变得极其精细，将拼合边界（Suture
  lines）由于特征不均匀导致的锯齿感和特征失真降到了最低。

### 混合精度部署策略（Mixed-Precision Policy）
  在量产落地中，我们发现有些任务头（如用来做微距高精度定位的车位角点回归检测头）对定点数极其敏感。因为回归任务需要极其平滑、高分辨率的特征差值，在 INT8下会因为分辨率不够产生严重的“像素级跳跃”和台阶效应。
混合精度部署（Mixed-Precision）：
  * INT8 全速运行（占 95% 算力）：Backbone、Neck、LSS Projection、BevEncoder 等占据模型 95% 以上算力和计算瓶颈的特征提取干线，全量进行 INT8 全速量化。
  * FP16 精度保障（占 5% 算力）：对于最后的 PolygonObjectDetectionHead 检测头，在部署编译时指定为 FP16（半精度浮点数） 运行。
    这一混合精度策略在车端无需任何额外的硬件开销，却在保证车端超高实时吞吐率的同时，完全消除了车位检测边界和角点回归的抖动问题，回归精度（角点距离误差）直接追平了 FP32 浮点模型。
___

# 剪枝
[pytorch如何使用自带的模型剪枝工具prune](https://blog.csdn.net/weixin_48304306/article/details/126993559)
目前最先进的深度学习技术依赖于过度参数化的模型，这些模型很难部署。相反，生物神经网络被认为使用了高效的稀疏连接。识别出在模型中通过减少参数数量来压缩模型的最佳技术是很重要的，这样可以减少内存、电池和硬件消耗，同时又不损失准确性。可以在设备上部署轻量级模型，PyTorch 提供了多种剪枝技术，如随机剪枝、L1剪枝、结构化剪枝等
```py
import torch
import torch.nn.utils.prune as prune
import onnx
from onnxsim import simplify

from common import utils
import model.net as net

# 加载model
json_path = r'experiments\params.json'
params = utils.Params(json_path)
model = net.fetch_net(params)
state_dict = torch.load('509_best.pth', map_location=torch.device('cpu'))
# 将状态字典加载到模型中
model.load_state_dict(state_dict, strict=False)
model.eval()

# 定义剪枝函数，全局剪枝，根据全局的权重分布进行剪枝，而不是仅针对某一层
def global_pruning(model, pruning_amount):
    parameters_to_prune = []
    for module_name, module in model.named_modules():  
        if isinstance(module, torch.nn.Conv2d) or isinstance(module, torch.nn.Linear):  #遍历卷积层和全连接层
            parameters_to_prune.append((module, 'weight'))

    prune.global_unstructured(
        parameters_to_prune,
        pruning_method=prune.L1Unstructured,    #基于L1范数（绝对值和）进行非结构化剪枝
        amount=pruning_amount,
    )
    return model

# 移除剪枝掩码,永久移除剪枝后的 mask，使剪枝效果不可逆
def remove_pruning_masks(model):
    for module_name, module in model.named_modules():
        if isinstance(module, torch.nn.Conv2d) or isinstance(module, torch.nn.Linear):
            try:
                prune.remove(module, 'weight')  #移除指定参数上的剪枝掩码
            except ValueError:
                pass
    return model


pruning_amount = 0.30    # 示例：全局裁掉 30% 权重；实际比例由验证集决定
model = global_pruning(model, pruning_amount)   #全局剪枝

# 移除剪枝掩码
model = remove_pruning_masks(model)

# 保存为PTH
torch.save(model.state_dict(), '509_best_pruned.pth')
# 导出为 ONNX 格式
dummy_input = torch.randn(1, 3, 128, 256)
onnx_path = '509_best_pruned.onnx'

torch.onnx.export(model,dummy_input, onnx_path, verbose=False, export_params=True, opset_version=11)

# 简化 ONNX 模型
onnx_model = onnx.load(onnx_path)
simplified_model, check = simplify(onnx_model)
if not check:
    raise RuntimeError("ONNX simplification check failed")
onnx.save(simplified_model, '509_best_pruned.onnx')
print("Done")
```



<span id="onnx"></span>

# ONNX 转换与优化
[模型部署简介 --- mmdeploy 1.3.1 文档](https://mmdeploy.readthedocs.io/zh-cn/latest/tutorial/01_introduction_to_model_deployment.html)

神经网络实际上只是描述了数据计算的过程，其结构可以用计算图表示。比如 `a+b` 可以用下面的计算图来表示：
![a+b](https://user-images.githubusercontent.com/4560679/156558717-96bbe544-4dc7-4460-8850-3cb1790e39ec.png)

为了加速计算，一些框架会使用对神经网络“先编译，后执行”的静态图来描述网络。静态图的缺点是难以描述控制流（比如 if-else 分支语句和 for 循环语句），直接对其引入控制语句会导致产生不同的计算图。比如循环执行 n 次 `a=a+b`，对于不同的 n，会生成不同的计算图：
![n=2](https://user-images.githubusercontent.com/4560679/156558606-6ff18e19-f3b1-463f-8f83-60bf6f7ef64b.png)

ONNX（Open Neural Network Exchange）开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，是 Facebook 和微软在 2017 年共同发布的，用于标准描述计算图的一种格式。目前，在数家机构的共同维护下，ONNX 已经对接了多种深度学习框架和多种推理引擎。因此，ONNX 被当成了深度学习框架到推理引擎的桥梁，就像编译器的中间语言一样。

> 链接：[ONNX](https://onnx.ai)，[Github](https://github.com/onnx/onnx)，[ONNX Runtime](https://onnxruntime.ai/)，[ONNX Runtime Web](https://onnx.coderai.cn) 
[torch.onnx 文档](https://pytorch.org/docs/stable/onnx.html)， [torch.onnx Github](https://github.com/pytorch/pytorch/tree/main/torch/onnx)
PyTorch 对 ONNX 的算子支持:[官方算子文档](https://github.com/onnx/onnx/blob/main/docs/Operators.md)
[opset_version版本对应关系](https://github.com/onnx/onnx/blob/main/docs/Versioning.md#released-versions)


算子：深度学习算法由计算单元组成，我们称这些计算单元为算子（Operator，也称op）。 算子是一个函数空间到函数空间上的映射，同一模型中算子名称是唯一的，但是同一类型的算子可以存在多个。 如：Conv1、Conv2，是两个算子类型相同的不同算子。PyTorch 转 ONNX，实际上就是把每个 PyTorch 的操作**映射**成了 ONNX 定义的**算子**。



在转换普通的torch.nn.Module模型时，PyTorch 一方面会用跟踪法执行前向推理，把遇到的算子整合成计算图；另一方面，PyTorch 还会把遇到的每个算子翻译成 ONNX 中定义的算子。要使 PyTorch 算子顺利转换到 ONNX ，我们需要保证：
> 1.算子在 PyTorch 中有实现
2.有把该 PyTorch 算子映射成一个或多个 ONNX 算子的方法
3.ONNX 有相应的算子


## ONNX 算子优化案例
### Slice替换Gather, 替换索引取值
   在多相机循环投影时，模型最初直接通过相机索引从 batch 特征图中拿取单视角特征：x[cam_id]
  + 编译结果：标量索引通常会导出为 Gather 类算子。该算子在特定目标 NPU 上发生 CPU fallback；是否支持以及性能如何取决于编译器版本和索引形式。
  > Gather：x[cam_id] （使用单个整型索引提取第 cam_id 个相机的特征，返回的张量少了一个维度）。代表离散、非连续、不确定寻址 (Random/Indirect Memory Access)。对于以高并行乘加（MAC）为核心、但片外 SRAM / DRAM 带宽受限的车载 NPU 来说，这种不确定的跳转会导致频繁的 Cache Miss（缓存不命中） 和总线等待，从而造成严重的计算管线停顿
  + 优化原理：`x[cam_id:cam_id+1]` 可导出为 Slice，并保留该维度。在当时目标后端中，Slice 获得了更好的算子支持和延迟；切换平台后必须重新编译与 profiling。
  > Slice：x[cam_id : cam_id + 1] （使用区间切片提取，返回的张量保留原有维度，形状为 (1, fH*fW, C)）。代表连续内存访问 (Sequential Memory Access)。它在物理内存中只需要提供一个 Start_Address（起始地址）和 Length（步长长度），然后通过 DMA（直接内存访问）将一整块连续的数据一次性拷贝到 NPU的片上高速缓存（SRAM）中。

### MatMul换ScatterND

  ONNX 能表达部分稀疏数据和算子，但目标编译器的支持范围各不相同。应同时保留可替换实现并根据编译报告选择：
   1. MatMul（矩阵乘法算子）：将映射关系编码为矩阵并与特征相乘。适合支持相应矩阵尺寸且内存开销可接受的后端。
   2. ScatterND（散布写入算子）：根据索引，将一个特征张量中的数据直接“分发并写入”到目标全景 BEV 零张量的对应物理槽位中
      * 由于硬件编译器的局限性：某些老一代车载 NPU 芯片，其 GEMM 乘法加速器内存极度受限（无法一次性载入巨大的静态映射矩阵），但是它的片上 DMA 控制器却支持高速的数据多路写入（即 Scatter 硬件支持）。
        * 若后端能高效执行该尺寸的 MatMul，可优先测量矩阵方案。
        * 若 ScatterND 支持更好，可测量索引散布方案。最终选择依据端到端延迟、内存、精度和 fallback 情况。



## 以超分辨率模型为例
参考：[模型部署那些事](https://www.zhihu.com/column/c_1497987564452114432)
以下是早期 symbolic 导出接口的超分辨率示例。现代 PyTorch 导出器和 ONNX Resize 支持会随版本变化；只有目标 opset 或后端不能表达所需语义时才考虑自定义 symbolic，并应先查阅当前 [`torch.onnx`](https://docs.pytorch.org/docs/stable/onnx.html) 文档。
```py
class NewInterpolate(torch.autograd.Function):
    # 自定义的插值算子，继承自torch.autograd.Function
    @staticmethod
    def symbolic(g, input, scales):
        # 静态方法，用于定义符号图的构建过程, g: 符号图构建器, input: 输入张量, scales: 缩放因子
        #ONNX 算子的具体定义由 g.op 实现。g.op 的每个参数都可以映射到 ONNX 中的算子属性
        #对于其他参数，可以照着 Resize 算子文档填
        return g.op("Resize",  # 使用Resize操作
                    input,  # 输入张量
                    g.op("Constant", value_t=torch.tensor([], dtype=torch.float32)),  # 空的常量张量
                    scales,  # 缩放因子
                    coordinate_transformation_mode_s="pytorch_half_pixel",  # 坐标转换模式为pytorch_half_pixel
                    cubic_coeff_a_f=-0.75,  # cubic插值的系数a为-0.75
                    mode_s='cubic',  # 插值模式为cubic
                    nearest_mode_s="floor")  # 最近邻插值模式为floor

    @staticmethod
    def forward(ctx, input, scales):    #算子的推理行为由算子的 foward 方法决定
        scales = scales.tolist()[-2:]   #截取输入张量的后两个元素,把 [1, 1, w, h] 格式的输入对接到原来的 interpolate 函数上
        return interpolate(input,   #把这两个元素以 list 的格式传入 interpolate 的 scale_factor 参数。
                           scale_factor=scales,
                           mode='bicubic',
                           align_corners=False)
```

![alt text](https://user-images.githubusercontent.com/4560679/157627349-10ed5483-8bde-47d0-b190-a7a4d0ca2c03.png)

<details>
    <summary>SRCNN超分辨率代码</summary>

```py
class StrangeSuperResolutionNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.conv1 = nn.Conv2d(3, 64, kernel_size=9, padding=4)
        self.conv2 = nn.Conv2d(64, 32, kernel_size=1, padding=0)
        self.conv3 = nn.Conv2d(32, 3, kernel_size=5, padding=2)

        self.relu = nn.ReLU()

    def forward(self, x, upscale_factor):
        x = NewInterpolate.apply(x, upscale_factor)
        out = self.relu(self.conv1(x))
        out = self.relu(self.conv2(out))
        out = self.conv3(out)
        return out


def init_torch_model():
    torch_model = StrangeSuperResolutionNet()

    state_dict = torch.load('srcnn.pth')['state_dict']

    # Adapt the checkpoint
    for old_key in list(state_dict.keys()):
        new_key = '.'.join(old_key.split('.')[1:])
        state_dict[new_key] = state_dict.pop(old_key)

    torch_model.load_state_dict(state_dict)
    torch_model.eval()
    return torch_model


model = init_torch_model()
factor = torch.tensor([1, 1, 3, 3], dtype=torch.float)

input_img = cv2.imread('face.png')
if input_img is None:
    raise FileNotFoundError('face.png')
input_img = input_img.astype(np.float32)

# HWC to NCHW
input_img = np.transpose(input_img, [2, 0, 1])
input_img = np.expand_dims(input_img, 0)

# Inference
torch_output = model(torch.from_numpy(input_img), factor).detach().numpy()

# NCHW to HWC
torch_output = np.squeeze(torch_output, 0)
torch_output = np.clip(torch_output, 0, 255)
torch_output = np.transpose(torch_output, [1, 2, 0]).astype(np.uint8)

# Show image
cv2.imwrite("face_torch2.png", torch_output)
input_img1 = cv2.imread('face.png')
cv2.imshow("Input Image", input_img1)
cv2.imshow("Torch Output", torch_output)
cv2.waitKey(0)
cv2.destroyAllWindows()
```
</details>

---
模型转换为ONNX，验证正确性，运行推理：
```py
# pth2onnx
x = torch.randn(1, 3, 256, 256)
# 一种叫做追踪（trace）的模型转换方法：给定一组输入，再实际执行一遍模型，即把这组输入对应的计算图记录下来，保存为 ONNX 格式
with torch.no_grad():
    torch.onnx.export(model, (x, factor),
                      "srcnn2.onnx",
                      opset_version=11,
                      input_names=['input', 'factor'],
                      output_names=['output'])


# 验证onnx, 此外可以使用Netron可视化检查网络结构
onnx_model = onnx.load("srcnn2.onnx")
try:
    onnx.checker.check_model(onnx_model)
except Exception:
    print("Model incorrect")
else:
    print("Model correct")


# 选择放大倍数，运行ONNX Runtime 推理
input_factor = np.array([1, 1, 5, 5], dtype=np.float32)
ort_session = onnxruntime.InferenceSession("srcnn2.onnx")   # 用于获取一个 ONNX Runtime 推理器
ort_inputs = {'input': input_img, 'factor': input_factor}
ort_output = ort_session.run(None, ort_inputs)[0]

ort_output = np.squeeze(ort_output, 0)
ort_output = np.clip(ort_output, 0, 255)
ort_output = np.transpose(ort_output, [1, 2, 0]).astype(np.uint8)
cv2.imwrite("face_torch2_run.png", ort_output)  # 生成上采样图片，运行成功
```
<img alt="picture 0" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DLdeploynetron.png" width="80%"/>  

## `torch.onnx.export` 转换接口

PyTorch 可通过 `torch.onnx.export(model, args, path, ...)` 导出 ONNX。接口和默认导出器会随 PyTorch 版本变化，使用时应查阅当前 [`torch.onnx` 文档](https://docs.pytorch.org/docs/stable/onnx.html)。重点确认输入分支、dtype、shape、输入输出名称、opset 以及目标 runtime 的动态维支持。
[TorchScript](https://link.zhihu.com/?target=https%3A//pytorch.org/docs/stable/jit.html) 是一种序列化和优化 PyTorch 模型的格式，在优化过程中，一个`torch.nn.Module`模型会被转换成 TorchScript 的 `torch.jit.ScriptModule`模型。
Tracing 只记录示例输入实际经过的路径，因此数据相关控制流可能被固化。遇到循环、条件分支或不支持算子时，应先检查当前导出器的图捕获能力，再考虑改写模型或自定义算子。

```py

# model: 模型， args：输入， f：导出文件名，
# export_params：是否存储模型权重， ONNX 是用同一个文件表示记录模型的结构和权重的,默认True
# input_names, output_names：设置输入和输出张量的名称。如果不设置的话，会自动分配一些简单的名字（如数字），最好设置，保证 ONNX 和推理引擎中使用同一套名称。
# opset_version：选择目标 runtime 支持且能表达所需算子的版本，不依赖旧版默认值。
# dynamic_axes：指定输入输出张量的哪些维度是动态的。为了效率，ONNX 默认所有参与运算的张量都是静态的（张量的形状不发生改变），必要时需要显式地指明输入输出张量的哪几个维度的大小是可变的。
```

导出后至少执行 `onnx.checker`，再使用 ONNX Runtime 和固定测试样本与 PyTorch 输出做数值对齐。只有导出、校验、数值对齐和目标后端编译全部通过，才能认为转换链路成立。

## 自定义算子
-   PyTorch 算子
    -   组合现有算子
    -   添加 TorchScript 算子
    -   添加普通 C++ 拓展算子
-   映射方法
    -   为 ATen 算子添加符号函数
    -   为 TorchScript 算子添加符号函数
    -   封装成 `torch.autograd.Function` 并添加符号函数
-   ONNX 算子
    -   使用现有 ONNX 算子
    -   定义新 ONNX 算子

[模型部署入门教程（四）：在 PyTorch 中支持更多 ONNX 算子](https://zhuanlan.zhihu.com/p/513387413)


<span id="deployment-sdk"></span>

# 部署框架与 SDK（以 MMDeploy 为例）
## 模型转换器设计
[千行百业智能化落地，MMDeploy 助你一"部"到位 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/450342651)
<img alt="图 3" src="https://pic1.zhimg.com/80/v2-a076d9317d2167d9d6d8898e0db0fd7c_1440w.webp?source=1940ef5c" width="80%"/>  
模型转换器的具体步骤为：

1. 把 PyTorch 转换成 ONNX 模型；
2. 对 ONNX 模型进行优化；
3. 把 ONNX 模型转换成后端推理引擎支持的模型格式;
4. （可选）把模型转换中的 meta 信息和后端模型打包成 SDK 模型。

在传统部署流水线中，兼容性是最难以解决的瓶颈。针对这些问题，MMDeploy 在模型转换器中添加了模块重写、模型分块和自定义算子这三大功能
+ 模块重写——有效代码替换
针对部分 Python 代码无法直接转换成 ONNX 的问题，MMDeploy 使用重写机制实现了函数、模块、符号表等三种粒度的代码替换，有效地适配 ONNX。
+ 模型分块——精准切除冗余
针对部分模型的逻辑过于复杂，在后端里无法支持的问题，MMDeploy 使用了模型分块机制，能像手术刀一样精准切除掉模型中难以转换的部分，把原模型分成多个子模型，分别转换。这些被去掉的逻辑会在 SDK 中实现。
+ 自定义算子——扩展引擎能力
OpenMMLab 实现了一些新算子，这些算子在 ONNX 或者后端中没有支持。针对这个问题，MMDeploy 把自定义算子在多个后端上进行了实现，扩充了推理引擎的表达能力。

## 应用开发工具包 SDK
<img alt="图 3" src="https://pic2.zhimg.com/80/v2-5618bc32c6018dbe6b7419555c373445_1440w.webp" width="80%"/>  

+ 接口层
SDK 为每种视觉任务均提供一组 C API。目前开放了分类、检测、分割、超分、文字检测、文字识别等几类任务的接口。 SDK 充分考虑了接口的易用性和友好性。每组接口均只由 ‘创建句柄’、‘应用句柄’、‘销毁数据’ 和 ‘销毁句柄’ 等函数组成。用法简单、便于集成。
+ 流水线层
SDK 把模型推理统一抽象为计算流水线，包括前处理、网络推理和后处理。对流水线的描述在 SDK Model 的 meta 信息中。使用 Model Converter 转换模型时，加入 --dump-info 命令，即可自动生成。 不仅是单模型，SDK同样可把流水线拓展到多模型推理场景。比如在检测任务后，接入识别任务。
+ 组件层
组件层为流水线中的节点提供具体的功能。SDK 定义了3类组件，
    + 设备组件（Device）：对硬件设备以及 runtime 的抽象
    + 模型组件（Model）：支持 SDK Model 不同的文件格式
    + 任务组件（Task）：模型推理过程中，流水线的最小执行单元。它包括:
        + 预处理（preprocess）：与 OpenMMLab Transform 算子对齐，比如 Resize、Crop、Pad、Normalize等等。每种算子均提供了 cpu、cuda 两种实现方式。
        + 网络推理引擎（net）：对 TensorRT、ONNX Runtime、NCNN、OpenVINO 等后端的封装；当前支持列表以所用 MMDeploy 版本文档为准。
        + 后处理（postprocess）：对应与 OpenMMLab 各算法库的后处理功能。
+ 核心层
核心层是 SDK 的基石，定义了 SDK 最基础、最核心的数据结构。

<span id="deployment-checklist"></span>

# 部署验收清单

| 阶段 | 必查项 |
| --- | --- |
| 基线 | 代码、权重、数据版本、预处理、随机种子与 FP32 KPI 可复现 |
| 剪枝 | 参数量/MACs 确实下降；残差与拼接维度正确；微调后 KPI 达标 |
| 量化 | 校准集覆盖关键场景；逐层误差、饱和率和敏感层记录完整 |
| ONNX | checker 通过；输入输出名称与 shape 正确；PyTorch/ORT 数值对齐 |
| 编译 | 无意外 CPU fallback；算子融合、精度分区和编译警告已审查 |
| 真机 | 预热后测 P50/P95 延迟、峰值内存、功耗和长时间稳定性 |
| SDK | 前后处理、颜色空间、layout、归一化、NMS 与训练配置一致 |
| 发布 | 模型、encodings、配置、runtime 版本和回退包一起归档 |

## 复习自测

1. 为什么 mask pruning 不一定减少真机延迟，而结构化剪枝更容易产生实际收益？
2. PTQ 的校准集为什么不需要标签，却仍必须覆盖真实输入分布？
3. Scale、zero-point、截断误差和取整误差之间是什么关系？
4. 什么情况下应从 PTQ 升级到 QAT，什么情况下应使用混合精度？
5. ONNX 导出通过后，为什么仍要做 ORT 对齐、后端编译和真机验证？
