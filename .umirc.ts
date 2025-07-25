import { defineConfig } from "@umijs/max";

export default defineConfig({
    antd: {},
    access: {},
    model: {},
    initialState: {},
    request: {},
    layout: {
        title: "SQL Copilot",
    },
    routes: [
        {
            path: "/",
            redirect: "/home",
        },
        {
            name: "SQL Editor",
            path: "/home",
            icon: "icon-htmlbianjiqi",
            component: "./Home",
        },
        // 数据源管理
        {
            name: "数据源管理",
            path: "/DataSource",
            icon: "icon-datafull",
            component: "./DataSource",
        },
        // 独立式 Copilot
        {
            name: "Copilot",
            path: "/Copilot",
            icon: "Discord",
            component: "./Copilot",
        },
        // 助手式 Copilot
        {
            name: "Helper",
            path: "/Helper",
            icon: "Slack",
            component: "./Helper",
        },
        {
            name: "权限演示",
            path: "/access",
            icon: "Calendar",
            component: "./Access",
        },
    ],

    npmClient: "yarn",
    tailwindcss: {},
});
