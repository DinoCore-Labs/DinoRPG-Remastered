import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxFollowers } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { toDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getDinozFicheRequest } from '../Controller/getDinozFiche.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
	targetId: string;
};

export async function followDinoz(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	const authed = req.user;
	const dinozId = +req.params.id;
	const dinozToFollowId = +req.params.targetId;

	const player_dinoz = await getDinozFicheRequest(dinozId, authed.id);
	const player_leader = await getDinozFicheRequest(dinozToFollowId, authed.id);

	if (!player_dinoz || !player_leader) {
		throw new ExpectedError('playerNotFound', { params: { id: authed.id } });
	}

	if (dinozId === dinozToFollowId) {
		throw new ExpectedError('Cannot follow itself');
	}

	const dinoz = player_dinoz.dinoz.find(d => d.id === dinozId);
	const leader = player_leader.dinoz.find(d => d.id === dinozToFollowId);

	if (!dinoz || !leader) {
		throw new ExpectedError('No dinoz found');
	}

	if (dinoz.canRename || leader.canRename) {
		throw new ExpectedError(`Dinoz has to be named.`);
	}

	//Check if leader is not at max followers
	const max = getMaxFollowers(toDinozFiche(player_leader, leader.id /*, null*/));
	if (leader.followers.length >= max) {
		throw new ExpectedError('maxFollowers');
	}

	if (dinoz.leaderId || dinoz.followers.length > 0) {
		throw new ExpectedError('Dinoz is already following another dinoz.');
	}

	if (dinoz.skills.some(s => s.skillId === Skill.BRAVE) || leader.skills.some(s => s.skillId === Skill.BRAVE)) {
		throw new ExpectedError('Dinoz cannot follow any dinoz');
	}

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId, dinozToFollowId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	if (dinoz.placeId !== leader.placeId) {
		throw new ExpectedError('Dinoz should be at the same place.');
	}

	// Update dinoz
	await updateDinoz(dinozId, { leader: { connect: { id: dinozToFollowId } } });
}
