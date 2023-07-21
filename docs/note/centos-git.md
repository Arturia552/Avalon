# centos安装更新git

由于centos7自带git版本比较低，无法满足部分软件如vscode的要求，故须手动升级到更高版本。

## 删除自带git
```shell
yum remove git -y
```

## 安装所需软件包

```shell
yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel -y
yum install gcc perl-ExtUtils-MakeMaker -y
```

## 安装git
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
