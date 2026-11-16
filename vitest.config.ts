import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envDir: false,
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "virtual:pwa-register/vue": fileURLToPath(
        new URL("./tests/fakes/PwaRegistration.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://app.test/" } },
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    maxWorkers: 2,
    env: {
      VITE_SUPABASE_API_URL: "https://supabase.invalid",
      VITE_SUPABASE_ANON_KEY: "dummy-test-key",
      VITE_BACKEND_API_URL: "https://backend.invalid/",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,vue}"],
      exclude: [
        "src/main.ts",
        "src/router.ts",
        "src/App.vue",
        "src/ports/backend/database.types.ts",
        "src/ports/backend/BackendPort.ts",
      ],
    },
  },
});
