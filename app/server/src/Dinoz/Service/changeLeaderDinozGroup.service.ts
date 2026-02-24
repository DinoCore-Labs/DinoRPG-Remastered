import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxFollowers } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { ownsDinoz } from '../../User/Controller/ownsDinoz.controller.js';
import { getLeaderWithFollowers } from '../Controller/getLeaderWithFollowers.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function changeLeaderDinozGroup(
	req: FastifyRequest<{
		Params: Params;
	}>,
	_reply: FastifyReply
) {
	const authed = req.user;
	const dinozId = +req.params.id;

	// Check if the player owns the dinoz
	if (!(await ownsDinoz(authed.id, dinozId))) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	// Retrieve the dinoz and its group (followers + skills)
	const currentLeader = await getLeaderWithFollowers(dinozId);

	if (!currentLeader) {
		throw new ExpectedError('No leader found for this dinoz');
	}

	// Retrieve the follower who will become the new leader directly from currentLeader.followers
	const newLeader = currentLeader.followers.find(f => f.id === dinozId);

	if (!newLeader) {
		throw new ExpectedError('Dinoz not found as a follower of the current leader');
	}

	// Check if the new leader can have this many followers
	const maxFollowers = getMaxFollowers(newLeader);
	if (currentLeader.followers.length > maxFollowers) {
		throw new ExpectedError('maxFollowers');
	}

	// Update leader/follower relationships
	await updateDinoz(newLeader.id, { leader: { disconnect: true } }); // The new leader no longer has a leader

	await updateDinoz(currentLeader.id, { leader: { connect: { id: newLeader.id } } }); // The former leader becomes a follower of the new leader

	await prisma.dinoz.updateMany({
		where: { leaderId: currentLeader.id },
		data: { leaderId: newLeader.id } // All former followers now follow the new leader
	});
}
