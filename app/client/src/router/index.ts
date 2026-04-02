import type { RouteRecord } from '@dinorpg/core/models/router/router.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import { createRouter, createWebHistory } from 'vue-router';

import AccountPage from '../pages/AccountPage.vue';
import AdminDinozPage from '../pages/Admin/AdminDinozPage.vue';
import AdminJobsPage from '../pages/Admin/AdminJobsPage.vue';
import AdminNewsEditPage from '../pages/Admin/AdminNewsEditPage.vue';
import AdminNewsPage from '../pages/Admin/AdminNewsPage.vue';
import AdminPage from '../pages/Admin/AdminPage.vue';
import AdminSecretsPage from '../pages/Admin/AdminSecretsPage.vue';
import AdminUserPage from '../pages/Admin/AdminUserPage.vue';
import DialogPage from '../pages/DialogPage.vue';
import DinozPage from '../pages/DinozPage.vue';
import FAQPage from '../pages/FAQPage.vue';
import FightPage from '../pages/FightPage.vue';
import GatherPage from '../pages/GatherPage.vue';
import HelpPage from '../pages/HelpPage.vue';
import HomePage from '../pages/HomePage.vue';
import Ingredients from '../pages/Ingredients.vue';
import Inventory from '../pages/Inventory.vue';
import LevelUpPage from '../pages/LevelUpPage.vue';
import MainPage from '../pages/MainPage.vue';
import NewsPage from '../pages/NewsPage.vue';
import RankingPage from '../pages/RankingPage.vue';
import ShopDinoz from '../pages/ShopDinoz.vue';
import ShopItems from '../pages/ShopItems.vue';
import ShopItinerant from '../pages/ShopItinerant.vue';
import { UserService } from '../services';
import { dinozStore } from '../store/dinozStore';
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
		path: '/',
		name: 'MainPage',
		component: MainPage,
		meta: { auth: true },
		children: [
			{
				path: '/news',
				name: 'NewsPage',
				component: NewsPage,
				meta: { public: true, showLeftPanel: false }
			},
			// ⭐️ PAGE COMPTE (mon compte)
			{
				path: '/user',
				name: 'MyAccount',
				component: AccountPage,
				meta: { auth: true }
			},
			// ⭐️ PAGE PROFIL PUBLIC (autre joueur)
			{
				path: '/user/:id',
				name: 'UserAccount',
				component: AccountPage,
				meta: { public: true, showLeftPanel: false }
			},
			{
				path: '/inventory',
				name: 'MyInventory',
				component: Inventory,
				meta: { auth: true }
			},
			{
				path: '/ingredients',
				name: 'MyIngredients',
				component: Ingredients,
				meta: { auth: true }
			},
			{
				path: '/dinoz/:id',
				name: 'DinozPage',
				component: DinozPage,
				meta: { auth: true }
			},
			{
				path: '/level/:id',
				name: 'Leveling',
				component: LevelUpPage,
				props: route => ({
					id: route.params.id
					//event: route.query.event,
					//eventId: route.query.eventId
				})
			},
			{
				path: '/fight/:dinozId',
				name: 'FightPage',
				component: FightPage,
				meta: { auth: true }
			},
			{
				path: '/gather/grid/:type/:dinozId',
				name: 'Gather',
				component: GatherPage,
				meta: { auth: true }
			},
			{
				path: '/dinoz/:id/dialog/:dialogId',
				name: 'DialogPage',
				component: DialogPage,
				meta: { auth: true }
			},
			{
				path: '/ranking',
				name: 'Ranking',
				component: RankingPage,
				meta: { public: true, showLeftPanel: false },
				children: [
					{
						path: 'player/:pageLoaded',
						name: 'RankingPlayers',
						component: () => import('../components/rankings/PlayerRanking.vue'),
						props: route => ({
							sort: 'classic',
							pageLoaded: Number(route.params.pageLoaded)
						}),
						meta: { public: true, showLeftPanel: false }
					},
					{
						path: 'average/:pageLoaded',
						name: 'RankingAverage',
						component: () => import('../components/rankings/PlayerRanking.vue'),
						props: route => ({
							sort: 'average',
							pageLoaded: Number(route.params.pageLoaded)
						}),
						meta: { public: true, showLeftPanel: false }
					},
					{
						path: 'completion/:pageLoaded',
						name: 'RankingCompletion',
						component: () => import('../components/rankings/CompletionRanking.vue'),
						props: route => ({
							sort: 'completion',
							pageLoaded: Number(route.params.pageLoaded)
						}),
						meta: { public: true, showLeftPanel: false }
					}
				]
			},
			{
				path: 'shop/dinoz',
				name: 'ShopDinoz',
				component: ShopDinoz,
				meta: { auth: true }
			},
			{
				path: '/shop/:name',
				name: 'ItemShopPage',
				component: ShopItems,
				meta: { auth: true }
			},
			{
				path: '/itinerantshop/:itinerantId',
				name: 'ItinerantShopPage',
				component: ShopItinerant,
				meta: { auth: true }
			},
			{
				path: '/faq',
				name: 'FAQPage',
				component: FAQPage,
				meta: { public: true, showLeftPanel: false }
			},
			{
				path: '/help',
				name: 'HelpPage',
				component: HelpPage,
				meta: { public: true, showLeftPanel: false }
			},
			{
				path: '/admin',
				name: 'Admin',
				component: AdminPage,
				meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] },
				children: [
					{
						path: '/admin/user',
						name: 'AdminUser',
						component: AdminUserPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/dinoz',
						name: 'AdminDinoz',
						component: AdminDinozPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/news',
						name: 'AdminNews',
						component: AdminNewsPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/news/create',
						name: 'AdminNewsCreate',
						component: AdminNewsEditPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/news/:id',
						name: 'AdminNewsEdit',
						component: AdminNewsEditPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/jobs',
						name: 'AdminJobs',
						component: AdminJobsPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
					},
					{
						path: '/admin/secrets',
						name: 'AdminSecrets',
						component: AdminSecretsPage,
						meta: { auth: true, roles: ['ADMIN', 'SUPER_ADMIN'] }
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
	const dinoz = dinozStore();

	// Helper: hydrate une fois si pas loggé
	const tryHydrate = async (): Promise<boolean> => {
		if (user.isLogged) return true;

		const data: UserData | null = await UserService.me().catch(() => null);
		if (!data) return false;

		user.setUser(data);
		dinoz.setDinozList(data.dinoz);
		return true;
	};

	// ✅ Pages publiques
	if (to.meta.public) {
		// si on arrive sur la home publique (ou toute page publique) et que la session est valide,
		// on redirige vers le jeu.
		const ok = await tryHydrate();
		if (ok && to.name === 'HomePage') {
			return { name: 'NewsPage' };
		}
		return true;
	}

	// ✅ Pages protégées
	if (to.meta.auth) {
		const ok = await tryHydrate();

		if (!ok) {
			user.clearUser();
			return {
				name: 'HomePage',
				query: { returnUrl: to.fullPath }
			};
		}
	}

	// ✅ Roles
	if (to.meta.roles && user.role) {
		const ok = to.meta.roles.some(r => is_granted(r, user.role!));
		if (!ok) return { name: 'NewsPage' };
	}

	return true;
});

export default router;
