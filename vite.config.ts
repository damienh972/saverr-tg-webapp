import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }): UserConfig => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "posingly-abrogable-audry.ngrok-free.dev",
    ],
  },
}));
