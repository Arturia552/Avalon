# kkfileview改造及部署

## 拉取源码

```shell
git clone https://gitee.com/kekingcn/file-online-preview.git
```

## 改造代码

项目目录下查找文件src/main/resources/static/pdfjs/web/viewer.js


```js
downloadOrSave(options) {
  if (this.pdfDocument?.annotationStorage.size > 0) {
    this.save(options);
  } else {
    this.download(options);
  }
},

```
::: tip
可根据"downloadOrSave"全局搜索找到该代码块
:::


