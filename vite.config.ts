import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        headers: {
          Origin: "http://localhost:3000",
        },
      },
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        headers: {
          Origin: "http://localhost:3000",
        },
      },
    },
  },
});
