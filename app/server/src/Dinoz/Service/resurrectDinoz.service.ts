import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { advanceStarScenarioOnNaturalResurrectTx } from '../../Scenario/Controller/starScenario.controller.js';
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
	const deathPlaceId = dinozData.placeId;
	const resurrectPlaceId = PlaceEnum.DINOVILLE;
	await updateDinoz(dinozId, {
		life: 1,
		experience: Math.round(dinozData.experience / 2),
		placeId: resurrectPlaceId,
		leader: { disconnect: true }
	});
	if (dinozData.followers.length > 0) {
		for (const d of dinozData.followers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
	}
	const progressed = await prisma.$transaction(tx =>
		advanceStarScenarioOnNaturalResurrectTx(tx, {
			userId: user.id,
			deathPlaceId,
			resurrectPlaceId
		})
	);
	await incrementUserStat(StatTracking.DEATHS, dinozData.user.id, 1);
	return {
		questTextKey: progressed ? 'scenarios.star.texts.resurrectStarFound' : undefined
	};
}
