---
title: PaperLog：DMS-YOLOv8
date: 2023-11-16 10:30:00
tags: 总结
---
论文《基于YOLOv8的驾驶员行为检测算法及其实现》日志, 项目地址：[DMS-YOLOv8](https://github.com/Arrowes/DMS-YOLOv8)
<!--more-->

该论文整体框架为之前两篇论文的整合：
+ 基于通道扩展与注意力机制的YOLOv7驾驶员分心行为检测
[CEAM-YOLOv7: Improved YOLOv7 Based on Channel Expansion and Attention Mechanism for Driver Distraction Behavior Detection](https://ieeexplore.ieee.org/document/9980374/metrics#metrics)
项目地址：[CEAM-YOLOv7](https://github.com/Arrowes/CEAM-YOLOv7)
+ 基于面部小目标动态追踪的YOLOv7驾驶员疲劳检测
[A Driver Fatigue Detection Algorithm Based on Dynamic Tracking of Small Facial Targets Using YOLOv7](https://www.jstage.jst.go.jp/article/transinf/E106.D/11/E106.D_2023EDP7093/_article)
项目地址：[FEY-YOLOv7](https://github.com/Arrowes/FEY-YOLOv7)

此外，加入算法部署实现部分，基于实习期间对TDA4的研究：
+ [TDA4①：SDK, TIDL, OpenVX](https://wangyujie.site/TDA4VM/)
+ [TDA4②：环境搭建、模型转换、Demo及Tools](https://wangyujie.site/TDA4VM2/)
+ [TDA4③：YOLOX的模型转换与SK板端运行](https://wangyujie.site/TDA4VM3/)
+ [TDA4④：部署自定义模型](https://wangyujie.site/TDA4VM4/)

训练数据：[exp](https://docs.qq.com/sheet/DWmV1TnhIdlBodW1C?tab=BB08J2&u=d859dabcd86a47b181e758b366a48fdc)



---
以下为开发日志（倒叙）
# 202311 部署模型至SK板
## 20231116 模型转换，yolox失败，yolov8 & FEY-YOLOX成功
```sh
#model_configs.py:
        'yolox_s_lite' :{  # infer wrong
        'model_path' : os.path.join(models_base_path, 'yolox_s_ti_lite0.onnx'),
        'mean': [0, 0, 0],
        'scale' : [0.003921568627,0.003921568627,0.003921568627],
        'num_images' : numImages,
        'num_classes': 4,
        'model_type': 'od',
        'od_type' : 'SSD',
        'framework' : 'MMDetection',
        'meta_layers_names_list' : os.path.join(models_base_path, 'yolox_s_ti_lite0.prototxt'),
        'session_name' : 'onnxrt' ,
        'meta_arch_type' : 6
    },    

#失败，输出全是-1
output.shape: (1, 1, 200, 6) [array([[[[-1., -1., -1., -1.,  0., -1.],
         [-1., -1., -1., -1.,  0., -1.],
         [-1., -1., -1., -1.,  0., -1.],
         ...,
         [-1., -1., -1., -1.,  0., -1.],
         [-1., -1., -1., -1.,  0., -1.],
         [-1., -1., -1., -1.,  0., -1.]]]], dtype=float32)]
input_data.shape (1, 3, 640, 640)
#是否仍然可以部署？

#如果注释掉prototxt，或以分类模型形式转换，则报错：
onnxruntime.capi.onnxruntime_pybind11_state.Fail: [ONNXRuntimeError] : 1 : FAIL : This is an invalid model. Error: the graph is not acyclic.

#使用edgeai-yolox中的pretrained yolox-s-ti-lite_39p1_57p9同样报错
#使用modelZoo中的8220 yolox_s_lite_640x640则正常
#两者模型主干相同，头尾不同
```
目前看来，edgeai-yolox训练得到的模型并不能直接转换（虽然它提供的export_onnx.py能导出prototxt）
而modelZoo中的yolox经查应该是由**edgeai_benchmark**训练得到的，下次尝试

又回去尝试直接转10月训练的yolov8n_4aug(不使用prototxt)，转换**有输出**（`output.shape: (1, 25200, 9)`）！！
但是无法直接infer，而且没有prototxtx后期如何部署？可能之后要手搓SK板中的代码

此外FEY-YOLOX也有输出，今天进展不错，明天尝试这两个有输出的部署以及edgeai_benchmark yolox的训练

## 20231115 edgeai-yolox训练
[edgeai-yolox](https://github.com/TexasInstruments/edgeai-yolox/blob/main/README_2d_od.md)
```py
#训练：
python -m yolox.tools.train -n yolox-s-ti-lite -d 0 -b 16 --fp16 -o --cache
#使用疲劳驾驶数据集训练成功，pth=68.5MB

#导出：
python3 tools/export_onnx.py --output-name yolox_s_ti_lite0.onnx -f exps/default/yolox_s_ti_lite.py -c YOLOX_outputs/yolox_s_ti_lite/best_ckpt.pth --export-det
#生成onnx（37.04MB）与prototxt

#onnx推理：
python3 demo/ONNXRuntime/onnx_inference.py -m yolox_s_ti_lite0.onnx -i test.jpg -s 0.3 --input_shape 640,640 --export-det
#推理成功，检测出眼睛嘴巴
```
YOLOX模型是ok的，与官方提供的预训练模型结构基本相同


## 20231113 尝试部署yolov8失败
尝试直接用edgeai-tools转换yolov8模型，失败
可能的原因：转换编译配置、SK板部署参数配置、模型结构不支持/输出不匹配
为排除模型问题，接下来先用yolox尝试

## 20231112 算法降级 FEY-YOLOv7 → FEY-YOLOX
参考：[用YOLOv5框架YOLOX](https://blog.csdn.net/g944468183/article/details/129559197)
FEY-YOLOX也许能直接部署

---

# 202310 算法升级YOLOv7 → v8
## 20231017 参考YOLOv8原项目
[YOLOv8_modules](https://github.com/ultralytics/ultralytics/ultralytics/nn/modules)
<img alt="图 1" src="https://raw.gitmirror.com/Arrowes/Blog/main/images/PerperLogYOLOv8Structure.jpeg" width="50%"/> 
参考网络结构，用modules搭积木
```yaml
#YOLOv8.yaml
# parameters
nc: 4  # number of classes
depth_multiple: 0.33  # model depth multiple
width_multiple: 0.25  # layer channel multiple
# scales: # model compound scaling constants, i.e. 'model=yolov8n.yaml' will call yolov8.yaml with scale 'n'
#   # [depth, width, max_channels]
#   n: [0.33, 0.25, 1024]  # YOLOv8n summary: 225 layers,  3157200 parameters,  3157184 gradients,   8.9 GFLOPs
#   s: [0.33, 0.50, 1024]  # YOLOv8s summary: 225 layers, 11166560 parameters, 11166544 gradients,  28.8 GFLOPs
#   m: [0.67, 0.75, 768]   # YOLOv8m summary: 295 layers, 25902640 parameters, 25902624 gradients,  79.3 GFLOPs
#   l: [1.00, 1.00, 512]   # YOLOv8l summary: 365 layers, 43691520 parameters, 43691504 gradients, 165.7 GFLOPs
#   x: [1.00, 1.25, 512]   # YOLOv8x summary: 365 layers, 68229648 parameters, 68229632 gradients, 258.5 GFLOPs
# # depth_multiple:0.33  用来控制模型的深度，仅在repeats≠1时启用
# # width_multiple:0.25  用来控制模型的宽度，主要做哟关于args中的ch_out
# # 如第一个卷积层，ch_out=64,那么在v8n实际运算过程中，会将卷积过程中的卷积核设为64x0.25，所以会输出16通道的特征图

# anchors
anchors:
#  - [10,13, 16,30, 33,23]  # P3/8
#  - [30,61, 62,45, 59,119]  # P4/16
#  - [116,90, 156,198, 373,326]  # P5/32
  - [5,6, 8,14, 15,11]
  - [10,13, 16,30, 33,23]  # P3/8
  - [30,61, 62,45, 59,119]  # P4/16

#  - [116,90, 156,198, 373,326]  # P5/32

# YOLOv7-tiny backbone
backbone:
  # [from, number, module, args]
  [[-1, 1, Conv, [64, 3, 2]],  # 0-P1/2 得到特征图大小的一半   
   [-1, 1, Conv, [128, 3, 2]],  # 1-P2/4
   [-1, 3, C2f, [128, True]],
   [-1, 1, Conv, [256, 3, 2]],  # 3-P3/8
   [-1, 6, C2f, [256, True]],
   [-1, 1, Conv, [512, 3, 2]],  # 5-P4/16
   [-1, 6, C2f, [512, True]],
   [-1, 1, Conv, [1024, 3, 2]],  # 7-P5/32
   [-1, 3, C2f, [1024, True]],
   [-1, 1, SPPF, [1024, 5]],  # 9
  ]
# YOLOv8.0n head
head:
  [[-1, 1, nn.Upsample, [None, 2, 'nearest']],
   [[-1, 6], 1, Concat, [1]],  # cat backbone P4
   [-1, 3, C2f, [512]],  # 12

   [-1, 1, nn.Upsample, [None, 2, 'nearest']],
   [[-1, 4], 1, Concat, [1]],  # cat backbone P3
   [-1, 3, C2f, [256]],  # 15 (P3/8-small)

   [-1, 1, Conv, [256, 3, 2]],
   [[-1, 12], 1, Concat, [1]],  # cat head P4
   [-1, 3, C2f, [512]],  # 18 (P4/16-medium)

   [-1, 1, Conv, [512, 3, 2]],
   [[-1, 9], 1, Concat, [1]],  # cat head P5
   [-1, 3, C2f, [1024]],  # 21 (P5/32-large)

   [[15, 18, 21], 1, Detect, [nc, anchors]],  # Detect(P3, P4, P5)
  ]
```

主要步骤：
在models/common.py中加入新模块：~~C2f（注释掉原C2f），并在yolo.py中导入~~, 用原模块好像也一样；暂未修改检测头和Anchor-free
使用疲劳驾驶数据集检测，效果很好√