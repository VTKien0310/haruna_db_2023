import './main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import {createVuestic} from "vuestic-ui";

createApp(App)
    .use(createPinia())
    .use(router)
    .use(createVuestic())
    .mount('#app')
