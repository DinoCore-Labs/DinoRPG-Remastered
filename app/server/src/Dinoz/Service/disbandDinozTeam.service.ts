import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { getFollowingDinoz } from '../Controller/getFollowingDinoz.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function disband(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	const authed = req.user;
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}
	const dinoz = await getFollowingDinoz(dinozId);

	if (!dinoz) {
		throw new ExpectedError('No dinoz found');
	}

	for (const d of dinoz.followers) {
		await updateDinoz(d.id, { leader: { disconnect: true } });
	}
}
