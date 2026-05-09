import { MARKET_EXPIRATION_INTERVAL_MS, MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';

import { getNextMarketOfferExpirationDate } from '../Market/Service/expireMarketOffers.service.js';
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
	await prisma.jobDefinition.upsert({
		where: { key: 'heal-fountain-pearl-dinoz' },
		create: {
			key: 'heal-fountain-pearl-dinoz',
			name: 'Heal Fountain of Youth Dinoz for Pearl owners',
			type: 'DAILY_AT',
			timezone: 'UTC',
			dailyHour: 0,
			dailyMinute: 0,
			nextRunAt: nextDailyAtUtc(0, 0),
			enabled: true
		},
		update: {}
	});
	const nextMarketExpiration = await getNextMarketOfferExpirationDate();
	await prisma.jobDefinition.upsert({
		where: {
			key: MARKET_EXPIRATION_JOB_KEY
		},
		create: {
			key: MARKET_EXPIRATION_JOB_KEY,
			name: 'Expire market offers',
			type: 'INTERVAL',
			timezone: 'UTC',
			intervalMs: null,
			nextRunAt: nextMarketExpiration,
			lockTimeoutS: 30,
			enabled: true
		},
		update: {
			type: 'INTERVAL',
			intervalMs: null,
			nextRunAt: nextMarketExpiration,
			lockTimeoutS: 30,
			enabled: true
		}
	});
}
