import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { incrementUserStat } from '../../Stats/stats.service.js';
import { getDinozFicheLiteRequest } from '../Controller/getDinozFiche.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function resurrectDinoz(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	const user = req.user;

	if (!user) {
		throw new ExpectedError('userNotFound');
	}

	const dinozId = +req.params.id;

	// Retrieve dinoz from id
	const dinozData = await getDinozFicheLiteRequest(dinozId);

	if (!dinozData) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	// Check ownership (user au lieu de player)
	if (!dinozData.user || dinozData.user.id !== user.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to user.`);
	}

	if (dinozData.life > 0) {
		throw new ExpectedError(`${dinozData.name} is not dead`);
	}

	await updateDinoz(dinozId, {
		life: 1,
		experience: Math.round(dinozData.experience / 2),
		placeId: PlaceEnum.DINOVILLE,
		leader: { disconnect: true }
	});

	if (dinozData.followers.length > 0) {
		for (const d of dinozData.followers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
	}

	//const starQuest = dinozData.user.quests.find(q => q.questId === Scenario.STAR && q.progression === 7);

	/*if (starQuest && dinozData.placeId === PlaceEnum.JUNGLE_SAUVAGE) {
		await updateQuest(dinozData.user.id, Scenario.STAR, 8);
		await increaseItemQuantity(dinozData.user.id, itemList[Item.MAGIC_STAR].itemId, 1);

		return {
			category: ItemEffect.QUEST,
			value: 'resurrect_star_found'
		};
	}*/

	// Update stats
	await incrementUserStat(StatTracking.DEATHS, dinozData.user.id, 1);
}
