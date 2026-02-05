import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { placeList } from '@dinorpg/core/models/place/placeList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { incrementUserStat } from '../../Stats/stats.service.js';
import { getDinozFightDataRequest } from '../Controller/getDinozFight.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';
import type { MoveDinozInput, MoveDinozResponse } from '../Schema/dinoz.schema.js';

type Req = FastifyRequest<{ Body: MoveDinozInput }>;

export async function moveDinozHandler(req: Req, reply: FastifyReply) {
	const { dinozId, placeId } = req.body;

	const authedId = req.user.id;

	const user = await getDinozFightDataRequest(dinozId, authedId);
	if (!user) throw new ExpectedError('playerNotFound', { params: { authedId } });

	const dinoz = user.dinoz.find(d => d.id === dinozId);
	if (!dinoz) throw new ExpectedError('dinozNotFound', { params: { dinozId } });

	if (dinoz.canRename) throw new ExpectedError(`Dinoz has to be named`);

	const currentPlace = actualPlace(dinoz);
	const desiredPlace = Object.values(placeList).find(p => p.placeId === placeId);

	if (!desiredPlace) throw new ExpectedError(`Dinoz ${dinozId} want to go in the void`);
	if (currentPlace.placeId === desiredPlace.placeId) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at ${currentPlace.name}`);
	}
	if (!currentPlace.borderPlace.includes(desiredPlace.placeId)) {
		throw new ExpectedError(`${currentPlace.name} is not adjacent with ${desiredPlace.name}`);
	}

	const finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Move
	await updateDinoz(dinoz.id, { placeId: finalPlace });

	await incrementUserStat(StatTracking.MOVES, authedId, 1);

	return reply.send({
		success: true,
		dinozId,
		placeId: finalPlace
	});
}
