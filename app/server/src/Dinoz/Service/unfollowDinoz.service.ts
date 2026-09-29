import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function makeDinozUnfollow(userId: string, dinozId: number) {
	if (!(await ownsDinoz(userId, dinozId))) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId
			}
		});
	}
	await updateDinoz(dinozId, { leader: { disconnect: true } });
}

export async function unfollowDinoz(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	return makeDinozUnfollow(req.user.id, Number(req.params.id));
}
