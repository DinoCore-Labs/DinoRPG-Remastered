import './style/main.scss';

import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';

import App from './App.vue';
import { initI18n } from './i18n';
import router from './router';

const pinia = createPinia().use(piniaPersist);
const app = createApp(App);

app.use(pinia);
app.use(await initI18n());
app.use(router);

app.mount('#app');
