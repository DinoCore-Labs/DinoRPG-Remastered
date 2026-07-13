import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import type { RouteRecord } from '@dinorpg/core/models/router/router.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import { createRouter, createWebHistory } from 'vue-router';

import AccountPage from '../pages/AccountPage.vue';
import AdminDinozPage from '../pages/Admin/AdminDinozPage.vue';
import AdminForcebrutPage from '../pages/Admin/AdminForcebrutPage.vue';
import AdminJobsPage from '../pages/Admin/AdminJobsPage.vue';
import AdminLogsPage from '../pages/Admin/AdminLogsPage.vue';
import AdminNewsEditPage from '../pages/Admin/AdminNewsEditPage.vue';
import AdminNewsPage from '../pages/Admin/AdminNewsPage.vue';
import AdminPage from '../pages/Admin/AdminPage.vue';
import AdminSecretsPage from '../pages/Admin/AdminSecretsPage.vue';
import AdminUserPage from '../pages/Admin/AdminUserPage.vue';
import BankPage from '../pages/BankPage.vue';
import ClanList from '../pages/Clan/ClanList.vue';
import createClan from '../pages/Clan/CreateClan.vue';
import DialogPage from '../pages/DialogPage.vue';
import DinozPage from '../pages/DinozPage.vue';
import FAQPage from '../pages/FAQPage.vue';
import FightPage from '../pages/FightPage.vue';
import ForcebrutPage from '../pages/ForcebrutPage.vue';
import GatherPage from '../pages/GatherPage.vue';
import HelpPage from '../pages/HelpPage.vue';
import HomePage from '../pages/HomePage.vue';
import Ingredients from '../pages/Ingredients.vue';
import Inventory from '../pages/Inventory.vue';
import LegalNoticePage from '../pages/LegalNoticePage.vue';
import LevelUpPage from '../pages/LevelUpPage.vue';
import MainPage from '../pages/MainPage.vue';
import ManageDinoz from '../pages/ManageDinoz.vue';
import MarketPage from '../pages/MarketPage.vue';
import MissionsPage from '../pages/MissionsPage.vue';
import NewsPage from '../pages/NewsPage.vue';
import RankingPage from '../pages/RankingPage.vue';
import RulesPage from '../pages/RulesPage.vue';
import ShopDinoz from '../pages/ShopDinoz.vue';
import ShopItems from '../pages/ShopItems.vue';
import ShopItinerant from '../pages/ShopItinerant.vue';
import SkillTreesPage from '../pages/SkillTreesPage.vue';
import TrainingCenterPage from '../pages/TrainingCenterPage.vue';
import { UserService } from '../services/user.service.js';
import { dinozStore } from '../store/dinozStore';
import { userStore } from '../store/userStore';
import { clearClientSession, isLogoutSessionInProgress } from '../utils/clearSession';
import { is_granted } from '../utils/permission';
import { isMobileViewport, requireOwnedDinozByParam } from './helper';

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
			{
				path: '/rules',
				name: 'RulesPage',
				component: RulesPage,
				meta: {
					public: true,
					showLeftPanel: false,
					rulesExempt: true
				}
			},
			{
				path: '/legal-notices',
				name: 'LegalNoticesPage',
				component: LegalNoticePage,
				meta: {
					public: true,
					showLeftPanel: false,
					rulesExempt: true
				}
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
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('id')
			},
			{
				path: '/level/:id',
				name: 'Leveling',
				component: LevelUpPage,
				props: route => ({
					id: route.params.id
				})
			},
			{
				path: '/fight/:dinozId',
				name: 'FightPage',
				component: FightPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('dinozId')
			},
			{
				path: '/gather/grid/:type/:dinozId',
				name: 'Gather',
				component: GatherPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('dinozId')
			},
			{
				path: '/dinoz/:id/dialog/:dialogId',
				name: 'DialogPage',
				component: DialogPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('id')
			},
			{
				path: '/dinoz/:id/missions/:group',
				name: 'DinozMissions',
				component: MissionsPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('id')
			},
			{
				path: '/dinoz/:id/training-center',
				name: 'TrainingCenterPage',
				component: TrainingCenterPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('id')
			},
			{
				path: '/dinoz/:id/forcebrut',
				name: 'ForcebrutPage',
				component: ForcebrutPage,
				meta: { auth: true },
				beforeEnter: requireOwnedDinozByParam('id')
			},
			{
				path: '/manage-dinoz',
				name: 'ManageDinoz',
				component: ManageDinoz,
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
					},
					{
						path: 'clans/:pageLoaded',
						name: 'RankingClans',
						component: () => import('../components/rankings/ClanRanking.vue'),
						props: route => ({
							pageLoaded: Number(route.params.pageLoaded)
						}),
						meta: { public: true, showLeftPanel: false }
					},
					{
						path: 'treasure/:pageLoaded',
						name: 'RankingTreasure',
						component: () => import('../components/rankings/ClanTreasureRanking.vue'),
						props: route => ({
							pageLoaded: Number(route.params.pageLoaded)
						}),
						meta: { public: true, showLeftPanel: false }
					}
				]
			},
			{
				path: '/skills',
				name: 'SkillTreesPage',
				component: SkillTreesPage,
				meta: { auth: true },
				beforeEnter: () => {
					const user = userStore();
					if (!user.rewards.includes(Reward.PAC)) {
						return { name: 'NewsPage' };
					}
				}
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
				path: '/bank',
				name: 'BankOfDinoland',
				component: BankPage,
				meta: { auth: true }
			},
			{
				path: '/market/:tab?',
				name: 'MarketPage',
				component: MarketPage,
				meta: { auth: true }
			},
			{
				path: '/clan/:id',
				name: 'clan',
				component: () => import('../pages/Clan/Clan.vue'),
				meta: { auth: true },
				children: [
					{
						path: '',
						name: 'Clan',
						component: () => import('../components/clan/ClanPages.vue'),
						meta: { auth: true }
					},
					{
						path: 'page',
						name: 'ClanPages',
						component: () => import('../components/clan/ClanPages.vue'),
						meta: { auth: true },
						children: [
							{
								path: '',
								name: 'ClanHomePage',
								component: () => import('../components/clan/ClanPage.vue'),
								meta: { auth: true }
							},
							{
								path: ':pageId',
								name: 'ClanPage',
								component: () => import('../components/clan/ClanPage.vue'),
								meta: { auth: true }
							}
						]
					},
					{
						path: 'createPage',
						name: 'ClanCreatePage',
						component: () => import('../components/clan/ClanCreatePage.vue'),
						meta: { auth: true }
					},
					{
						path: 'editPage/:pageId',
						name: 'ClanEditPage',
						component: () => import('../components/clan/ClanCreatePage.vue'),
						meta: { auth: true }
					},
					{
						path: 'members',
						name: 'ClanMembers',
						component: () => import('../components/clan/ClanMembers.vue'),
						meta: { auth: true }
					},
					{
						path: 'member/:memberId',
						name: 'ClanMemberEdit',
						component: () => import('../components/clan/ClanMemberEdit.vue'),
						meta: { auth: true }
					},
					{
						path: 'treasure',
						name: 'ClanTreasure',
						component: () => import('../components/clan/ClanTreasure.vue'),
						meta: { auth: true }
					},
					{
						path: 'discussion',
						name: 'ClanDiscussion',
						component: () => import('../components/clan/ClanDiscussion.vue'),
						meta: { auth: true }
					},
					{
						path: 'history',
						name: 'ClanHistory',
						component: () => import('../components/clan/ClanHistory.vue'),
						meta: { auth: true }
					},
					{
						path: 'parameters',
						name: 'ClanParameters',
						component: () => import('../components/clan/ClanParameters.vue'),
						meta: { auth: true }
					}
				]
			},
			{
				path: '/createclan',
				name: 'CreateClan',
				component: createClan,
				meta: { auth: true }
			},
			{
				path: '/clans',
				name: 'clansList',
				component: ClanList,
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
						path: '/admin/forcebrut',
						name: 'AdminForcebrut',
						component: AdminForcebrutPage,
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
						path: '/admin/logs',
						name: 'AdminLogs',
						component: AdminLogsPage,
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
	routes,
	scrollBehavior(_to, _from, savedPosition) {
		if (!isMobileViewport()) {
			return savedPosition ?? false;
		}
		return {
			top: 0,
			left: 0,
			behavior: 'auto'
		};
	}
});

let sessionHydrated = false;

router.beforeEach(async to => {
	const user = userStore();
	const dinoz = dinozStore();
	if (isLogoutSessionInProgress()) {
		clearClientSession();
		if (to.meta.auth) {
			return { name: 'HomePage' };
		}
		return true;
	}
	// Helper: hydrate une fois si pas loggé
	const tryHydrate = async (force = false): Promise<boolean> => {
		if (!force && sessionHydrated && user.isLogged) return true;
		const data: UserData | null = await UserService.me({ silent: true }).catch(() => null);
		if (!data || isLogoutSessionInProgress()) {
			clearClientSession();
			return false;
		}
		sessionHydrated = true;
		user.setUser(data);
		dinoz.setDinozList(data.dinoz);

		return true;
	};
	const getRulesRedirect = () => {
		if (!user.mustAcceptGameRules || to.meta.rulesExempt) {
			return null;
		}
		return {
			name: 'RulesPage',
			query: {
				redirect: to.fullPath
			}
		};
	};
	// ✅ Pages publiques
	if (to.meta.public) {
		// si on arrive sur la home publique (ou toute page publique) et que la session est valide,
		// on redirige vers le jeu.
		const ok = await tryHydrate();
		if (ok) {
			const rulesRedirect = getRulesRedirect();
			if (rulesRedirect) {
				return rulesRedirect;
			}
			if (to.name === 'HomePage') {
				return { name: 'NewsPage' };
			}
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
		const rulesRedirect = getRulesRedirect();
		if (rulesRedirect) {
			return rulesRedirect;
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
