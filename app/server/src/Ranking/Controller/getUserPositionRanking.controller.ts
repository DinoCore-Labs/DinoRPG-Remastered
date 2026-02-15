import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

export async function getUserRankingSummary(userId: string) {
	const current = await prisma.ranking.findUnique({
		where: { userId },
		select: {
			points: true,
			dinozCount: true,
			user: { select: { name: true } }
		}
	});

	if (!current) throw new ExpectedError('User ranking not found');

	const above = await prisma.ranking.count({
		where: {
			OR: [
				{ points: { gt: current.points } },
				{
					points: { equals: current.points },
					user: { is: { name: { lt: current.user.name } } }
				}
			]
		}
	});

	return { position: above + 1, points: current.points, dinozCount: current.dinozCount };
}
