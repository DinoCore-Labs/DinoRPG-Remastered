import { type DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
//import { UnavailableReason } from '@dinorpg/core/models/enums/UnavailableReason.js';
import { type Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyRequest } from 'fastify';

import { getDinozEquipItemRequest } from '../../Dinoz/Controller/getDinozEquipItem.controller.js';
import { backpackSlot } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getItemMaxQuantity } from '../../utils/user/getItemMaxQuantity.js';
import { addItemToInventory } from '../Controller/addItem.controller.js';
import { addItemToDinoz } from '../Controller/addItemToDinoz.controller.js';
import { removeItem } from '../Controller/removeItem.controller.js';
import { removeItemFromDinoz } from '../Controller/removeItemFromDinoz.controller.js';

type EquipItemParams = {
	dinozId: string;
};

type EquipItemBody = {
	itemId: number;
	equip: boolean;
};

export async function equipItem(
	req: FastifyRequest<{ Params: EquipItemParams; Body: EquipItemBody }>
): Promise<DinozItems[]> {
	const dinozId = Number(req.params.dinozId);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}

	const authed = req.user;

	const dinoz = await getDinozEquipItemRequest(dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`);
	}

	/*if (dinoz.unavailableReason === UnavailableReason.selling) {
		throw new ExpectedError(translate(`UnavailableReason.${dinoz.unavailableReason}`, authed));
	}*/

	const itemId = Number(req.body.itemId);
	const equip = Boolean(req.body.equip);

	const itemToEquip = Object.values(itemList).find(i => i.itemId === itemId);

	if (!dinoz.user || dinoz.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	if (!itemToEquip) {
		throw new ExpectedError(`This item doesn't exist`);
	}

	if (!itemToEquip.canBeEquipped) {
		throw new ExpectedError(`Item n°${itemToEquip.itemId} cannot be equiped`);
	}

	const playerItemQuantity = dinoz.user.items.find(i => i.itemId === itemId)?.quantity ?? 0;

	if (playerItemQuantity === 0 && equip) {
		throw new ExpectedError(`You don't have enought ${itemToEquip.itemId}`);
	}

	// Limite objets magiques
	if (equip && itemToEquip.itemType === ItemType.MAGICAL) {
		let magicalItemsEquipped = 0;

		for (const it of dinoz.items) {
			const fiche = itemList[it.itemId as Item];
			if (fiche?.itemType === ItemType.MAGICAL) magicalItemsEquipped++;
		}

		const magicalItemsLimit = dinoz.skills.some(s => s.skillId === Skill.NAPOMAGICIEN) ? 2 : 1;

		if (magicalItemsEquipped >= magicalItemsLimit) {
			throw new ExpectedError('tooManyMagicItemEquiped');
		}
	}

	// Sac plein
	if (equip && backpackSlot(dinoz.user.engineer, dinoz) <= dinoz.items.length) {
		throw new ExpectedError('backpackFull', { params: { dinozId } });
	}

	const dinozItem = dinoz.items.find(i => i.itemId === itemId);

	if (!dinozItem && !equip) {
		throw new ExpectedError(`This dinoz don't have this item equiped`);
	}

	if (equip) {
		await removeItem(dinoz.user.id, itemToEquip.itemId, 1);
		dinoz.items.push(await addItemToDinoz(dinoz.id, itemToEquip.itemId));
	} else {
		if (!dinozItem) throw new ExpectedError(`This dinoz doesn't have this item equiped`);

		const itemMaxQuantity = getItemMaxQuantity(dinoz.user, itemToEquip);
		if (playerItemQuantity >= itemMaxQuantity) {
			throw new ExpectedError('maxQuantityInventory');
		}

		await removeItemFromDinoz(dinoz.id, dinozItem.itemId);
		await addItemToInventory(dinoz.user.id, itemToEquip.itemId, 1);

		const itemIndex = dinoz.items.findIndex(i => i.id === dinozItem.id);
		if (itemIndex >= 0) dinoz.items.splice(itemIndex, 1);
	}

	return dinoz.items.map(i => ({ itemId: i.itemId }));
}
