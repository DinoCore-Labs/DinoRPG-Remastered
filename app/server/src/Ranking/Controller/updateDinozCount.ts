import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

export async function updateDinozCount(userId: string, dinozCount: number) {
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
		throw new ExpectedError('User ranking not found');
	}

	await prisma.ranking.update({
		where: {
			userId
		},
		data: {
			dinozCount: ranking.dinozCount + dinozCount
		}
	});
}
