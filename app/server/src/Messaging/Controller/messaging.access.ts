import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import { MESSAGING_UNLOCK_REWARD_ID } from '../../utils/messaging/constants.js';

export async function assertMessagingAccess(userId: string) {
	const reward = await prisma.userRewards.findFirst({
		where: {
			userId,
			rewardId: MESSAGING_UNLOCK_REWARD_ID
		},
		select: {
			id: true
		}
	});

	if (!reward) {
		throw new ExpectedError('Messaging is locked for this user');
	}
}
