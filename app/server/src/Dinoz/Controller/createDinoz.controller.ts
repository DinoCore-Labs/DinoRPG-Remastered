import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { GameLogType, Prisma } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';

export async function createDinoz(dinoz: Prisma.DinozCreateInput) {
	const userId = dinoz.user?.connect?.id;
	if (!userId) throw new ExpectedError('Missing user id');
	const newDinoz = await prisma.dinoz.create({
		data: dinoz
	});
	// Stat player
	await incrementUserStat(StatTracking.GET_DINOZ, userId, 1);
	// Log
	safeCreateGameLog({
		type: GameLogType.CreateDinoz,
		userId,
		dinozId: newDinoz.id,
		dinozNameSnapshot: newDinoz.name,
		metadata: {
			raceId: newDinoz.raceId,
			display: newDinoz.display,
			level: newDinoz.level
		}
	});
	//GLOBAL.liveStats.incrementDinoz();
	return newDinoz;
}
