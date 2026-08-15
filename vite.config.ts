// Smart Krishi-Yatra (smartkrishiyatraa.noxverse.in) - Vite & TanStack Start Configuration
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start server entry to src/server.ts for SSR handling
    server: { entry: "server" },
  },
  vite: {
    server: {
      allowedHosts: true,
      host: "0.0.0.0",
      port: 3000,
    },
    preview: {
      allowedHosts: true,
      host: "0.0.0.0",
      port: 3000,
    },
  },
});
