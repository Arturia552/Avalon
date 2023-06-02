import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import theme from 'vitepress/dist/client/theme-default/index'

export default {
  ...theme,
  enhanceApp({app}) {
    app.use(ElementPlus)
  }
}