import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Root path for Netlify
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  publicDir: "public",
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/register": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/logout": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/files": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
