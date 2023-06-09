---
title: TDA4:环境搭建、模型转换及Demo
date: 2023-05-18 16:28:00
tags:
- 嵌入式
- 深度学习
---

相关前置知识见笔记：[[TDA4VM, TIDL, OpenVX]](https://wangyujie.site/2023/05/10/TDA4VM/)
环境搭建需要下载：[PROCESSOR-SDK-J721E](https://www.ti.com.cn/tool/cn/PROCESSOR-SDK-J721E)

# [Linux SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-rt-jacinto7/08_06_00_11/exports/docs/devices/J7/linux/index.html) 环境搭建

```shell
#添加执行文件并执行
chmod +x ./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin 
./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin

#安装依赖的系统软件包和工具，安装过程中跳过需要连EVM的NFS、minicom、TFTP
#(若Ubuntu版本不匹配 > bin/setup-host-check.sh > if [ "$host" != "bionic" ] 改为 if [ "$host" != "focal" ] )
sudo ./setup.sh
#TISDK setup completed!
```
通过在根目录下make linux或u-boot等各种命令，可以快速的让SDK编译出你所需要的产物。注意需要手工修改Rules.mak文件中的DESTDIR变量为你的TF卡挂载路径。
```sh
#ti-processor-sdk-linux-j7-evm*/board-support/
Make linux        #编译Linux kernel代码和dtb，主要用于内核驱动的修改和裁剪。安装命令可以将内核和驱动模块自动拷贝到TF卡中。
Make linux_install  #生成built-images
Make u-boot       #编译u-boot代码，主要分为两部分：运行在MCU上的r5f部分和运行在A72上的a53部分。此处A72兼容A53指令集。
Make sysfw-image  #生成sysfw固件，主要在修改MSMC大小的时候会用到。
```


# [RTOS SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/index.html) 环境搭建

> 下载：
ti-processor-sdk-rtos-j721e-evm-08_06_01_03.tar.gz
ti-processor-sdk-rtos-j721e-evm-08_06_01_03-prebuilt.tar
+两个dataset.tar.gz
```sh
tar -xf ti-processor-sdk-rtos-j721e-evm-08_06_01_03.tar.gz  #解压
#配置RTOS和Linux的安装环境变量
export PSDKL_PATH=/home/wyj/SDK/ti-processor-sdk-linux-j7-evm-08_06_01_02
export PSDKR_PATH=/home/wyj/SDK/ti-processor-sdk-rtos-j721e-evm-08_06_01_03
#拷贝linux系统文件和linux启动文件到psdk rtos文件夹（或从rtos-prebuilt.tar）
cp ${PSDKL_PATH}/board-support/prebuilt-images/boot-j7-evm.tar.gz ${PSDKR_PATH}/
cp ${PSDKL_PATH}/filesystem/tisdk-default-image-j7-evm.tar.xz ${PSDKR_PATH}/
#安装依赖库和下载编译器，若安装报错则需换源，有包没安上会影响之后的make
./psdk_rtos/scripts/setup_psdk_rtos.sh  #若卡在git clone则进.sh把git://换成https://
#Packages installed successfully
```


# [Vision Apps Demo](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/vision_apps/docs/user_guide/ENVIRONMENT_SETUP.html) 编译
```sh
#修改文件 tiovx/build_flags.mak（没修改过则是默认）
BUILD_EMULATION_MODE=no #非模拟器模式
BUILD_TARGET_MODE=yes
BUILD_LINUX_A72=yes
PROFILE=release
#Optional:配置tiovx/build_flags.mak, vision_apps/vision_apps_build_flags.mak
#开始编译vision apps
cd vision_apps
make vision_apps -j8    #若缺少core-secdev-k3包，手动导入(https://git.ti.com/cgit/security-development-tools/core-secdev-k3/snapshot/core-secdev-k3-08.06.00.006.tar.gz)

#编译成功可以看到对应目录下有产出文件，RTOS SDK主要使用了一个开源编译框架concerto，这个框架基于Makefile，他能够自动搜索当前目录内的所有concerto.mak文件，并且分析依赖，一次将各个核心的固件全部编译出来。编译生成的文件位于
vision_apps/out/J7/A72/LINUX/$PROFILE
vision_apps/out/J7/R5F/SYSBIOS/$PROFILE
vision_apps/out/J7/C66/SYSBIOS/$PROFILE
vision_apps/out/J7/C71/SYSBIOS/$PROFILE
##If clean build of vision_apps/clean the full PSDK RTOS
#cd vision_apps, make vision_apps_scrub/make sdk_scrub
```
<details>
<summary>配置SD卡(EVM)</summary>
配置SD卡(EVM)，在TDA4VM的开发过程中，都是使用TF卡进行开发的。在单片机开发平台下，通常是直接用电脑使用USB方式将固件烧写到板卡的eMMC或FLASH中去。在TI平台下，首选的调试方法是使用TF卡：TF卡会被划分为两个分区，一个是 *BOOT* 分区（FAT32），用于存放bootloader如uboot等，另一个是 *rootfs* 分区（ext4），用于存放Linux需要的文件系统。每次Ubuntu编译完成的固件都需要手动拷贝到TF卡中，然后将TF卡插入EVM上电启动。

``df -h``, 查得SD卡设备名 `/dev/sdb`
使用RTOS SDK prebuilt中的脚本依次执行：
脚本|作用
--|--
sudo ./mk-linux-card.sh /dev/sdb|用途：将TF卡重新分区、并且格式化
./install_to_sd_card.sh|将该脚本旁边的文件系统压缩包直接拷贝到/media/USER/BOOT和/media/USER/rootfs中，需要十几分钟，之后该卡就可以启动了。
./install_data_set_to_sd_card.sh ./psdk_rtos_ti_data_set_08_06_00.tar.gz|以及./psdk_rtos_ti_data_set_08_06_00_j721e.tar.gz，将数据集解压到TF卡中对应的位置，这样默认SDK配套的Demo就可以正常运行。

添加可执行文件至SD card
```sh
cd ${PSDKR_PATH}/vision_apps
make linux_fs_install_sd
```
然后即可插在EVM端运行，这里没有，跳过。
</details>

# [TDA4VM-SK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/devices/TDA4VM/linux/getting_started.html) 配置
通过USB挂载SD卡到Ubuntu
下载[SDK包](https://www.ti.com/tool/download/PROCESSOR-SDK-LINUX-SK-TDA4VM)
使用[Balena etcher tool 1.7.0](https://github.com/balena-io/etcher/releases/tag/v1.7.0)把 SD card .wic image flash到SD卡上
然后插入SD卡到SK板，SK板连接显示器，上电，进入界面。
```sh
#安装SDK Linux-SK
chmod +x ./xxx.bin
./xxx.bin
```
挂载USB串口，使用[minicom](https://help.ubuntu.com/community/Minicom)串口通讯：
```sh
sudo apt-get install minicom  #安装minicom
sudo minicom -D /dev/ttyUSB2 -c on
#输入用户名：root，登录tda4vm-sk
```
试运行开箱即用的 GUI 应用程序
```sh
#Classification (python)
cd /opt/edgeai-gst-apps/apps_python
./app_edgeai.py ../configs/image_classification.yaml  #ctrl+c退出
#Classification (c++)
cd /opt/edgeai-gst-apps/apps_cpp
./bin/Release/app_edgeai ../configs/image_classification.yaml
#修改和构建C++应用：
/opt/edgeai-gst-apps/apps_cpp# rm -rf build bin lib
/opt/edgeai-gst-apps/apps_cpp# mkdir build
/opt/edgeai-gst-apps/apps_cpp# cd build
/opt/edgeai-gst-apps/apps_cpp/build# cmake ..
/opt/edgeai-gst-apps/apps_cpp/build# make -j2

#视频流车辆检测
cd /opt/edgeai-gst-apps/scripts/optiflow# 
`./optiflow.py ../../configs/object_detection.yaml -t`  #如果没有单引号，终端会将 -t 选项解释为一个单独的参数，而不是作为 optiflow.py 命令的选项之一
```
<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/_images/edgeai_video_source_optiflow.jpg" width='88%'>




# [TIDL](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_user_model_deployment.html)

<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/TIDL_import_process.png" >

## Demo
[Demo：MobileNetV2 Tensorflow model，PeleeNet Caffe model，JSegNet21V2 Caffe model](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_user_model_deployment.html#importing-mobilenetv2-model-for-image-classification)

**Config** TIDL
```sh
export TIDL_INSTALL_PATH=/home/wyj/SDK/ti-processor-sdk-rtos-j721e-evm-08_06_01_03/tidl_j721e_08_06_00_10
#配置永久环境变量更方便，sudo gedit /etc/profile，末尾加入如上代码，然后source /etc/profile加载立即生效

#optional：tidlModelGraphviz tool 模型可视化工具
sudo apt install graphviz-dev
export TIDL_GRAPHVIZ_PATH=/usr
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelGraphviz
make
```

**Import**ing PeleeNet model for object detection (caffe)
[下载](https://drive.google.com/file/d/1KJHKYQ2nChZXlxroZRpg-tRsksTXUhe9/view)并提取.caffemodel，deploy.prototxt放入`ti_dl/test/testvecs/models/public/caffe/peele/pelee_voc/`
deploy.prototxt中改confidence_threshold: 0.4

```sh
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelImport
./out/tidl_model_import.out ${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/config/import/public/caffe/tidl_import_peeleNet.txt
#${TIDL_INSTALL_PATH}/ti_dl/test/下面的配置文件在RTOSsdk8.6中找不到，要从SDK8.5复制！！！

#successful Memory allocation
# Compiled network and I/O .bin files used for inference
    # Compiled network file in ti_dl/test/testvecs/config/tidl_models/caffe/tidl_net_peele_300.bin
    # Compiled I/O file in ti_dl/test/testvecs/config/tidl_models/caffe/tidl_io_peele_300_1.bin
# Performance simulation results for network analysis in ti_dl/utils/perfsim/tidl_import_peeleNet.txt/tidl_import_peeleNet...csv

#若是tensorflow例程，.pb需要先运行tensorflow的.local/lib/python3.6/site-packages/tensorflow/python/tools/optimize_for_inference.py工具进行模型推理优化，再导入。
```


**Run**ning PeleeNet for object detection
```sh
#在文件ti_dl/test/testvecs/config/config_list.txt顶部加入:
1 testvecs/config/infer/public/caffe/tidl_infer_pelee.txt
0

#运行，结果在ti_dl/test/testvecs/output/
cd ${TIDL_INSTALL_PATH}/ti_dl/test
./PC_dsp_test_dl_algo.out
#若标注框尺寸不匹配，需要改deploy.prototxt文件顶部：dim: 512  dim: 1024
```
<img alt="picture 1" src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/out_ti_lindau_000020.png" width="70%"/>  


## YOLOX部署TDA4VM-SK流程
TI官方在[ ModelZOO ](https://github.com/TexasInstruments/edgeai-modelzoo)中提供了一系列预训练模型可以直接拿来转换，也提供了[ edgeai-YOLOv5 ](https://github.com/TexasInstruments/edgeai-yolov5)与[ edgeai-YOLOX ](https://github.com/TexasInstruments/edgeai-yolox)等优化的开源项目，可以直接下载提供的yolov7_s的[ onnx文件 ](http://software-dl.ti.com/jacinto7/esd/modelzoo/latest/models/vision/detection/coco/edgeai-yolox/yolox-s-ti-lite_39p1_57p9.onnx
)和[ prototxt文件 ](http://software-dl.ti.com/jacinto7/esd/modelzoo/latest/models/vision/detection/coco/edgeai-yolox/yolox_s_ti_lite_metaarch.prototxt
)，也可以在官方项目上训练自己的模型后再导入。

这里尝试跑通全流程，在 edgeai-YOLOX 项目中训练，得到 `.pth` 权重文件，使用 export_onnx.py 文件转换为 `.onnx` 模型文件和 `.prototxt` 架构配置文件，并导入TIDL，得到部署用的 `.bin` 文件。
主要参考[ edgeai-YOLOX文档 ](https://github.com/TexasInstruments/edgeai-yolox/blob/main/README_2d_od.md)以及[ YOLOX模型训练结果导入及平台移植应用 ](https://blog.csdn.net/AIRKernel/article/details/126222505)

<img alt="picture 1" src="https://github.com/TexasInstruments/edgeai-yolox/raw/main/yolox/utils/figures/Focus.png"/>  

### 1. 模型文件转ONNX
~~pycharm进入edgeai-yolox项目，根据提示额外安装requirements~~
Window中配置该环境需要安装visual studio build tools，而且很多包报错，因此转ubuntu用vscode搭pytorch环境，非常顺利（vscode插件离线安装：如装python插件，直接进[ marketplace ](https://marketplace.visualstudio.com/vscode)下好拖到扩展位置）拓展设置中把Python Default Path改成创建的环境 `/home/wyj/anaconda3/envs/pytorch/bin/python`，最后用vscode打开项目，F5运行py程序，将.pth转为 ``.onnx, .prototxt`` 文件。
```sh
pip3 install -U pip && pip3 install -r requirements.txt
pip3 install -v -e .  # or  python3 setup.py develop
#安装pycocotools
pip3 install cython
pip3 install 'git+https://github.com/cocodataset/cocoapi.git#subdirectory=PythonAPI'
#下载ti的yolox-s-ti-lite.pth放入项目文件夹，运行export，
python3 tools/export_onnx.py --output-name yolox_s_ti_lite.onnx -f exps/default/yolox_s_ti_lite.py -c yolox-s-ti-lite.pth
#Debug：
TypeError: Descriptors cannot not be created directly. > pip install protobuf==3.19.6;
AttributeError: module 'numpy' has no attribute 'object'. > pip install numpy==1.23.4
#成功，生成onnx文件
 __main__:main:245 - generated onnx model named yolox_s_ti_lite.onnx
 __main__:main:261 - generated simplified onnx model named yolox_s_ti_lite.onnx
 __main__:main:264 - generated prototxt yolox_s_ti_lite.prototxt
```
<details>
<summary>yolox_s_ti_lite.prototxt</summary>

```sh
name: "yolox"
tidl_yolo {
  yolo_param {
    input: "/head/Concat_output_0"
    anchor_width: 8.0
    anchor_height: 8.0}
  yolo_param {
    input: "/head/Concat_3_output_0"
    anchor_width: 16.0
    anchor_height: 16.0}
  yolo_param {
    input: "/head/Concat_6_output_0"
    anchor_width: 32.0
    anchor_height: 32.0}
detection_output_param {
    num_classes: 80
    share_location: true
    background_label_id: -1
    nms_param {
      nms_threshold: 0.4
      top_k: 500}
    code_type: CODE_TYPE_YOLO_X
    keep_top_k: 200
    confidence_threshold: 0.4}
  name: "yolox"
  in_width: 640
  in_height: 640
  output: "detections"}
```
</details>


[ONNXRuntime Demo](https://github.com/TexasInstruments/edgeai-yolox/tree/main/demo/ONNXRuntime#yolox-onnxruntime-in-python)
```sh
cd <YOLOX_HOME>/demo/ONNXRuntime
python3 demo/ONNXRuntime/onnx_inference.py -m yolox_s_ti_lite.onnx -i assets/dog.jpg -o output -s 0.3 --input_shape 640,640 --export-det
失败 先pass
#TypeError: only size-1 arrays can be converted to Python scalars
```

### 2. ONNX导入TIDL
1. 模型文件配置：拷贝 .onnx, .prototxt 文件至/ti_dl/test/testvecs/models/public/onnx/，**yolox_s_ti_lite.prototxt**中改in_width&height，根据情况改nms_threshold: 0.4，confidence_threshold: 0.4
2. 编写转换配置文件：在/testvecs/config/import/public/onnx下新建（或复制参考目录下yolov3例程）**tidl_import_yolox_s.txt**，参数配置见[文档](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_model_import.html)
```sh
#tidl_import_yolox_s.txt
modelType       = 2     #模型类型，0: Caffe, 1: TensorFlow, 2: ONNX, 3: tfLite
numParamBits    = 8     #模型参数的位数，Bit depth for model parameters like Kernel, Bias etc.
numFeatureBits  = 8     #Bit depth for Layer activation
quantizationStyle = 3   #量化方法，Quantization method. 2: Linear Mode. 3: Power of 2 scales（2的幂次）
inputNetFile    = "../../test/testvecs/models/public/onnx/yolox-s-ti-lite.onnx" #Net definition from Training frames work
outputNetFile   = "../../test/testvecs/config/tidl_models/onnx/yolo/tidl_net_yolox_s.bin"   #Output TIDL model with Net and Parameters
outputParamsFile = "../../test/testvecs/config/tidl_models/onnx/yolo/tidl_io_yolox_s_"  #Input and output buffer descriptor file for TIDL ivision interface
inDataNorm      = 1     #1 Enable / 0 Disable Normalization on input tensor.
inMean          = 0 0 0 #Mean value needs to be subtracted for each channel of all input tensors
inScale         = 1.0 1.0 1.0   #Scale value needs to be multiplied after means subtract for each channel of all input tensors，yolov3是0.003921568627 0.003921568627 0.003921568627
inDataFormat    = 1     #Input tensor color format. 0: BGR planar, 1: RGB planar
inWidth         = 1024  #each input tensors Width (可以在.prototxt文件中查找到)
inHeight        = 512   #each input tensors Height
inNumChannels   = 3     #each input tensors Number of channels
numFrames       = 1     #Number of input tensors to be processed from the input file
inData          =   "../../test/testvecs/config/detection_list.txt" #Input tensors File for Reading
perfSimConfig   = ../../test/testvecs/config/import/device_config.cfg   #Network Compiler Configuration file
inElementType   = 0     #Format for each input feature, 0 : 8bit Unsigned, 1 : 8bit Signed
metaArchType    = 6     #网络使用的元架构类型，Meta Architecture used by the network，ssd mobilenetv2 = 3, yolov3 = 4, efficientdet tflite = 5, yolov5 yolox = 6
metaLayersNamesList =  "../../test/models/pubilc/onnx/yolox_s_ti_lite.prototxt" #架构配置文件，Configuration files describing the details of Meta Arch
postProcType    = 2     #后处理，Post processing on output tensor. 0 : Disable, 1- Classification top 1 and 5 accuracy, 2 – Draw bounding box for OD, 3 - Pixel level color blending
```
3. 模型导入
使用TIDL import tool，得到可执行文件 ``.bin``
```sh
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelImport
./out/tidl_model_import.out ${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/config/import/public/onnx/tidl_import_yolox_s.txt
#successful Memory allocation
#../../test/testvecs/config/tidl_models/onnx/生成的文件分析：
tidl_net_yolox_s.bin        #Compiled network file 网络模型数据
tidl_io_yolox_s_1.bin       #Compiled I/O file 网络输入配置文件
tidl_net_yolox_s.bin.svg    #tidlModelGraphviz tool生成的网络图
tidl_out.png, tidl_out.txt  #执行的目标检测测试结果，与第三步TIDL运行效果一致 txt:[class, source, confidence, Lower left point(x,y), upper right point(x,y) ]

#Debug，本来使用官方的yolox_s.pth转成onnx后导入，发现报错：
Step != 1 is NOT supported for Slice Operator -- /backbone/backbone/stem/Slice_3 
#因为"the slice operations in Focus layer are not embedded friendly"，因此ti提供yolox-s-ti-lite，优化后的才能直接导入
```

### 3. TIDL运行
```sh
#在文件ti_dl/test/testvecs/config/config_list.txt顶部加入:
1 testvecs/config/infer/public/onnx/tidl_infer_yolox.txt
0

#新建tidl_infer_yolox.txt:
inFileFormat    = 2
numFrames       = 1
netBinFile      = "testvecs/config/tidl_models/onnx/yolo/tidl_net_yolox_s.bin"
ioConfigFile    = "testvecs/config/tidl_models/onnx/yolo/tidl_io_yolox_s_1.bin"
inData  =   testvecs/config/detection_list.txt
outData =   testvecs/output/tidl_yolox_od.bin
inResizeMode    = 0
debugTraceLevel = 0
writeTraceLevel = 0
postProcType    = 2

#运行，结果在ti_dl/test/testvecs/output/
cd ${TIDL_INSTALL_PATH}/ti_dl/test
./PC_dsp_test_dl_algo.out
```

### 4. 板端运行(TDA4VM-SK)
ongoing




## [TIDL-RT](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/md_tidl_dependency_info.html)
```sh
export TIDL_INSTALL_PATH=/home/ywang85/SDK/RTOSSDK/tidl_j721e_08_06_00_10   #设置环境变量
#TARGET_PLATFORM=PC make gv失败：../../inc/itidl_ti.h:91:21: fatal error: ivision.h: No such file or directory
#跳过，不修改code暂时不要rebuild
```



## [EdgeAI TIDL Tools](https://github.com/TexasInstruments/edgeai-tidl-tools)
```sh
sudo apt-get install libyaml-cpp-dev
git clone https://github.com/TexasInstruments/edgeai-tidl-tools.git #failed：手动安装证书 git config --global http.sslVerify false，export GIT_SSL_NO_VERIFY=1
git checkout 08_06_00_05
export SOC=am68pa
source ./setup.sh   #有些包可能要手动安装，并注释掉

Docker Based X86_PC Setup
#sudo docker build失败：Get "https://registry-1.docker.io/v2/": x509: certificate signed by unknown authority

```



