---
title: DL模型转换及部署
date: 2023-06-09 11:36:00
tags:
- 嵌入式
- 深度学习
---

**算法部署**
+ Network selection：

+ Optimization：分组卷积、深度可分离卷积、稀疏卷积[^1]
[^1]:[适用于嵌入式应用的深度学习推理参考设计](https://www.ti.com.cn/cn/lit/ug/zhcu546/zhcu546.pdf)

+ Deployment：
<img alt="图 7" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>  

# [ONNX](https://onnx.ai) 
Open Neural Network Exchange 开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，是深度学习框架到推理引擎的桥梁 [Github](https://github.com/onnx/onnx)，[ONNX Runtime Web](https://onnx.coderai.cn)，

[TORCH.ONNX](https://pytorch.org/docs/stable/onnx.html)，[Github](https://github.com/pytorch/pytorch/tree/main/torch/onnx)
Pytorch 模型导出使用自带的接口：`torch.onnx.export`
 PyTorch 转 ONNX，实际上就是把每个 PyTorch 的操作**映射**成了 ONNX 定义的**算子**。PyTorch 对 ONNX 的算子支持:[官方算子文档](https://github.com/onnx/onnx/blob/main/docs/Operators.md)

在转换普通的torch.nn.Module模型时，PyTorch 一方面会用跟踪法执行前向推理，把遇到的算子整合成计算图；另一方面，PyTorch 还会把遇到的每个算子翻译成 ONNX 中定义的算子。要使 PyTorch 算子顺利转换到 ONNX ，我们需要保证[^2]：
> 算子在 PyTorch 中有实现
有把该 PyTorch 算子映射成一个或多个 ONNX 算子的方法
ONNX 有相应的算子

[^2]:[PyTorch 转 ONNX 详解](https://zhuanlan.zhihu.com/p/498425043)

