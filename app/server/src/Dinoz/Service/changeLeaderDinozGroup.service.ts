import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxFollowers, haveElementAffinity } from '@dinorpg/core/utils/dinozUtils.js';
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
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId: authed.id
			}
		});
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
	const newLeaderHasFearFactor = newLeader.items.some(i => i.itemId === Item.FEAR_FACTOR);
	const newLeaderHasBrave = newLeader.skills.some(s => s.skillId === Skill.BRAVE);
	const maxFollowers = getMaxFollowers(newLeader, newLeaderHasFearFactor);
	if (currentLeader.followers.length > maxFollowers) {
		throw new ExpectedError('maxFollowers', { params: { maxFollowers } });
	}

	// Prevent bypassing Brave rules when swapping leaders
	const allOtherMembers = [currentLeader, ...currentLeader.followers.filter(f => f.id !== newLeader.id)];
	for (const member of allOtherMembers) {
		const memberHasBrave = member.skills.some(s => s.skillId === Skill.BRAVE);
		const memberHasTrouillometre = member.items.some(i => i.itemId === Item.FEAR_FACTOR);

		if (newLeaderHasBrave || memberHasBrave) {
			if (newLeaderHasBrave && !newLeaderHasFearFactor) {
				throw new ExpectedError('dinozCannotFollowBrave');
			}
			if (memberHasBrave && !memberHasTrouillometre) {
				throw new ExpectedError('dinozCannotFollowBrave');
			}
			if (!haveElementAffinity(newLeader.raceId, member.raceId)) {
				throw new ExpectedError('dinozCannotFollowSharedElement');
			}
		}
	}

	// Update leader/follower relationships
	await updateDinoz(newLeader.id, { leader: { disconnect: true } }); // The new leader no longer has a leader
	await updateDinoz(currentLeader.id, { leader: { connect: { id: newLeader.id } } }); // The former leader becomes a follower of the new leader
	await prisma.dinoz.updateMany({
		where: { leaderId: currentLeader.id },
		data: { leaderId: newLeader.id } // All former followers now follow the new leader
	});
}
