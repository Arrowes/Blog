---
title: DL算法的嵌入式部署
date: 2023-05-18 16:28:00
tags:
- 嵌入式
- 深度学习
---
# 算法部署
+ Network selection：

+ Optimization：分组卷积、深度可分离卷积、稀疏卷积[^6]
[^6]:[适用于嵌入式应用的深度学习推理参考设计](https://www.ti.com.cn/cn/lit/ug/zhcu546/zhcu546.pdf)

+ Deployment：
<img alt="图 7" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>  

# [ONNX](https://onnx.ai) (Open Neural Network Exchange)
开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，[Github](https://github.com/onnx/onnx)

[ONNX Runtime Web](https://onnx.coderai.cn)