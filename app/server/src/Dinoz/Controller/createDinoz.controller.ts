import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';

export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	const userId = dinoz.user?.connect?.id;
	if (!userId) throw new ExpectedError('Missing user id');

	const newDinoz = await prisma.dinoz.create({
		data: dinoz
	});

	await incrementUserStat(StatTracking.GET_DINOZ, userId, 1);

	//GLOBAL.liveStats.incrementDinoz();

	return newDinoz;
}
