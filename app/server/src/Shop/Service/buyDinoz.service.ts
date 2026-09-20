import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { toDinozFiche, UserForDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import { purchaseDinoz } from '../Controller/purchaseDinoz.controller.js';

type BuyDinozParams = {
	id: number;
};

export async function buyDinoz(
	req: FastifyRequest<{
		Params: BuyDinozParams;
	}>,
	_reply: FastifyReply
) {
	const userId = req.user.id;
	const shopDinozId = Number(req.params.id);
	if (!Number.isInteger(shopDinozId)) {
		throw new ExpectedError('dinozNotFound');
	}
	const dinozCreated = await purchaseDinoz({
		userId,
		shopDinozId
	});
	const newDinoz: UserForDinozFiche = {
		id: userId,
		engineer: false,
		items: [],
		rewards: [],
		ranking: null,
		dinoz: [
			{
				...dinozCreated,
				status: [],
				skills: [],
				missions: [],
				items: [],
				followers: []
			}
		]
	};
	return toDinozFiche(newDinoz, dinozCreated.id);
}
