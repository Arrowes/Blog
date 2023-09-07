---
title: Python：Anaconda，Pycharm，Pytorch
date: 2022-11-24 21:26:44
tags: 
- python
---

视频：[PyTorch深度学习快速入门教程](https://www.bilibili.com/video/BV1hE411t7RN/)

# Anaconda
```sh
conda create -n pytorch python=3.8  #Anaconda创建环境
conda update python #更新py
conda activate pytorch  #激活环境
conda deactivate    #退出虚拟环境
conda remove pytorch --all  #删除环境 或conda env remove -n XXX
conda list          #查看环境中的所有包
conda install XXX   #安装 XXX 包
conda remove XXX    #删除 XXX 包
conda env list      #列出所有环境
conda create -n XXX jupyter notebook  #创建环境并安装Jupyter Notebook
jupyter notebook    #打开Jupyter Notebook

pip install XXX==2.0 (pip uninstall XXX) #安装特定版本/卸载
pip install --upgrade pip #更新pip
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple  #pip换源
pip config list -v  #查源
pip install opencv-python -i https://pypi.tuna.tsinghua.edu.cn/simple/  #pip换源安装
conda config --remove-key channels    #换回默认源
```
> 国内镜像源:
  清华大学：https://pypi.tuna.tsinghua.edu.cn/simple
  阿里云：http://mirrors.aliyun.com/pypi/simple
  豆瓣：http://pypi.douban.com/simple

修改conda环境保存路径(windows):
1.找到用户目录下的.condarc文件（C:\Users\username）。
2.打开.condarc文件之后，添加或修改.condarc 中的 env_dirs 设置环境路径:``envs_dirs:  - D:\Anaconda3\envs``





# Pycharm
创建新项目，手动导入已存在的anaconda创建的环境``D:\Anaconda3\envs\pytorch\python.exe``

配置或更改环境：				``Settings > Project > interpreter > 齿轮 > Add > System Interpreter > 手动添加``

Terminal：``File > Settings > Tools > Terminal > Shell path`` ``C:\Windows\System32\cmd.exe``

**Pycharm使用**
> 新建.py文件(用作工程) > 右上角配置py解释器 > 运行/直接右键运行
控制台(用作调试，查参数) > Shift+enter：输入多行 > “↑”重新编辑
Ctrl + D 快速复制至下一行
Ctrl + R 批量修改
Ctrl + / 批量注释
调试：打断点 > debug > 使用工具栏内的“下一步”或“计算器内输入表达式”进行调试

调试时使用Console的python调试台，print指令
![图 1](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Pytorch1.png) ![图 2](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Pytorch2.png)  




# Jupyter notebook
激活pytorch环境后: ``conda install nb_conda``
打开 jupyter notebook: ``New > 选择环境：Python [conda env:pytorch]``
IDLE Ctrl+N 编辑多行代码
输入一半按tab可以补全

打包与解压缩
+ 打包：
  ```py
  import zipfile

  zip_ref = zipfile.ZipFile('WYJ.zip', 'r')
  zip_ref.extractall('.')
  zip_ref.close()
  ```

+ 解压：
  ```py
  import zipfile
  import os

  def zip_folder(folder_path, zip_path):
      with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
          for root, dirs, files in os.walk(folder_path):
              for file in files:
                  file_path = os.path.join(root, file)
                  zipf.write(file_path, os.path.relpath(file_path, folder_path))

  folder_path = './output' # 指定要下载的文件夹路径
  zip_path = './output.zip' # 指定要保存的zip文件路径
  zip_folder(folder_path, zip_path)

  from IPython.display import FileLink
  FileLink(zip_path) # 生成下载链接
  ```



# [Google Colab](https://colab.research.google.com/)

```py
#设置并查看GPU 修改>笔记本设置>GPU
import tensorflow as tf
tf.test.gpu_device_name()

!/opt/bin/nvidia-smi #详情
```

**基本指令**
```py
!unzip /content/XX.zip -d /content/XX #解压
%cd /content/XX   #进入
!pip install -r requirements.txt    #安装requirements
!python XX.py --rect    #运行
!rm -rf /content/XX/mydata  #删除

%load_ext tensorboard   #加载tensorboard
%tensorboard --logdir=runs/train    #执行tensorboard
```

**云盘**
```py
#先装载谷歌云盘，在云盘里运行以防数据丢失，指定Google Drive云端硬盘的根目录，名为drive
!mkdir -p drive
!google-drive-ocamlfuse drive

#connect to self drive
from google.colab import drive
drive.mount('/content/drive')
#云训练时还是要将盘里的文件拿出来再开始，否则容易直接断连!
```
续航插件：[Colab Alive](https://chrome.google.com/webstore/detail/colab-alive/eookkckfbbgnhdgcbfbicoahejkdoele?hl=zh-CN), 防止训练时掉线

# Pytorch
要调用GPU进行训练的话，需要安装显卡驱动对应的CUDA
1. ``nvidia-smi`` 查询支持CUDA版本, 显卡驱动程序显示的cuda版本为电脑最高可适配的cuda版本
![图 3](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Pytorch3.png)  
2. 到 [Pytorch官网](https://pytorch.org/get-started/locally/) 复制对应code进行安装
![图 4](https://raw.sevencdn.com/Arrowes/Arrowes-Blogbackup/main/images/Pytorch4.png)  

**查GPU**
```py
python -c "import torch;print(torch.cuda.is_available())"   #返回True说明GPU可以被使用
torch.__version__ #查pytorch版本
nvidia-smi #查GPU CUDA
python –-version #查python版本
conda install python=3.8  #升级(覆盖安装)python
```

## 库
### 两大查询函数
dir() 函数，能让我们知道工具箱以及工具箱中的分隔区有什么东西。
help() 函数，能让我们知道每个工具是如何使用的，工具的使用方法。
``Jupyter>XX??``
``Pycharm>ctrl+左键(查原函数)	ctrl+p(查询输入参数，有等号的可忽略)``
多查 [pytorch官方文档](https://pytorch.org/docs/stable/index.html)

+ 文件
  ```py
  ../XXX #上一层
  root=“D:\\desktop”  #window下绝对路径使用双斜杠\\避免转义：
  root=r“D:\\desktop” #或统一加上r取消转义
  ```
+ 计时		
  ```py
  import time 	
  start=time.time()     end=time.time()     print(start-end)
  ```
+ 组 
  ```py
  a = (1, 2)    # 元组 tuple
  b = [1, 2, 3] # 数组 list
  c = {'name': 'wyj', 'age': '23'}  # 字典 dict

  print(a[0])
  print(b[1])
  print(c['name'])
  ```

### Tensorboard可视化
pytorch下安装 ``pip install tensorboard (conda install tensorboard)``

+ 使用
  ```py
  from torch.utils.tensorboard import SummaryWriter
  writer=SummaryWriter(“logs“)
  writer.add_image("name“，parameter，组内步数)
  writer.close() #关闭读写 
  ```
+ 打开
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
### Transform
transforms.py图像处理工具箱
1. 调用工具tool=transforms.XXX()	
2. 使用 result=tool(input)
如: Totensor>转向量; Normalize>归一化; Resize>缩放; Compose>组合; RandomCrop>随机裁剪

### ToTensor
```py
#（桥梁，很多输入都要求tensor类型）
from torchvision import transforms
tensor_tool=transforms.ToTensor()
tensor_result=tensor_tool(img)
```

```py
class Person:
	_ _call_ _(self,name)	
可直接调用>person=Person(“wyj")
```
### torchvision
torchvision.datasets 数据集处理

```py
import torchvision
train_set = torchvision.datasets.CIFAR10(root="./dataset", train=True, #训练集
transform=dataset_transform, download=True)
test_set = torchvision.datasets.CIFAR10(root="./dataset", train=False, #测试集
transform=dataset_transform, download=True)
```
### Dataloader
```py
from torch.utils.data import DataLoader
test_loader = DataLoader(dataset=test_data, batch_size=64, shuffle=True, num_workers=0, drop_last=True)
```
例
```py
writer = SummaryWriter("dataloader")
for epoch in range(2):
    step = 0
    for data in test_loader: #读数据
        imgs, targets = data
        writer.add_images("Epoch: {}".format(epoch), imgs, step)
        step = step + 1
writer.close()
```