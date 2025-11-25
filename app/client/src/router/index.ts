import type { RouteRecord } from '@dinorpg/core/models/router/Router';
import type { UserRole } from '@dinorpg/core/models/user/UserRole';
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import MainPage from '../pages/MainPage.vue';
import { userStore } from '../store/userStore';
import { is_granted } from '../utils/permission';

const routes: RouteRecord[] = [
	{
		path: '/',
		name: 'HomePage',
		component: HomePage,
		meta: { public: true }
	},
	{
		path: '/main',
		name: 'MainPage',
		component: MainPage,
		meta: { auth: true }
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

let initialized = false;

router.beforeEach(async to => {
	const user = userStore();

	// 1) Premier passage → vérifier le cookie via /me
	if (!initialized) {
		initialized = true;
	}

	// 2) Page publique → OK
	if (to.meta.public) {
		return true;
	}

	// 3) Page protégée → vérifier login
	if (to.meta.auth && !user.isLogged) {
		return { name: 'HomePage', query: { returnUrl: to.fullPath } };
	}

	// 4) Rôles (si tu l'actives)
	if (to.meta.roles && user.role) {
		const ok = to.meta.roles.some((r: UserRole) => is_granted(r, user.role!));
		if (!ok) return { name: 'HomePage' };
	}

	return true;
});

export default router;
