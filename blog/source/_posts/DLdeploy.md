---
title: DL算法的嵌入式部署
date: 2023-05-18 16:28:00
tags:
- 嵌入式
- 深度学习
---
# TIDL
## SDK环境搭建
[PROCESSOR-SDK-J721E](https://www.ti.com.cn/tool/cn/PROCESSOR-SDK-J721E)
### Linux SDK
[Linux SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-linux-rt-jacinto7/08_06_00_11/exports/docs/devices/J7/linux/index.html)
```shell
#添加执行文件并执行
chmod +x ./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin 
./ti-processor-sdk-linux-j7-evm-08_06_01_02-Linux-x86-Install.bin

#安装依赖的系统软件包和工具，vi setup.sh屏蔽需要连EVM的NFS、minicom、TFTP
#(若Ubuntu版本不匹配 > bin/setup-host-check.sh > if [ "$host" != "bionic" ] 改为 if [ "$host" != "focal" ] )
sudo ./setup.sh 
```
1.1.3章节说明了如何格式化SD卡。在TDA4VM的开发过程中，都是使用TF卡进行开发的。在单片机开发平台下，通常是直接用电脑使用USB方式将固件烧写到板卡的eMMC或FLASH中去。在TI平台下，首选的调试方法是使用TF卡：TF卡会被划分为两个分区，一个是BOOT分区（FAT32），用于存放bootloader如uboot等，另一个是rootfs分区（ext4），用于存放Linux需要的文件系统。每次Ubuntu编译完成的固件都需要手工拷贝到TF卡中，然后将TF卡插入EVM上电启动。

1.1.4章节介绍了顶层的Makefile。通过在根目录下make linux或u-boot等各种命令，可以快速的让SDK编译出你所需要的产物。注意需要手工修改Rules.mak文件中的DESTDIR变量为你的TF卡挂载路径。

### RTOS SDK
[RTOS SDK](https://software-dl.ti.com/jacinto7/esd/processor-sdk-rtos-jacinto7/08_06_00_12/exports/docs/psdk_rtos/docs/user_guide/index.html)
> ti-processor-sdk-rtos-j721e-evm-08_06_01_03.tar
ti-processor-sdk-rtos-j721e-evm-08_06_01_03-prebuilt.tar

```sh
tar -xf ti-processor-sdk-rtos-j721e-evm-08_06_01_03.tar.gz  #解压
cp ../ti-processor-sdk-rtos-j721e-evm-08_06_01_03-prebuilt/tisdk-edgeai-image-j7-evm.tar.xz ./
cp ../ti-processor-sdk-rtos-j721e-evm-08_06_01_03-prebuilt/boot-j7-evm.tar.gz ./    #导入prebuilt包（或from LinuxSDK）
./psdk_rtos/scripts/setup_psdk_rtos.sh  #安装依赖库和下载编译器，若安装报错则需换源，有包没安上会影响之后的make
```



# 算法部署
+ Network selection：

+ Optimization：分组卷积、深度可分离卷积、稀疏卷积[^6]
[^6]:[适用于嵌入式应用的深度学习推理参考设计](https://www.ti.com.cn/cn/lit/ug/zhcu546/zhcu546.pdf)

+ Deployment：
<img alt="图 7" src="https://raw.sevencdn.com/Arrowes/Blog/main/images/TDA4VMdeploy.png" width="70%"/>  



# [ONNX](https://onnx.ai) (Open Neural Network Exchange)
开源机器学习通用中间格式，兼容各种深度学习框架、推理引擎、终端硬件、操作系统，[Github](https://github.com/onnx/onnx)

[ONNX Runtime Web](https://onnx.coderai.cn)