import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Arturia",
  description: "Avalon",
  base: "/",
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
            { text: "IDEA远程debug", link: "/note/idea-remote-debug" },
            { text: "linux安装nodejs", link: "/note/linux-node" },
            { text: 'ubuntu安装vsftp', link: "/note/vsftp"}
          ],
        },
      ],
      "/database/": [
        {
          text: "数据库",
          collapsed: false,
          items: [{ text: "mongoDB时间序列", link: "/database/mongo" }],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  lastUpdated: true, // 开启最后更新时间提示
})
