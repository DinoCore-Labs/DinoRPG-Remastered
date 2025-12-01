import { ExpectedError } from '@dinorpg/core/models/utils/ExpectedError';

import { prisma } from '../../prisma.js';

// ---- USER POSITION ----
export async function getUserRankingPosition(userId: string) {
	const current = await prisma.ranking.findUnique({
		where: { userId },
		select: {
			points: true,
			user: { select: { name: true } }
		}
	});

	if (!current) throw new ExpectedError('User ranking not found');

	const above = await prisma.ranking.count({
		where: {
			OR: [
				{ points: { gt: current.points } },
				{
					points: current.points,
					user: { name: { lt: current.user?.name ?? '' } }
				}
			]
		}
	});

	return above + 1;
}
