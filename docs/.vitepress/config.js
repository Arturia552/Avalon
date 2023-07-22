import { defineConfig } from "vitepress"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Arturia",
  description: "Avalon",
  base: "/Avalon/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "🏚️ 主页", link: "/" },
      { text: "📓 笔记", link: "/note/kkfileview" },
      { text: "🚀 数据库", link: "/database/mongo" },
    ],

    sidebar: {
      "/note/": [
        {
          text: "笔记",
          collapsed: false,
          items: [
            { text: "kkfileview改造及部署", link: "/note/kkfileview" },
            { text: "centos7升级git", link: "/note/centos-git" },
          ],
        },
      ],
      "/database/": [
        {
          text: "数据库",
          collapsed: false,
          item: [{ text: "mongo", link: "/mongo" }],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  lastUpdated: true, // 开启最后更新时间提示
})
