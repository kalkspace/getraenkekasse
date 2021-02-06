import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  server: {
    proxy: {
      "/events": {
        target: "http://localhost:3030/",
        rewrite: (path) => path.replace(/^\/events/, ""),
      },
      "/mete-compat": {
        target: "http://localhost:3003/",
        rewrite: (path) => path.replace(/^\/mete-compat/, ""),
      },
      "/mete": {
        target: "http://localhost:8080/",
        rewrite: (path) => path.replace(/^\/mete/, ""),
      },
    },
  },
  plugins: [vue()],
});
