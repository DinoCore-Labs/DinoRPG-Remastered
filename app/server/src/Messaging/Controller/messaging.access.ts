import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import { MESSAGING_UNLOCK_REWARD_ID } from '../../utils/messaging/constants.js';

export async function assertMessagingAccess(userId: string) {
	const [reward, user] = await Promise.all([
		prisma.userRewards.findFirst({
			where: {
				userId,
				rewardId: MESSAGING_UNLOCK_REWARD_ID
			},
			select: { id: true }
		}),
		prisma.user.findUnique({
			where: { id: userId },
			select: { mutedUntil: true }
		})
	]);

	if (!reward) {
		throw new ExpectedError('Messaging is locked for this user');
	}

	if (user?.mutedUntil && user.mutedUntil > new Date()) {
		throw new ExpectedError('Account is muted');
	}
}
