import type { RouteRecord } from '@dinorpg/core/models/router/router.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import MainPage from '../pages/MainPage.vue';
import RankingPage from '../pages/RankingPage.vue';
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
		path: '/game',
		name: 'MainPage',
		component: MainPage,
		meta: { auth: true },
		children: [
			{
				path: '/ranking',
				name: 'Ranking',
				component: RankingPage,
				children: [
					{
						path: 'player/:pageLoaded',
						name: 'RankingPlayers',
						component: () => import('../components/rankings/PlayerRanking.vue'),
						props: route => ({
							sort: 'classic',
							pageLoaded: Number(route.params.pageLoaded)
						})
					},
					{
						path: 'average/:pageLoaded',
						name: 'RankingAverage',
						component: () => import('../components/rankings/PlayerRanking.vue'),
						props: route => ({
							sort: 'average',
							pageLoaded: Number(route.params.pageLoaded)
						})
					}
				]
			}
		]
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
			const data: UserData = await UserService.me().catch(() => null);

			if (data) {
				user.setUser(data);
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
