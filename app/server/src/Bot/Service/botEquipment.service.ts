import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { getDinozEquipItemRequest } from '../../Dinoz/Controller/getDinozEquipItem.controller.js';
import { backpackSlot } from '../../utils/dinoz/dinozFiche.mapper.js';
import { equipDinozItem } from '../../Inventory/Service/equipItem.service.js';

export async function findBotEquipCandidate(
	dinozId: number
): Promise<{ itemId: number } | null> {
	const dinoz = await getDinozEquipItemRequest(dinozId);
	if (!dinoz || !dinoz.user) return null;
	if (dinoz.items.length >= backpackSlot(dinoz.user.engineer, dinoz)) return null;

	const equipped = new Set(dinoz.items.map(item => item.itemId));

	const candidates = dinoz.user.items
		.filter(entry => entry.quantity > 0 && !equipped.has(entry.itemId))
		.map(entry => Object.values(itemList).find(item => item.itemId === entry.itemId))
		.filter(
			(item): item is NonNullable<typeof item> =>
				Boolean(item?.canBeEquipped && item.itemType !== ItemType.MAGICAL)
		);

	if (candidates.length === 0) return null;

	return {
		itemId: candidates[Math.floor(Math.random() * candidates.length)].itemId
	};
}

export async function equipBotDinoz(userId: string, dinozId: number): Promise<boolean> {
	const candidate = await findBotEquipCandidate(dinozId);
	if (!candidate) return false;

	await equipDinozItem({
		userId,
		dinozId,
		itemId: candidate.itemId,
		equip: true
	});
	return true;
}
