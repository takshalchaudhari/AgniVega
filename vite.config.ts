// Smart Krishi-Yatra (smartkrishiyatra.noxverse.in) - Vite & TanStack Start Configuration
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start server entry to src/server.ts for SSR handling
    server: { entry: "server" },
  },
});
