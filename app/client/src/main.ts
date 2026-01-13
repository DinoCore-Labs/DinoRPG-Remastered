import './style/main.scss';

import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { plugin as VueTippy } from 'vue-tippy';

import App from './App.vue';
import { initI18n } from './i18n';
import { mixins } from './mixins/mixins';
import router from './router';
import { createToastPlugin } from './utils/toast';

const vueTippyProps = {
	directive: 'tippy',
	component: 'Tippy',
	defaultProps: {
		placement: 'bottom-start',
		followCursor: true,
		allowHTML: true,
		inlinePositioning: true,
		duration: [50, 50],
		hideOnClick: false,
		offset: [10, 20]
	}
};

const pinia = createPinia().use(piniaPersist);
const app = createApp(App);

app.use(pinia);
app.use(await initI18n());
app.use(router);
app.use(
	createToastPlugin({
		position: 'bottom',
		duration: 50000
	})
);
app.use(VueTippy, vueTippyProps);
app.mixin(mixins);

app.mount('#app');
