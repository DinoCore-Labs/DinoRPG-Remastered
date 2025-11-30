import './style/main.scss';

import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import ToastPlugin from 'vue-toast-notification';

import App from './App.vue';
import { initI18n } from './i18n';
import router from './router';

const vueToastProps = {
	position: 'bottom',
	duration: 10000
};

const pinia = createPinia().use(piniaPersist);
const app = createApp(App);

app.use(pinia);
app.use(await initI18n());
app.use(router);
app.use(ToastPlugin, vueToastProps);

app.mount('#app');
