# centos 安装更新 git

由于 centos7 自带 git 版本比较低，无法满足部分软件如 vscode 的要求，故须手动升级到更高版本。

## 删除自带 git

```shell
yum remove git -y
```

## 安装所需软件包

```shell
yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel -y
yum install gcc perl-ExtUtils-MakeMaker -y
```

## 安装 git

```shell
cd /usr/share
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.39.3.tar.gz
tar xzf git-2.39.3.tar.gz
cd git-2.39.3/
make prefix=/usr/local/git all
make prefix=/usr/local/git install
```

## 建立软连接

```shell
cd /usr/bin
ln -s  /usr/local/git/bin/git git
# 检查版本
git --version
# 结果
git version 2.39.3
```

## linux 上传代码至 github

```shell
# 设置全局用户名和邮箱
git config --global user.name "用户名"
git config --global user.email "邮箱"

# 生成ssh密钥，一路enter
ssh-keygen -t rsa -b 4096 -C "邮箱"

# 复制公钥
cd ~/.ssh
cat id_rsa.pub
```

进入 github 官网，右上角点击头像 Settings->SSh and GPG keys -> New SSH key，把公钥复制到指定位置

```shell
# 测试github连接
ssh -T git@github.com
```
