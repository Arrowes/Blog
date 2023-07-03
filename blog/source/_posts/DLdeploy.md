---
title: DL模型转换及部署：量化、ONNX
date: 2023-06-09 11:36:00
tags:
- 嵌入式
- 深度学习
---

**算法部署**
+ Network selection：
+ Optimization：分组卷积、深度可分离卷积、稀疏卷积
+ Deployment：
<img alt="图 1" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>  

Netron神经网络可视化: [软件下载](https://github.com/lutzroeder/netron/releases/tag/v7.0.0), [在线网站](https://netron.app/)

# 量化
量化一般是指把模型的单精度参数（Float32）转化为低精度参数(Int8,Int4)，把推理过程中的浮点运算转化为定点运算。
*（float和int的本质区别在于小数点是否固定）*

浮点数格式 (float32)：$V = (-1)^s×M×2^E$
符号位s|阶码E|尾数M|
---|--|--
1|8|23|
定点数格式 (int8)：
符号位|整数位（设定）|小数位(量化系数)|
---|--|--
1|4|3|
若整数位占4位，小数位占3位，则其最大精度为0.125，最大值为15.875
若整数位占5位，小数位占2位，则其最大精度为0.250，最大值为31.750
$int8=float32∗2^3$
$float32=int8/2^3$


浮点运算在运算过程中，小数点的位置是变动的，而定点运算则是固定不变。如果将浮点数转换成定点数，就可以实现一次读取多个数进行计算（1 float32 = 4 int8），提高了运算效率。

> 8位和16位是指量化的位深度，表示用多少个二进制位来表示每个权重或激活值。在量化时，8位会将每个权重或激活值分成256个不同的离散值，而16位则分为65536个离散值，因此16位的表示范围更广，可以更精确地表示模型中的参数和激活值。但是，使用较高的位深度会增加存储要求和计算成本，因此需要在预测精度和计算开销之间进行权衡。
<img src="https://img2018.cnblogs.com/blog/947235/201905/947235-20190513143437402-715176586.png" width='70%'>
乘一个系数把float类型的小数部分转换成整数部分，然后用这个转换出来的整数进行计算，计算结果再还原成float

<img alt="图 3" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/DLdeployquantized.png" width="80%"/>  

[A White Paper on Neural Network Quantization](https://arxiv.org/pdf/2106.08295.pdf)

# ONNX
Open Neural Network Exchange 开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，是深度学习框架到推理引擎的桥梁 
链接：[ONNX](https://onnx.ai)，[Github](https://github.com/onnx/onnx)，[ONNX Runtime](https://onnxruntime.ai/)，[ONNX Runtime Web](https://onnx.coderai.cn)

[TORCH.ONNX](https://pytorch.org/docs/stable/onnx.html)，[Github](https://github.com/pytorch/pytorch/tree/main/torch/onnx)
Pytorch 模型导出使用自带的接口：`torch.onnx.export`
 PyTorch 转 ONNX，实际上就是把每个 PyTorch 的操作**映射**成了 ONNX 定义的**算子**。PyTorch 对 ONNX 的算子支持:[官方算子文档](https://github.com/onnx/onnx/blob/main/docs/Operators.md)


在转换普通的torch.nn.Module模型时，PyTorch 一方面会用跟踪法执行前向推理，把遇到的算子整合成计算图；另一方面，PyTorch 还会把遇到的每个算子翻译成 ONNX 中定义的算子。要使 PyTorch 算子顺利转换到 ONNX ，我们需要保证：
> 算子在 PyTorch 中有实现
有把该 PyTorch 算子映射成一个或多个 ONNX 算子的方法
ONNX 有相应的算子


