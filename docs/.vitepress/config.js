import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Arturia",
  description: "Avalon",
  base: "/Avalon/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "笔记", link: "/kkfileview" },
    ],

    sidebar: [
      {
        text: "笔记",
        items: [
          { text: "kkfileview改造及部署", link: "/kkfileview" },
          { text: "centos7升级git",link:'/centos-git'}
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  lastUpdated: true,  // 开启最后更新时间提示
})
