import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { toDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getDinozFicheRequest } from '../Controller/getDinozFiche.controller.js';
import { getAvailableActions } from './getDinozActions.service.js';

// import { TournamentManager } from '../../tournament/TournamentManager.js';
// import { isDinozInTournament } from '../../tournament/isDinozInTournament.js';
// import { getAvailableActions } from '../../actions/getAvailableActions.js';

type Params = { id: string };

export async function getDinozFiche(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}

	const authedId = req.user.id;

	// Retrieve player from dinozId
	const playerData = await getDinozFicheRequest(dinozId, authedId);

	if (!playerData) {
		throw new ExpectedError('userNotFound', { params: { authedId } });
	}

	if (playerData.dinoz.length === 0) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}

	const myDinoz = playerData.dinoz.find(d => d.id === dinozId);

	// If player found is different from player who do the request, throw exception
	if (!myDinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authedId}`);
	}

	//const currentTournament = await TournamentManager.getCurrentTournamentState(prisma);

	//const isInTournament = await isDinozInTournament(dinozId);

	// Create the answer that will be sent back
	const ret = toDinozFiche(playerData, dinozId /*isInTournament ? currentTournament : null*/);
	ret.actions = await getAvailableActions(myDinoz, playerData);

	return reply.send(ret);
}
