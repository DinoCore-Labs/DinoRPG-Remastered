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

	await prisma.ranking.update({
		where: {
			userId
		},
		data: {
			points: newPoints,
			average: Math.round(newPoints / ranking.dinozCount)
		}
	});
}
