import type { RouteRecord } from '@dinorpg/core/models/router/Router';
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';

const routes: RouteRecord[] = [
	{
		path: '/',
		name: 'HomePage',
		component: HomePage
	}
];

const router = createRouter({
	history: createWebHistory(),
	// @ts-ignore
	routes
	/*scrollBehavior(to, from, savedPosition) {
		return { top: 0 };
	}*/
});

export default router;
