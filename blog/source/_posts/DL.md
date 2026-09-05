---
title: DL：深度学习相关概念
date: 2022-12-28 20:22:05
mathjax: true
tags:
- 深度学习
---
记录深度学习基本概念，不断更新中，项目地址：[DLpractice](https://github.com/Arrowes/DLpractice)
<!--more-->

从机器学习到深度学习：[从机器学习谈起](https://www.cnblogs.com/subconscious/p/4107357.html)，[从神经元到深度学习](https://www.cnblogs.com/subconscious/p/5058741.html)
什么是卷积讲解视频：[大白话讲解卷积神经网络工作原理](https://www.bilibili.com/video/BV1sb411P7pQ/?share_source=copy_web&vd_source=b148fb6f311bfe6f3870ad8f4dfda92a)

[DL500问](https://github.com/scutan90/DeepLearning-500-questions)

# 深度学习框架
```mermaid
graph LR
A[程序框架]-->B[A.黑箱]
A-->C[B.模块化] -->1.处理数据
C-->2.构建网络
C-->3.损失函数
C-->4.优化函数
C-->5.模型保存
A-->E[C.定义]
```

<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL1.png" width = "60%" />

GPU 网络和数据要同时送进GPU

## 激活函数 Activate Function
激活函数是深度学习神经网络中的一个重要组成部分，它用来引入*非线性性质*，使神经网络能够学习复杂的函数关系。激活函数接收神经元的输入，并产生输出作为下一层神经元的输入。在神经网络中，激活函数通常被应用于每个神经元的输出，使神经网络能够进行非线性映射和学习。

激活函数的主要作用有以下几点：
+ 非线性映射：激活函数引入非线性性质，使神经网络可以逼近和表示复杂的非线性函数。如果没有激活函数，多层神经网络的组合将等效于单一层的线性变换。
+ 特征提取：激活函数有助于神经网络从输入数据中提取关键特征，例如边缘、纹理、形状等，以便更好地完成分类、回归和其他任务。
+ 解决梯度消失问题：某些激活函数（如ReLU）有助于减轻梯度消失问题，使深层网络能够更好地进行反向传播和训练。

一些常见的激活函数包括：

激活函数                       |特点          |图像
------------------------------|--------------|---------
 $$softmax(x_i) = \frac{e^{x_i}}{\sum_{j=0}^{N} e^{x_j}}$$  | 将未规范化的预测变换为非负数并且总和为1，同时让模型保持可导的性质;常用在分类网络的最后一层，把网络输出转化为各类别的概率。 |首先对每个未规范化的预测求幂，这样可以确保输出非负。为了确保最终输出的概率值总和为1，再让每个求幂后的结果除以它们的总和
挤压函数（squashing function）$$sigmoid(x) = \frac 1{1 + exp(−x)}$$  | 将输入映射到范围(0, 1)，常用于二元分类问题。sigmoid可以视为softmax的特例 | <img src="https://zh.d2l.ai/_images/output_mlp_76f463_51_0.svg"  />
双曲正切 $$tanh(x) = \frac {1 − exp(−2x)}{1 + exp(−2x)}$$   |   将输入映射到范围(-1, 1)，也用于某些分类和回归问题, 当输入在0附近时，tanh函数接近线性变换。形状类似于sigmoid函数，不同的是tanh函数关于坐标系原点中心对称。（LSTM）|<img src="https://zh.d2l.ai/_images/output_mlp_76f463_81_0.svg"  />
修正线性单元（Rectified Linear Unit）$$ReLU(x) = max(x, 0)$$  $$LeakyReLU=max(αx,x)$$ |求导表现得特别好：要么让参数消失，要么让参数通过。最常用的激活函数，通常能够加速收敛和减轻梯度消失问题（Transfromer）； LeakyReLU中通常设α=0.01来调整负值的零梯度，缓解dead ReLU问题（YOLO） 若α为可学习参数，则为PReLU|    <img src="https://zh.d2l.ai/_images/output_mlp_76f463_21_0.svg"  />
指数线性单元 (Exponential Linear Units) <img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL_ELU.png"/>|   对小于零的情况采用类似指数计算的方式进行输出。与 ReLU 相比，ELU 有负值，这会使激活的平均值接近零。均值激活接近于零可以使学习更快，因为它们使梯度更接近自然梯度。但计算量较大 |<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9waWMyLnpoaW1nLmNvbS84MC92Mi02MDRiZTExNGZhMDQ3OGYzYTEwNTk5MjNmZDEwMjJkMV9oZC5wbmc?x-oss-process=image/format,png"  />


## 感受野(Receptive field)
感受野是指在卷积神经网络中，输出特征图上的一个像素点对应于输入图像上的感受区域大小。感受野的大小可以用来衡量网络在某一层上能够“看到”输入图像的范围，从而影响网络对局部和全局信息的感知能力。
<img src="https://pic1.zhimg.com/80/v2-93a99cd695aeb1b8edf0c4b4eac8b7a9_1440w.webp?source=1940ef5c"  />

$   n_{output.features}=[\frac{n_{input.features}+2p_{adding.size}-k_{ernel.size}}{s_{tride.size}}+1]   $
较小的感受野通常用于捕获局部特征，而较大的感受野则有助于捕获全局信息。
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL2.png" width = "50%" />

## 卷积
一个卷积核（kernel）为3×3、步长（stride）为1、填充（padding）为1的二维卷积：
<img src="https://pic1.zhimg.com/50/v2-d552433faa8363df84c53b905443a556_720w.webp?source=1940ef5c" width = "40%" />

| 组件大类 | 组件名称 | 核心功能 | 典型应用场景 | PyTorch 核心 API 及关键参数 |
| --- | --- | --- | --- | --- |
| **特征提取** | **卷积层**<br><br>(Convolution) | 提取局部空间特征，具有参数共享和平移不变性。 | 图像识别、目标检测等所有 CV 任务 | `nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)` |
|  | **全连接层**<br><br>(Linear) | 全局特征组合，执行矩阵乘法 <br>$$y = xA^T + b$$<br> | 分类器末端输出、MLP（多层感知机） | `nn.Linear(in_features, out_features, bias=True)` |
| **信息聚合** | **最大/平均池化**<br><br>(Pooling) | 下采样，降低特征图空间尺寸，减少计算量，扩大感受野。 | 降低特征维度，防止过拟合 | `nn.MaxPool2d(kernel_size, stride)` <br><br> `nn.AvgPool2d(kernel_size, stride)` |
| **规范化** | **批量归一化**<br><br>(BatchNorm) | 跨 Batch 和空间维度规范化，消除内部协变量偏移，加速训练。 | 在每一层卷积之后，强行将特征图的分布拉回到均值为 0、方差为 1 的正态分布，从而允许使用更大的学习率，并起到一定的正则化作用。 | `nn.BatchNorm2d(num_features, eps=1e-05, momentum=0.1)` |
|  | **层归一化**<br><br>(LayerNorm) | 针对单个样本跨所有通道归一化，不依赖 Batch 大小。 | NLP (Transformer)、序列模型 | `nn.LayerNorm(normalized_shape)` |
|  | **组归一化**<br><br>(GroupNorm) | 将通道分组，组内进行归一化。结合了 BN 和 LN 的优点。 | 微批次（Small Batch Size）下的 CV 任务 | `nn.GroupNorm(num_groups, num_channels)` |
| **机制架构** | **自注意力**<br><br>(Self-Attention) | 计算序列内部任意两点的相关性得分，捕捉长距离依赖。 | 大语言模型 (LLM)、Vision Transformer | `nn.MultiheadAttention(embed_dim, num_heads)` |
|  | **残差连接**<br><br>(Skip Connection) | 将输入直接加到输出上 (<br>$$y=f(x)+x$$<br>)，解决梯度消失。 | 支撑深层网络（如 ResNet、Transformer） | *无现成 API，需在 `forward` 中手动实现*：<br><br>`out = self.layer(x) + x` || **结构控制** | **丢弃层**<br><br>(Dropout) | 训练时随机让部分神经元失活，强迫网络学习鲁棒特征。 | 抑制网络过拟合 | `nn.Dropout(p=0.5)` |
---
在卷积神经网络（CNN）中，理解数学表达式 W ∈ R^{Cₒᵤₜ × Cᵢₙ × K × K} 是掌握模型结构、剪枝和量化策略的基石。

  我们可以从物理多维形状、计算过程以及物理意义三个维度来剖析这句话和“权重”这个参数：

  1. 维度分解：W ∈ R^{Cₒᵤₜ × Cᵢₙ × K × K} 怎么看？

  这代表卷积层（如 PyTorch 中的 nn.Conv2d）的权重张量（Weight Tensor）是一个 4维实数矩阵（4D Tensor），其每一个维度的物理含义如下：

   1. Cₒᵤₜ（输出通道数 / Filter 数量）：
      * 这一层中包含的独立卷积核（滤波器）的数量。
      * 每一个滤波器负责提取一种特定的视觉特征（如：车位线横向边缘、立柱垂直边缘等）。如果这一层有 64 个滤波器，那么输出的特征图就会有 64 个通道。
   2. Cᵢₙ（输入通道数 / 滤波器深度）：
      * 输入给当前层的特征图通道数（或者是原始图像的通道数，如 RGB 的 3 通道，YUV 的 2 通道）。
      * 物理对齐规则：每一个单独的滤波器本身必须是个 3D 实体，其深度（Channel Depth）必须严格等于输入通道数 Cᵢₙ，才能与输入图像在通道维度上完全重合。
   3. K × K（卷积核高与宽 / Kernel Size）：
      * 滤波器在空间维度上的感受野窗口大小（如 3 × 3、5 × 5 或者是 1 × 1）。

  举个具体的自动驾驶物理案例：
  假设我们输入的图像是 YUV 图像（输入通道数 Cᵢₙ = 2），我们用一个卷积层提取特征，输出 16 个通道特征图（输出通道数 Cₒᵤₜ = 16），卷积核大小设为 3 × 3（即 $K = 3$）。
   * 那么，这层卷积的权重张量 W 的形状就是：[16, 2, 3, 3]。
   * 参数个数：16 × 2 × 3 × 3 = 288 个实型浮点数。

  ---

  2. “权重”在这里是一个什么参数？

  在 PyTorch 的 nn.Conv2d 内部包含两个主要的 trainable 参数：weight（权重）和 bias（偏置）。

  在这里，“权重（Weight）”指的就是可学习的局部特征提取系数（Feature Extraction Coefficients / Filter Weights）。

  ① 在前向传播（Forward Pass）中的计算角色：
  当我们对第 i 个滤波器（Wᵢ ∈ R^{Cᵢₙ × K × K}）进行前向计算时，这个 3D 的局部滑动窗口在输入特征图上滑过。在每一个位置，它会将滤波器里的 288 个权重值与输入特征图上局部重叠的 288
  个激活值，执行点对点相乘并全部相加的操作（Frobenius 内积），最后加上偏置 biasᵢ：

  yᵢ = ∑_{c=1}^{Cᵢₙ} ∑ᵤ₌₁^{K} ∑ᵥ₌₁^{K} Wᵢ(c, u, v) · X(c, x+u, y+v) + biasᵢ

  因此，每一个权重实数，本质上就是对输入特征图中特定通道、特定空间相对位置的信号强度进行标定和缩放的“放大/缩小乘数”。

  ② 权重在模型训练、剪枝与量化中的物理演变：
   * 训练前：这些权重是完全随机的噪音（如服从均值为 0 窄方差的随机初始化分布）。
   * 训练后：通过反向传播，权重收敛为具有具体几何意义的参数（如捕获车位角点的算子、捕捉车线颜色的算子）。
   * 在结构化剪枝中（Pruning）：
    我们评分的“第 i 个通道 Wᵢ”，其实指的就是 W 中大小为 Cᵢₙ × K × K 的 3D 权重切片（Slice）。如果我们对模型剪枝 25%：
     1. 计算这 16 个滤波器各自的绝对值之和（L₁ 范数评分）；
     2. 找出评分最低的 4 个滤波器；
     3. 在物理上直接把这 4 个 3D 滤波器 Wᵢ 从张量 W 中整条删去，此时 W 的形状从 [16, 2, 3, 3] 缩减到了 [12, 2, 3, 3]。
### PyTorch 代码综合调用示例

以下展示如何在 PyTorch 中组合使用上述部分核心组件来构建一个标准的前向传播网络块：

```python
import torch
import torch.nn as nn

class CoreComponentsBlock(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(CoreComponentsBlock, self).__init__()
        
        # 1. Convolutional Layer
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False)
        
        # 2. BatchNorm Layer
        self.bn = nn.BatchNorm2d(out_channels)
        
        # 3. Activation (Transcendental Function derivative)
        self.relu = nn.ReLU()
        
        # 4. Dropout Layer
        self.dropout = nn.Dropout(p=0.2)
        
        # 5. Pooling Layer
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        # Shortcut identity mapping if channels change (for Residual Connection)
        self.downsample = None
        if in_channels != out_channels:
            self.downsample = nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=False)

    def forward(self, x):
        # Save input for Residual Connection
        identity = x
        if self.downsample is not None:
            identity = self.downsample(x)
            
        # Feature extraction pipeline
        out = self.conv(x)
        out = self.bn(out)
        out = self.relu(out)
        out = self.dropout(out)
        
        # Residual Connection (Add input back to output)
        out += identity
        
        # Downsampling via Pooling
        out = self.pool(out)
        return out

# Instantiate and test the block
# [Batch=2, Channel=3, Height=32, Width=32]
block = CoreComponentsBlock(in_channels=3, out_channels=16)
dummy_input = torch.randn(2, 3, 32, 32)
output = block(dummy_input)

print("Output shape:", output.shape) # Expected: torch.Size([2, 16, 16, 16])
```

## BatchNorm
BatchNorm 的作用是在 mini-batch 维度上对每个通道的激活做归一化，使其均值接近 0、方差接近 1，再通过可学习参数 gamma 和 beta 做缩放和平移。它可以缓解训练过程中特征分布变化，改善梯度传播，加快收敛，并有一定正则化效果。

以 `BatchNorm2d(C)` 为例，主要参数/状态包括：

- `num_features=C`：通道数。
- `eps`：防止除零的小常数。
- `momentum`：更新 running mean/variance 的动量。
- `affine=True`：是否学习 gamma 和 beta。
- `running_mean`、`running_var`：推理阶段使用的滑动均值和方差。
- `weight(gamma)`、`bias(beta)`：可学习缩放和平移参数。

训练时用 batch 统计量，推理时用 running mean/var。部署时常把 Conv + BN 融合成一个 Conv，以减少计算。

对某个通道的特征，训练时计算 batch 维和空间维上的均值与方差：
`x_hat = (x - mean) / sqrt(var + eps)`
然后用可学习参数恢复表达能力：
`y = gamma * x_hat + beta`

即：
1. 标准化 (Standardization)
$$\hat{x} = \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}}$$

2. 仿射变换 (Affine Transformation)
$$y = \gamma \hat{x} + \beta$$

* $x$：输入的特征值。
* $\mu$ (`mean`)：特征的均值。
* $\sigma^2$ (`var`)：特征的方差。
* $\epsilon$ (`eps`)：为了数值稳定性添加的极小数，防止分母为 0。
* $\gamma$ (`gamma`)：网络通过反向传播学习到的缩放因子。
* $\beta$ (`beta`)：网络通过反向传播学习到的平移因子。

如果输入是 `B x H x W x C`，常见 BN 按通道归一化，每个通道有一个 `gamma` 和一个 `beta`，所以可学习参数是 `2C`。此外还有非可学习的 running_mean 和 running_var，用于推理阶段。部署时 Conv + BN 可以融合到卷积权重和 bias 里。


---

<img alt="图 37" src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL-Conv.jpg" />  


---

### 空洞卷积（膨胀卷积）（Dilated Convolution / Atrous Convolution）
为扩大感受野，在卷积核里面的元素之间插入空格来“膨胀”内核，形成“空洞卷积”（或称膨胀卷积），并用膨胀率参数L表示要扩大内核的范围，即在内核元素之间插入L-1个空格。当L=1时，则内核元素之间没有插入空格，变为标准卷积。
如下图为膨胀率L=2的空洞卷积：
<img src="https://i-blog.csdnimg.cn/blog_migrate/25f59923ebff9de57b88708b04ba0319.jpeg" width = "50%" />

### 可分离卷积（Separable Convolution）
#### 空间可分离卷积（Spatially Separable Convolutions）
将卷积核分解为两项独立的核分别进行操作。分解后的卷积计算过程如下图，先用3x1的卷积核作横向扫描计算，再用1x3的卷积核作纵向扫描计算，最后得到结果。采用可分离卷积的计算量比标准卷积要少。
<img src="https://i-blog.csdnimg.cn/blog_migrate/73552c43d83172806c87876ca2b46cad.jpeg" width = "70%" />

#### 深度可分离卷积（Depthwise Separable Convolutions）
一种高效的卷积方式，它通过先对每个通道单独做空间上的卷积（depthwise），再用 1×1 卷积融合通道信息（pointwise），与标准卷积相比显著减少了参数量和计算成本，特别适合部署在轻量级或移动设备上，同时仍保有较强的特征提取能力。
   1. 使用3个卷积核分别对输入层的3个通道作卷积计算，再堆叠在一起。
   2. 再使用1x1的卷积（3个通道）进行计算，得到只有1个通道的结果
   3. 重复多次1x1的卷积操作（如下图为128次），则最后便会得到一个深度的卷积结果。
   <img src="https://i-blog.csdnimg.cn/blog_migrate/02a334c5b63b85e85e00df195fd3869c.jpeg" width = "80%" />

可变形卷积（Deformable Convolution, DCN）是一种改进的卷积操作，它通过引入可学习的“偏移量（offsets）”来动态调整卷积核的采样位置，使网络能够更好地适应图像中的几何变形和复杂结构。
传统卷积卷积核在特征图上采样的位置是固定的、规则的（如 3×3 网格）。可变形卷积在每个采样点上增加一个可学习的偏移量 Δ𝑝，使得卷积核能够“变形”，灵活地选择更合适的采样位置。
使卷积核不再局限于规则网格，而是可以根据任务需求自适应地调整感受野。

二维高斯核：这种高斯核生成的方式使得置信度图在真实关键点位置达到峰值，并向周围平滑地衰减，为模型提供了更平滑、更有信息量的监督信号，而不是一个孤立的点。

## 上采样
放大特征图（feature map）尺寸的技术：转置卷积 (Deconvolution)、上采样 (Upsampling) 和 上池化 (Unpooling)
### 转置卷积/反卷积
与普通卷积相反，它将小尺寸的输入映射到更大的输出。常用于语义分割、图像生成等任务中。
通过在输入特征图的像素之间填充0（这个过程称为 dilation），并在周围添加 padding，然后进行一次标准的卷积操作，从而实现输出尺寸的放大。卷积核的权重是通过反向传播学习得到的。由于其学习特性，反卷积能够生成比插值方法更精细、信息更丰富的特征图。但计算量更大。
<img src="https://i-blog.csdnimg.cn/blog_migrate/62be732a9003bfc80c298a2ecd5058a8.jpeg" width = "20%" />

### 上池化
池化（Pooling）操作的逆操作，特别是最大池化（Max Pooling）的逆操作。它旨在将特征图恢复到池化前的大小。
利用池化过程中记录的位置信息来恢复特征图的结构。在进行最大池化时，不仅会保留池化区域内的最大值，还会记录这个最大值在原始特征图中的位置索引。在上池化阶段，会创建一个与池化前尺寸相同的全零特征图，然后根据之前记录的位置索引，将池化后的特征值放回相应位置。其余位置则保持为0。

在U-Net等经典的图像分割网络中，解码器部分可能会先使用上采样或上池化来放大尺寸，然后再通过卷积层（或反卷积层）来学习和丰富特征。
<img src="https://mmbiz.qpic.cn/mmbiz_png/teF4oHzZ4IQzKII5nhSaQrQV4tmXKQvf0ibE3QUVDR8X6FcDBqicuTE3riaO2QDLS5nibEoMzI7ugWPu33yVZUAydQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1" width = "100%" />
图（a）是输入层；
图（b）是14\*14反卷积的结果；
图（c）（d）是28\*28的UnPooling和反卷积的结果；
图（e）（f）是56\*56的Unpooling和反卷积的结果；
图（g）（h）是112\*112 UnPooling和反卷积的结果；
图（i）（j）是224\*224的UnPooling和反卷积的结果

### 普通上采样
上采样泛指所有将图像或特征图分辨率扩大的技术。在深度学习中，它通常特指那些不带可学习参数的、基于插值（Interpolation）的方法。
+ 最近邻插值 (Nearest Neighbor Interpolation): 将输出图像中每个像素的值设为输入图像中最近邻像素的值。这种方法简单快速，但容易产生块状效应。
+ 双线性插值 (Bilinear Interpolation): 考虑了输入图像中四个最近邻像素的加权平均值，生成的图像更平滑。
+ 双三次插值 (Bicubic Interpolation): 考虑了更广泛的邻域（16个像素），效果更好，但计算更复杂。
#### 双线性插值（Bilinear Interpolation）
双线性插值是图像缩放中最常见的插值方法之一，目标插值位置在像素格子中间，用周围 4 个像素按距离加权平均，估计这个位置的值。核心思想是在二维平面上先沿一个方向做一次线性插值，再沿另一个方向再做一次线性插值。

在深度学习里，它常用于：
+ 特征图上采样（如语义分割解码器、FPN、UNet）
+ 输入图像 resize 到固定分辨率
+ 对齐不同尺度特征（融合前的尺寸统一）

假设目标点坐标为 $(x, y)$，其周围四个像素点分别为：

> |$Q_{11}(x_1,y_1)$---$Q_{21}(x_2,y_1)$|
|--------------(x,y)--------------|
|$Q_{12}(x_1,y_2)$---$Q_{22}(x_2,y_2)$|

则双线性插值结果为：
$$
f(x,y)=\frac{1}{(x_2-x_1)(y_2-y_1)}
\begin{bmatrix}x_2-x & x-x_1\end{bmatrix}
\begin{bmatrix}
f(Q_{11}) & f(Q_{12})\\
f(Q_{21}) & f(Q_{22})
\end{bmatrix}
\begin{bmatrix}y_2-y\\y-y_1\end{bmatrix}
$$

更直观地看，可以拆成两次一维插值：

1. 在 $y=y_1$ 上，对 $Q_{11}$ 和 $Q_{21}$ 线性插值，得到 $R_1$
2. 在 $y=y_2$ 上，对 $Q_{12}$ 和 $Q_{22}$ 线性插值，得到 $R_2$
3. 在 $x$ 固定处，对 $R_1$ 和 $R_2$ 再做一次线性插值，得到最终值

+ 相比最近邻插值，结果更平滑、锯齿更少
+ 计算量小于双三次插值，速度和效果比较均衡
+ 会引入一定模糊，高频细节可能被平滑

PyTorch 中常见写法：
```python
import torch.nn.functional as F

# x: [N, C, H, W]
y = F.interpolate(x, size=(h_out, w_out), mode='bilinear', align_corners=False)
```

## 反向传播
待续

## Optimizer
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL3.gif" width = "60%" />

$$SGD → SGDM → NAG → AdaGrad → AdaDelta → Adam → Nadam$$
![图 4](https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL4.png)  

### 学习率与优化器调度策略

| 策略名称 | 作用 | 说明 |
|----------|------|------|
| **Warmup** | 稳定训练初期 | 学习率从小逐渐升高，避免梯度爆炸 |
| **余弦退火（Cosine Annealing）** | 平滑收敛 | 学习率按余弦曲线下降，后期趋近于零 |
| **Step Decay** | 分段衰减 | 每隔固定 epoch 将学习率乘以一个因子 |
| **Exponential Decay** | 指数衰减 | 学习率按指数函数持续下降 |
| **Cyclical Learning Rate (CLR)** | 提升探索能力 | 学习率在两个边界之间周期性波动 |
| **OneCycle Policy** | 快速收敛 | 学习率先升后降，动量反向变化 |
| **自适应学习率（如 Adam、RMSprop）** | 自动调整 | 根据梯度历史动态调整每个参数的学习率 |

### 动量与梯度控制策略

| 策略名称 | 作用 | 说明 |
|----------|------|------|
| **动量（Momentum）** | 加速收敛 | 保留上一次梯度方向，减少震荡 |
| **周期性动量调整** | 提升泛化 | 动量值随训练周期变化，配合 CLR 使用 |
| **梯度裁剪（Gradient Clipping）** | 防止梯度爆炸 | 限制梯度最大值，常用于 RNN 或 Transformer |
| **梯度累积（Gradient Accumulation）** | 显存优化 | 多个小 batch 累积后再更新参数，适用于大模型 |

### 模型正则化与泛化策略

| 策略名称 | 作用 | 说明 |
|----------|------|------|
| **Dropout** | 防止过拟合 | 随机丢弃神经元，增强模型鲁棒性 |
| **L1/L2 正则化** | 限制权重 | 控制模型复杂度，避免过拟合 |
| **Early Stopping** | 提前终止训练 | 验证集性能不再提升时停止训练 |
| **Label Smoothing** | 提升分类鲁棒性 | 将标签分布平滑处理，减少过拟合倾向 |
| **Stochastic Depth** | 深度网络正则化 | 随机跳过某些层，常用于 ResNet/ViT |

### 常见组合推荐

| 目标 | 推荐策略组合 |
|------|---------------|
| 稳定训练 | Warmup + Cosine Annealing + Gradient Clipping |
| 控制过拟合 | Dropout + L2 正则化 + Early Stopping |
| 提升精度 | Mixup + Label Smoothing + OneCycle Policy |
| 显存受限 | Gradient Accumulation + Mixed Precision Training |
| 多任务场景 | MTL + Shared Backbone + Task-specific Heads |

## Batch size
batch size的大小影响的是训练过程中的完成*每个epoch所需的时间* $^1$（假设算力确定了）和每次迭代(iteration)之间*梯度的平滑程度* $^2$。
> 1. 假设训练集大小为N，每个epoch中mini-batch大小为b，那么完成每个epoch所需的迭代次数为 N/b , 因此完成每个epoch所需的时间会随着迭代次数的增加而增加
2. 如pytorch\tensorflow等深度学习框架，在进行mini-batch的loss反向传播时，一般都是先将每个mini-batch中每个样本得到的loss求sum后再平均化之后再反求梯度，进行迭代，因此b的大小决定了相邻迭代batch之间的梯度平滑程度。一个batch内所含样本越多，这个batch的梯度应该越能反映真实的梯度，因此这样的大batch间梯度不会跨越太大

因此：大的batch_size往往建议可以相应取大点learning_rate, 因为梯度震荡小，大 learning_rate可以加速收敛过程，也可以防止陷入到局部最小值，而小batch_size用小learning_rate迭代，防止错过最优点，一直上下震荡没法收敛 
>1. 若是loss还能降，指标还在升，那说明欠拟合，还没收敛，应该继续train，增大epoch。
2. 若是loss还能再降，指标也在降，说明过拟合了，那就得采用提前终止（减少epoch）或采用weight_decay等防过拟合措施。
3. 若是设置epoch=16，到第8个epoch，loss也不降了，指标也不动了，说明8个epoch就够了，剩下的白算了。

## 损失函数「loss function」
来度量模型的预测值$\hat{y}$与真实值$y$的差异程度的运算函数，它是一个非负实值函数，通常使用$L(y, \hat{y})$来表示，损失函数越小，模型的鲁棒性就越好。
**基于距离度量的损失函数**
基于距离度量的损失函数通常将输入数据映射到基于距离度量的特征空间上，如欧氏空间、汉明空间等，将映射后的样本看作空间上的点，采用合适的损失函数度量特征空间上样本真实值和模型预测值之间的距离。特征空间上两个点的距离越小，模型的预测性能越好。
### L1范数损失函数（MAE）
$$L_{MSE}=\frac{1}{n}\sum_{i=1}^{n}|y_i-\hat{y_i}|$$
又称为曼哈顿距离，表示残差的绝对值之和。L1损失函数对离群点有很好的鲁棒性，但它在残差为零处却不可导,且更新的梯度始终相同；
### L2损失函数（MSE均方误差损失函数）
$$L_{MSE}=\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat{y_i})^2$$
在回归问题中，均方误差损失函数用于度量样本点到回归曲线的距离，通过最小化平方损失使样本点可以更好地拟合回归曲线。（L2损失又被称为欧氏距离，是一种常用的距离度量方法，通常用于度量数据点之间的相似度。）

### Wing Loss
`Wing Loss` 常用于关键点回归（如人脸关键点、姿态估计），核心思路是：
- 小误差区域放大梯度，推动关键点更精细地对齐
- 大误差区域保持近似线性，避免异常点主导训练

设误差 $x=\hat{y}-y$，其常见形式为：

$$
L(x)=
\begin{cases}
w\ln(1+\frac{|x|}{\epsilon}), & |x|<w \\
|x|-C, & |x|\ge w
\end{cases}
$$

其中：
- $w$：控制“非线性放大区间”的阈值
- $\epsilon$：控制曲线弯曲程度
- $C=w-w\ln(1+\frac{w}{\epsilon})$，用于保证分段处连续

与 L1/L2 相比，Wing Loss 在小误差区间更敏感，通常能提升关键点定位精度；在遮挡或噪声样本存在时，也比纯 L2 更稳。
**基于概率分布度量的损失函数**
基于概率分布度量的损失函数是将样本间的相似性转化为随机事件出现的可能性，即通过度量样本的真实分布与它估计的分布之间的距离，判断两者的相似度，一般用于涉及概率分布或预测类别出现的概率的应用问题中，在分类问题中尤为常用。
### KL散度（ Kullback-Leibler divergence）
$$L_{MSE}=\sum_{i=1}^{n}\hat{y_i}log(\frac{y_i}{\hat{y_i}})$$
也被称为相对熵，是一种非对称度量方法，常用于度量两个概率分布之间的距离。KL散度也可以衡量两个随机分布之间的距离，两个随机分布的相似度越高的，它们的KL散度越小，可以用于比较文本标签或图像的相似性。

### 交叉熵损失函数
https://www.bbbdata.com/text/337

#### 香农信息量（Shannon Information）
表示某个事件发生时所携带的信息量：
$$I(x) = -\log_b P(x) = -\ln P(x)$$

- $ P(x) $：事件 $ x $ 的概率  
- $ b $：对数底，通常取 2（单位为 bit）或 $ e $（单位为 nat）  
- 概率越小，信息量越大（越“惊讶”）
#### CE
交叉熵（Cross Entropy）是信息论中的一个概念，最初用于估算平均编码长度，引入机器学习后，用于评估当前训练得到的概率分布与真实分布的差异情况。是在不知道真实分布、仅有猜测的概率时，我们知道真相时所获得的信息量期望；交叉熵的意义是，它可用于评估我们认知概率的准确性，在认知概率与真实概率一致，交叉熵是最小的，反过来说，交叉熵越小则说明预测越准确

衡量两个概率分布之间（交叉）的差异，真实分布 $ y $ 与预测分布 $ \hat{y} $：

$$H(y, \hat{y}) = - \sum_{i=1}^{n} y_i \ln(\hat{y}_i)$$
 
- $ y_i $：真实标签（通常是 one-hot）  
- $ \hat{y}_i $：模型预测的概率（通常是 softmax 输出）
  
交叉熵是模型对正确类别预测概率的负对数期望
#### CE loss
交叉熵损失函数(Cross-Entropy Loss)是一种常用于概率预测模型的损失函数。交叉熵损失函数是指，基于模型的预测概率，在知道真实标签时的交叉熵
$$CE Loss =- \frac{1}{m} \sum_{i=1}^{m}\sum_{j=1}^{C}y_i,_j · \ln(\hat{y}_i,_j) = - \frac{1}{m} \sum_{i=1}^{m}\sum_{i(y_i=k)} · \ln(\hat{y}_i,_k) = - \frac{1}{m} \sum_{i=1}^{m}· \ln(\hat{y}_i,_k)$$
* $m$： 样本的总数（一个 batch 的大小）。求平均就是期望
* $ C $：类别数 
* i：样本的索引（从 1 到 m）。
* j：类别的索引（从 1 到 C）。
* 如果是One-Hot 编码，y_i,k=1,其他为0，可以得到简化的第3个公式

C=2时，得到二元交叉熵损失**BCE loss** (Binary Cross-Entropy Loss)公式:
$$BCE Loss =- \frac{1}{m} \sum_{i=1}^{m} [y_i \cdot \ln(\hat{y}_i) + (1 - y_i) \cdot \ln(1 - \hat{y}_i)]$$
* $y_i$：第 $i$ 个样本的真实标签，在二分类中 $y_i$ 的值通常是 1（代表正类）或 0（代表负类）。
* $\hat{y}_i$：模型对第 $i$ 个样本预测为正类 (类别 1) 的概率。 (这通常是 Sigmoid 函数的输出，值在 0 和 1 之间)。
* $(1 - \hat{y}_i)$：模型对第 $i$ 个样本预测为负类 (类别 0) 的概率。
* $\hat{y} = \sigma(x) = \frac{1}{1 + e^{-x}}$ 时，即$\hat{y}_i$为 Sigmoid 函数的输出，则为**BCEWithLogitsLoss**，意思是这个Loss可以直接输入原始Logits值，而不需要是概率，因为集成了Sigmoid（二分类）或Softmax（多分类）

交叉熵越小，期望获得的信息量就越小，说明我们对本身事物越掌握，也即模型的预测概率越准确
所以交叉熵损失函数的目的，就是最小化期望信息量，也即最大化模型概率预测的准确程度



#### Focal loss
`Focal Loss` 是一种专门为解决**类别不平衡问题**而设计的损失函数，尤其在目标检测（如 RetinaNet）和语义分割中非常有效
Focal Loss 是对传统的 CE Loss 的一种改进。它的核心思想是： **降低容易分类样本的损失权重，聚焦在难分类样本上。**。它是一个动态缩放的交叉熵损失，通过一个动态缩放因子，可以动态降低训练过程中易区分样本的权重，从而将重心快速聚焦在那些难区分的样本（有可能是正样本，也有可能是负样本，但都是对训练网络有帮助的样本）。
这对于数据集中**正负样本极度不平衡**的情况非常有用，比如：
- 检测图像中的小目标
- 分割稀疏区域（如车道线、肿瘤）

以二分类为例，Focal Loss 的公式如下：

$$\text{FL}(p_t) =- [\alpha_i y_i (1 - \hat{y}_i)^\gamma \cdot \ln(\hat{y}_i) + (1 - \alpha_i)(1 - y_i) \hat{y}_i^\gamma \cdot \ln(1 - \hat{y}_i)]= -\alpha_t (1 - p_t)^\gamma \log(p_t)$$

其中：
- $ p_t $：模型对真实类别的预测概率
- $ \alpha_t $：类别权重（控制正负样本不平衡）,通常设为 0.25 [正类（y=1）的重要性是 0.25，而负类（y=0）的重要性是 0.75）
- $ \gamma $：聚焦因子，控制对易分类样本的抑制程度，通常设为 2
  - 如果样本**易分类**（模型很有把握，$\hat{y}_i \to 1$），那么 $(1 - \hat{y}_i)^\gamma \to 0$。这个因子的值会变得非常小，从而**极大地降低**了这个“简单”样本对总损失的贡献。
  - 如果样本**难分类**（模型预测错误，$\hat{y}_i \to 0$），那么 $(1 - \hat{y}_i)^\gamma \to 1$。损失几乎不受影响，模型会**重点关注**它。
  - $\gamma = 0$ 时，Focal Loss 就退化为了标准的（加权）BCE Loss。

```python
import torch
import torch.nn.functional as F

def focal_loss(inputs, targets, alpha=0.25, gamma=2.0):
    BCE_loss = F.binary_cross_entropy_with_logits(inputs, targets, reduction='none')
    pt = torch.exp(-BCE_loss)  # pt = sigmoid(inputs) if BCE used
    focal_term = alpha * (1 - pt) ** gamma
    return (focal_term * BCE_loss).mean()
```

one-hot独热编码：将类别变量转换为机器学习算法易于利用的一种形式的过程。

### RMI Loss（Region Mutual Information Loss）
`RMI Loss` 常用于语义分割，本质上是把像素级监督扩展到“局部区域的统计相关性”约束。相比只看单像素分类误差的 CE/BCE，RMI 更关注邻域结构是否一致（边界、纹理、形状连续性）。

核心思想：
- 将预测图与标签图按窗口（如 $3\times3$、$5\times5$）展开为局部向量
- 通过协方差矩阵建模局部区域联合分布
- 最大化预测与标签的互信息（或最小化其负值）

常见组合写法：

$$
L = L_{BCE/CE} + \lambda L_{RMI}
$$

其中 $\lambda$ 用于平衡像素级分类监督和区域结构监督。

实践经验：
- 对小目标和细边界（如道路边缘、器官轮廓）通常更友好
- 在类别不平衡和边界复杂场景中，往往优于单独 CE/BCE
- 计算量高于普通 CE，训练时需要关注显存与窗口大小设置

### IoU Loss

在目标检测和图像分割任务中，交并比 IoU Loss（Intersection over Union Loss）用于衡量预测框与真实框之间的重叠程度。相比于传统的 L1/L2 或 Smooth L1 损失，IoU 类损失更关注几何上的匹配，对边界框回归尤为关键。下面是主流几种 IoU 类损失的介绍：

| 损失类型     | 特点与优势                                         | 适用场景                         |
|--------------|----------------------------------------------------|----------------------------------|
| IoU Loss     | 基础形式，仅考虑重叠区域比例                      | 边界框回归基础版本              |
| GIoU Loss    | 引入最小闭包区域作为惩罚项，解决无交集的问题     | 较大偏移框，对空区域更敏感      |
| DIoU Loss    | 加入中心点距离作为惩罚，提高定位精度             | 对目标位置要求高的检测任务      |
| CIoU Loss    | 综合考虑中心点距离、重叠率、纵横比               | 高精度框回归，如人脸检测等      |
| SIoU Loss    | 引入角度、方向对齐等几何信息，优化收敛速度       | 高稳定性和收敛效率的检测模型    |

- **IoU**：
  $$IoU = \frac{\text{Area of Overlap}}{\text{Area of Union}}$$

#### GIoU Loss
GIOU Loss 是传统 IoU Loss 的改进版，它在 IoU 的基础上增加了一个惩罚项，解决了当预测框与真实框**不相交**时 IoU Loss=0, 梯度为零、无法优化的问题，使得模型能够学习如何将分离的框相互靠近。

$$L_{GIoU} = 1 - GIOU$$

$$GIOU = IoU - \frac{|C| - |A \cup B|}{|C|}$$

* **IoU**: 预测框 A 和真实框 B 的交并比。
* **C**: 能同时包含 A 和 B 的**最小闭包矩形**（Smallest Enclosing Box）。
* $\frac{|C| - |A \cup B|}{|C|}$: 这就是**惩罚项**。它计算的是闭包区域中不属于两个框联合区域的面积比例。两个框距离越远，这个惩罚项越大，GIOU 值就越小。

**取值范围**：GIOU 的值域为 $[-1, 1]$。**1**: 完美重合。**趋近 -1**: 不重叠且相距非常远。
**既是度量也是损失**：不仅可以像 IoU 一样作为评估指标，其 $1 - GIOU$ 的形式更是一个优秀的损失函数。
**关注非重叠区域**：通过闭包区域 C，它不仅仅关心重叠部分，还关心两个框的**相对位置关系**。

**收敛速度问题**：在训练后期，当预测框与真实框重叠方式比较特殊时（如一个框完全包含另一个框），GIOU 会退化成 IoU，无法进一步区分对齐的好坏，可能导致收敛较慢。
**对齐方式不敏感**：当两个框的 IoU 和 GIOU 值相同时，它们中心点的距离和长宽比可能差异很大，GIOU 并未考虑这些因素。这也催生了后续的 DIOU 和 CIOU 等更优的损失函数。
- **DIoU Loss**：
  $$DIoU = IoU - \frac{\rho^2(b, b^{gt})}{c^2}$$
  其中 $ \rho $ 是中心距离，$ c $ 是对角线长度。

- **CIoU Loss**：
  在 DIoU 基础上增加形状约束项，综合角度与纵横比。

#### PIoU Loss (Pixels-IoU Loss)
是在 ECCV 2020 中提出的一种专门用于旋转/定向目标检测（OBB, Oriented Object Detection）的损失函数。

* **传统方法缺陷**：传统的旋转检测器（如使用 $L1$ 或 $Smooth\text{-}L1$ 损失）通常将角度 $\theta$ 作为一个独立的距离参数进行回归。这种设计**对高长宽比（细长型）物体极不敏感**。在相同角度误差下，细长物体的真实 IoU 会急剧下降，而传统损失无法感知这一变化。

PIoU 通过像素级（Pixel-wise）的交并比计算，直接将角度信息和 IoU 融合进同一个损失函数中：

* **像素点判断**：对边界框区域内的像素点进行采样，利用数学公式（如判断点到包围框四条边的距离）计算每个像素点是否在预测框和真实框内部。
* **连续可导化**：由于“点是否在框内”是不可导的阶跃函数，PIoU 引入了**贡献度函数（Contribution Function）**，使用类似 Sigmoid 的软阈值函数，将像素点的归属度转化为 $[0, 1]$ 之间的连续值，使得整个过程端到端可导。
* **IoU 计算**：通过对所有像素点的交集和并集进行加权求和，直接算得交并比：

$$\text{PIoU} = \frac{\sum p_{\text{intersection}}}{\sum p_{\text{union}}}$$


$$\text{PIoU Loss} = 1 - \text{PIoU}$$

* **对长宽比敏感**：完美解决了细长物体（如零售货架商品、遥感图像中的船舶、桥梁）稍微偏转导致 IoU 暴跌、而损失函数不敏感的问题。
* **通用性强**：同时适用于基于锚框（Anchor-based）和无锚框（Anchor-free）的检测框架。

IoU Loss 系列通过引入几何对齐、惩罚项等方式，让模型在训练时更关注框的位置与形状，提升检测精度和稳定性。

## NMS
NMS（Non-Maximum Suppression，非极大值抑制）一种用于目标检测任务的后处理技术，主要用于消除冗余的检测框，保留最可能准确的预测结果。
在目标检测中，模型（如YOLO、Faster R-CNN等）通常会对同一目标生成多个重叠的预测框（Bounding Box），每个框带有置信度分数。NMS通过筛选，保留置信度最高且位置最合理的框，抑制其他冗余的框，从而避免重复检测。
1. 按置信度排序：将所有预测框按置信度从高到低排序。选择最高置信度的框：取出当前列表中置信度最高的框，加入最终保留列表。
2. 计算IoU并抑制重叠框：计算该框与剩余所有框的交并比（IoU，Intersection over Union）。若某框与当前框的IoU超过设定的阈值（如0.5），则认为它们是同一目标，直接删除。
3. 重复步骤2\~3：对剩余框重复上述过程，直到所有框被处理。
IoU阈值：通常设为0.3\~0.7，控制框的重叠容忍度。阈值越低，抑制越严格。
置信度阈值：预过滤掉低置信度的框（例如只保留置信度≥0.5的框）。
### 极坐标 NMS (Polar NMS) 
Polar NMS 是专门针对**车载多相机环视系统 (Surround-View System, SVS)** 设计的一种几何感知型 NMS。其核心逻辑在于解决**单目相机测距的非对称不确定性**：
*   **物理背景**: 单目相机在进行 3D 目标检测时，沿着**相机视线方向（径向 Ray / Depth Direction）** 的测距误差（纵向误差）通常非常大，而沿着**垂直于视线方向（切向 / Lateral Direction）** 的误差（横向误差）则非常小。
*   **不确定性椭圆建模**:
    1. **相机识别**: 根据目标中心点 $[x, y]$，判断其可被哪些环视相机（前、后、左、右）观测到。
    2. **椭圆朝向**: 椭圆的中心设在目标中心。将椭圆的**长半轴（Semi-Major Axis）朝向**严格对齐到“相机到目标中心”的连线方向（通过 `theta = math.atan2(toCamY, toCamX)` 实现）。
    3. **自适应尺度缩放**: 椭圆长、短轴的长度会随着目标到相机的距离 `dist` 线性增加。距离相机越远，深度定位越不准，长半轴和短半轴越大（通过双轴极值 `major_axis_m`、`minor_axis_m` 和缩放范围 `axis_scaling_m` 进行插值计算）。
*   **抑制准则**: 若次级框的中心落在主导框的误差椭圆内，则认为它们是同一个物理目标在不同误差下的重复预测，从而将其剔除或合并（通过 `pointInEllipse` 实现）。

###  Scale nms

针对 Bird's-Eye-View (BEV) 下小目标（如行人、交通锥）因物理投影面积过小、即便中心稍有重叠其多边形 IoU 也可能降为 0%，导致传统 NMS 无法去重的缺陷，`scale_nms` 采用**“类别特定尺度膨胀，索引空间抑制，原样输出”**的部署方案：

1. **类别映射与自适应尺度缩放 (Classwise Scale Inflation)**:
   * 为不同类别设置尺度膨胀系数 $S_c$。
   * 对于在 BEV 中极其微小的目标（如 `pedestrian`, `cone`），给予大于 1 的缩放因子（例如 $S_{\text{pedestrian}} = 1.5$，$S_{\text{cone}} = 2.0$）；而对于本来就足够大且不易发生位置轻微偏移造成 0% IoU 的目标（如 `vehicle`），膨胀系数保持为 $1.0$。
   * 缩放计算公式如下。设物体的中心为 $(x_c, y_c)$，多边形的四个顶点坐标分别为 $(x_i, y_i) \quad (i \in [1, 2, 3, 4])$。我们将各顶点相对于中心的偏移量按膨胀系数 $S_c$ 进行线性拉伸：
     $$\Delta x_i = x_i - x_c$$
     $$\Delta y_i = y_i - y_c$$
     $$\Delta x'_i = \Delta x_i \times S_c$$
     $$\Delta y'_i = \Delta y_i \times S_c$$
     $$x'_i = x_c + \Delta x'_i$$
     $$y'_i = y_c + \Delta y'_i$$
   * 该公式在严格保留目标原始中心 $(x_c, y_c)$ 和偏航朝向 (Yaw Angle) 的同时，无失真地在 BEV 空间完成了面积膨胀。

2. **多边形 IoU 级联抑制 (IoU-Based Index Filtering)**:
   * 采用上述公式对候选框进行临时“充气”。
   * 利用 `vshapely` 计算这些放大后多边形的 IoU，如果 IoU 超过抑制阈值（如 `0.2`），则将该候选框标记为“已抑制”。

3. **几何尺寸恢复原样 (Rescaling Recovery)**:
   * 抑制操作仅过滤并保留合格目标的**索引 (Index)**。
   * 在最终向后传递输出时，直接输出未经过膨胀拉伸的**原始、真实物理尺寸的目标框坐标**。此设计能去重多余框，同时确保模型检测出的 3D 边界框物理大小不受任何畸变影响。

# 注意力机制（Attention Mechanism）
自上而下有意识的聚焦称为**聚焦式注意力**，自下而上无意识、由外界刺激引发的注意力称为**显著式注意力**。
神经网络中的注意力机制是在计算能力有限的情况下，将计算资源分配给更重要的任务，同时解决信息超载问题的一种资源分配方案，到2014年，Volodymyr的《Recurrent Models of Visual Attention》一文中将其应用在视觉领域，后来伴随着2017年Ashish Vaswani的《Attention is all you need》中Transformer结构的提出，注意力机制在NLP,CV相关问题的网络设计上被广泛应用。
注意力有两种，一种是软注意力(soft attention)，另一种则是强注意力(hard attention)。
**软注意力**更关注区域或者通道，是确定性的注意力，学习完成后直接可以通过网络生成，最关键的地方是软注意力是可微的，这是一个非常重要的地方。可以微分的注意力就可以通过神经网络算出梯度并且前向传播和后向反馈来学习得到注意力的权重。
**强注意力**是更加关注点，也就是图像中的每个点都有可能延伸出注意力，同时强注意力是一个随机的预测过程，更强调动态变化。当然，最关键是强注意力是一个不可微的注意力，训练过程往往是通过增强学习(reinforcement learning)来完成的。
## 软注意力的注意力域
### 空间域（Spatial Domain）
空间域将原始图片中的空间信息变换到另一个空间中并保留了关键信息。
普通的卷积神经网络中的池化层（pooling layer）直接用一些max pooling 或者average pooling 的方法，将图片信息压缩，减少运算量提升准确率。
发明者认为之前pooling的方法太过于暴力，直接将信息合并会导致关键信息无法识别出来，所以提出了一个叫 **空间转换器（spatial transformer）** 的模块，将图片中的的空间域信息做对应的空间变换，从而能将关键的信息提取出来。
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL5.png" width = "50%" />

### 通道域（Channel Domain）
通道注意力机制在计算机视觉中，更关注特征图中channel之间的关系，而普通的卷积会对通道做通道融合，这个开山鼻祖是SENet,后面有GSoP-Net，FcaNet 对SENet中的squeeze部分改进，EACNet对SENet中的excitation部分改进，SRM,GCT等对SENet中的scale部分改进。

[SENet](https://arxiv.org/abs/1709.01507),[pytorch](https://github.com/moskomule/senet.pytorch)
SENet《Squeeze-and-Excitation Networks》是CVPR17年的一篇文章，提出SE module。在卷积神经网络中，卷积操作更多的是关注感受野，在通道上默认为是所有通道的融合（深度可分离卷积不对通道进行融合，但是没有学习通道之间的关系，其主要目的是为了减少计算量），SENet提出SE模块，将注意力放到通道之间，希望模型可以学习到不同通道之间的权重：
![图 6](https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL6.png)  

### 时域注意力机制
时域注意力机制在cv领域主要考虑有时序信息的领域，如视频领域中的动作识别方向，其注意力机制主要是在时序列中，关注某一时序即某一帧的信息。

### 通道和空间注意力机制
通道和空间注意力是基于通道注意力和空间注意力机制，将两者有效的结合在一起，让注意力能关注到两者，又称混合注意力机制，如CBAM,BAM,scSE等，同时基于混合注意力机制的一些关注点，如Triplet Attention 关注各种跨维度的相互作用；Coordinate Attention, DANet关注长距离的依赖；RGA 关注关系感知注意力。还有一种混合注意力机制，为3D的attention :Residual attention,SimAM, Strip Pooling, SCNet等。

[CBAM](https://arxiv.org/abs/1807.06521),[github](https://github.com/luuuyi/CBAM.PyTorch) 
CBAM (Convolutional Block Attention Module)是SENet的一种拓展，SENet主要基于通道注意力，CBAM是通道注意力和空间注意力融合的注意力机制。
![图 7](https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL7.png)  
如上图所示，输入一个h*w*c的特征图，通过channel Attention Module 生成通道注意力权重对输入特征图在通道层添加权重，再通过spatial Attention Module 生成空间注意力权重，对特征图在空间层添加权重，输出特征图。

# Metrics 评估
## 混淆矩阵
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL8.png" width = "70%" />

X横坐标为正确的分类（即你用标签所标注的真实分类）
Y纵坐标为模型所预测的分类（即图片经过模型推理后模型将其辨别为的分类）
> True positives (TP): 猫🐱的图片被正确识别成了猫🐱。（猫🐱的正确分类预测）
True negatives(TN): 背景的图片被正确识别为背景。（非猫🐱被预测为其他动物或背景）
False positives(FP): 背景的图片被错误识别为猫🐱。（非猫🐱被预测为猫🐱）
False negatives(FN): 猫🐱的图片被错误识别为背景。（猫🐱被预测为其他动物或者背景）

## Evaluation parameters
**准确率 Accuracy**：在正负样本数量接近的情况下，准确率越高，模型的性能越好（当测试样本不平衡时，该指标会失去意义。）
$$Accuracy=\frac{TP+TN}{TP+FP+TN+FN}$$  
**精准率（查准率） precision**：代表在总体预测结果中真阳性的预测数，针对预测结果，当区分能力强时，容易将部分（与负样本相似度高）正样本排除。
$$precision(P)=\frac{TP}{TP+FP}$$
**召回率（查全率） recall**：所有ground truths中真阳性的预测数，针对原样本，当敏感度高时，容易将部分（与正样本相似度高）负样本也判断为正样本。
$$recall(R)=\frac{TP}{TP+FN}$$
**F1 score**：对Precision和Recall两个指标的调和平均值（类似平均速度），F1分值越高，目标检测的准确性越好。F1-score最常用于数据集的类别不平衡的情况。
$$F_1 score=2\cdot \frac{P\cdot R}{P+R}$$
**AP**：同时考察Precision和Recall两个指标来衡量模型对于各个类别的性能。 
$$AP_i=\int_0^1P_i(R_i)dR_i$$
**mAP**：表示AP的平均值，并用作衡量目标检测算法的总体检测精度的度量。
将recall设置为横坐标，precision设置为纵坐标。PR曲线下围成的面积即AP，所有类别AP平均值即mAP.
$$mAP=\frac1n\sum_{i = 1}^{n}AP_i$$
**置信度 Confidence**：置信度设定越大，Prediction约接近1，Recall越接近0，要寻找最优的F1分数，需要遍历置信度。
![图 9](https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL9.png)  

**交并比 IoU**（Intersection over Union）：是目标检测中使用的一个概念，IoU计算的是“预测的边框”和“真实的边框”的交叠率，即它们的交集和并集的比值。最理想情况是完全重叠，即比值为1。

*mAP@0.5*：IoU阈值设为 0.5，即预测框与真实框的重叠面积占比 ≥ 50% 就算正确。对每个类别计算 AP，再取平均值得到 mAP。评估标准较宽松，适合快速验证模型是否具备基本检测能力。
*mAP@0.5:0.95*：在 IoU 阈值从 0.5 到 0.95（步长为 0.05） 的 10 个点上分别计算 AP，然后取平均。更严格地评估模型在不同定位精度要求下的表现。全面衡量模型稳定性和定位能力，常用于学术论文和高精度场景（如自动驾驶）。
如果一个模型在 mAP@0.5 上表现很好，但在 mAP@0.5:0.95 上得分低，说明它能大致定位目标，但在精确定位方面表现不佳。
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL10.png" width = "60%" />




**ROC曲线**(Receiver Operating Characteristic 受试者工作特征)
$$TPR=\frac{TP}{TP+FN},FPR=\frac{FP}{FP+TN}$$可以理解为分类器对正样本的覆盖敏感性和对负样本的敏感性的权衡。
在ROC曲线图中，每个点以对应的FPR值为横坐标，以TPR值为纵坐标 
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL11ROC.jpg" width = "40%" />

**AUC值**：PR曲线下方的面积
<img src="https://raw.githubusercontent.com/Arrowes/Blog/main/images/DL12AUC.png" width = "70%" />

> 1.AUC = 1，是完美分类器，采用这个预测模型时，存在至少一个阈值能得出完美预测。绝大多数预测的场合，不存在完美分类器。
2.0.5 < AUC < 1，优于随机猜测。这个分类器（模型）妥善设定阈值的话，能有预测价值。
3.AUC = 0.5，跟随机猜测一样（例：丢铜板），模型没有预测价值。
4.AUC < 0.5，比随机猜测还差；但只要总是反预测而行，就优于随机猜测。

ROC曲线图中，越靠近(0,1)的点对应的模型分类性能越好。而且可以明确的一点是，ROC曲线图中的点对应的模型，它们的不同之处仅仅是在分类时选用的阈值(Threshold)不同，每个点所选用的阈值都对应某个样本被预测为正类的概率值。
## 模型计算量(FLOPs)和参数量(Params)
**计算量 FLOPs**：FLOPs指浮点运算次数，Floating-point Operations Per Second，s是指秒，即每秒浮点运算次数的意思，考量一个网络模型的计算量的标准。硬件要求是在于芯片的floaps（指的是gpu的运算能力）
FLOPS：（全部大写），每秒所执行的浮点运算次数，理解为计算速度, 是一个衡量硬件性能/模型速度的指标，即一个芯片的算力。
MACCs：multiply-accumulate operations，乘-加操作次数，MACCs 大约是 FLOPs 的一半。将 w[0]∗x[0]+... 视为一个乘法累加或 1 个 MACC。
MAC: Memory Access Cost 内存访问代价。指的是输入单个样本（一张图像），模型/卷积层完成一次前向传播所发生的内存交换总量，即模型的空间复杂度，单位是 Byte。
**参数量 Params**：是指网络模型中需要训练的参数总数。硬件要求在于显存大小
1.**卷积层**
计算时间复杂度(计算量)
$$Time\sim O(\sum_{l=1}^D M_l^2\cdot K_l^2\cdot C_{l-1}\cdot C_l)$$

计算空间复杂度(参数量)
$$Space\sim O(\sum_{l=1}^D K_l^2\cdot C_{l-1}\cdot C_l+\sum_{l=1}^D M^2\cdot C_l)$$

```
参数量
(kernel*kernel) *channel_input*channel_output
kernel*kernel 就是 weight * weight
其中kernel*kernel ＝ 1个feature的参数量

计算量
(kernel*kernel*map*map) *channel_input*channel_output
kernel*kernel 就是weight*weight
map*map是下个featuremap的大小，也就是上个weight*weight到底做了多少次运算
其中kernel*kernel*map*map＝　1个feature的计算量
```
2.池化层
无参数
3.**全连接层**
``参数量＝计算量＝weight_in*weight_out  #模型里面最费参数的就是全连接层``

**换算计算量**,一般一个参数是指一个float，也就是４个字节,1kb=1024字节

# EfficientNet
EfficientNet 是 Google 在 2019 年提出的一组 CNN。它先用神经架构搜索得到较高效的基准网络 **EfficientNet-B0**，再使用 **compound scaling（复合缩放）** 同时调整网络的深度、宽度和输入分辨率，在相近计算预算下取得更好的精度与效率平衡。

## 复合缩放（Compound Scaling）

只增加网络深度、只增加通道宽度，或者只提高输入分辨率，都会使另外两个维度成为瓶颈。EfficientNet 用一个缩放系数 $\phi$ 同时控制三个维度：

$$
depth=\alpha^\phi,\qquad width=\beta^\phi,\qquad resolution=\gamma^\phi
$$

其中 $\alpha$、$\beta$、$\gamma$ 分别控制深度、宽度和分辨率，通常通过网格搜索确定，并满足近似约束：

$$
\alpha\cdot\beta^2\cdot\gamma^2\approx 2
$$

原因是：深度增加大致线性增加计算量，卷积的通道数和特征图面积分别与计算量近似呈平方关系。固定 $\phi$ 后，得到 EfficientNet-B0 到 B7；B0 是基准模型，B1-B7 逐渐增加模型规模和输入分辨率。

### 深度、通道宽度和分辨率的影响

复合缩放中的三个维度分别作用于网络的不同能力。它们不是越大越好，而是在精度、计算量、显存和延迟之间进行权衡。

| 缩放维度 | 主要改变 | 可能带来的收益 | 主要代价与风险 |
| --- | --- | --- | --- |
| **深度（Depth）** | 网络层数和特征变换次数 | 逐步提取更高级的语义特征，扩大有效感受野，提升复杂任务的表达能力 | 计算量和延迟大致随层数增加；网络过深可能梯度传播困难、收益递减，端侧还可能增加 kernel launch 开销 |
| **通道宽度（Width）** | 每层特征图的通道数 | 同一层能够表示更多种特征，增强特征的多样性和模型容量 | 卷积计算量、参数量和激活显存明显增加；宽度过大可能过拟合，并受到内存带宽限制 |
| **输入分辨率（Resolution）** | 输入图像及中间特征图的空间尺寸 | 保留更多细节，对小目标、细边缘和纹理更友好；特征图空间尺寸变大也会增加有效感受野覆盖范围 | 特征图面积随高和宽的乘积增长，FLOPs、显存和延迟通常近似按分辨率平方增加；过高分辨率可能放大噪声，收益递减 |

可以这样理解：**深度**决定“能进行多少次推理和抽象”，**宽度**决定“每一步能同时表示多少种特征”，**分辨率**决定“输入中有多少空间细节能够被保留”。

- 分类任务中，增加深度和宽度通常更直接地提升语义表达能力；
- 小目标检测、关键点和分割任务通常对输入分辨率更敏感，但还需要匹配多尺度特征提取结构；
- 低算力部署中，不能只看参数量。宽度会影响内存访问，深度会影响串行延迟，分辨率会显著影响中间激活显存，三者都应在目标设备上实测；
- 当数据量较小时，盲目增大模型规模容易过拟合，应配合数据增强、权重衰减、Dropout 或冻结部分 backbone。

| 模型 | 常见输入分辨率 | 特点 |
| --- | ---: | --- |
| EfficientNet-B0 | 224 | 最小基准模型，适合资源受限场景 |
| EfficientNet-B1/B2 | 240/260 | 在精度和计算量之间折中 |
| EfficientNet-B3/B4 | 300/380 | 更高精度，计算和显存开销明显增加 |
| EfficientNet-B5/B6/B7 | 456/528/600 | 精度较高，但训练、推理和部署成本较大 |

这里的分辨率是论文和预训练权重常用的默认值，实际项目应根据数据分布、显存和端侧延迟重新选择，不应机械套用。

## MBConv

EfficientNet 的基本模块是 **MBConv（Mobile Inverted Bottleneck Convolution）**。它把 MobileNetV2 的 inverted bottleneck 与 squeeze-and-excitation（SE）结合起来，典型数据流如下：

1. **Expansion 1x1 卷积**：将输入通道从 $C$ 扩展到 $tC$，提升特征表达能力。
2. **Depthwise 3x3/5x5 卷积**：每个通道单独做空间卷积，降低计算量。
3. **SE 注意力**：全局池化后学习通道权重，重新标定重要通道。
4. **Projection 1x1 卷积**：将通道数压回输出通道数。
5. **残差连接**：当 stride=1 且输入输出通道相同时，执行 $y=F(x)+x$。

与普通卷积相比，深度可分离卷积的参数量近似为：

$$
K^2C_{in}+C_{in}C_{out}
$$

而普通卷积为：

$$
K^2C_{in}C_{out}
$$

因此 MBConv 能以较低的参数量和 FLOPs 获得较大的感受野。但它并不是“免费加速”：depthwise convolution 的算术强度较低，实际延迟还会受到内存访问、算子融合和硬件 kernel 支持的影响。

### MBConv 的简化 PyTorch 实现

```python
import torch
from torch import nn


class MBConv(nn.Module):
  def __init__(self, in_channels, out_channels, expansion=6, stride=1):
    super().__init__()
    hidden_channels = in_channels * expansion
    # 只有尺寸和通道数都不变时，输入才能与输出逐元素相加。
    self.use_residual = stride == 1 and in_channels == out_channels

    layers = []
    if expansion != 1:
      # 1x1 卷积先扩展通道，提升瓶颈块的表达能力。
      layers.extend([
        nn.Conv2d(in_channels, hidden_channels, 1, bias=False),
        nn.BatchNorm2d(hidden_channels),
        nn.SiLU(inplace=True),
      ])
    layers.extend([
      # groups=hidden_channels 表示每个通道独立进行空间卷积。
      nn.Conv2d(
        hidden_channels,
        hidden_channels,
        3,
        stride=stride,
        padding=1,
        # 1x1 投影将扩展后的通道压缩为输出通道数。
        groups=hidden_channels,
        bias=False,
      ),
      nn.BatchNorm2d(hidden_channels),
      nn.SiLU(inplace=True),
      nn.Conv2d(hidden_channels, out_channels, 1, bias=False),
      nn.BatchNorm2d(out_channels),
    ])
    self.block = nn.Sequential(*layers)

  def forward(self, x):
    out = self.block(x)
    # 残差连接有助于梯度传播；stride=1 且通道一致时才启用。
    return x + out if self.use_residual else out
```

上面代码用于说明 MBConv 的主干结构，省略了 SE、DropConnect/Stochastic Depth 和不同 stage 的配置。实际使用中优先采用经过验证的实现，例如 torchvision 提供的 `efficientnet_b0`、`efficientnet_b1` 等预训练模型。

```python
from torchvision.models import EfficientNet_B0_Weights, efficientnet_b0

model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
```

## EfficientNet-Lite

EfficientNet-Lite 是面向移动端和边缘设备重新调整的系列，不是简单地把 B0-B7 改名。其目标是减少移动端不友好的算子和运行时开销，常见调整包括：

- 使用 `ReLU6` 替代 `Swish/SiLU`，便于整数化和 TFLite 等推理后端支持；
- 移除或简化部分 SE 等额外结构，降低访存和算子开销；
- 调整 stem、分类头、正则化和输入尺寸，使模型更适合移动端训练与部署。

具体结构应以目标框架和对应 checkpoint 的实现为准，不同仓库中的 “Lite” 变体并不一定完全相同。部署前至少要检查算子是否被后端支持，以及 FP32、FP16、INT8 量化后的精度和延迟。

## 选型与工程注意点

选择 EfficientNet-Lite 的理由：参数量较小、FLOPs 较低、卷积算子部署友好，能够在精度和端侧延迟之间取得较好平衡。没选 FPN/Transformer，通常是因为当前低算力平台对显存、访存带宽和算子支持更加敏感；但如果任务需要多尺度检测，EfficientNet-Lite 仍可以作为 backbone，搭配轻量级 FPN 或检测头，而不是二选一。

### 参数量、激活显存、计算量与延迟

这四个指标描述的是模型的不同方面，不能互相替代：

| 指标 | 回答的问题 | 主要由什么决定 | 常见影响 |
| --- | --- | --- | --- |
| **参数量（Params）** | 模型中有多少个需要保存和训练的权重？ | 层数、卷积核大小、输入/输出通道数、全连接层规模；BN 的 affine 参数也属于参数 | 决定权重文件大小、模型存储占用和一部分训练显存；参数越多不一定延迟越高 |
| **激活显存（Activation Memory）** | 前向和反向过程中间特征图需要占多少内存？ | Batch size、输入分辨率、各层通道数、特征图尺寸、数据类型，以及训练时需要保存的中间结果 | 训练显存通常比推理显存大；高分辨率和大 batch 往往首先增加激活显存 |
| **计算量（FLOPs/MACs）** | 完成一次前向传播需要执行多少数学运算？ | 输入尺寸、输出特征图尺寸、卷积核大小、输入/输出通道数、层数和 batch size | 反映理论计算工作量；FLOPs 低通常更容易做到低延迟，但不是绝对关系 |
| **延迟（Latency）** | 一次推理实际需要多长时间？ | 硬件算力和内存带宽、算子实现、并行度、kernel launch、算子融合、量化、线程数、batch size 和数据搬运 | 是部署最关心的实际指标，必须在目标设备和完整推理流程上实测 |

对于一个**普通卷积**，忽略 bias 时，参数量近似为：

$$
Params=K^2C_{in}C_{out}
$$

若输出特征图大小为 $H_{out}\times W_{out}$，则单张图片的 MACs 近似为：

$$
MACs=H_{out}W_{out}K^2C_{in}C_{out}
$$

若把一次乘法和一次加法分别计作一次 FLOP，则通常有 $FLOPs\approx2\times MACs$。不同工具对 MACs、FLOPs 是否包含加法、激活函数和 BN 的统计口径可能不同，比较结果时必须确认口径一致。

$$
计算量\approx参数量\times每个参数参与计算的次数
$$

同一组卷积参数会在输出特征图的每个空间位置重复使用，所以当输出特征图为 $H_{out}\times W_{out}$ 时，每个参数大约参与 $H_{out}W_{out}$ 次乘法。由此可见：

- 卷积层的**参数量主要由通道数和卷积核大小决定**；
- 卷积层的**计算量还会受到输出特征图分辨率影响**；
- 即使两个卷积层参数量相同，只要输出分辨率不同，计算量也可能相差很大。

**全连接层**则不同。若输入维度为 $N$、输出维度为 $M$：

$$
Params=N\times M,\qquad MACs\approx N\times M
$$

单次推理时，全连接层中的每个权重通常只参与一次乘法，因此它的参数量和单样本计算量数量级接近。但在 batch size 为 $B$ 时，整个 batch 的计算量约为 $B\times N\times M$，而参数量仍然只有 $N\times M$。

深度卷积进一步说明了两者的区别：它的参数量和计算量都比普通卷积小，但由于每个参数仍会在所有空间位置重复使用，所以分辨率提高后计算量仍会明显增加。

因此，判断模型大小主要看 Params 和权重文件大小；判断理论运算工作量要看 FLOPs/MACs；判断实际运行速度还必须结合硬件、内存访问和算子实现测量延迟。

对于**深度卷积**，参数量和计算量分别近似为：

$$
Params=K^2C,\qquad MACs=H_{out}W_{out}K^2C
$$

它比普通卷积省参数和运算，但不一定按相同比例降低延迟，因为深度卷积的计算密度较低，可能受内存访问和硬件 kernel 效率限制。

**激活显存**可以用一个中间特征图粗略估算：

$$
Memory\approx B\times C\times H\times W\times bytes(dtype)
$$

例如 `B x C x H x W` 的 FP16 特征图每个元素占 2 字节，FP32 占 4 字节。训练时还要保存多个中间激活用于反向传播，实际峰值显存还包括参数、梯度、优化器状态、临时 workspace 和框架缓存，因此不能只把所有参数量乘以 4 作为训练显存。

几个容易混淆的结论：

- **参数量小，不代表激活显存小**：高分辨率特征图可能只有少量参数，却产生很大的激活张量；
- **FLOPs 少，不代表延迟低**：算子不被硬件高效支持、访存开销大或 kernel 数量多时，低 FLOPs 模型仍可能较慢；
- **延迟和吞吐量不同**：延迟是单次或单 batch 的完成时间，吞吐量是单位时间处理的样本数，大 batch 可能提高吞吐量但增加单次延迟和显存；
- **训练和推理的资源不同**：推理通常不保存反向图，也不需要梯度和优化器状态；训练则需要更多激活显存和额外状态；
- **改变缩放维度的影响不同**：增加深度主要增加串行层数，增加宽度同时增加参数量、计算量和激活通道，增加分辨率主要放大特征图面积以及激活显存和空间计算量。

使用时需要注意：

- 预训练权重通常要求固定的归一化方式和输入尺寸，训练和推理必须保持一致；
- 仅比较 Params 或 FLOPs 不能代表真实速度，应在目标设备上测量端到端延迟、峰值内存和功耗；
- 迁移学习时可先冻结 backbone，再逐步解冻；小数据集上应同时关注分类头过拟合和 BatchNorm 统计量漂移；
- 端侧 INT8 部署需要校准数据，量化后应重新评估精度，尤其关注小目标和细粒度类别；
- EfficientNet 原始模型使用 SiLU/Swish 时，训练精度可能较好，但某些 NPU 不支持或代价较高，Lite 版本的部署优势需要通过实际 benchmark 验证。

# Transformer
Transformer 是一种以 **Attention（注意力）** 为核心的序列建模架构。它不像传统 RNN 那样必须按时间顺序逐个处理输入，而是让序列中的元素相互计算关系，因此更容易并行训练，也更擅长建模长距离依赖。

Transformer 的核心在于注意力机制（Attention Mechanism），注意力机制由三个字母构建：Q (Query)、K (Key)、V (Value)。
用经典的“图书馆检索”类比来解释 Q、K、V：
+ Query (Q - 查询)：相当于你走到图书馆系统前，输入的“搜索词”（例如：“机器学习入门”）。它是你带着的目的或问题。
+ Key (K - 键)：相当于图书馆里每一本书背面的“标签或书名”。系统会用你的 Q 去和所有的 K 进行比对，计算相似度。
+ Value (V - 值)：相当于这本“书的具体内容”。当系统发现某本书的 K 和你的 Q 高度匹配时，它就会把这本书的 V（内容）提取出来交给你。
数学表达如下：
$$Attention(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
公式的物理意义是：用 Q 和 K 算点积（计算相似度打分），然后把分数作为权重，去对 V 进行加权求和。

### Q、K、V 是怎样计算出来的

假设输入序列为 $X\in\mathbb{R}^{N\times d_{model}}$，其中 $N$ 是 token 数量，$d_{model}$ 是特征维度。Self-Attention 会通过三个可学习的线性层生成 Q、K、V：

$$
Q=XW_Q+b_Q,\qquad K=XW_K+b_K,\qquad V=XW_V+b_V
$$

其中 $W_Q$、$W_K$、$W_V$ 是训练得到的投影矩阵。若单个注意力头的维度为 $d_k$，则：

$$
W_Q,W_K,W_V\in\mathbb{R}^{d_{model}\times d_k},\qquad Q,K,V\in\mathbb{R}^{N\times d_k}
$$

具体计算可以拆成四步：

1. **生成 Q、K、V**：把每个 token 投影到查询、匹配和内容三个子空间；
2. **计算相似度**：$QK^T$ 的形状为 $N\times N$，第 $i,j$ 个元素表示第 $i$ 个 token 对第 $j$ 个 token 的关注程度；
3. **归一化权重**：对每一行做 softmax，得到每个 Query 对所有 Key 的注意力权重；
4. **聚合 Value**：用注意力权重对 V 加权求和，得到新的 token 表示。

多头注意力会使用多组不同的 $W_Q,W_K,W_V$，每个头独立计算注意力，最后拼接并通过一个输出投影：

$$
MultiHead(Q,K,V)=Concat(head_1,\ldots,head_h)W_O
$$

### 为什么要除以 $\sqrt{d_k}$

如果 Q 和 K 的每个元素都近似服从均值为 0、方差为 1 的分布，那么点积：

$$
q\cdot k=\sum_{i=1}^{d_k}q_i k_i
$$

其方差大致会随着 $d_k$ 增长。$d_k$ 越大，$QK^T$ 的数值越容易变大。直接把这些大数送入 softmax，会使最大值接近 1、其余值接近 0，softmax 进入饱和区，梯度变小，训练不稳定。

除以 $\sqrt{d_k}$ 可以把点积的数值尺度拉回相对稳定的范围，使 softmax 不容易过早饱和。因此它是为了**稳定数值范围和梯度**，不是为了改变 Query 与 Key 的语义。

### Self-Attention 与 Cross-Attention

两者使用的计算公式相同，核心区别是 Q、K、V 的来源不同：

| 类型 | Q 的来源 | K、V 的来源 | 直观含义 |
| --- | --- | --- | --- |
| **Self-Attention** | 同一个输入 $X$ | 同一个输入 $X$ | 序列内部互相交流，回答“我应该关注同一序列中的谁” |
| **Cross-Attention** | 一个序列 $X_q$ | 另一个序列 $X_{kv}$ | 一个序列去读取另一个序列，回答“查询应该从外部信息中取什么” |

Self-Attention 的写法是：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V
$$

Cross-Attention 的写法是：

$$
Q=X_qW_Q,\qquad K=X_{kv}W_K,\qquad V=X_{kv}W_V
$$

例如 Encoder-Decoder Transformer 中，Decoder 的 token 生成 Q，Encoder 输出的特征生成 K 和 V。自动驾驶感知中，BEV Query 生成 Q，多相机图像特征生成 K 和 V，这就是 Cross-Attention。

### Deformable Attention 的基本原理

标准全局 Attention 会让每个 Query 与所有 Key 计算相关性。如果 Query 数量为 $N_q$、图像特征 token 数量为 $N_k$，其注意力矩阵大小为 $N_q\times N_k$，计算量和显存开销近似为：

$$
O(N_qN_kd_k)
$$

对于高分辨率图像，$N_k$ 很大，所有位置都参与匹配，其中大部分位置其实与当前 Query 无关。

Deformable Attention 不再让一个 Query 关注所有位置，而是为每个 Query 预测少量**采样点（sampling points）**及其权重：

1. 根据 Query 预测采样偏移量 $\Delta p$；
2. 以一个参考点 $p_q$ 为中心，得到采样位置 $p_q+\Delta p$；
3. 在这些位置对特征图做双线性插值，取出对应的 Value；
4. 用预测的注意力权重对少量采样特征加权求和。

单尺度 Deformable Attention 可以写成：

$$
DeformAttn(z_q,x)=\sum_{m=1}^{M}W_m\sum_{k=1}^{K}A_{mqk}\,x\left(p_q+\Delta p_{mqk}\right)
$$

其中 $M$ 是注意力头数，$K$ 是每个头的采样点数量，$A_{mqk}$ 是采样权重，$\Delta p_{mqk}$ 是可学习偏移量，$x(\cdot)$ 表示在连续坐标处插值取值。

全局 Attention 需要比较所有 Key，而 Deformable Attention 每个 Query 只读取 $M\times K$ 个位置，因此复杂度近似变为：

$$
O(N_qMKd_k),\qquad MK\ll N_k
$$

所以它能显著节省计算量和注意力矩阵显存，尤其适合高分辨率检测和多尺度视觉特征。代价是采样位置是稀疏的，模型可能漏掉有用区域；采样点数量、参考点质量和特征尺度设计会影响最终效果。

### BEVFormer 中 BEV Query 如何读取多相机特征

BEVFormer 的目标是把环视多相机图像转换成统一的鸟瞰视角（Bird's-Eye View，BEV）特征。可以把它理解为：先在 BEV 平面上放置一张可学习的“查询网格”，每个网格位置都向多相机图像询问信息。

其 Spatial Cross-Attention 的主要流程如下：

1. **初始化 BEV Query**：在 BEV 平面建立 $H_{bev}\times W_{bev}$ 个网格，每个网格对应一个 BEV Query。Query 可以是可学习参数，也可以与 BEV 位置编码相加；
2. **生成参考点**：为每个 BEV Query 在三维空间中设置一个或多个参考高度，得到参考点 $p_{bev}$；
3. **坐标投影**：利用车辆坐标系到各相机坐标系的外参，以及相机内参，将 BEV 参考点投影到每个相机的图像平面：

  $$
  p_{img}=K_{cam}[R\mid t]p_{bev}
  $$

  再进行齐次坐标归一化，得到图像上的二维采样坐标。落在相机视野外的点会被 mask 掉；
4. **从多尺度图像特征采样**：每个投影点不需要读取整张图像，而是在不同 FPN 特征层附近采样少量点，采样值通过双线性插值得到；
5. **Cross-Attention 聚合**：BEV Query 作为 Q，投影位置附近的多相机图像特征作为 K/V，Deformable Attention 预测各采样点的偏移和权重，再把有效相机、多个尺度和多个采样点的特征融合起来；
6. **更新 BEV 特征**：每个 BEV 网格得到融合后的视觉信息，形成统一的 BEV 特征图，后续检测头可以在这个特征图上预测 3D 框、地图元素或其他自动驾驶目标。

需要注意，BEVFormer 不是简单地把所有相机图像拼接后做一次全局 Attention。它利用相机标定把“BEV 位置”与“图像位置”对应起来，再通过稀疏可变形采样读取相关区域，因此既保留了几何关系，又避免了极高的全局注意力开销。

此外，BEVFormer 还包含 **Temporal Self-Attention**：当前帧的 BEV Query 不仅与当前多相机图像做 Spatial Cross-Attention，还会与历史 BEV 特征进行时序交互，从而利用前后帧信息改善遮挡和检测稳定性。

在自动驾驶感知中，图像特征图（BEV 特征）本身充当了浩如烟海的图书馆（它提供了 Keys 和 Values）。
Q: Object Query（对象查询/可学习查询）。
在 PivotNet 中提到的 Point Query 和 Line Query，本质上就是这种 Object Query。它们具有以下极其特殊的性质：
+ 无中生有的“参数”：在网络刚开始训练时，Point Query 可能只是一组随机生成的、没有任何意义的数字向量。
+ 不断进化的“侦察兵”：在经过成千上万张图片的训练后，这些 Query 通过梯度下降“学习”到了特定的技能。如寻找高对比度的“边缘”、寻找“黄色与黑色的交界点”。
+ 交叉注意力 (Cross-Attention)：在推理时，这些训练有素的 Query 会带着它们各自学到的“问题（特征偏好和位置偏好）”，去和 BEV 特征图（Keys 和 Values）进行交互。

## Transformer Block 的组成

一个标准 Transformer Block 通常包括：

1. **Multi-Head Self-Attention**：使用多个注意力头，从不同子空间学习关系；
2. **残差连接和 LayerNorm**：稳定训练并保留原始特征，常见形式是 `x + Attention(x)`；
3. **FFN（Feed-Forward Network）**：对每个位置独立地进行通道维度上的非线性变换，常见结构是 Linear-GELU-Linear；
4. **位置编码（Positional Encoding）**：注意力本身不感知顺序，需要额外注入位置信息。

注意力主要负责“不同位置之间的信息混合”，FFN 主要负责“每个位置内部的特征变换”。多头注意力则可以同时学习不同类型的关系，例如语法关系、空间邻近关系或远距离依赖。

## Transformer 在大语言模型中的使用

大语言模型（LLM）通常先把文本切分为 token，再把 token 映射成向量。一个 token 可以是一个字、一个词、词的一部分或标点，具体由 tokenizer 决定。

以 GPT 类模型为例，典型流程是：

1. 文本经过 tokenizer 变成 token ID；
2. token ID 查表得到词向量，并加入位置编码；
3. 多层 **Decoder-only Transformer** 处理这些 token；
4. 最后一层 Linear 将隐藏向量映射到词表大小，得到下一个 token 的 logits；
5. 经过 softmax 得到概率，选择或采样下一个 token，再把它追加到输入中循环生成。

LLM 训练通常使用因果语言建模（Causal Language Modeling）：预测当前位置的下一个 token。为了防止模型偷看答案，Self-Attention 使用**因果 mask**，第 $i$ 个位置只能关注第 $i$ 个及其之前的位置：

$$
P(x_t|x_{<t})
$$

所以 LLM 中的 Transformer 重点是：**理解 token 之间的语言关系，并根据上下文生成下一个 token**。它的输出通常是词表上的概率分布，而不是图像中的像素或边界框。

BERT 则是另一种常见形式：主要使用 **Encoder-only Transformer**，通过双向注意力理解上下文，适合分类、匹配和抽取等理解任务；T5 等模型使用 Encoder-Decoder 结构，适合输入到输出的文本转换任务。

## Transformer 在计算机视觉中的使用

图像不是天然的一维 token 序列，因此视觉 Transformer（Vision Transformer，ViT）通常先把图像切成固定大小的 patch。例如输入图像为 $H\times W$，patch 大小为 $P\times P$，则 token 数量约为：

$$
N=\frac{H}{P}\times\frac{W}{P}
$$

每个 patch 经过线性投影变成一个视觉 token，再加入二维位置编码，随后送入 Transformer Encoder。以图像分类为例，数据流可以概括为：

1. 图像切分为 patch；
2. 每个 patch 展平并投影为固定维度的 token；
3. 添加位置编码和可选的 `[CLS]` token；
4. Encoder 通过 Self-Attention 建模不同图像区域之间的关系；
5. 使用分类头输出类别。

视觉任务不同，Transformer 的输出形式也不同：

- **分类**：使用 `[CLS]` token 或全局池化后的特征输出类别；
- **目标检测**：使用 object query 查询图像特征，输出类别和边界框，DETR 就属于这一类；
- **语义分割**：保留空间位置，将 token 特征恢复或映射到像素网格；
- **图像生成**：将图像 patch 或离散视觉 token 按序预测和生成。

CV 中的注意力既可以是 patch 之间的全局注意力，也可以限制在局部窗口内。全局注意力能捕捉远距离空间关系，但计算量随 token 数量 $N$ 近似按 $O(N^2)$ 增长；高分辨率图像会产生大量 token，因此 Swin Transformer 等方法采用窗口注意力、层级特征和窗口移动来降低开销。

## LLM 与 CV 中 Transformer 的区别

两者使用相同的注意力基本公式，但输入、位置关系、mask 和输出目标不同：

| 对比维度 | 大语言模型（LLM） | 计算机视觉（CV） |
| --- | --- | --- |
| 输入 | 文本 token，通常是一维序列 | 图像 patch token，来源于二维网格，也可能来自 CNN 特征图 |
| 位置关系 | 词语的先后顺序，常使用绝对或相对位置编码、RoPE | patch 的二维空间位置，通常需要二维位置编码或窗口位置偏置 |
| 注意力范围 | Decoder-only LLM 使用因果 mask，只看当前位置及之前的 token | 图像理解通常允许 patch 之间双向关注；检测器也会使用 query 与图像特征交互 |
| 主要任务 | 预测下一个 token、文本理解、问答、翻译和生成 | 分类、检测、分割、跟踪、姿态估计和图像生成 |
| 常见输出 | 词表上的 logits 或文本序列 | 类别、边界框、掩码、关键点或图像特征图 |
| 主要瓶颈 | 上下文长度、KV Cache、显存和生成速度 | 高分辨率导致 token 数量多、空间细节和全局建模的平衡 |
| 常见结构 | GPT：Decoder-only；BERT：Encoder-only；T5：Encoder-Decoder | ViT、Swin、DETR，以及 CNN-Transformer 混合架构 |

最容易混淆的一点是：**LLM 中的 token 是语言切分单元，CV 中的 token 通常是图像 patch 或特征位置**。二者都叫 token，但含义不同。LLM 多数是“根据前文生成后文”，CV 多数是“理解整张图并输出结构化预测”。

在自动驾驶感知中，图像特征图或 BEV 特征可以作为 Key 和 Value，Point Query、Line Query 或 Object Query 作为 Query，通过 Cross-Attention 从视觉特征中提取目标、点或线的信息。这些 Query 可以是可学习的向量，也可以由其他网络根据输入动态生成。


## DETR (DEtection TRansformer)
1. CNN 骨干网络 (Backbone)：DETR 没有完全抛弃 CNN，使用 ResNet 等经典的 CNN 来提取图像的基础特征，生成一张浓缩了图像信息的特征图。
2. Transformer 编码器 (Encoder)：CNN 提取的特征图被拉平，并加上位置编码（Positional Encoding，附加的位置信息）后，送入 Transformer Encoder。Encoder深度理解输入数据的上下文。 它的输入是一堆带有位置编码的原始特征，输出则是经过深度交流、融合了全局信息的“高级特征图”。
    + 自注意力机制（Self-Attention）：Encoder 的核心运算机制，使得图像中的每一个像素都能感知到全局上下文。Query (Q)、Key (K)、Value (V) 全部来源于同一个输入源。让输入序列中的每一个元素，都去和同一序列中的其他所有元素计算“相关性”，从而更新自己的理解。
3. Transformer 解码器（Decoder）:交叉注意力和自注意力的区别在于信息来源不同，是割裂的双向的：Query (Q) 来自Object Query，而 Key (K) 和 Value (V) 来自CNN 提取的特征图。
    + Q: Object Query: DETR 初始化了固定数量的 $N$ 个（通常设为 100）Object Query。这 100 个 Query 就像 100 个带着特定位置偏好和特征偏好的“侦察兵”。它们在 Decoder 中，通过交叉注意力（Cross-Attention）不断向 Encoder 提取的全局特征图“提问并抓取”自己感兴趣的物体信息。
    + Cross-Attention: 实现信息的跨模态或跨模块提取。在 DETR/PivotNet 中，是让侦察兵（Query）去庞大的背景报告（Encoder 输出的特征图）里定向抓取信息。
4. 预测头 (Prediction Heads)最后，这 100 个 Query 会各自独立地通过一个简单的前馈网络（FFN），直接输出 100 个预测结果。每个结果包含两个信息：类别（包括具体的物体类别，或者一个特殊的“无物体/背景”类别 $\varnothing$）。边界框坐标（归一化后的中心点 $x, y$ 和宽高 $w, h$）。
    + FFN: Attention 机制（无论是 Self 还是 Cross）本质上是在做空间维度 / 序列维度上的信息混合 (Spatial/Sequence Mixing)，它只负责算出“谁和谁有关联”，但仅仅依靠线性加权，网络的非线性表达能力是不够的。FFN 负责的是特征通道维度上的信息混合 (Channel Mixing)。它对序列中的每一个元素（Point-wise / Position-wise）独立且等价地进行深度的非线性变换。FFN 通常是一个包含两个线性变换层（全连接层）和中间一个非线性激活函数（如 ReLU 或 GELU）
5. 训练方式：匈牙利算法 (Hungarian Algorithm) 驱动的二分图匹配(Bipartite Matching)

在一个标准的 Transformer Block 中，数据流是这样的：
1. 数据先经过 Self-Attention，完成元素彼此之间的上下文互相理解。
2. （如果是 Decoder）再经过 Cross-Attention，去外部特征源抓取特定信息。
3. 最后经过 FFN，在每个元素自己的特征通道内进行非线性的升维和提炼。
4. 每一层之间都会穿插残差连接 (Residual Connection) 和 层归一化 (LayerNorm)，以确保深层网络的梯度稳定传播。

# 相关概念
## 联邦学习
联邦学习（Federated Learning）是一种先进的分布式机器学习方法，它在数据隐私保护和数据利用效率方面具有显著的优势。在联邦学习中，多个参与方（也称为客户端或节点）可以在保持数据本地化的同时，共享模型训练的成果。
让各个企业自己进行模型的训练，各个企业在完成模型的训练之后，将各自模型的参数上传至一个中心服务器（也可以是点对点），中心服务器结合各个企业的参数（可以上传梯度，也可以是自己更新后的参数），重新拟定新的参数（例如通过加权平均，这一步叫做联邦聚合），将新的参数下发至各个企业，企业将新参数部署到模型上，从而继续新的训练，这个过程可以进行反复的迭代，直到模型收敛，或者满足其他的条件。
<img src="https://i-blog.csdnimg.cn/direct/dbf3bfb8a37c4c1582d09b9ebd6ad01b.png#pic_center" width = "50%" />

## 分布式训练
单机单卡情况下，信息都在一台机器上，无所谓分发。而分布式训练中，信息是要被“分发”的，分发的不同方式，常被称为“并行方式”。通常，习惯上将分发方分为“数据并行”和“模型并行”两种：
+ 模型并行(Model Parallelism)：将模型进行切分，完整的数据 被送至各个训练节点，与 切分后的模型 进行运算，最后将多个节点的运算结果合并；适用于模型规模大的情况
+ 数据并行(Data Parallelism)：将样本数据进行切分，切分后的数据 被送至各个训练节点，与 完整的模型 进行运算，最后将多个节点的信息进行合并；适用于数据量大的情况
    1. 数据划分：不同GPU设备上划分出不同的mini-batch，作为训练的数据集
    2. 前向+反向:不同GPU设备上用相同的模型，用各自接收到的mini-batch数据进行训练（前向和反向传播)
    3. 梯度同步更新:每个GPU设备得到了mini-batch训练后的权重值，这些值需要汇总然后更新至每一个GPU设备，保证每一次迭代后，每个GPU设备上的模型完全一致。
    <img src="https://i-blog.csdnimg.cn/blog_migrate/480474efbee3b54d014a3f6691284354.jpeg" width = "50%" />

> 分布式训练中的学习率自动缩放：在数据并行中，多个GPU同时处理不同的数据子集（每个GPU的批量大小为 B），总批量大小为 B × GPU数量。例如，单GPU批量大小为256，使用4个GPU时，总批量大小变为1024。
更大的批量意味着梯度估计的方差更小，更新方向更准确。为了保持参数更新的有效步长与单GPU训练一致，需要按比例调整学习率。

分布式系统中因为面临大量的信息同步、更新需求，因此传统的点对点(P2P, Point-to-point)的通信方式不能很好的满足需求。需要使用集合通信库(Collective communication Library)，用于分布式训练时，多个计算设备之间的集合通信，常见的有 Open MPI、NCCL:
+ Open MPI:Open MPI项目是一个开源MPI（消息传递接口 ）实现，由学术，研究和行业合作伙伴联盟开发和维护。因此，Open MPI可以整合高性能计算社区中所有专家，技术和资源，以构建可用的最佳MPI库。
+ Gloo:facebook开源的一套集体通信库，他提供了对机器学习中有用的一些集合通信算法如：barrier, broadcast, allreduce
+ NCCL:NVIDIA Collective Communications Library, 英伟达基于NCIDIA-GPU的一套开源的集体通信库，如其官网描述：NVIDIA集体通信库（NCCL）实现了针对NVIDIA GPU性能优化的多GPU和多节点集体通信原语。NCCL提供了诸如all-gather, all-reduce, broadcast, reduce, reduce-scatter等实现，这些实现优化后可以通过PCIe和NVLink等高速互联，从而实现高带宽和低延迟。 因为NCCL则是NVIDIA基于自身硬件定制的，能做到更有针对性且更方便优化，故在英伟达硬件上，NCCL的效果往往比其它的通信库更好。
  + P2P（Peer-to-Peer）是指单个节点内的 GPU 之间直接通信，而不需要通过 CPU 或系统内存中转，可以显著提高通信效率。但若某些 GPU 之间没有直接的 P2P 连接（NVLink 或 PCIe P2P），NCCL可能会初始化后挂死，通过设置 NCCL_P2P_DISABLE=1，可以强制 NCCL 使用系统内存中转的方式代替 P2P 通信，从而避免这些问题。

NCCL遇到显卡P2P通信问题:[1](https://huo.zai.meng.li/p/vllm%E5%90%AF%E5%8A%A8%E6%97%B6nccl%E9%81%87%E5%88%B0%E6%98%BE%E5%8D%A1p2p%E9%80%9A%E4%BF%A1%E9%97%AE%E9%A2%98/) [2](https://huo.zai.meng.li/p/vllm%E5%90%AF%E5%8A%A8%E6%97%B6nccl%E9%81%87%E5%88%B0%E6%98%BE%E5%8D%A1p2p%E9%80%9A%E4%BF%A1%E9%97%AE%E9%A2%98/)



## 曼哈顿距离 (Manhattan distance)
曼哈顿距离（Manhattan distance），也叫 城市街区距离（City Block Distance） 或 L1 距离，是一种常见的距离度量方法。它的名字来源于美国纽约曼哈顿的街道布局——街道呈网格状，行走时只能沿着水平或垂直方向移动。
𝑑 ( 𝑃 1 , 𝑃 2 ) = ∣ 𝑥 1 − 𝑥 2 ∣ + ∣ 𝑦 1 − 𝑦 2 ∣
应用场景
机器学习：在 KNN、聚类等算法中作为距离度量。
优化问题：L1 范数常用于稀疏解（如 Lasso 回归）。
图像处理：计算像素间的差异。
路径规划：在网格地图中估算步数或路径长度。

## 匈牙利算法（Hungarian Algorithm）
+ Step 1：代价矩阵的每一行减去其最小的值。
+ Step 2：然后，对第一步完成后的代价矩阵的每一列减去其最小的值。
+ Step 3：接着，用最小的行与列来覆盖代价矩阵中已经是0的元素。如果这个行与列的总数达到n，算法结束，否则进入Step 4。
+ Step 4：对于所有没有被覆盖的元素，找出其中的最小值，然后所有没有被覆盖的元素减去该最小值，所有被覆盖了两次的元素（行覆盖了一次，列又覆盖一次）加上该最小值。然后重新回到Step3。当找到对应的 0元素后，代入回最开始的原来的代价矩阵中对应的位置，便能找到最小的匹配。

在目标检测中：
模型会输出 一组预测框（通常数量比真实框多）。
数据集提供 一组真实框（ground truth）。
我们需要把预测框和真实框 一一对应，才能计算损失函数。
如果直接用 IoU 或贪心匹配，可能出现：
一个真实框被多个预测框匹配/有些预测框没有对应真实框/导致训练不稳定

匈牙利算法的作用
匈牙利算法解决的是 最优匹配问题：
输入：预测框集合 𝑃，真实框集合 𝐺。
构造一个 代价矩阵 𝐶，其中元素 𝑐𝑖𝑗表示预测框 𝑝𝑖与真实框 𝑔𝑗的匹配代价。
输出：一个最优分配方案，使得总代价最小。
代价矩阵的构造
在检测任务中，代价通常由以下部分组成：
分类代价：预测类别与真实类别的交叉熵。
位置代价：预测框与真实框的 L1 距离。
IoU 代价：预测框与真实框的重叠度（1 - IoU）。

## 全卷积网络（FCNs）
全卷积网络（Fully Convolutional Networks, FCNs）是一种专门用于图像语义分割的深度学习架构，它将传统卷积神经网络中的全连接层替换为卷积层，从而能够处理任意尺寸的输入图像，并输出与输入同尺寸的像素级预测结果。
核心思想
去掉全连接层：传统 CNN 在最后通常有全连接层用于分类，而 FCN 将其替换为卷积层，使得输出不再是单一类别，而是一个空间分布（热力图）。
端到端训练：输入原始图像，输出预测分割图，不需要额外的手工特征设计。
任意尺寸输入：由于没有全连接层，FCN 可以接受不同大小的图像作为输入。
上采样（Upsampling）：通过反卷积（转置卷积）或插值方法恢复特征图尺寸，使输出与原图大小一致。
跳级结构（Skip connections）：结合深层语义信息和浅层细节信息，提高分割精度和细节保真度。
