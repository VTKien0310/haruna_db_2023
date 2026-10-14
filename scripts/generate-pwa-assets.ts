import { fileURLToPath } from "node:url";
import { generateImages } from "pwa-asset-generator";
import { THEME_OPTIONS } from "../src/modules/master/ThemeEntities.ts";

const logo = fileURLToPath(new URL("../src/assets/logo.svg", import.meta.url));
const output = fileURLToPath(new URL("../public/pwa", import.meta.url));
const options = {
  index: fileURLToPath(new URL("../index.html", import.meta.url)),
  pathOverride: "/pwa",
  // Parse the app entry as HTML so script/div tags are never self-closing.
  xhtml: false,
  // Opt in only when the local Linux environment cannot run sandboxed Chromium.
  noSandbox: process.env.PWA_ASSETS_NO_SANDBOX === "1",
};
const light = THEME_OPTIONS.find((theme) => theme.id === "haruna-light")!;
const dark = THEME_OPTIONS.find((theme) => theme.id === "haruna-dark")!;

await generateImages(logo, output, {
  ...options,
  iconOnly: true,
  favicon: true,
  type: "png",
  padding: "0",
  background: light.themeColor,
});

for (const theme of [light, dark]) {
  await generateImages(logo, output, {
    ...options,
    splashOnly: true,
    darkMode: theme.colorScheme === "dark",
    type: "jpg",
    quality: 80,
    padding: "30%",
    background: theme.themeColor,
  });
}
