import { prisma } from '../prisma.js';
import { nextDailyAtUtc } from './helpers/time.js';

export async function ensureJobsExist() {
	await prisma.jobDefinition.upsert({
		where: { key: 'reset-dinoz-shop' },
		create: {
			key: 'reset-dinoz-shop',
			name: 'Reset Dinoz Shop',
			type: 'DAILY_AT',
			timezone: 'UTC',
			dailyHour: 0,
			dailyMinute: 0,
			nextRunAt: nextDailyAtUtc(0, 0),
			enabled: true
		},
		update: {}
	});
	await prisma.jobDefinition.upsert({
		where: { key: 'itinerant-merchant-move' },
		create: {
			key: 'itinerant-merchant-move',
			name: 'Move itinerant merchant (weekly)',
			type: 'DAILY_AT',
			timezone: 'UTC',
			dailyHour: 0,
			dailyMinute: 0,
			nextRunAt: nextDailyAtUtc(0, 0),
			enabled: true
		},
		update: {}
	});
}
