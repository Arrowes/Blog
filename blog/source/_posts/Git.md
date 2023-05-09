---
title: Git：github工作流
date: 2022-11-29 15:00:30
tags:
- 技术
---
[十分钟学会正确的github工作流，和开源作者们使用同一套流程](https://www.bilibili.com/video/BV19e4y1q7JJ/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=b530b63b4657d68926b54a618d047d04)

## 主要指令

1.``git clone <X>`` // 到本地
2.``git checkout -b xxx`` 切换至新分支xxx，相当于复制了remote的仓库到本地的xxx分支上
3.修改或者添加本地代码（部署在硬盘的源文件上）
4.``git diff`` 查看自己对代码做出的改变
5.``git add`` 上传更新后的代码至暂存区
6.``git commit`` 可以将暂存区里更新后的代码更新到本地git
7.``git push origin xxx`` 将本地的xxxgit分支上传至github上的git

如果在写自己的代码过程中发现远端GitHub上代码出现改变
1.``git checkout main`` 切换回main分支
2.``git pull origin master(main)`` 将远端修改过的代码再更新到本地
3.``git checkout xxx`` 回到xxx分支
4.``git rebase main`` 我在xxx分支上，先把main移过来，然后根据我的commit来修改成新的内容
（中途可能会出现，rebase conflict --> 手动选择保留哪段代码）
5.``git push -f origin xxx`` 把rebase后并且更新过的代码再push到远端github上
（-f --> 强行）
6.原项目主人采用pull request 中的 squash and merge 合并所有不同的commit

远端完成更新后
1.``git branch -d xxx`` 删除本地的git分支
2.``git pull origin master`` 再把远端的最新代码拉至本地

## 详细状态过程
``git clone <https://github.com/example/example.git> ``
> 状态
•	Remote git repo 的状态: main(master) init
•	本地 git repo 的状态: main(master) init
•	本地磁盘存储文件的状态: main(master) init

准备在本地修改代码, 先建立一个新的 branch 
``git checkout -b my-feature``
> 状态
•	remote: 
    main(master) init
•	local: 
    main(master) init
    my-feature init
•	Disk: 
    my-feature init

对本地代码做出修改, ``git diff`` 显示变动
当我们确认好修改的文件, 准备把文件告知 local git 的时候 ``git add <changed_file>``, 此时 local git 会把这些文件放到暂存区
使用 ``git commit`` 把所有的修改真正的提交到 local git 
> 状态
•	remote: 
	main(master): Init
•	local: 
	main(master): Init
	my-feature: Init --> f-commit
•	Disk: 
	my-feature: Init --> f-commit

我们需要把 local git 的变化告知 remote git 
``git push origin my-feature ``
这个命令结束之后, remote git 会多出来一个 branch 
> 状态
•	remote: 
	main(master): Init
	my-feature: Init --> f-commit
•	local: 
	main(master): Init
	my-feature: Init --> f-commit
•	Disk: 
	my-feature: Init --> f-commit

紧接着我们会遇到非常常见的情况: 在我们修改本地代码的时候, remote git 也发生了更新, 此时当然是要测试我们刚在做的 feature 在新的 update 下能不能正常运行 
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	local: 
	main(master): Init
	my-feature: Init --> f-commit
•	Disk: 
	my-feature: Init --> f-commit

首先要 local git 切换回 main 
``git checkout main``
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	local: 
	main(master): Init
	my-feature: Init --> f-commit
•	Disk: 
	main(master): Init

``git pull origin master`` 把 remote git 的变化同步到 local git 以及 disk 
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	local: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	Disk: 
	main(master): Init --> update

回到 my-feature 分支 ``git checkout my-feature``
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	local: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	Disk: 
	my-feature: Init --> f-commit

``git rebase main`` 把 my-feature 的修改先放在一边, 然后把 main 的修改同步到 my-feature, 如果有冲突, 需要先手动去解决冲突 
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> f-commit
•	local: 
	main(master): Init --> update
	my-feature: Init --> update --> f-commit
•	Disk: 
	my-feature: Init --> update --> f-commit

更新完 my-feature 之后, 需要把 local git 的 my-feature 分支同步到 remote git 的 my-feature 分支 
``git push -f origin my-feature``
> 状态
•	remote: 
	main(master): Init --> update
	my-feature: Init --> update --> f-commit
•	local: 
	main(master): Init --> update
	my-feature: Init --> update --> f-commit
•	Disk: 
	my-feature: Init --> update --> f-commit

此时需要把我们更新的代码合并到 main branch 上, 这个过程就是 pull request, 在 main 分支的维护者, 审查完 my-feature 的代码后, 进行一个 Squash and merge 操作.
•	Squash and merge 把一个分支上面的所有改变, 合并成一个改变, 然后把这个 commit 放到 main branch
> 状态 
•	remote: 
	main(master): Init --> update --> update2
	my-feature: Init --> update --> f-commit
•	local: 
	main(master): Init --> update
	my-feature: Init --> update --> f-commit
•	Disk: 
	my-feature: Init --> update --> f-commit

一般情况下, main branch 的维护者会在 merge 完这个分支之后, 把这个分支删除掉 delete branch 此时在本地, ``git checkout main``
> 状态
•	remote: 
	main(master): Init --> update --> update2
•	local: 
	main(master): Init --> update
	my-feature: Init --> update --> f-commit
•	Disk: 
	main(master): Init --> update

然后使用, ``git branch -D my-feature`` 删除 local git 的 my-feature 
> 状态
•	remote: 
	main(master): Init --> update --> update2
•	local: 
	main(master): Init --> update
•	Disk: 
	main(master): Init --> update

最后, git pull origin master
> 状态
•	remote: 
	main(master): Init --> update --> update2
•	local: 
	main(master): Init --> update --> update2
•	Disk: 
	main(master): Init --> update --> update2