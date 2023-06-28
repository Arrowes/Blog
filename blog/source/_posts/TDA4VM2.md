---
title: TDA4②：环境搭建、模型转换、Demo及Tools
date: 2023-05-18 16:28:00
tags:
- 嵌入式
- 深度学习
---

相关前置知识见上一篇：[[TDA4：SDK, TIDL, OpenVX]](https://wangyujie.site/TDA4VM/)
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
#输入用户名：root，登录tda4vm-sk，若连接了USB摄像头此时会显示相关信息
```
插入USB摄像头，配置：
```sh
#查摄像头参数
cd 
./.profile  #/dev/video2
```
可以鼠标点击试运行开箱即用的 GUI 应用程序
也使用 Python 和C++参考示例开发边缘 AI 应用程序：
```sh
#配置
cd /opt/edgeai-gst-apps/configs/  #app_config_template.yaml中有参数介绍
vi image_classification.yaml  #flow参数配置为摄像头输入input0

#Classification (python)
cd /opt/edgeai-gst-apps/apps_python
./app_edgeai.py ../configs/image_classification.yaml  #ctrl+c退出
#替换为configs下其他文件能执行不同任务如object_detection.yaml

#Classification (c++)
cd /opt/edgeai-gst-apps/apps_cpp
./bin/Release/app_edgeai ../configs/image_classification.yaml

#视频流车辆检测
cd /opt/edgeai-gst-apps/scripts/optiflow
`./optiflow.py ../../configs/object_detection.yaml -t`  #如果没有单引号，终端会将 -t 选项解释为一个单独的参数，而不是作为 optiflow.py 命令的选项之一

#多flows
flows:
    # flowname : [input,mode1,output,[mosaic_pos_x,mosaic_pos_y,width,height]]
    flow0: [input0,model1,output0,[160,90,800,450]]
    flow1: [input0,model2,output0,[960,90,800,450]]
    flow2: [input1,model0,output0,[160,540,800,450]]
    flow3: [input1,model3,output0,[960,540,800,450]]
```

**Dataflows**
<img src="https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/_images/edgeai_object_detection.png" width='90%'>
GStreamer input pipeline:
```
v4l2src device=/dev/video18 io-mode=2 ! image/jpeg, width=1280, height=720 ! jpegdec ! tiovxdlcolorconvert ! video/x-raw, format=NV12 ! tiovxmultiscaler name=split_01
split_01. ! queue ! video/x-raw, width=320, height=320 ! tiovxdlpreproc data-type=10 channel-order=1 mean-0=128.000000 mean-1=128.000000 mean-2=128.000000 scale-0=0.007812 scale-1=0.007812 scale-2=0.007812 tensor-format=rgb out-pool-size=4 ! application/x-tensor-tiovx ! appsink name=pre_0 max-buffers=2 drop=true
split_01. ! queue ! video/x-raw, width=1280, height=720 ! tiovxdlcolorconvert out-pool-size=4 ! video/x-raw, format=RGB ! appsink name=sen_0 max-buffers=2 drop=true
```
GStreamer output pipeline:
```
appsrc format=GST_FORMAT_TIME is-live=true block=true do-timestamp=true name=post_0 ! tiovxdlcolorconvert ! video/x-raw,format=NV12, width=1280, height=720 ! queue ! mosaic_0.sink_0
appsrc format=GST_FORMAT_TIME block=true num-buffers=1 name=background_0 ! tiovxdlcolorconvert ! video/x-raw,format=NV12, width=1920, height=1080 ! queue ! mosaic_0.background
tiovxmosaic name=mosaic_0
sink_0::startx="<320>"  sink_0::starty="<180>"  sink_0::widths="<1280>"   sink_0::heights="<720>"
! video/x-raw,format=NV12, width=1920, height=1080 ! kmssink sync=false driver-name=tidss
```
[Edge AI application stack](https://github.com/TexasInstruments/edgeai-gst-apps/tree/44f4d44ddcda766d2abb5e89b9b112a1280f99ec)
<img src='https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-edgeai/TDA4VM/08_06_01/exports/docs/_images/edgeai-app-stack.jpg' width='80%'>

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







## [TIDL-RT](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/md_tidl_dependency_info.html)
```sh
export TIDL_INSTALL_PATH=/home/ywang85/SDK/RTOSSDK/tidl_j721e_08_06_00_10   #设置环境变量
#TARGET_PLATFORM=PC make gv失败：../../inc/itidl_ti.h:91:21: fatal error: ivision.h: No such file or directory
#跳过，不修改code暂时不要rebuild
```



## [EdgeAI TIDL Tools](https://github.com/TexasInstruments/edgeai-tidl-tools)
要求：OS——Ubuntu 18.04，Python Version——3.6
<img alt="图 9" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM2onnxruntimeflow.png" width="70%"/>  

1. OSRT(Open Source Runtimes:TFLite,ONNX,TVM) 作为用户应用程序的顶级推理 API
2. 将子图卸载到 C7x/MMA 以使用TIDL进行加速执行
3. 在 ARM 核心上运行优化代码，以支持 TIDL 不支持的层（[支持情况](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/docs/supported_ops_rts_versions.md)）

```sh
sudo apt-get install libyaml-cpp-dev
git clone https://github.com/TexasInstruments/edgeai-tidl-tools.git #failed：手动安装证书 git config --global http.sslVerify false，export GIT_SSL_NO_VERIFY=1
git checkout 08_06_00_05
export SOC=am68pa
source ./setup.sh   #仔细查看setup.sh文件，有些包可能要手动安装，并注释掉
#gcc-arm的包解压到项目文件夹，

#Docker Based X86_PC Setup 跳过，不用docker装

#make过程中各种依赖库报错 SSLError

```

## [EdgeAI-ModelMaker](https://github.com/TexasInstruments/edgeai-modelmaker)
An end-to-end model development tool that contains dataset handling, model training and compilation，集成了edgeai-modelzoo, edgeai-torchvision, edgeai-mmdetection, edgeai-benchmark, edgeai-modelmaker
```sh
Git clone 项目，按照文档在bash下配置环境，curl -L ... 运行失败改为-L -k忽略SSL检查
.setup_all.sh 安装失败：torch1.10.0, dlr, tvm, onnuruntime-tidl, tflite-runtime
SSLError
```


## [Edge AI Studio](https://dev.ti.com/edgeaistudio/)
TI官方提供的云端环境，集成了一系列工具,无需本地搭环境，使用需要申请，基于jupyter notebook，提供两个工具：
+ [Model Analyzer](https://dev.ti.com/edgeaisession/)：远程连接到真实的评估硬件，在 TI 嵌入式处理器上部署和测试 AI 模型性能，进行多个模型的Benchmark。前身叫做 TI edge AI cloud。
+ [Model Composer](https://dev.ti.com/modelcomposer/)： 为 TI 嵌入式处理器训练、优化和编译 AI 模型。支持数据采集，标注，模型训练，以及上板编译。比如，用自己的数据重新训练TI Model Zoo的模型和更多性能优化操作。目前仅支持分类和检测任务，只能使用modelzoo中的模型进行训练，比如OD任务只有yolox模型，灵活度不高，主打方便快捷。

### Model Analyzer
选TDA4VM设备，能使用3h，进入后分两大板块:
+ Find your model: Compare model performance
+ Get model benchmarks： Model performance， Custom models

Find your model能查看不同模型在板端的表现，用来选择适合自己需求的模型；
Model performance中代码都已配置好，试用OD task, 选ONNX runtime，无需修改一步步运行即可输出结果，文件在顶端My Workspace；下面重点使用Custom models：

**Custom models**（onnxRT）
- 编译模型（在异构模型编译期间，支持的层将被装载到`TI-DSP`，生成推理所需工件（artifacts））
- 使用生成的工件进行推理
- *执行输入预处理和输出后处理*
- 启用调试日志
- 使用deny-layer编译选项来隔离可能有问题的层并创建额外的模型子图
- 使用生成的子图工件进行推理
- *执行输入预处理和输出后处理*

Create Onnx runtime with `tidl_model_import_onnx` library to generate artifacts that offload supported portion of the DL model to the TI DSP.
参数配置见[User options for TIDL Acceleration](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/examples/osrt_python/README.md#user-options-for-tidl-acceleration)
```py
# 'sess' model compilation options
compile_options = {
    'tidl_tools_path' : os.environ['TIDL_TOOLS_PATH'], #tidl tools 路径
    'artifacts_folder' : output_dir, #编译输出目录
    'tensor_bits' : num_bits,    #量化位数
    'accuracy_level' : accuracy, #精度级别，0快但精度低，1慢但精度高
    'advanced_options:calibration_frames' : len(calib_images),  #设置用于校准模型量化参数的图片
    'advanced_options:calibration_iterations' : 3, #设置校准迭代次数 used if accuracy_level = 1
    'debug_level' : 1, #设置调试级别，级别越高提供的调试信息越详细
    'deny_list' : "MaxPool" #排除ONNXRT不支持的层
}

# 创建一个会话选项对象，可以设置GPU加速、CPU 线程数、精度模式等会话参数
so = rt.SessionOptions() #此处默认参数
# 设置执行提供者列表，包含 TIDLCompilationProvider 和 CPUExecutionProvider
EP_list = ['TIDLCompilationProvider', 'CPUExecutionProvider'] #当第一个 Execution Provider 调用失败时，自动尝试使用下一个，直到成功为止。
# compile the model with TIDL acceleration by passing required compilation options.
sess = rt.InferenceSession(onnx_model_path, providers=EP_list, provider_options=[compile_options, {}], sess_options=so)
# 载入 ONNX 模型并进行推理。可以使用 sess 对象来进行标准化、预处理、推理等操作，还可以获取模型的输入信息、输出信息、元图信息等
# At the end of model compilation step, model-artifacts for inference will be generated in user specified path.

input_details = sess.get_inputs() # 获取输入数据信息

# 对校准图片进行预处理并进行推理，并将输出结果存储到 output 列表中
for num in tqdm.trange(len(calib_images)):
    output = list(sess.run(None, {input_details[0].name : preprocess_for_onnx_resent18v2(calib_images[num])}))[0]
# Create OSRT inference session with TIDL acceleration option for running inference with generated model artifacts in the above step.
```

Then using Onnx with the libtidl_onnxrt_EP inference library we run the model and collect benchmark data.
<img alt="图 9" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VM2benchmark.png" width="88%"/>  

[edgeai-tidl-tools:Python Examples](https://github.com/TexasInstruments/edgeai-tidl-tools/blob/master/examples/osrt_python/README.md)
[适用于嵌入式应用的深度学习推理参考设计](https://www.ti.com.cn/cn/lit/ug/zhcu546/zhcu546.pdf)