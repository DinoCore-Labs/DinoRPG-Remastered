import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { ShopFiche } from '@dinorpg/core/models/shop/shopFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';

export async function checkShopCondition(shop: ShopFiche, userId: string): Promise<void> {
	if (!shop.condition) {
		return;
	}
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true,
			leader: true,
			messie: true,
			items: {
				select: {
					itemId: true,
					quantity: true
				}
			},
			rewards: {
				select: {
					rewardId: true
				}
			},
			scenarios: {
				select: {
					scenarioKey: true,
					progression: true,
					tracking: true,
					updatedAt: true
				}
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			ranking: {
				select: {
					dinozCount: true,
					points: true
				}
			},
			dinoz: {
				select: {
					id: true,
					level: true,
					life: true,
					placeId: true,
					raceId: true,
					status: {
						select: {
							statusId: true
						}
					},
					items: {
						select: {
							itemId: true
						}
					},
					skills: {
						where: {
							state: true
						},
						select: {
							skillId: true
						}
					},
					missions: true
				}
			}
		}
	});
	if (!user) {
		throw new ExpectedError('userNotFound');
	}
	const dinozAtShop = user.dinoz.filter(dinoz => shop.placeId === PlaceEnum.ANYWHERE || dinoz.placeId === shop.placeId);
	const hasAccess = dinozAtShop.some(dinoz => {
		const context = buildConditionContext(user, dinoz.id, defaultConditionKeyMaps);
		return checkCondition(shop.condition, context);
	});
	if (!hasAccess) {
		throw new ExpectedError('Shop access conditions are not satisfied');
	}
}
