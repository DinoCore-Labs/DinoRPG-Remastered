import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';

import { prisma } from '../prisma.js';

type StatsDb = Pick<typeof prisma, 'userTracking'>;

export async function incrementUserStat(stat: StatTracking, userId: string, quantity: number, db: StatsDb = prisma) {
	if (!quantity) return;
	return db.userTracking.upsert({
		where: {
			stat_userId: {
				stat,
				userId
			}
		},
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
