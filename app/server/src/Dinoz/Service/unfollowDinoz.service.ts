import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function unfollowDinoz(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	const authed = req.user;
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { disconnect: true } });
}
