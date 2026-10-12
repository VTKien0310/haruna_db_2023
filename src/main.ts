import "./main.css";

import { IonicVue } from "@ionic/vue";
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { createHarunaUI } from "@/libs/ui";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// load utc plugin for dayjs
dayjs.extend(utc);

const app = createApp(App)
  .use(createPinia())
  .use(IonicVue)
  .use(router)
  .use(createHarunaUI());

router.isReady().then((): void => {
  app.mount("#app");
});
