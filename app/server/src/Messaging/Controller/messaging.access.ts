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

export async function assertUsersCanUseMessaging(userIds: string[]) {
	if (userIds.length === 0) return;

	const rewards = await prisma.userRewards.findMany({
		where: {
			userId: {
				in: userIds
			},
			rewardId: MESSAGING_UNLOCK_REWARD_ID
		},
		select: {
			userId: true
		}
	});

	const unlockedUserIds = new Set(rewards.map(reward => reward.userId));
	const blockedUserIds = userIds.filter(userId => !unlockedUserIds.has(userId));

	if (blockedUserIds.length > 0) {
		throw new ExpectedError('One or more participants cannot use messaging');
	}
}
