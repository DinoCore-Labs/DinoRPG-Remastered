/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/main.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2025-11-16 through 2026-08-04.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import './style/main.scss';

import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import { plugin as VueTippy } from 'vue-tippy';

import App from './App.vue';
import Loading from './components/utils/Loading.vue';
import { initI18n } from './i18n';
import { mixins } from './mixins/mixins';
import router from './router';
import { clickOutside } from './utils/clickOutside';
import ConfirmPlugin from './utils/confirmPlugin';
import { createToastPlugin } from './utils/toast';
import { startVersionChecker } from './utils/versionChecker';

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
app.use(ConfirmPlugin);
app.use(
	createToastPlugin({
		position: 'bottom',
		duration: 20000
	})
);
app.use(VueTippy, vueTippyProps);
app.mixin(mixins);
app.directive('click-outside', clickOutside);
app.component('Loading', Loading);

app.mount('#app');

startVersionChecker();
