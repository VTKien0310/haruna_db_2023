import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { VitePWA } from "vite-plugin-pwa";
import { THEME_OPTIONS } from "./src/modules/master/ThemeEntities.ts";

const defaultThemeColor = THEME_OPTIONS[0].themeColor;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "prompt",
      devOptions: {
        enabled: false,
      },
      strategies: "generateSW",
      injectRegister: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg}"],
      },
      manifest: {
        name: "Haruna Digital Book",
        short_name: "HarunaDB",
        theme_color: defaultThemeColor,
        start_url: "/",
        display: "standalone",
        background_color: defaultThemeColor,
        icons: [
          {
            src: "pwa/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
});
