# linux安装nodejs

## 下载安装包
```shell
cd /opt
wget https://nodejs.org/dist/v16.14.2/node-v16.14.2-linux-x64.tar.xz
```

## 建立软连接
```shell
tar -xvf node-v16.14.2-linux-x64.tar.gz -C /usr/local
cd /usr/local
mv node-v16.14.2-linux-x64.tar.gz/ nodejs
ln -s /usr/local/nodejs/bin/node /usr/local/bin
ln -s /usr/local/nodejs/bin/npm /usr/local/bin
```

## 设置国内仓库
```shell
npm config set registry http://registry.npmmirror.com
```

## 安装pnpm
```shell
npm installl -g pnpm
pnpm config set registry https://registry.npmmirror.com/
```