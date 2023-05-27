---
title: DeepLeaning算法部署
date: 2023-05-18 16:28:00
tags:
- 嵌入式
- 深度学习
---
# 算法部署
+ Network selection：

+ Optimization：分组卷积、深度可分离卷积、稀疏卷积[^0]
[^0]:[适用于嵌入式应用的深度学习推理参考设计](https://www.ti.com.cn/cn/lit/ug/zhcu546/zhcu546.pdf)

+ Deployment：
<img alt="图 7" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>  



## [ONNX](https://onnx.ai) (Open Neural Network Exchange)
开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，[Github](https://github.com/onnx/onnx)，[ONNX Runtime Web](https://onnx.coderai.cn)




# 基于TDA4VM的嵌入式部署
相关知识介绍见笔记：[[TDA4VM, TIDL, OpenVX]](https://wangyujie.site/2023/05/10/TDA4VM/)
## SDK环境搭建与调试
[PROCESSOR-SDK-J721E](https://www.ti.com.cn/tool/cn/PROCESSOR-SDK-J721E)
### Linux SDK
[Linux SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-rt-jacinto7/08_06_00_11/exports/docs/devices/J7/linux/index.html)
```shell
#添加执行文件并执行
chmod +x ./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin 
./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin

#安装依赖的系统软件包和工具，安装过程中跳过需要连EVM的NFS、minicom、TFTP
#(若Ubuntu版本不匹配 > bin/setup-host-check.sh > if [ "$host" != "bionic" ] 改为 if [ "$host" != "focal" ] )
sudo ./setup.sh
#TISDK setup completed!
```
1.1.3章节说明了如何格式化SD卡。在TDA4VM的开发过程中，都是使用TF卡进行开发的。在单片机开发平台下，通常是直接用电脑使用USB方式将固件烧写到板卡的eMMC或FLASH中去。在TI平台下，首选的调试方法是使用TF卡：TF卡会被划分为两个分区，一个是BOOT分区（FAT32），用于存放bootloader如uboot等，另一个是rootfs分区（ext4），用于存放Linux需要的文件系统。每次Ubuntu编译完成的固件都需要手工拷贝到TF卡中，然后将TF卡插入EVM上电启动。

1.1.4章节介绍了顶层的Makefile。通过在根目录下make linux或u-boot等各种命令，可以快速的让SDK编译出你所需要的产物。注意需要手工修改Rules.mak文件中的DESTDIR变量为你的TF卡挂载路径。

### RTOS SDK
[RTOS SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/index.html)
> ti-processor-sdk-rtos-j721e-evm-08_06_01_03.tar.gz
ti-processor-sdk-rtos-j721e-evm-08_06_01_03-prebuilt.tar

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
### Vision Apps Demo
```sh
#修改文件 tiovx/build_flags.mak（没修改过则是默认）
BUILD_EMULATION_MODE=no #非模拟器模式
BUILD_TARGET_MODE=yes
BUILD_LINUX_A72=yes
PROFILE=release

#开始编译vision apps
cd vision_apps
make vision_apps -j4    #若缺少core-secdev-k3包，手动导入

#编译成功可以看到对应目录下有产出文件，RTOS SDK主要使用了一个开源编译框架concerto，这个框架基于Makefile，他能够自动搜索当前目录内的所有concerto.mak文件，并且分析依赖，一次将各个核心的固件全部编译出来。编译生成的文件位于
vision_apps/out/J7/A72/LINUX/$PROFILE
vision_apps/out/J7/R5F/SYSBIOS/$PROFILE
vision_apps/out/J7/C66/SYSBIOS/$PROFILE
vision_apps/out/J7/C71/SYSBIOS/$PROFILE
```
## [TIDL](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_user_model_deployment.html)
+ **Import** trained network models into files that can be used by TIDL. The following model formats are currently supported:
    + .bin 二进制格式
    + Caffe 模型（使用 .caffemodel 和 .prototxt 文件）
    + Tensorflow 模型（使用 .pb 或 .tflite 文件）
    + ONNX 模型（使用 .onnx 文件）
+ Run **performance simulation tool** on PC to estimate the expected performace of the network while executing the network for inference on TI Jacinto7 SoC
+ **Execute the network on PC** using the imported files and validate the results.bin
+ **Execute the network on TI** Jacinto7 SoC using the imported files and validate the results.bin
### 配置
```sh
export TIDL_INSTALL_PATH=/home/wyj/SDK/ti-processor-sdk-rtos-j721e-evm-08_06_01_03/tidl_j721e_08_06_00_10

#optional：tidlModelGraphviz tool 模型可视化工具
sudo apt install graphviz-dev
export TIDL_GRAPHVIZ_PATH=/usr
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelGraphviz
make
```

**Importing MobileNetV2 model for image classification**
下载[.pb文件](https://storage.googleapis.com/mobilenet_v2/checkpoints/mobilenet_v2_1.0_224.tgz)，移到ti_dl/test/testvecs/models/public/tensorflow/mobilenet_v2
```sh
#模型推理优化
pip install tensorflow
cd /home/wyj/.local/lib/python3.6/site-packages/tensorflow/python/tools/
#运行tensorflow下的optimize_for_inference工具
python3  optimize_for_inference.py \
                       --input=${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/models/public/tensorflow/mobilenet_v2/mobilenet_v2_1.0_224_frozen.pb \
                       --output=${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/models/public/tensorflow/mobilenet_v2/mobilenet_v2_1.0_224_final.pb \
                       --input_names="input" \
                       --output_names="MobilenetV2/Predictions/Softmax"
#生成mobilenet_v2_1.0_224_final.pb

#Import
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelImport
./out/tidl_model_import.out ${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/config/import/public/tensorflow/tidl_import_mobileNetv2.txt
#配置文件tidl_import_mobileNetv2.txt及其相关文件在8.6的RTOSsdk中找不到，从SDK8.5复制
#successful Memory allocation
```
**Importing PeleeNet model for object detection**
[下载](https://drive.google.com/file/d/1KJHKYQ2nChZXlxroZRpg-tRsksTXUhe9/view)并提取.caffemodel，deploy.prototxt放入ti_dl/test/testvecs/models/public/caffe/peele/pelee_voc/
deploy中改confidence_threshold: 0.4
```sh
cd ${TIDL_INSTALL_PATH}/ti_dl/utils/tidlModelImport
./out/tidl_model_import.out ${TIDL_INSTALL_PATH}/ti_dl/test/testvecs/config/import/public/caffe/tidl_import_peeleNet.txt
#successful Memory allocation
```
**Running PeleeNet for object detection**
```sh
#在文件ti_dl/test/testvecs/config/config_list.txt顶部加入:
1 testvecs/config/infer/public/caffe/tidl_infer_pelee.txt
0
#运行，结果在ti_dl/test/testvecs/output/
cd ${TIDL_INSTALL_PATH}/ti_dl/test
./PC_dsp_test_dl_algo.out
```

### [TIDL-RT](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/tidl_j721e_08_06_00_10/ti_dl/docs/user_guide_html/md_tidl_dependency_info.html)
```sh
export TIDL_INSTALL_PATH=/home/ywang85/SDK/RTOSSDK/tidl_j721e_08_06_00_10   #设置环境变量
#TARGET_PLATFORM=PC make gv失败：../../inc/itidl_ti.h:91:21: fatal error: ivision.h: No such file or directory
#跳过，不修改code暂时不要rebuild
```



### [EdgeAI TIDL Tools](https://github.com/TexasInstruments/edgeai-tidl-tools)
```sh
sudo apt-get install libyaml-cpp-dev
git clone https://github.com/TexasInstruments/edgeai-tidl-tools.git #failed：手动安装证书 git config --global http.sslVerify false，export GIT_SSL_NO_VERIFY=1
git checkout 08_06_00_05
export SOC=am68pa
source ./setup.sh   #有些包可能要手动安装，并注释掉

Docker Based X86_PC Setup
#sudo docker build失败：Get "https://registry-1.docker.io/v2/": x509: certificate signed by unknown authority
```



### [TIDL Importer](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/06_01_01_12/exports/docs/tidl_j7_01_00_01_00/ti_dl/docs/user_guide_html/md_tidl_model_import.html)
1. Read import config file.
2. Translate/import layers/operators to TIDL net file, Calculate layer size & buffer size. Merge layers if possible.
3. Generate quant config file, call quant tool to do Range Collection, and update the TIDL net file.
4. Generate config file for network compiler, and calls complier to do performance optimization.
5. *[Optional]* call GraphVisualiser to generate a image of net structure.
6. Import tool will check the model at the end of import process.
7. Finally, if there is no error, it is ready to deploy.
support：
> Caffe - 0.17 (caffe-jacinto in gitHub)
Tensorflow - 1.12
ONNX - 1.3.0
TFLite - Tensorflow 2.0-Alpha

```sh
#位于RTOSsdk的tidl_j721e/ti_dl/utils/tidlModelImport

```