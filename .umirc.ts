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
            name: "Copilot",
            path: "/home",
            icon: "Dashboard",
            component: "./Home",
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
