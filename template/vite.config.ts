import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

// Tauri 固定端口 1420；src-tauri 与 core 由 cargo 监听，不让 vite 重复监听
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: { chunkSizeWarningLimit: 2000 },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**", "**/core/**", "**/target/**"] }
  }
});
