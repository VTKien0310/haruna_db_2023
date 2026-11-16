import { defineStore } from "pinia";
import { ref } from "vue";
import { DEFAULT_THEME, type ThemeId } from "../ThemeEntities";

export const useThemeStore = defineStore("theme", () => {
  const themeId = ref<ThemeId>(DEFAULT_THEME);
  return { themeId };
});
