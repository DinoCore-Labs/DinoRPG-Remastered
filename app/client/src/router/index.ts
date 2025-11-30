import type { RouteRecord } from '@dinorpg/core/models/router/Router';
import type { UserRole } from '@dinorpg/core/models/user/UserRole';
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import MainPage from '../pages/MainPage.vue';
import { UserService } from '../services';
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

router.beforeEach(async to => {
	const user = userStore();

	// page publique -> OK
	if (to.meta.public) {
		return true;
	}

	// page protégée -> si pas loggé, tenter /me
	if (to.meta.auth) {
		if (!user.isLogged) {
			// On tente de récupérer les données utilisateur
			const data = await UserService.me().catch(() => null);

			if (data) {
				user.setUser(data.id, data.name, data.role);
			} else {
				user.clearUser();
				return {
					name: 'HomePage',
					query: { returnUrl: to.fullPath }
				};
			}
		}
	}

	// Roles
	if (to.meta.roles && user.role) {
		const ok = to.meta.roles.some(r => is_granted(r, user.role!));
		if (!ok) return { name: 'HomePage' };
	}

	return true;
});

export default router;
