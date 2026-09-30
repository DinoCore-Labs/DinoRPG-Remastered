import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

export async function updatePoints(userId: string, points: number) {
	const ranking = await prisma.ranking.findUnique({
		where: {
			userId
		},
		select: {
			points: true,
			dinozCount: true
		}
	});

	if (!ranking) {
		throw new ExpectedError('Player ranking not found');
	}

	const newPoints = ranking.points + points;
	const average = ranking.dinozCount > 0 ? Math.round(newPoints / ranking.dinozCount) : newPoints;

	await prisma.ranking.update({
		where: {
			userId
		},
		data: {
			points: newPoints,
			average
		}
	});
}
