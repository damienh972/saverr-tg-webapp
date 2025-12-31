import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // add local ngrok host for dev
    allowedHosts: [
      "posingly-abrogable-audry.ngrok-free.dev",
      "https://demobot.saverr.io"
    ]
  },
}));
