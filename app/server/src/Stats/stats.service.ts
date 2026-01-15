import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';

import { prisma } from '../prisma.js';

export async function incrementUserStat(stat: StatTracking, userId: string, quantity: number) {
	if (!quantity) return;

	return prisma.userTracking.upsert({
		where: { stat_userId: { stat, userId } },
		update: {
			quantity: {
				increment: quantity
			}
		},
		create: {
			stat,
			quantity,
			userId
		}
	});
}
