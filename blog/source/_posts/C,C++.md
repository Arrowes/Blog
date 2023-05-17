---
title: C, C++, Cmake
date: 2023-05-16 09:43:00
tags:
- C/C++
---
# C++

## 基于VScode用cmake搭建C++编译调试环境
1. 安装VScode插件：C/C++，cmake，cmake tools
2. 按F1，选择cmake:Quick Start,创建一个cmake工程
3. 点击左侧栏的CMake工具按钮,右键可执行文件，选择Debug,进入调试界面

# Cmake
[CMake](www.cmake.org) 是一个跨平台的开源构建管理系统，用于自动化应用程序的构建、测试和打包过程。它使用类似于Makefile的文本文件来描述构建过程中所需的所有组件和依赖项，并将其转换为适合各种不同编译器和操作系统的本地构建系统的配置文件。总之，CMake就是一个将多个cpp,hpp文件组合构建为一个大工程的语言。
[CMake下载](https://cmake.org/download/) (Linux无需下载)
[Cmake 实践](https://github.com/gavinliu6/CMake-Practice-zh-CN) 在实践中上手的教程
[cmake-examples-Chinese](https://github.com/SFUMECJF/cmake-examples-Chinese) 例程

## [Cmake 实践](https://gavinliu6.github.io/CMake-Practice-zh-CN/#/)
### 创建Hello world
建立main.c与CMakeLists.txt并编译（需要为每一个子目录建立一个CMakeLists.txt）
```sh
PROJECT (HELLO)     #PROJECT(projectname [CXX] [C] [Java])
SET(SRC_LIST main.c)    #提供要编译的源代码文件列表，可定义多个源文件main.c 1.c
MESSAGE([SEND_ERROR|STATUS|FATAL_ERROR] "message to display")
ADD_EXECUTABLE(hello ${SRC_LIST})   #创建名为hello的可执行文件，IF不用${}引用变量

#内部编译
cmake . #构建工程，生成makefile
make    #构建目标文件hello二进制
./hello #运行目标文件
make clean  #清理工程

#外部编译(out of source build,推荐)
mkdir build, cd build #新建并进入build文件夹
cmake ..    #在父目录找到cmakelists构建工程
make    #在build编译目录中获得目标文件，不影响原有工程
```
### 完善项目并安装
```sh
#在CMakeLists中加入
INSTALL(FILES COPYRIGHT README DESTINATION doc)
INSTALL(PROGRAMS runhello.sh DESTINATION bin)
INSTALL(DIRECTORY doc/ DESTINATION doc) #不同的安装类型
#在 src的 CMakeLists.txt中添加，以安装hello到bin中
INSTALL(TARGETS hello RUNTIME DESTINATION bin) 

#Install
cmake -DCMAKE_INSTALL_PREFIX=tmp ..
make
make install
```
### lib静态库和动态库构建
```sh
SET(LIBHELLO_SRC hello.c)
ADD_LIBRARY(hello SHARED ${LIBHELLO_SRC})   #SHARED动态库（.so）
ADD_LIBRARY(hello_static STATIC ${LIBHELLO_SRC})    #STATIC静态库(.a) 
SET_TARGET_PROPERTIES(hello_static PROPERTIES OUTPUT_NAME "hello")  #设置静态库名称，以得到名字相同的.so .a
SET_TARGET_PROPERTIES(hello PROPERTIES VERSION 1.2 SOVERSION 1) #动态库版本号 
INSTALL(TARGETS hello hello_static LIBRARY DESTINATION lib ARCHIVE DESTINATION lib) #关键字ARCHIVE 特指静态库，LIBRARY 特指动态库，RUNTIME 特指可执行目标二进制
INSTALL(FILES hello.h DESTINATION include/hello)
```



## gcc/g++,MinGW/MSVC与make/CMake/qmake
**GNU**/Linux：简称Linux，包括Ubuntu，Debian，CentOS，自带gcc；
**gcc/g++**：GNU编译器套件（GNU Compiler Collection）,在*Linux*或MacOS上使用，gcc主要用于C语言,g++支持更多的C++特性。

**MinGW**(Minimalist GNUfor Windows)，是*Windows*下运行的GNU环境，包含gcc和一系列工具，让开发者在Windows下可以写GNU的c/c++代码, 编译的结果是windows的可执行文件exe；
**MSVC**:微软开发的C/C++编译器，在*Windows*下编译C/C++程序。它被集成在Visual Studio IDE中。

**Makefile**包含了描述如何编译和链接程序的规则和指令,指定哪些文件需要先编译，后编译以及重新编译，甚至更复杂的功能操作,通常被用于自动化构建C/C++项目;
**Make**是一个自动化构建工具，执行Make命令时，它会读取Makefile中的规则，并根据依赖项关系来判断哪些规则需要被执行，来实现编译、链接等操作。
**CMake**是一个跨平台的自动化构建工具，与Make类似，但是它不直接构建项目，而是生成适合不同构建系统的配置文件，如Makefile或Visual Studio的.sln文件，并调用相应的构建系统来进行项目构建。
**qmake**是Qt框架提供的自动化构建工具，用于构建Qt项目。