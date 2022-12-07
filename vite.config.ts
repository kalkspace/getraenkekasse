import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  build: {
    target: "es2020",
  },
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
      "^/mete/api/v1/users/\\d+/buy.json": {
        target: "http://127.0.0.1:5000/",
      },
      "/mete": {
        target: "http://localhost:8080/",
      },
    },
  },
  plugins: [vue()],
});
