import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // add local ngrok host for dev
    allowedHosts: [
      "90ab61c6a758.ngrok-free.app",
      "https://demobot.saverr.io"
    ]
  },
}));
