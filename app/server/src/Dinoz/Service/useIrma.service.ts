import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { Item, itemList } from '@dinorpg/core/models/items/ItemList.js'; // adapte si besoin
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { removeItem } from '../../Inventory/Controller/removeItem.controller.js';
import { prisma } from '../../prisma.js';
import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type UseIrmaParams = {
	id: string; // Fastify params = string
};

export async function useIrma(req: FastifyRequest<{ Params: UseIrmaParams }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('Invalid dinoz id', { statusCode: 400 });
	}

	const userId = req.user.id; // via app.authenticate

	// Check ownership
	const isOwner = await ownsDinoz(userId, dinozId);
	if (!isOwner) {
		throw new ExpectedError('Player does not own this dinoz', { statusCode: 403 });
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			remaining: true,
			fight: true,
			//gather: true,
			//followers: { select: { id: true, remaining: true, fight: true, gather: true } },
			user: {
				select: {
					id: true,
					items: true
				}
			}
		}
	});
	if (!dinoz || !dinoz.user) {
		throw new ExpectedError('No dinoz found', { statusCode: 404 });
	}

	const team = [dinoz /*, ...(dinoz.followers ?? [])*/];

	const irmaItemId = itemList[Item.POTION_IRMA].itemId;
	const irmaQuantity = dinoz.user.items?.find(i => i.itemId === irmaItemId);

	// On consomme une Irma seulement quand remaining === 0 ET (fight=false OU gather=false)
	const neededIrma = team.filter(d => d.remaining === 0 && !d.fight /*|| !d.gather*/).length;

	if (neededIrma > 0 && (!irmaQuantity || irmaQuantity.quantity < neededIrma)) {
		throw new ExpectedError('notEnoughIrma', { statusCode: 400 });
	}

	// Réactive fight/gather. Si remaining > 0, on décrémente.
	for (const dino of team.filter(d => !d.fight /*|| !d.gather*/)) {
		if (dino.remaining > 0) {
			await updateDinoz(dino.id, {
				fight: true,
				//gather: true,
				remaining: { decrement: 1 }
			});
		} else {
			await updateDinoz(dino.id, {
				fight: true
				//gather: true
			});
		}
	}

	if (neededIrma > 0) {
		await removeItem(dinoz.user.id, irmaItemId, neededIrma);
	}

	return reply.send({
		category: ItemEffect.ACTION,
		value: neededIrma
	});
}
