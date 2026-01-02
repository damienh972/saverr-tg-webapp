import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // add local ngrok host for dev
    allowedHosts: [
      "emelina-nonoxidating-keren.ngrok-free.dev",
      "posingly-abrogable-audry.ngrok-free.dev",
      "https://demobot.saverr.io"
    ]
  },
}));
