import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "66e444c4ed5e.ngrok-free.app",
      "https://demo_bot.saverr.io/"
    ],
  },
}));
