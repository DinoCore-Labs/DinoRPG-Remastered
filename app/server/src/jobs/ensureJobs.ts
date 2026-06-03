import { BANK_EXCHANGE_RATE_JOB_KEY } from '@dinorpg/core/models/bank/constants.js';
import {
	GAME_LOG_MAINTENANCE_INTERVAL_MS,
	GAME_LOG_MAINTENANCE_JOB_KEY
} from '@dinorpg/core/models/gamelog/constants.js';
import { MARKET_EXPIRATION_INTERVAL_MS, MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';

import { getNextMarketOfferExpirationDate } from '../Market/Service/expireMarketOffers.service.js';
import { prisma } from '../prisma.js';
import { nextDailyAtUtc } from './helpers/time.js';

export async function ensureJobsExist() {
	// Dinoz shop
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
	// Bank
	await prisma.jobDefinition.upsert({
		where: {
			key: BANK_EXCHANGE_RATE_JOB_KEY
		},
		create: {
			key: BANK_EXCHANGE_RATE_JOB_KEY,
			name: 'Refresh Dinoland Bank exchange rate',
			type: 'DAILY_AT',
			timezone: 'UTC',
			dailyHour: 0,
			dailyMinute: 0,
			nextRunAt: nextDailyAtUtc(0, 0),
			enabled: true
		},
		update: {}
	});
	// Itinerant Merchant
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
	// Heal fountain
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
	// Offers Market
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
	// Gamelog
	await prisma.jobDefinition.upsert({
		where: {
			key: GAME_LOG_MAINTENANCE_JOB_KEY
		},
		create: {
			key: GAME_LOG_MAINTENANCE_JOB_KEY,
			name: 'Aggregate and purge game logs',
			type: 'INTERVAL',
			timezone: 'UTC',
			intervalMs: GAME_LOG_MAINTENANCE_INTERVAL_MS,
			nextRunAt: new Date(Date.now() + GAME_LOG_MAINTENANCE_INTERVAL_MS),
			lockTimeoutS: 300,
			enabled: true
		},
		update: {
			type: 'INTERVAL',
			intervalMs: GAME_LOG_MAINTENANCE_INTERVAL_MS,
			lockTimeoutS: 300,
			enabled: true
		}
	});
}
