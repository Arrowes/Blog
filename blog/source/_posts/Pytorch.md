---
title: Python工具：Anaconda，Pycharm，Jupyter，Pytorch
date: 2022-11-24 21:26:44
tags: 
- python
---
# Anaconda Prompt
Anaconda创建环境 ``conda create -n pytorch python=3.6``
更新 ``conda update python`` ``pip install --upgrade pip``
激活环境 ``conda activate pytorch``
退出虚拟环境 ``deactivate``
安装[pytorch](https://pytorch.org/): 
``conda install pytorch torchvision torchaudio cudatoolkit=10.2 -c pytorch``

**查包**
```py
pip list #列包

import torch
torch.cuda.is_available() #返回True说明GPU可以被使用
torch.__version__ #查pytorch

nvidia-smi #查GPU CUDA
python –version #查python版本
```
安装特定版本/卸载 ``pip install XXX==2.0`` / ``pip uninstall XXX``

# 编辑器
## Pycharm
创建新项目	手动导入已存在的anaconda创建的环境：``D:\Anaconda3\envs\pytorch\python.exe``
更改环境：				``Settings>Project>interpreter``
环境路径配置： ``接上interpreter>齿轮>Add>System Interpreter>手动添加``
检验 : 				``Python Console``	``同上#查包处``
Terminal：``File->Settings->Tools->Terminal->Shell path`` ``C:\Windows\System32\cmd.exe``

**Pycharm使用**
新建.py文件(用作工程)>右上角配置py解释器>运行/直接右键运行
控制台(用作调试，查参数)>Shift+enter：输入多行>“↑”重新编辑
Ctrl+D 快速复制至下一行
Ctrl+R 批量修改
ctrl+/ 批量注释
调试：打断点>debug>使用工具栏内的“下一步”或“计算器内输入表达式”进行调试

调试时使用Console的python调试台，print指令
![图 1](/images/3d48dab87c260ef9d021d26f8218f569fece80b9bd7ed27c94cc835121291d52.png)![图 2](/images/d2e472375bbf282c764539c21d3b00d9f7077d85d09e247faf0f23f092f0b446.png)![图 3](/images/46d8a3df125599f7e7a98ecf67cc57f419fb6ecd521d180eb4278d435bfbad4d.png)  

## Jupyter notebook
激活pytorch环境后 ``conda install nb_conda``
打开 jupyter notebook
``New>选择环境：Python [conda env:pytorch]``
IDLE Ctrl+N 编辑多行代码
输入一半按tab可以补全
```py
#cd 路径
	C：\Users\Arrow> cd E：\桌面
	C：\Users\Arrow> E：
        得E：\桌面>i.py
#亦或直接	
        E：\桌面> python E：\桌面\i.py
```

**打包下载：**
 ```py
import os
import tarfile

def recursive_files(dir_name='.', ignore=None):
    for dir_name,subdirs,files in os.walk(dir_name):
        if ignore and os.path.basename(dir_name) in ignore: 
            continue

        for file_name in files:
            if ignore and file_name in ignore:
                continue

            yield os.path.join(dir_name, file_name)

def make_tar_file(dir_name='.', tar_file_name='tarfile.tar', ignore=None):
    tar = tarfile.open(tar_file_name, 'w')

    for file_name in recursive_files(dir_name, ignore):
        tar.add(file_name)

    tar.close()

dir_name = '.'
tar_file_name = 'archive.tar'
ignore = {'.ipynb_checkpoints', '__pycache__', tar_file_name}
make_tar_file(dir_name, tar_file_name, ignore)
 ```

# 库
## 两大查询函数
dir（）函数，能让我们知道工具箱以及工具箱中的分隔区有什么东西。
help（）函数，能让我们知道每个工具是如何使用的，工具的使用方法。
``Jupyter>XX??``
``Pycharm>ctrl+左键(查原函数)	ctrl+p(查询输入参数，有等号的可忽略)``
多查[pytorch官方文档](https://pytorch.org/docs/stable/index.html)

文件
```
../XXX #上一层
root=“D:\\desktop” #window下绝对路径使用双斜杠\\避免转义：
root=r“D:\\desktop” #或统一加上r取消转义
```
计时		
```
import time 	
start=time.time()     end=time.time()     print(start-end)
```
图片通道处理 ``image=image.convert(‘RGB’)  #PNG是四通道``
全安装 		``pip install -r requirements``

组 
```py
a = (1, 2)  # 元组 tuple
b = [1, 2, 3]  # 数组 list
c = {'name': 'wyj', 'age': '23'}  
# 字典 dict
 print(a[0])
print(b[1])
print(c['name'])
```


## Tensorboard可视化
pytorch下安装 ``pip install tensorboard (conda)``
使用
```py
	from torch.utils.tensorboard import SummaryWriter
	writer=SummaryWriter(“logs“)
	writer.add_image("name“，parameter，组内步数)
	writer.close() #关闭读写 
```
打开
```py
tensorboard --logdir=logs(文件夹路径) --port=6006（6007） #注意路径
tensorboard --logdir runs/train  （YOLO）
```
地址	localhost:6006
```py
#debug
AttributeError: type object 'h5py.h5.H5PYConfig' has no attribute '__reduce_cython__'
pip uninstall h5py

AttributeError: module 'distutils' has no attribute 'version'
pip install setuptools==59.5.0
pip install brotli
```
## Transform
transforms.py图像处理工具箱
```
1.调用工具tool=transforms.XXX()	2.使用 result=tool(input)
如	Totensor>转向量	Normalize>归一化		Resize>缩放	
Compose>组合		RandomCrop>随机裁剪
```
## ToTensor（桥梁，很多输入都要求tensor类型）
```py
from torchvision import transforms
tensor_tool=transforms.ToTensor()
tensor_result=tensor_tool(img)
```
```py
class Person:
	_ _call_ _(self,name)	
可直接调用>person=Person(“wyj")
```
## torchvision
torchvision.datasets 数据集处理
```py
import torchvision
train_set = torchvision.datasets.CIFAR10(root="./dataset", train=True, #训练集
transform=dataset_transform, download=True)
test_set = torchvision.datasets.CIFAR10(root="./dataset", train=False, #测试集
transform=dataset_transform, download=True)
```
## Dataloader
```py
from torch.utils.data import DataLoader
test_loader = DataLoader(dataset=test_data, batch_size=64, shuffle=True, num_workers=0, drop_last=True)
```
例：
```
writer = SummaryWriter("dataloader")
for epoch in range(2):
    step = 0
    for data in test_loader: #读数据
        imgs, targets = data
        writer.add_images("Epoch: {}".format(epoch), imgs, step)
        step = step + 1
writer.close()
```
