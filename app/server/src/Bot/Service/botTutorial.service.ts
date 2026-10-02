import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import type { TutorialEvent } from '@dinorpg/core/models/tutorial/tutorial.js';

import { getItemMaxQuantity } from '../../Inventory/Service/getAllItemsData.service.js';
import { prisma } from '../../prisma.js';
import { getUserShopOneItemDataRequest } from '../../Shop/Controller/getUserShopOneItemData.controller.js';
import { purchaseItemWithGold } from '../../Shop/Controller/purchaseItemWithGold.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import {
	getCurrentTutorial,
	handleTutorialEvent,
	refreshTutorialProgress
} from '../../Tutorial/Controller/tutorial.controller.js';

export type BotTutorialPlan =
	| { type: 'event'; event: TutorialEvent }
	| { type: 'move'; placeId: PlaceEnum }
	| { type: 'dialog'; dialogId: string; preferredLinkIds?: string[] }
	| { type: 'buy_burger' }
	| { type: 'use_burger' }
	| { type: 'fight' };

const INTRO_STEPS: Record<
	number,
	{
		placeId: PlaceEnum;
		dialogId: string;
		preferredLinkIds: string[];
	}
> = {
	2: {
		placeId: PlaceEnum.ILE_WAIKIKI,
		dialogId: 'intro_waikiki',
		preferredLinkIds: ['pop', 'combat', 'papy', 'papy2']
	},
	3: {
		placeId: PlaceEnum.MARAIS_COLLANT,
		dialogId: 'intro_swamp',
		preferredLinkIds: ['baston', 'battle', 'fight', 'zenith', 'zenith2']
	},
	4: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		dialogId: 'intro_falls_bao',
		preferredLinkIds: ['shaman', 'gard', 'aura']
	},
	5: {
		placeId: PlaceEnum.CHUTES_MUTANTES,
		dialogId: 'intro_falls_taurus',
		preferredLinkIds: ['taurus', 'vade', 'demon', 'ouf', 'move']
	}
};

export async function getBotTutorialPlan(
	userId: string,
	dinozId: number
): Promise<BotTutorialPlan | null> {
	/*
	 * Certaines actions joueur (déplacement, achat, soin, mission...)
	 * satisfont des objectifs conditionnels.
	 *
	 * On rafraîchit avant de planifier afin qu'un bot existant puisse
	 * reprendre proprement son tutoriel même s'il a déjà rempli la
	 * condition lors d'une action précédente.
	 */
	await refreshTutorialProgress({
		userId,
		dinozId
	});

	const tutorial = await getCurrentTutorial(userId);
	if (!tutorial || tutorial.completed || !tutorial.objective) {
		return null;
	}

	/*
	 * Compatibilité avec les bots créés avant la prise en charge
	 * complète du tutoriel : l'ancienne implémentation validait
	 * GUIDE_MICHEL_SPOKEN directement et pouvait donc avancer le
	 * tutoriel sans créer scenario(intro)=1.
	 *
	 * Les nouveaux bots passent par le vrai dialogue "guide".
	 * Ce bloc ne sert qu'à réparer cet ancien état incohérent.
	 */
	if (!['dinoz', 'speak'].includes(tutorial.objective.id)) {
		await prisma.userScenario.upsert({
			where: {
				scenarioKey_userId: {
					userId,
					scenarioKey: 'intro'
				}
			},
			create: {
				userId,
				scenarioKey: 'intro',
				progression: 1
			},
			update: {}
		});
	}

	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			placeId: true,
			life: true,
			maxLife: true,
			user: {
				select: {
					items: {
						where: {
							itemId: itemList[Item.CLOUD_BURGER].itemId
						},
						select: {
							quantity: true
						}
					}
				}
			}
		}
	});
	if (!dinoz) return null;

	switch (tutorial.objective.id) {
		case 'dinoz':
			return {
				type: 'event',
				event: 'DINOZ_ADOPTED'
			};

		case 'speak':
			return {
				type: 'dialog',
				dialogId: 'guide',
				preferredLinkIds: ['pub']
			};

		case 'move':
			return {
				type: 'move',
				placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE
			};

		case 'port':
			return {
				type: 'move',
				placeId: PlaceEnum.PORT_DE_PRECHE
			};

		case 'pub':
			if (dinoz.placeId !== PlaceEnum.PORT_DE_PRECHE) {
				return {
					type: 'move',
					placeId: PlaceEnum.PORT_DE_PRECHE
				};
			}
			return {
				type: 'dialog',
				dialogId: 'intro_port',
				preferredLinkIds: ['poivrot', 'bao', 'guerre', 'boit', 'glop', 'raison', 'gloups', 'explo', 'fight', 'fin']
			};

		case 'baobob': {
			const intro = await prisma.userScenario.findUnique({
				where: {
					scenarioKey_userId: {
						userId,
						scenarioKey: 'intro'
					}
				},
				select: {
					progression: true
				}
			});
			const progression = intro?.progression ?? 1;
			const step = INTRO_STEPS[progression];

			if (!step) {
				if (progression < 2) {
					if (dinoz.placeId !== PlaceEnum.PORT_DE_PRECHE) {
						return {
							type: 'move',
							placeId: PlaceEnum.PORT_DE_PRECHE
						};
					}
					return {
						type: 'dialog',
						dialogId: 'intro_port',
						preferredLinkIds: ['poivrot', 'bao', 'guerre', 'boit', 'glop', 'raison', 'gloups', 'explo', 'fight', 'fin']
					};
				}
				return null;
			}

			if (dinoz.placeId !== step.placeId) {
				return {
					type: 'move',
					placeId: step.placeId
				};
			}
			return {
				type: 'dialog',
				dialogId: step.dialogId,
				preferredLinkIds: step.preferredLinkIds
			};
		}

		case 'papy':
			if (dinoz.placeId !== PlaceEnum.PAPY_JOE) {
				return {
					type: 'move',
					placeId: PlaceEnum.PAPY_JOE
				};
			}
			return {
				type: 'dialog',
				dialogId: 'papy_joe'
			};

		case 'shop':
			return {
				type: 'buy_burger'
			};

		case 'burger': {
			const burgerQuantity = dinoz.user?.items[0]?.quantity ?? 0;
			if (burgerQuantity <= 0) {
				return {
					type: 'buy_burger'
				};
			}
			if (dinoz.life < dinoz.maxLife) {
				return {
					type: 'use_burger'
				};
			}
			return {
				type: 'fight'
			};
		}

		case 'clan':
			return {
				type: 'event',
				event: 'CLAN_PAGE_VISITED'
			};

		case 'user':
			return {
				type: 'event',
				event: 'ACCOUNT_PAGE_VISITED'
			};

		case 'end':
			return {
				type: 'event',
				event: 'TUTORIAL_FINISHED'
			};

		default:
			return null;
	}
}

export async function executeBotTutorialEvent(
	userId: string,
	dinozId: number,
	event: TutorialEvent
) {
	return handleTutorialEvent({
		userId,
		dinozId,
		event
	});
}

export async function buyBotTutorialBurger(
	userId: string,
	dinozId: number
): Promise<boolean> {
	const itemId = itemList[Item.CLOUD_BURGER].itemId;
	const playerShopData = await getUserShopOneItemDataRequest(userId, itemId);
	if (!playerShopData) return false;

	const shop = shopListV2.FLYING_SHOP;
	const sold = shop.listItemsSold.find(entry => entry.id === itemId);
	if (!sold) return false;

	const item = structuredClone(itemList[Item.CLOUD_BURGER]);
	item.price =
		playerShopData.merchant
			? Math.round(sold.price * 0.9)
			: sold.price;
	item.maxQuantity = getItemMaxQuantity(playerShopData, item);

	await purchaseItemWithGold({
		userId,
		itemId,
		quantity: 1,
		unitPrice: item.price,
		maxQuantity: item.maxQuantity
	});
	await incrementUserStat(StatTracking.S_BUYER, userId, 1);
	await refreshTutorialProgress({
		userId,
		dinozId
	});
	return true;
}
