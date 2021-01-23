import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  server: {
    proxy: {
      "/mete": {
        target: "http://localhost:8080/",
        rewrite: (path) => path.replace(/^\/mete/, ""),
      },
    },
  },
  plugins: [vue()],
});
