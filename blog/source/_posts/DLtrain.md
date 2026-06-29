---
title: DL train：Code, Ideas, Workflow
date: 2022-11-27 16:04:02
tags:
- python
- 深度学习
---
记录了深度学习训练的代码、想法和工作流程。
<!--more-->

# 炼丹经验
## MTN多任务训练
### GradNorm
Grad norm,- [Gradient Normalization Paper](https://arxiv.org/abs/2210.13438)

在多任务模型中，不同任务的损失函数量级、收敛速度和对共享层参数梯度的影响往往差异巨大。这会导致“任务主导（Task Domination）”现象：某个任务的梯度过大，完全主导了模型权重的更新，导致其他任务学不到东西。

**GradNorm**（由 Chen 等人在 ICML 2018 提出）是解决这一问题的经典算法，核心思想是：**动态调整每个任务的损失权重，使得所有任务在最后一个共享层上产生的梯度大小（Gradient Norm）保持相近，同时强制让训练较慢的任务产生更大的梯度。**

假设模型有 $T$ 个任务，每个任务对应一个动态变化的损失权重 $w_i(t)$，模型的总损失为：

$$L(t) = \sum_{i=1}^{T} w_i(t) L_i(t)$$

GradNorm 并不直接优化总损失来更新 $w_i(t)$，而是专门为 $w_i(t)$ 设计了一个**梯度损失函数（GradNorm Loss）**：

* **当前梯度范数 $G_i(t)$：** 任务 $i$ 在当前步骤对**最后一个共享层**权重 $W$ 的梯度 L2 范数：

$$G_i(t) = \|\nabla_W (w_i(t) L_i(t))\|_2$$


* **平均梯度范数 $\bar{G}(t)$：** 所有任务梯度范数的平均值，作为基准：

$$\bar{G}(t) = \frac{1}{T} \sum_{i=1}^{T} G_i(t)$$


* **相对训练速率 $\tilde{r}_i(t)$：** 衡量任务 $i$ 当前的训练进度。首先计算当前损失与初始损失的比值 $r_i(t) = L_i(t) / L_i(0)$，然后求相对值：

$$\tilde{r}_i(t) = \frac{r_i(t)}{\frac{1}{T}\sum_{j} r_j(t)}$$



如果 $\tilde{r}_i(t) > 1$，说明任务 $i$ 训练得比平均水平慢。
* **目标梯度范数 $G_i^{target}(t)$：** 结合平均梯度和训练速率，计算任务 $i$ 应该达到的理想梯度大小（$\alpha$ 是调节不平衡程度的超参数，通常设为 0.1 到 1.5 之间）：

$$G_i^{target}(t) = \bar{G}(t) \times [\tilde{r}_i(t)]^\alpha$$



最后，构建关于权重 $w_i(t)$ 的损失函数（通常用 L1 损失），并对其进行反向传播来更新 $w_i(t)$：

$$L_{grad}(t) = \sum_{i=1}^{T} |G_i(t) - G_i^{target}(t)|$$


在代码实现中，需要两套优化器：一套用于更新网络模型的参数，另一套专门用于更新任务权重 $w_i$。

1. **前向传播：** 将数据输入网络，得到每个任务的预测结果，计算各任务的初始损失 $L_i(0)$（仅在第一步计算并保存）和当前步骤的损失 $L_i(t)$。
2. **计算梯度范数：** 取出网络中“最后一个共享层”的参数。分别计算每个 $w_i L_i$ 对该层参数的梯度，并求其 L2 范数，得到 $G_i(t)$。
3. **计算 GradNorm 目标：** 根据公式计算当前任务的相对训练速率，并得出目标梯度范数 $G_i^{target}(t)$。注意，在计算目标值时，需要将其从计算图中分离（Detach），因为它不参与反向传播。
4. **更新任务权重 $w_i$：** 计算 $L_{grad}(t)$，对其进行反向传播，使用专门的优化器更新 $w_i$。更新后通常需要将 $w_i$ 重新归一化，使其总和为 $T$。
5. **更新网络参数：** 将更新后的 $w_i$ 与 $L_i$ 相乘求和得到总损失，进行常规的反向传播，更新整个网络的模型参数。

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 假设共有 2 个任务
num_tasks = 2
alpha = 1.5

# 1. 定义任务权重（需要梯度），并将其放入专门的优化器
weights = nn.Parameter(torch.ones(num_tasks))
optimizer_weights = optim.Adam([weights], lr=0.01)

# 定义网络优化器（假设 model 是你的多任务模型）
optimizer_model = optim.Adam(model.parameters(), lr=0.001)

# 记录初始 loss
initial_task_losses = None

for batch in dataloader:
    # 模拟前向传播和计算每个任务的 loss
    task_losses = model(batch) # 返回一个包含 2 个 loss 的张量
    
    if initial_task_losses is None:
        initial_task_losses = task_losses.detach()
    
    # 获取最后一个共享层（假设是 model.shared_layer.weight）
    shared_layer = model.shared_layer.weight
    
    # 2. 计算当前每个任务对共享层的梯度范数
    norms = []
    for i in range(num_tasks):
        # retain_graph=True 因为我们还需要对整体 loss 进行一次 backward
        grad = torch.autograd.grad(weights[i] * task_losses[i], shared_layer, retain_graph=True)[0]
        norms.append(torch.norm(grad, 2))
    norms = torch.stack(norms)
    
    # 3. 计算 GradNorm 的 Target
    with torch.no_grad():
        mean_norm = norms.mean()
        loss_ratio = task_losses / initial_task_losses
        inverse_train_rate = loss_ratio / loss_ratio.mean()
        target_norms = mean_norm * (inverse_train_rate ** alpha)
    
    # 4. 计算 GradNorm Loss 并更新 weights
    loss_grad = torch.nn.functional.l1_loss(norms, target_norms)
    # 普通训练求导是为了更新网络模型参数，但这里的求导只针对任务权重
    optimizer_weights.zero_grad()
    loss_grad.backward()
    # 用专门的优化器更新 weights
    optimizer_weights.step()
    
    # 重新归一化 weights，保证权重之和为 num_tasks
    with torch.no_grad():
        normalize_coeff = num_tasks / weights.sum()
        weights.data = weights.data * normalize_coeff
    
    # 5. 常规更新网络模型参数
    total_loss = torch.sum(weights * task_losses)
    
    optimizer_model.zero_grad()
    total_loss.backward()
    optimizer_model.step()

```

* **优点：** 完全自动化，无需人工猜测不同任务的损失量级差异。它不仅平衡了不同任务的量级，还通过引入训练速率，动态地给予“学习困难”的任务更多关注。
* **缺点：** 计算开销大。为了计算 $G_i(t)$，每个任务都需要单独对共享层进行一次反向传播操作。如果任务数量极多，训练时间会显著增加。通过复用同一次前向传播的计算图，强行进行了 $T$（任务数）次局部的反向求导，外加最后 1 次全局的反向传播。 这意味着如果你的模型有 5 个任务，虽然前向传播还是 1 次，但反向传播的工作量直接变成了原来的 6 倍。此外，超参数 $\alpha$ 以及“最后一个共享层”的选择仍然需要一定的实验调优。

### Uncertainty Loss
在多任务学习（Multi-Task Learning, MTL）中，Uncertainty Loss（基于不确定性的损失权重分配）是另一种极其经典的动态权重平衡算法。与 GradNorm（强行拉平梯度大小）不同，Uncertainty Loss 走的是一条**贝叶斯概率**的优雅路线。

简单来说，它的核心思想是：**如果一个任务自带的“噪音”很大、不确定性很高（太难了或者数据太脏），模型就应该降低对它的信任度（赋予较小的权重）；反之，对于确定性高的简单任务，就给予更大的权重。**

在机器学习中，不确定性主要分几种。这里用到的是**同方差不确定性**，通俗理解就是“任务级别的固有难度或噪音”。
如果直接把多任务加起来训练，如带有高噪音的“深度预测”任务产生的杂乱梯度，就会干扰模型学习简单的分割等任务。

Uncertainty Loss 通过让模型**自己学习**每个任务的不确定性（用方差 $\sigma^2$ 表示），来动态调整权重。

对于有 $T$ 个任务的模型，假设任务 $i$ 的原始损失为 $L_i$，模型会为每个任务额外学习一个可训练的参数 $\sigma_i$。总的 Uncertainty Loss 公式如下：

$$L_{total} = \sum_{i=1}^{T} \left( \frac{1}{2\sigma_i^2} L_i + \log \sigma_i \right)$$

* **前半部分（$\frac{1}{2\sigma_i^2} L_i$）：权重惩罚。**
$\frac{1}{2\sigma_i^2}$ 就相当于任务 $i$ 的权重 $w_i$。如果任务 $i$ 的 Loss 很大（任务很难），为了让总 $L_{total}$ 降下来，模型会倾向于把 $\sigma_i$ 变得**很大**。$\sigma_i$ 变大，权重就变小了，相当于模型在说：“这个任务太难/太吵了，我不想学了，把它权重降下来吧。”
* **后半部分（$\log \sigma_i$）：正则化约束。**
如果只有前半部分，模型会耍小聪明，把所有任务的 $\sigma_i$ 都无限放大，这样总 Loss 就变成 0 了。为了防止这种作弊，加入了 $\log \sigma_i$。当你把 $\sigma_i$ 变大时，$\log \sigma_i$ 也会变大，从而对模型进行惩罚。

工业界标准的做法是定义对数方差：$s_i = \log(\sigma_i^2)$。此时损失函数可以等价转换为没有除法和对数惩罚的稳定形态：

$$L_{total} = \sum_{i=1}^{T} \left( \exp(-s_i) \cdot L_i + \frac{1}{2} s_i \right)$$

```python
import torch
import torch.nn as nn

# 假设有 2 个任务，初始化对数方差 s_i 为 0
# 必须设置 requires_grad=True，让优化器去更新它
log_vars = nn.Parameter(torch.zeros(2, requires_grad=True)) 

# 在前向传播计算出 task1_loss 和 task2_loss 后
loss_1 = torch.exp(-log_vars[0]) * task1_loss + 0.5 * log_vars[0]
loss_2 = torch.exp(-log_vars[1]) * task2_loss + 0.5 * log_vars[1]

total_loss = loss_1 + loss_2
# 然后直接 total_loss.backward() 即可
```

| 对比维度 | Uncertainty Loss (Kendall et al.) | GradNorm (Chen et al.) |
| --- | --- | --- |
| **理论基础** | 贝叶斯概率，同方差不确定性 | 梯度范数，相对训练速率 |
| **计算开销** | **极小**（只需多加几个标量参数参与一次常规的反向传播） | **极大**（每个任务都需要对共享层单独求导一次） |
| **干预逻辑** | **随遇而安：** 难的任务就降低权重，防止它捣乱。 | **劫富济贫：** 难的任务就加大权重，强迫它跟上进度。 |
| **适用场景** | 任务之间难度差异大、有些任务天生带噪音（如深度估计、特征回归）。 | 任务之间理应齐头并进，但因为量级问题导致某些任务被忽视。 |


## 小目标检测
**小目标检测**：小目标检测效果不好主要原因为小目标尺寸问题。
以网络的输入608×608为例，yolov5中下采样使用了5次，因此最后的特征图大小是19×19，38×38，76×76。三个特征图中，最大的76×76负责检测小目标，而对应到608×608上，每格特征图的感受野是608/76=8×8大小。即如果原始图像中目标的宽或高小于8像素，网络很难学习到目标的特征信息。
另外很多图像分辨率很大，如果简单的进行下采样，下采样的倍数太大，容易丢失数据信息。但是倍数太小，网络前向传播需要在内存中保存大量的特征图，极大耗尽GPU资源,很容易发生显存爆炸，无法正常的训练及推理。
这种情况可以使用**分割**的方式，将大图先分割成小图，再对每个小图检测，不过这样方式有优点也有缺点： 
> 优点：准确性 分割后的小图，再输入目标检测网络中，对于最小目标像素的下限会大大降低。
比如分割成608×608大小，送入输入图像大小608×608的网络中，按照上面的计算方式，原始图片上，长宽大于8个像素的小目标都可以学习到特征。
缺点：增加计算量 比如原本1920×1080的图像，如果使用直接大图检测的方式，一次即可检测完。但采用分割的方式，切分成4张912×608大小的图像，再进行N次检测，会大大增加检测时间。
[YOLOV5 模型和代码修改——针对小目标识别-CSDN博客](https://blog.csdn.net/weixin_56184890/article/details/119840555)

此外，也可以增加一个小目标检测层：[增加小目标检测层-CSDN博客](https://blog.csdn.net/m0_70388905/article/details/125392908)

## ImageNet 预训练
ImageNet预训练是指在大型图像数据集ImageNet上先训练好一个深度学习模型，然后将其用于其他图像任务的迁移学习。
ImageNet数据集：https://image-net.org/ , 包含超过1400万张标注图像，涵盖约1000个类别，是计算机视觉领域最广泛使用的图像分类数据集之一。
在ImageNet上训练模型可以让其学习到通用的图像特征（如边缘、纹理、形状等），这些特征在很多其他任务中也很有用。
迁移学习：将预训练模型的参数（尤其是底层卷积层）迁移到新任务中，比如医学图像分类、工业检测等:
1. Frozen（冻结）策略：只使用预训练模型的底层参数，不更新它们，只训练新任务的高层参数。
2. Fine-tuning（微调）策略：在新任务中继续训练整个模型或部分层，使其更适应当前任务的数据分布。

+ 节省计算资源：从零开始训练一个深度神经网络需要大量数据和算力，预训练可以显著降低成本。
+ 提升性能：在数据量有限的任务中，预训练模型能提供更好的初始参数，从而提高最终模型的准确率。
+ 通用性强：ImageNet涵盖类别广泛，训练出的模型具有良好的泛化能力。

## 其他
使用云服务器快速训练（收费）：[AutoDL算力云 | 弹性、好用、省钱](https://www.autodl.com/home)
[AutoDL帮助文档-GPU选型](https://www.autodl.com/docs/gpu/)

+ **数据集**：输入图像的大小要求必须是32的倍数；
+ Resize保持原始图像比例调整大小更安全；
+ 标注时标注框的设计影响精度

+ **配置**：mosic有时没用可删；删卷积层可减少计算量；若显存不足需要调小batchsize或数据集分辨率；可以从小模型中学到的权重开始，对更大模型进行训练
    + 大的batch_size往往建议可以相应取大点learning_rate, 因为梯度震荡小，大learning_rate可以加速收敛过程，也可以防止陷入到局部最小值，而小batch_size用小learning_rate迭代，防止错过最优点，一直上下震荡没法收敛
    + 参数调优过程一般要反复多次进行`微调<—>训练<—>测试`，最终得出符合需求/较优的HyperPara，应用在项目中	`data/hyps/hyp.finetune.yaml`

# 数据
## 数据集
> [Kaggle数据集](https://www.kaggle.com/datasets)
[格物钛数据集](https://gas.graviti.cn/open-datasets)
[Roboflow数据集](https://universe.roboflow.com/roboflow-100)
[IEEE DataPort](https://ieee-dataport.org/datasets)

标注工具：[Roboflow](https://app.roboflow.com/395841716-qq-com)

### CVAT
```py
git clone https://github.com/cvat-ai/cvat
# 在docker-compose.yml配置端口号   traefik:   - 5000:8080 - 5001:8090
# 改数据目录  cvat_server:   volumes: - cvat_data:/home/django/data
# 配置IP
export CVAT_HOST=FQDN_or_YOUR-IP-ADDRESS
# 启动
docker compose up -d
# 添加用户
docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'
# 改数据目录
docker run --name cvat-server -v /my/cvat_data_dir:/home/django/data -d cvat/server
# 关闭
docker compose down
```
### webdataset
WebDataset 是一种基于 TAR 文件的高效数据集存储与加载方式，专为深度学习任务设计，能够将大规模图像、音频、视频等数据以分片形式流式传输到训练管道中，从而显著提升 I/O 性能。
`import webdataset as wds`
将数据打包成 TAR 分片文件（每个分片包含图像、标签等）。
使用 WebDataset 库读取这些分片。
配合 torch.utils.data.DataLoader 进行批量加载和训练。

### 其他
开源驾驶员行为数据集：[StateFarm-distracted-driver-detection](https://www.kaggle.com/c/state-farm-distracted-driver-detection/data)

数据增强：抖动模糊；三种不同的数据增强方法合成三通道；针对红外图像优化
扩大数据集：旋转 偏移（首先要保证原始数据量够）；混合数据集——彩色+红外
各集种类分配不均，测试集要用不同的人

[红外图像通道扩展特征增强算法](https://blog.csdn.net/Arrowes/article/details/130020241?spm=1001.2014.3001.5501)
[Guided image filtering 引导滤波算法实现图像细节增强](https://blog.csdn.net/Arrowes/article/details/130020426?spm=1001.2014.3001.5501)

---

# MMDetection
## 基本概念和环境搭建
[MMDetection](https://mmdetection.readthedocs.io/zh-cn/latest/) 由 7 个主要部分组成，apis、structures、datasets、models、engine、evaluation 和 visualization。
+ apis 为模型推理提供高级 API。
+ structures 提供 bbox、mask 和 DetDataSample 等数据结构。
+ datasets 支持用于目标检测、实例分割和全景分割的各种数据集。
  + transforms 包含各种数据增强变换。
  + samplers 定义了不同的数据加载器采样策略。
+ models 是检测器最重要的部分，包含检测器的不同组件。
  + detectors 定义所有检测模型类。
  + data_preprocessors 用于预处理模型的输入数据。
  + backbones 包含各种骨干网络。
  + necks 包含各种模型颈部组件。
  + dense_heads 包含执行密集预测的各种检测头。
  + roi_heads 包含从 RoI 预测的各种检测头。
  + seg_heads 包含各种分割头。
  + losses 包含各种损失函数。
  + task_modules 为检测任务提供模块，例如 assigners、samplers、box coders 和 prior generators。
  + layers 提供了一些基本的神经网络层。
+ engine 是运行时组件的一部分。
  + runner 为 MMEngine 的执行器提供扩展。
  + schedulers 提供用于调整优化超参数的调度程序。
  + optimizers 提供优化器和优化器封装。
  + hooks 提供执行器的各种钩子。
+ evaluation 为评估模型性能提供不同的指标。
+ visualization 用于可视化检测结果。

[文档 - 环境安装与验证](https://mmdetection.readthedocs.io/zh-cn/latest/get_started.html)
1. 使用 MIM 安装 MMEngine 和 MMCV。
2. 从源码安装MMDetection
3. 验证
> Debug: 
1.验证推理时报AssertionError: MMCV == 2.2.0 is used but incompatible. Please install mmcv>=2.0.0rc4, <2.2.0. 解决: mmdet/__init__.py", line 17 强行改版本适配 <=
2.ModuleNotFoundError: No module named 'mmdet' 解决：编译mmdetection：python setup.py develop
3.cuda版本问题：conda install pytorch == 1.13.1 torchvision == 0.14.1 torchaudio==0.13.1 cudatoolkit=11.7 pytorch-cuda=11.7 -c pytorch -c nvidia

[训练 & 测试](https://mmdetection.readthedocs.io/zh-cn/latest/user_guides/index.html#id1)：使用开源模型和数据集来执行常见的训练和测试任务

[实用工具](https://mmdetection.readthedocs.io/zh-cn/latest/user_guides/index.html#id2)：
+ 查看模型配置:`python tools/misc/print_config.py ./configs/_base_/models/mask-rcnn_r50_fpn.py`
+ 列出所有模型：`models = DetInferencer.list_models('mmdet')`

+ 推理：推理的高层编程接口——推理器Inferencer
    ```py
    from mmdet.apis import DetInferencer
    inferencer = DetInferencer('rtmdet_tiny_8xb32-300e_coco')   # 初始化模型
    inferencer('demo/demo.jpg', show=False,out_dir='./outputs',print_result=True)   # 推理示例图片
    # 快速验证：
    python demo/image_demo.py demo/demo.jpg rtmdet_tiny_8xb32-300e_coco.py --weights rtmdet_tiny_8xb32-300e_coco_20220902_112414-78e30dcc.pth --device cpu
    ```
    
+ 下载COCO数据集：`python tools/misc/download_dataset.py --dataset-name coco2017`

+ 测试：`python tools/test.py ${CONFIG_FILE} ${CHECKPOINT_FILE} [--out ${RESULT_FILE}] [--show]`
    ```sh
    python tools/test.py configs/rtmdet/rtmdet_l_8xb32-300e_coco.py checkpoints/rtmdet_l_8xb32-300e_coco_20220719_112030-5a0be7c4.pth --show-dir rtmdet_l_8xb32-300e_coco_results
    ```
+ 训练：
    ```sh
    python tools/train.py {CONFIG_FILE} [optional arguments]
    python tools/train.py configs/retinanet/retinanet_r50_fpn_1x_coco.py
    ```
+ `tensorboard --logdir=work_dirs`:
    tensorboard可视化--在`../_base_/default_runtime.py`--visualizer中：
    ```py
    vis_backends = [
        dict(type='LocalVisBackend'),
        dict(type='TensorboardVisBackend')
    ]
    ```

[进阶教程](https://mmdetection.readthedocs.io/zh-cn/latest/advanced_guides/index.html)
自定义模型重点看：[组件定制](https://mmdetection.readthedocs.io/zh-cn/latest/advanced_guides/index.html#id2)
深入理解看：[中文教程](https://mmdetection.readthedocs.io/zh-cn/latest/article.html)
[MMEngine](https://mmengine.readthedocs.io/zh-cn/latest/get_started/introduction.html)，较深入时要看
[算法组件](https://zhuanlan.zhihu.com/p/337375549)

![MM](https://pic3.zhimg.com/80/v2-c4e6229a1fd42692d090108481be34a6_1440w.webp)


[整体构建细节](https://zhuanlan.zhihu.com/p/341954021)

Pipeline: 由一系列按照插入顺序运行的数据处理模块组成，每个模块完成某个特定功能，例如 Resize，因为其流式顺序运行特性，故叫做 Pipeline。

MMDataParallel:处理Dataloader中pytorch 无法解析的DataContainer 对象,且额外实现了 `train_step()` 和 `val_step() `两个函数，可以被 Runner 调用

<img src="https://pic4.zhimg.com/80/v2-b03d43ed4b3dc4c02e68712e57023cff_1440w.webp" width = "80%" />

[MMDetection框架入门教程（完全版）](https://blog.csdn.net/qq_16137569/article/details/121316235)
Pytorch
1. 构建数据集：新建一个类，并继承Dataset类，重写__getitem__()方法实现数据和标签的加载和遍历功能，并以pipeline的方式定义数据预处理流程
2. 构建数据加载器：传入相应的参数实例化DataLoader
3. 构建模型：新建一个类，并继承Module类，重写forward()函数定义模型的前向过程
4. 定义损失函数和优化器：根据算法选择合适和损失函数和优化器
5. 训练和验证：循环从DataLoader中获取数据和标签，送入网络模型，计算loss，根据反传的梯度使用优化器进行迭代优化
6. 其他操作：在主调函数里可以任意穿插训练Tricks、日志打印、检查点保存等操作

MMDetection
1. 注册数据集：CustomDataset是MMDetection在原始的Dataset基础上的再次封装，其__getitem__()方法会根据训练和测试模式分别重定向到prepare_train_img()和prepare_test_img()函数。用户以继承CustomDataset类的方式构建自己的数据集时，需要重写load_annotations()和get_ann_info()函数，定义数据和标签的加载及遍历方式。完成数据集类的定义后，还需要使用DATASETS.register_module()进行模块注册。
2. 注册模型：模型构建的方式和Pytorch类似，都是新建一个Module的子类然后重写forward()函数。唯一的区别在于MMDetection中需要继承BaseModule而不是Module，BaseModule是Module的子类，MMLab中的任何模型都必须继承此类。另外，MMDetection将一个完整的模型拆分为backbone、neck和head三部分进行管理，所以用户需要按照这种方式，将算法模型拆解成3个类，分别使用BACKBONES.register_module()、NECKS.register_module()和HEADS.register_module()完成模块注册。
3. 构建配置文件：配置文件用于配置算法各个组件的运行参数，大体上可以包含四个部分：datasets、models、schedules和runtime。完成相应模块的定义和注册后，在配置文件中配置好相应的运行参数，然后MMDetection就会通过Registry类读取并解析配置文件，完成模块的实例化。另外，配置文件可以通过_base_字段实现继承功能，以提高代码复用率。
4. 训练和验证：在完成各模块的代码实现、模块的注册、配置文件的编写后，就可以使用./tools/train.py和./tools/test.py对模型进行训练和验证，不需要用户编写额外的代码。
![alt text](https://i-blog.csdnimg.cn/blog_migrate/9623846bf1a2b09682eab74e606063bb.png)
蓝色部分表示Pytorch流程，橙色部分表示MMDetection流程，绿色部分表示和算法框架无关的通用流程。
## Registry注册机制
从本质上讲，MMDetection 的注册机制是一个全局的键值映射系统，其“键”是字符串（例如，'ResNet'），“值”则是对应的类或函数（例如，ResNet 类）。这个机制由 MMDetection 的底层库 MMCV (OpenMMLab Computer Vision Foundation) 提供。
在 MMDetection 中，几乎所有的模型组件，包括骨干网络 (Backbones)、颈部 (Necks)、检测头 (Heads)、损失函数 (Losses)、数据增强流程 (Pipelines) 等，都是通过注册机制来管理的。
```py
# 实例化一个注册器用来管理模型
MODELS = Registry('myModels')

# 在类的创建过程中, 使用函数装饰器进行注册
@MODELS.register_module() #该装饰器是实现注册的核心。它将 ResNet 类和字符串 'ResNet' 关联起来。
class ResNet(object):
    def __init__(self, depth):
        self.depth = depth
        print('Initialize ResNet{}'.format(depth))
print(MODELS)
""" 打印结果为:
Registry(name=myModels, items={'ResNet': <class '__main__.ResNet'>})
"""

# 配置参数, 一般cfg从配置文件中获取
backbone_cfg = dict(type='ResNet', depth=101)
# 实例化模型(将配置参数传给模型的构造函数), 得到实例化对象
my_backbone = MODELS.build(backbone_cfg)
print(my_backbone)
""" 打印结果为:
Initialize ResNet101
<__main__.ResNet object at 0x000001E68E99E198>
"""
```
+ `@TRANSFORMS.register_module()`
这是 MMDetection 库提供的一个 Python 装饰器。它用于将一个新的模块（通常是一个定义数据增强或预处理操作的类）注册到 MMDetection 库的流水线系统中。位于一个类定义的上方。
TRANSFORMS: 这是 MMDetection 中的一个注册表，用于存储目标检测流水线中使用的不同数据增强和预处理步骤。
register_module(): 这是 TRANSFORMS 注册表中的一个函数，用于注册一个新的模块。
## Hook机制
[MMEngine - Hook](https://mmengine.readthedocs.io/zh-cn/latest/tutorials/hook.html)
Hook可以理解为一种触发器，可以在程序预定义的位置执行预定义的函数。MMCV根据算法的生命周期预定义了6个可以插入自定义函数的位点，用户可以在每个位点自由地插入任意数量的函数操作，如下图所示：
<img src="https://i-blog.csdnimg.cn/blog_migrate/a3e9e76563206c4bab09b91762341533.png" width = "50%" />
MMCV已经实现了部分常用Hook，其中默认Hook不需要用户自行注册，通过配置文件配置对应的参数即可；定制Hook则需要用户在配置文件中手动配置custom_hooks字段进行注册。
![alt text](https://i-blog.csdnimg.cn/blog_migrate/945ac8d55f31965189e6fcdc2b86a3d0.png)
和其他模块不同，当我们定义好一个Hook(并注册到HOOKS注册器中)之后，还需要注册到Runner中才能使用，前后一共进行两次注册。第一次注册到HOOKS是为了程序能够根据Hook名称找到对应的模块，第二次注册到Runner中是为了程序执行到预定义位置时能够调用对应的函数。

Runner是MMCV用来管理训练过程的一个类，封装了 OpenMMLab 体系下各个框架的训练和验证详细流程，其负责管理训练和验证过程中的整个生命周期；它内部会维护一个list类型变量self._hooks，我们需要把训练过程会调用的Hook实例对象按照优先级顺序全部添加到self._hooks中，这个过程通过Runner.register_hook()函数实现。MMCV预定义了几种优先级, 数字越小表示优先级越高, 如果觉得默认的分级方式颗粒度过大, 也可以直接传入0~100的整数进行精细划分。

实现一个Hook包含5个步骤：
1. 定义一个类，继承Hook基类
2. 根据自定义Hook的功能有选择地重写Hook基类中对应的函数
3. 注册自定义Hook模块到HOOKS查询表中（register_module）
4. 实例化Hook模块并注册到Runner中（register_hook）
5. 使用回调函数调用重写的Hook函数（call_hook）

## 算法实现流程
### 数据集
在Pytorch中Dataset的遍历是通过重写`__getitem__()`函数实现的，而MMDetection已经重写了`__getitem__()`函数，可以根据当前运行模式调用`prepare_train_img()`或`prepare_test_img()`，两者的区别在于是否加载训练标签。所以我们只需要重写`load_annotations()`和`get_ann_info()`函数

完成自定义的Dataset类后要加上`@DATASETS.register_module()`将当前模块注册到DATASETS表中。
### 注册模型
相比Pytorch的区别：
继承的父类从Module变成了BaseModule
需要按照backbone、neck和head的结构将模型拆解成3个部分，分别定义并注册到BACKBONES、NECKS以及HEADS当中：
1. Backbone: 任何一个 batch 的图片先输入到 backbone 中进行特征提取，典型的骨干网络是 ResNet, Darknet `mmdet/models/backbones`
2. Neck: 输出的单尺度或者多尺度特征图输入到 neck 模块中进行特征融合或者增强，neck 可以认为是 backbone 和 head 的连接层，主要负责对 backbone 的特征进行高效融合和增强，能够对输入的单尺度或者多尺度特征进行融合、增强输出等。典型的 neck 是 FPN `mmdet/models/necks`
3. Head: 上述多尺度特征最终输入到 head 部分，一般都会包括分类和回归分支输出;目标检测算法输出一般包括分类和框坐标回归两个分支，不同算法 head 模块复杂程度不一样，灵活度比较高。在网络构建方面，理解目标检测算法主要是要理解 head 模块。`mmdet/models/dense_heads + roi_heads`
虽然 head 部分的网络构建比较简单，但是由于正负样本属性定义、正负样本采样和 bbox 编解码模块都在 head 模块中进行组合调用，故 MMDetection 中最复杂的模块就是 head。
   1. Enhance: 在整个网络构建阶段都可以引入一些即插即用增强算子来增加提取提取能力，典型的例如 SPP、DCN、注意力机制 等等
   2. BBox Assigner，BBox Sampler：目标检测 head 输出一般是特征图，对于分类任务存在严重的正负样本不平衡，可以通过正负样本属性分配和采样策略控制 `mmdet/core/bbox/assigners + samplers`
   3. BBox Encoder：为了方便收敛和平衡多分支，一般都会对 gt bbox 进行编码，如归一化 `mmdet/core/bbox/coder`
   4. Loss: 最后一步是计算分类和回归 loss，进行训练 `mmdet/models/losses`
1. Training tricks: 在训练过程中也包括非常多的 trick，例如优化器选择等，参数调节也非常关键
### 配置文件
在 MMDetection 中，一个模型被定义为一个配置文件 和对应被存储在 checkpoint 文件内的模型参数的集合。
在MMDetection框架下，不需要另外实现迭代训练/测试流程的代码，只需要执行现成的train.py或test.py即可，由配置文件实现
[配置文件](https://mmdetection.readthedocs.io/zh-cn/latest/user_guides/config.html#id1)
[MMEngine - 配置（CONFIG）详细文档](https://mmengine.readthedocs.io/zh-cn/latest/advanced_tutorials/config.html)

`./mmdetection/configs/_base_/..`

```py
_base_ = [
    'mmdetection/configs/_base_/models/fast_rcnn_r50_fpn.py',		# models
    'mmdetection/configs/_base_/datasets/coco_detection.py',		# datasets
    'mmdetection/configs/_base_/schedules/schedule_1x.py',			# schedules
    'mmdetection/configs/_base_/default_runtime.py',				# defualt_runtime
]
# 这些配置信息样例如下：
# 1. 模型配置(models) =========================================
model = dict(
	type='FastRCNN',			# 模型名称是FastRCNN
	backbone=dict(				# BackBone是ResNet
        type='ResNet',
        ...,
    ),
    neck=dict(					# Neck是FPN
        type='FPN',
        ...,
    ),
    roi_head=dict(				# Head是StandardRoIHead
        type='StandardRoIHead',
        ...,
        loss_cls=dict(...),		# 分类损失函数
        loss_bbox=dict(...),	# 回归损失函数
    ),
    train_cfg=dict(				# 训练参数配置
    	assigner=dict(...),		# BBox Assigner
    	sampler=dict(...),		# BBox Sampler
    	...
	),
    test_cfg =dict(				# 测试参数配置
    	nms=dict(...),			# NMS后处理
    	...,
    )
)

# 2. 数据集配置(datasets) =========================================
dataset_type = '...'			# 数据集名称
data_root = '...'				# 数据集根目录
img_norm_cfg = dict(...)		# 图像归一化参数
train_pipeline = [				# 训练数据处理Pipeline
	...,
]
test_pipeline = [...]			# 测试数据处理Pipeline
data = dict(
	samples_per_gpu=2,			# batch_size
    workers_per_gpu=2,			# GPU数量
	train=dict(					# 训练集配置
		type=dataset_type,
        ann_file=data_root + 'annotations/instances_train2017.json',	# 标注问加你
        img_prefix=data_root + 'train2017/',	# 图像前缀
		pipline=trian_pipline,					# 数据预处理pipeline
	),
	val=dict(					# 验证集配置
		...,
		pipline=test_pipline,
	),
	test=dict(					# 测试集配置
		...,
		pipline=test_pipline,
	)
)

# 3. 训练策略配置(schedules) =========================================
evaluation = dict(interval=1, metric='bbox')
optimizer = dict(type='SGD', lr=0.02, momentum=0.9, weight_decay=0.0001)
optimizer_config = dict(grad_clip=None)
lr_config = dict(
    policy='step',
    warmup='linear',
    warmup_iters=500,
    warmup_ratio=0.001,
    step=[8, 11])
runner = dict(type='EpochBasedRunner', max_epochs=12)

# 4. 运行配置(runtime) =========================================
checkpoint_config = dict(interval=1)
log_config = dict(interval=50, hooks=[dict(type='TextLoggerHook')])
custom_hooks = [dict(type='NumClassCheckHook')]
dist_params = dict(backend='nccl')
log_level = 'INFO'
load_from = None
resume_from = None
workflow = [('train', 1)]
```
需要继承的配置文件，新建一个配置文件的时候，一般都是继承这4个基础配置文件，然后在此基础上进行针对性调整：
```py
# 从_base_中继承的原始优化器
optimizer = dict(type='SGD', lr=0.02, momentum=0.9, weight_decay=0.0001)

# 修改学习率
optimizer = dict(lr=0.001)		
# 修改后optimizer变成
optimizer = dict(type='SGD', lr=0.001, momentum=0.9, weight_decay=0.0001)

# 将原来的SGD替换成AdamW
optimizer = dict(_delete_=True, type='AdamW', lr=0.0001, weight_decay=0.0001)  
# 替换后optimizer变成
optimizer = dict(type='AdamW', lr=0.0001, weight_decay=0.0001)

```
### 训练和测试
**train.py**
```py
def main():
	# Step1: 解析配置文件, args.config是配置文件路径
	cfg = Config.fromfile(args.config)

	# Step2: 初始化模型, 函数内部调用的是DETECTORS.build(cfg)
	model = build_detector(cfg.model)
  model.init_weights()
	
	# Step3: 初始化训练集和验证集, 函数内部调用build_from_cfg(cfg, DATASETS), 等价于DATASETS.build(cfg)
	datasets = [build_dataset(cfg.data.train)]
    if len(cfg.workflow) == 2:
        val_dataset = copy.deepcopy(cfg.data.val)
        val_dataset.pipeline = cfg.data.train.pipeline # 验证集在训练过程中使用train pipeline而不是test pipeline
        datasets.append(build_dataset(val_dataset))
    
    # Step4: 传入模型和数据集, 准备开始训练模型
    train_detector(model, datasets, cfg)
```
**train_detector**
```py
def train_detector(model, dataset, cfg):
	# 获取Runner类型, EpochBasedRunner或IterBasedRuner
	runner_type = 'EpochBasedRunner' if 'runner' not in cfg else cfg.runner['type']
	
	# Step1: 获取dataloader, 因为dataset列表里包含了训练集和验证集, 所以使用for循环的方式构建dataloader
	# build_dataloader()会用DataLoader类进行dataloader的初始化
    data_loaders = [
        build_dataloader(
            ds,
            cfg.data.samples_per_gpu,		# batch_size
            runner_type=runner_type) for ds in dataset
    ]
	
	# Step2: 封装模型, 为了进行分布式训练
	model = MMDataParallel(model.cuda(cfg.gpu_ids[0]), device_ids=cfg.gpu_ids)
	
	# Step3: 初始化优化器
	optimizer = build_optimizer(model, cfg.optimizer)

	# Step4: 初始化Runner
	runner = build_runner(
        cfg.runner,
        default_args=dict(model=model, optimizer=optimizer)

	# Step5: 注册默认Hook(注册到runner._hooks列表中)
	runner.register_training_hooks(cfg.lr_config, optimizer_config,
                                   cfg.checkpoint_config, cfg.log_config,
                                   cfg.get('momentum_config', None))
	
	# Step6: 注册自定义Hook(注册到runner._hooks列表中)
	 if cfg.get('custom_hooks', None):
        custom_hooks = cfg.custom_hooks
        for hook_cfg in cfg.custom_hooks:
            hook_cfg = hook_cfg.copy()
            priority = hook_cfg.pop('priority', 'NORMAL')
            hook = build_from_cfg(hook_cfg, HOOKS)
            runner.register_hook(hook, priority=priority)

	# Step7: 开始训练流程
    if cfg.resume_from:
    	# 恢复检查点
        runner.resume(cfg.resume_from)
    elif cfg.load_from:
    	# 加载预训练模型
        runner.load_checkpoint(cfg.load_from)
    # 调用run()方法, 开始迭代过程
    runner.run(data_loaders, cfg.workflow)
```
**runner** 
runner 对象内部的 run 方式是一个通用方法，可以运行任何 workflow，目前常用的主要是 train 和 val。
```py
def run(self, data_loaders, workflow, max_epochs=None, **kwargs):
    while self.epoch < self._max_epochs:
        for i, flow in enumerate(workflow):
            mode, epochs = flow
            
            # 如果mode='train', 则调用self.train()函数
            # 如果mode='val', 则调用self.val()函数
            epoch_runner = getattr(self, mode)

            for _ in range(epochs):
                if mode == 'train' and self.epoch >= self._max_epochs:
                    break
                # 运行train()或val()
                epoch_runner(data_loaders[i], **kwargs)

```

**train() val()**
train()和val()的核心函数是run_iter()，根据train_mode参数调用model.train_step()或model.val_step()，这两个函数最终都会指向我们自己模型的forward()函数，返回模型的前向推理结果（一般是Loss值）。Runner到我们自己的模型中间还会经过MMDataParallel、BaseDetector、SingleStageDetector(或TwoStageDetector)四个类，最终调用我们自己模型的forward()函数，执行推理过程。
```py
def train(self, data_loader, **kwargs):
    self.model.train()
    self.mode = 'train'
    self.data_loader = data_loader
    self.call_hook('before_train_epoch')
    for i, data_batch in enumerate(self.data_loader):
        self.call_hook('before_train_iter')
        self.run_iter(data_batch, train_mode=True)
        self.call_hook('after_train_iter')

    self.call_hook('after_train_epoch')

@torch.no_grad()  #由于测试过程不需要梯度回传，所以val函数加了一个装饰器
def val(self, data_loader, **kwargs):
	# 将模块设置为验证模式
    self.model.eval()
    self.mode = 'val'
    self.data_loader = data_loader
    for i, data_batch in enumerate(self.data_loader):
        self.run_iter(data_batch, train_mode=False)

#核心函数实际上是 self.run_iter()，如下：
def run_iter(self, data_batch, train_mode, **kwargs):
    if train_mode:
        # 对于每次迭代，最终是调用如下函数
        outputs = self.model.train_step(data_batch,...)
    else:
        # 对于每次迭代，最终是调用如下函数
        outputs = self.model.val_step(data_batch,...)

    if 'log_vars' in outputs:
        self.log_buffer.update(outputs['log_vars'],...)
    self.outputs = outputs

#上述 self.call_hook() 表示在不同生命周期调用所有已经注册进去的 hook，而字符串参数表示对应的生命周期。以 OptimizerHook 为例，其执行反向传播、梯度裁剪和参数更新等核心训练功能：
@HOOKS.register_module()
class OptimizerHook(Hook):

    def __init__(self, grad_clip=None):
        self.grad_clip = grad_clip

    def after_train_iter(self, runner):
        runner.optimizer.zero_grad()
        runner.outputs['loss'].backward()
        if self.grad_clip is not None:
            grad_norm = self.clip_grads(runner.model.parameters())
        runner.optimizer.step()

#可以发现 OptimizerHook 注册到的生命周期是 after_train_iter，故在每次 train() 里面运行到self.call_hook('after_train_iter') 时候就会被调用，其他 hook 也是同样运行逻辑。
```
训练和验证的时候实际上调用了 model 内部的 train_step 和 val_step 函数，理解了两个函数调用流程就理解了 MMDetection 训练和测试流程。

MMDetection的梯度反传优化是通过一个实现了after_train_iter()的Hook实现的
![alt text](https://i-blog.csdnimg.cn/blog_migrate/bbc1b91aef9aa68f0fc1dff0720c1a29.png)



## notes
### Head流程
[Head流程](https://zhuanlan.zhihu.com/p/343433169)
![Head](https://pic4.zhimg.com/80/v2-ba9edb24f8cbf10ee77bacb7f10befa7_1440w.webp)
```py
#============= mmdet/models/detectors/single_stage.py/SingleStageDetector ============
def forward_train(...):
    super(SingleStageDetector, self).forward_train(img, img_metas)
    # 先进行 backbone+neck 的特征提取
    x = self.extract_feat(img)
    # 主要是调用 bbox_head 内部的 forward_train 方法
    losses = self.bbox_head.forward_train(x, ...)
    return losses
```
读起来有点吃力，后续结合源码读
### 修改
```sh
│
├───configs
│   └───FedPSD
│           yolo.py
│
├───mmdet
│   ├───datasets
│   │   │   markingpoint.py
│   │   │   __init__.py
│   │   │
│   │   └───pipelines   #pipeline似乎可以复用，在配置文件里改？
│   │       │   formating.py    
│   │       │   loading.py  #数据加载
│   │       │   transforms.py   #数据处理
│   │       └───__init__.py
│   │
│   └───models
│       ├───dense_heads
│       │   │   psd_head.py
│       │   └───__init__.py
│       │
│       └───detectors
│           │   parking_slot_det.py
│           └───__init__.py
```
在修改之后，需要重新编译mmdet,在根目录使用 
`python setup.py install` `pip install -v -e .`, 否则会报错

---

# YOLO
## YOLO环境配置
详细使用见 [Anaconda，Pycharm，Jupyter，Pytorch](https://wangyujie.space/Pytorch/)

**Windows环境配置**
1. 安装[miniconda](https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe), [镜像源](https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/?C=M&O=D) （或[**Anaconda**](https://www.anaconda.com/)，更大更全但没必要）
防止环境装在C盘占空间：修改user目录下.condarc文件里的默认地址，或执行``conda config --add D:\Anaconda3\envs ``,然后``conda info`` 检查envs directories
（若报错 The channel is not accessible or is invalid 运行``conda config --remove-key channels``）

2. **配置环境**：打开Anaconda Prompt
创建环境``conda create -n pytorch python=3.8``
激活环境``conda activate pytorch``

3. 安装显卡驱动对应的**CUDA**：``nvidia-smi`` 查询支持CUDA版本，
再到[Pytorch官网](https://pytorch.org/get-started/locally/)复制对应code进行安装, 如：
``conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia``
（验证torch能否使用GPU：`python -c "import torch;print(torch.cuda.is_available())"`   返回True说明GPU可以被使用）

4. 安装[**Pychram**](https://www.jetbrains.com/pycharm/), 用pycharm打开YOLO项目文件夹，配置编辑器``D:P\Anaconda3\envs\pytorch\python.exe``，在pycharm的terminal中打开pytorch环境

5. 安装各种**包**：``pip install -r requirements.txt``,
换源补装失败的包``pip install opencv-python -i https://pypi.tuna.tsinghua.edu.cn/simple/``

**Linux 环境配置**
1. 安装miniconda，相较Anaconda更小巧快捷，功能一样
    ```sh
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
    bash Miniconda3-latest-Linux-x86_64.sh
    #一路Enter + Yes，最后使修改的PATH环境变量生效：
    source ~/.bashrc
    conda   #验证是否成功
    conda create -n pytorch python=3.6  #创建一个名为pytorch的环境
    conda activate pytorch  #激活环境
    ```
    > （若要安装：[Anaconda](https://www.anaconda.com/)，执行下载的.sh文件，输入``bash XXX.sh``，然后一路enter和yes；激活：``cd ///root/anaconda3/bin``,输入：``source ./activate``，终端前出现``(base)``则激活成功）

2. 下载pycharm，解压，进入bin文件夹，运行``./pycharm.sh``以打开pycharm（更简单且能生成图标的方法：``sudo snap install pycharm-community --classic``）
在项目中导入环境``.conda/envs/pytorch/bin/python3.6``
3. 安装CUDA
    + **pytorch**
    ``conda install pytorch torchvision torchaudio pytorch-cuda=11.7 -c pytorch -c nvidia``
    或`pip install torch==1.13.1+cu116 torchvision==0.14.1+cu116 torchaudio==0.13.1 --extra-index-url https://download.pytorch.org/whl/cu116`

    + **tensorflow**
    cuda:``conda install cudatoolkit=10.0``
    cuDNN:``conda install cudnn=7.6``
    tf:``pip install tensorflow-gpu==1.15.0``(注意版本匹配)

如果requirements中有包实在安不上，手动装包：进[网站](https://pypi.org/)搜索包，下载.whl，在包所在位置激活环境运行``pip install [].whl``(包名中cp38代表python3.8版本)
vscode导入conda：当在VScode中打开某py文件时，左下角会出现Python, 点击可切换conda环境

## YOLO资料与代码

| Model   |Paper  | Code|
|---------|-------|-------|
| YOLOv1  | [You Only Look Once:Unified, Real-Time Object Detection](https://arxiv.org/pdf/1506.02640.pdf)        | [Code](https://pjreddie.com/darknet/yolov1/)        |
| YOLOv2  | [YOLO9000:Better, Faster, Stronger](https://arxiv.org/pdf/1612.08242.pdf) | [Code](https://pjreddie.com/darknet/yolo/)|
| YOLOv3  | [YOLOv3: An Incremental Improvement](https://arxiv.org/pdf/1804.02767.pdf)| [Code](https://github.com/ultralytics/yolov3)|
| YOLOv4  | [YOLOv4: Optimal Speed and Accuracy of Object Detection](https://arxiv.org/pdf/2004.10934.pdf)| [Code](https://github.com/Tianxiaomo/pytorch-YOLOv4)|
| YOLOv5  | /|      [Code](https://github.com/ultralytics/yolov5)|
| YOLOv6  | [YOLOv6: A Single-Stage Object Detection Framework for Industrial Applications](https://arxiv.org/pdf/2209.02976.pdf)|              [Code](https://github.com/meituan/YOLOv6)|
| YOLOv7  | [YOLOv7: Trainable bag-of-freebies sets new state-of-the-art for real-time object detectors](https://arxiv.org/abs/2207.02696)|   [Code](https://github.com/WongKinYiu/yolov7)|
| YOLOv8  | /|     [Code](https://github.com/ultralytics/ultralytics)  |
|CEAM-YOLOv7| [CEAM-YOLOv7:Improved YOLOv7 Based on Channel Expansion Attention Mechanism for Driver behavior detection](https://ieeexplore.ieee.org/document/9980374/metrics) |       [Code](https://github.com/Arrowes/CEAM-YOLOv7)
|FEY-YOLOv7| [A Driver Fatigue Detection Algorithm Based on Dynamic Tracking of Small Facial Targets Using YOLOv7](https://www.jstage.jst.go.jp/article/transinf/E106.D/11/E106.D_2023EDP7093/_article) | [Code](https://github.com/Arrowes/FEY-YOLOv7)

YOLOv1 - v5历程：[从yolov1至yolov5的进阶之路](https://blog.csdn.net/wjinjie/article/details/107509243)
YOLOv3论文精读视频：[同济子豪兄YOLOV3目标检测](https://www.bilibili.com/video/BV1Vg411V7bJ/?)
YOLOv5知识精讲：[Yolov5核心基础知识完整讲解](https://zhuanlan.zhihu.com/p/172121380)，[YOLOV5-5.x 源码讲解](https://blog.csdn.net/qq_38253797/article/details/119043919)
YOLOv7网络结构：[理解yolov7网络结构](https://blog.csdn.net/athrunsunny/article/details/125951001) ,[Yolov7 基础网络结构详解](https://blog.csdn.net/u010899190/article/details/125883770)
全流程指导视频：[目标检测 YOLOv5 开源代码项目调试与讲解实战-土堆](https://www.bilibili.com/video/BV1tf4y1t7ru/)


算法精品仓库：[Bubbliiiing](https://github.com/bubbliiiing), [YOLO Air](https://github.com/iscyy/yoloair)，[YOLO Air2](https://github.com/iscyy/yoloair2), [yolov5_research](https://github.com/positive666/yolov5_research)

[YOLO_Note](https://github.com/Arrowes/DLpractice/tree/main/YOLO_note)

[笔记：目标检测二十年综述Object Detection in 20 Years: A Survey中英对照翻译、重点标注及关键词翻译](https://blog.csdn.net/Arrowes/article/details/121877601?spm=1001.2014.3001.5501)

## Ideas

### 网络结构
1. 在 `models/common.py` 加入新的结构代码
2. 在`models/yolo.py` 的parse_model函数中引入上面新写的结构名称
3. `.yaml` 修改网络结构
![图 2](https://raw.githubusercontent.com/Arrowes/Blog/main/images/Yolo2.png)  

### 注意力模块
[CV中即插即用的注意力模块](https://zhuanlan.zhihu.com/p/330535757)
[手把手带你YOLOv5 (v6.1)添加注意力机制](https://blog.csdn.net/weixin_43694096/article/details/124443059?spm=1001.2014.3001.5502)

> 位置：
在上采样+concat之后接一个注意力机制可能会更好？
backbone结尾使用一个注意力机制？
每个block（如residual block）结尾使用比每个Conv里使用更好？

transformer自注意力模块 CBAM注意力模块 CA注意力模块 SE注意力模块

### 激活函数 activations.py
[改进激活函数为ReLU、RReLU、Hardtanh、ReLU6、Sigmoid、Tanh、Mish、Hardswish、ELU、CELU等](https://blog.csdn.net/m0_70388905/article/details/128753641)
> activations.py：激活函数代码写在了activations.py文件里，可引入新的激活函数
common.py：替换激活函数，很多卷积组都涉及到了激活函数（Conv，BottleneckCSP），所以改的时候要全面

例：插入激活函数：Mish
1.在utils/activation.py中定义Mish激活函数
2.重构Conv模块，改激活函数：
```py
class Conv(nn.Module):
    # Standard convolution
    def __init__(self, c1, c2, k=1, s=1, p=None, g=1, act=True):  # ch_in, ch_out, kernel, stride, padding, groups
        super(Conv, self).__init__()
        self.conv = nn.Conv2d(c1, c2, k, s, autopad(k, p), groups=g, bias=False)
        self.bn = nn.BatchNorm2d(c2)
        #self.act = nn.SiLU() if act is True else (act if isinstance(act, nn.Module) else nn.Identity())
        self.act = nn.Mish() if act is True else (act if isinstance(act, nn.Module) else nn.Identity())

class ReLU(nn.Module):
    __constants__ = ['inplace']
    inplace: bool
    def __init__(self, inplace: bool = False):
        super(ReLU, self).__init__()
        self.inplace = inplace
    def forward(self, x):
        return F.relu(x, inplace=self.inplace)
    def extra_repr(self):
        inplace_str = 'inplace=True' if self.inplace else ''
        return inplace_str
```

### Loss Function
例：改 EIOU loss
1. 修改 general.py，增加EIOU。
```py
elif EIoU:
                w=(w1-w2)*(w1-w2)
                h=(h1-h2)*(h1-h2)
                return iou-(rho2/c2+w/(cw**2)+h/(ch**2))#EIOU  2021.12.29
```
2. 将loss.py中边框位置回归损失函数改为eiou。
```py
            iou = bbox_iou(pbox.T, tbox[i], x1y1x2y2=False, EIoU=True)  # iou(prediction, target)
```

### 参数配置（YOLOv5）
**Detect参数**
调用电脑摄像头: 
右上角py配置 > Edit Configurations > Parameters
``--view-img --source 0``

调用手机摄像头：
下载 [IP摄像头](https://www.123pan.com/s/goS7Vv-QeKbd.html) App，关闭代理，连同一个网，Parameters配置为：
``--source http://admin:admin@192.168.43.1:8081`` 具体地址见 APP

**Train参数**
`action='store_true'` 触发了为true，否则为false 和 default=False 效果一样

**YOLOv8（没搞懂）**
该版本参数集中配置ultralytics/yolo/configs/default.yaml
model参数可以是pt也可以是yaml。
>pt:相当于使用预训练权重进行训练，比如选择为yolov8n.pt，就是训练一个yolov8n模型，并且训练前导入这个pt的权重。
yaml:相当于直接初始化一个模型进行训练，比如选择为yolov8n.yaml，就是训练一个yolov8n模型，权重是随机初始化。

data.yaml数据只能用绝对地址
要修改代码先卸ultralytics包，利用setup.py

### 其他
剪枝：[模型剪枝、蒸馏、压缩-CSDN博客](https://blog.csdn.net/m0_70388905/article/details/128222629)
[GitHub - Torch-Pruning: [CVPR 2023] Towards Any Structural Pruning; ](https://github.com/VainF/Torch-Pruning)

融合EfficientNet和YoloV5：主要思想是训练一个图像分类模型(EfficientNet)，它可以实现非常高的AUC(约0.99)，并找到一种方法将其与目标检测模型融合。这被称为“2 class filter”

加权框融合(WBF)后处理：对目标检测模型产生的框进行过滤，从而使结果更加准确和正确的技术。它的性能超过了现有的类似方法，如NMS和soft-NMS。

用5折交叉验证
双流网络
矩形训练
PERCLOS值怎么显示？
把图像增强工作流加入算法？

The author uses ArcFace loss to measure the error of prediction. This loss was proposed for facial recognition in 2018. Other sophisticated approaches have also been published in recent years, such as [ElasticFace](https://openaccess.thecvf.com/content/CVPR2022W/Biometrics/papers/Boutros_ElasticFace_Elastic_Margin_Loss_for_Deep_Face_Recognition_CVPRW_2022_paper.pdf). author can compare the proposed loss with this approach.

[YOLOV5 模型和代码修改——针对小目标识别](https://blog.csdn.net/weixin_56184890/article/details/119840555)