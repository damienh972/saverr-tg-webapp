import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "pseudogyrate-pleuritic-lesia.ngrok-free.dev",
      "https://demo_bot.saverr.io/"
    ],
  },
}));
