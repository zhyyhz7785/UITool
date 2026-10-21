import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
// 插件是给开发服务器用的普通脚本，没有类型声明。
// @ts-expect-error 开发服务器本地读写
import { linkFsPlugin } from "./scripts/link-fs-plugin.mjs";

const host = process.env.TAURI_DEV_HOST;

// @tpl 指向 template/src：设计器的预览和导出的工程用的是同一份界面代码
export default defineConfig({
  plugins: [react(), linkFsPlugin()],
  define: { "import.meta.env.VITE_UIT_DESIGNER": JSON.stringify("1") },
  clearScreen: false,
  build: { chunkSizeWarningLimit: 2000 },
  resolve: {
    alias: {
      "@tpl": fileURLToPath(new URL("./template/src", import.meta.url)),
      "hy3d-spec": fileURLToPath(new URL("./scripts/hy3d-spec.mjs", import.meta.url)),
      "hymd-spec": fileURLToPath(new URL("./scripts/hymd-spec.mjs", import.meta.url))
    },
    dedupe: ["react", "react-dom", "@tauri-apps/api"]
  },
  server: {
    port: 1430,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1431 } : undefined,
    watch: { ignored: ["**/src-tauri/**", "**/template/core/**", "**/target/**", "**/.tmp/**"] }
  }
});
