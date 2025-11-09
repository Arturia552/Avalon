import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Arturia",
  description: "Avalon",
  base: "/",
  themeConfig: {
    nav: [
      { text: "🏚️ 主页", link: "/" },
      { text: "📓 笔记", link: "/note/kkfileview" },
      { text: "🚀 数据库", link: "/database/闭包表" },
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
            { text: "ubuntu安装vsftp", link: "/note/vsftp" },
          ],
        },
      ],
      "/database/": [
        {
          text: "数据库",
          collapsed: false,
          items: [
            {
              text: "物化路径权限模型",
              link: "/database/ruoyi物化路径权限模型",
            },
             {
              text: "闭包表权限模型",
              link: "/database/闭包表",
            },
            { text: "IotDB连续查询统计实践", link: "/database/iotdb连续查询统计方案" },
            { text: "时序数据库时区设计", link: "/database/时序数据库时区设计" }
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
  lastUpdated: true, // 开启最后更新时间提示
});
