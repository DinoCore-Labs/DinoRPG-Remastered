import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { prisma } from '../../prisma.js';
import { useItem } from '../../Inventory/Service/useItem.service.js';

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
			(value): value is {
				entry: { itemId: number; quantity: number };
				item: NonNullable<(typeof value)['item']>;
			} => Boolean(value.item?.effect && value.item.effect.category === ItemEffect.HEAL)
		)
		.map(({ entry, item }) => ({
			itemId: entry.itemId,
			heal: item.effect!.category === ItemEffect.HEAL ? item.effect.value : 0
		}))
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
