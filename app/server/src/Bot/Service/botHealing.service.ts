import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { BotDinozRole, BotRoleObjective } from '../../../../prisma/index.js';
import { useItem } from '../../Inventory/Service/useItem.service.js';
import { prisma } from '../../prisma.js';

export function getBotHealingThreshold(
	role: BotDinozRole | null,
	objective: BotRoleObjective | null,
	fightExperienceBonus = 0
): number {
	let threshold =
		role === BotDinozRole.FIGHTER
			? 0.3
			: role === BotDinozRole.GATHERER
				? 0.5
				: role === BotDinozRole.EXPLORER
					? 0.45
					: 0.35;

	if (objective === BotRoleObjective.GATHERER_MERCHANT || objective === BotRoleObjective.GATHERER_HARVEST) {
		threshold += 0.05;
	}
	if (objective === BotRoleObjective.EXPLORER_DISCOVERY) {
		threshold += 0.05;
	}

	if (fightExperienceBonus <= -60) {
		threshold += 0.15;
	} else if (fightExperienceBonus <= -30) {
		threshold += 0.1;
	}

	return Math.max(0.25, Math.min(0.7, threshold));
}

export async function findBestBotHealingItem(userId: string, dinozId: number): Promise<number | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			life: true,
			maxLife: true,
			user: {
				select: {
					items: {
						select: {
							itemId: true,
							quantity: true
						}
					}
				}
			}
		}
	});
	if (!dinoz || !dinoz.user) return null;

	const missingLife = Math.max(0, dinoz.maxLife - dinoz.life);
	if (missingLife <= 0) return null;

	const healingItems = dinoz.user.items
		.filter(entry => entry.quantity > 0)
		.map(entry => ({
			entry,
			item: Object.values(itemList).find(item => item.itemId === entry.itemId)
		}))
		.filter(
			(
				value
			): value is {
				entry: { itemId: number; quantity: number };
				item: NonNullable<(typeof value)['item']>;
			} => Boolean(value.item?.effect && value.item.effect.category === ItemEffect.HEAL)
		)
		.map(({ entry, item }) => {
			const effect = item.effect;
			if (!effect || effect.category !== ItemEffect.HEAL) {
				return null;
			}

			return {
				itemId: entry.itemId,
				heal: effect.value
			};
		})
		.filter(
			(
				value
			): value is {
				itemId: number;
				heal: number;
			} => value !== null
		)
		.sort((a, b) => {
			const aWaste = Math.abs(missingLife - a.heal);
			const bWaste = Math.abs(missingLife - b.heal);
			if (aWaste !== bWaste) return aWaste - bWaste;
			return a.heal - b.heal;
		});

	return healingItems[0]?.itemId ?? null;
}

export async function healBotDinoz(userId: string, dinozId: number): Promise<boolean> {
	const itemId = await findBestBotHealingItem(userId, dinozId);
	if (itemId == null) return false;

	await useItem({
		userId,
		dinozId,
		itemId
	});
	return true;
}
