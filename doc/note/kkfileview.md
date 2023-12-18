# kkfileview改造及部署

## 拉取源码

```shell
git clone https://gitee.com/kekingcn/file-online-preview.git
```

## 改造代码

项目目录下查找文件src/main/resources/static/pdfjs/web/viewer.js


```js
 
downloadOrSave(options) {
  if (this.pdfDocument?.annotationStorage.size > 0) {     // [!code --]
    this.save(options);   // [!code --]
  } else {   // [!code --]
    this.download(options);   // [!code --]
  }   // [!code --]

  return null // [!code ++]
},

```
::: tip
可根据"downloadOrSave"全局搜索找到该代码块
:::

## 编译打包、镜像

maven打包，结果生成了target文件夹里面的kkFileView-4.4.0-SNAPSHOT.tar.gz
```shell
mvn clean package -DskipTests
```
编写dockerfile文件
```dockerfile
FROM keking/kkfileview-jdk:4.3.0
ADD kkFileView-4.4.0-SNAPSHOT.tar.gz /opt/ 
ENV KKFILEVIEW_BIN_FOLDER /opt/kkFileView-4.4.0-SNAPSHOT/bin
ENTRYPOINT ["java","-Dfile.encoding=UTF-8","-Dspring.config.location=/opt/kkFileView-4.4.0-SNAPSHOT/config/application.properties","-jar","/opt/kkFileView-4.4.0-SNAPSHOT/bin/kkFileView-4.4.0-SNAPSHOT.jar"]
```
在linux环境中将上述两个文件放在同一目录，运行以下命令构造docker镜像
```shell
docker build -t  kkfw:1.0 . 
```
运行容器
```shell
docker run -d --name kkfileview -v /docker/kkfile/application.properties:/opt/kkFileView-4.4.0-SNAPSHOT/config/application.properties  -p 8012:8012 kkfw:1.0 
```
通过ip:8012访问服务


