import { BANK_EXCHANGE_RATE_JOB_KEY } from '@dinorpg/core/models/bank/constants.js';
import {
	GAME_LOG_MAINTENANCE_INTERVAL_MS,
	GAME_LOG_MAINTENANCE_JOB_KEY
} from '@dinorpg/core/models/gamelog/constants.js';
import { MARKET_EXPIRATION_INTERVAL_MS, MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';

import { getNextMarketOfferExpirationDate } from '../Market/Service/expireMarketOffers.service.js';
import { prisma } from '../prisma.js';
import {
	TOURNAMENT_FINALS_R0_JOB_KEY,
	TOURNAMENT_FINALS_R1_JOB_KEY,
	TOURNAMENT_FINALS_R2_JOB_KEY,
	TOURNAMENT_FINALS_R3_JOB_KEY,
	TOURNAMENT_FINALS_R4_JOB_KEY,
	TOURNAMENT_INIT_JOB_KEY,
	TOURNAMENT_POOLS_R1_JOB_KEY,
	TOURNAMENT_POOLS_R2_JOB_KEY,
	TOURNAMENT_POOLS_START_JOB_KEY
} from '../utils/tournamentManager.js';
import { nextDailyAtUtc, nextWeeklyAtUtc } from './helpers/time.js';

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
	// Devourer Midnight Reset
	await prisma.jobDefinition.upsert({
		where: { key: 'devourer-midnight-reset' },
		create: {
			key: 'devourer-midnight-reset',
			name: 'Reset Devourer attacks and reward controllers',
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
	//TID
	await prisma.jobDefinition.upsert({
		where: { key: 'reset-dojo-challenge' },
		create: {
			key: 'reset-dojo-challenge',
			name: 'Reset Dojo Challenge',
			type: 'DAILY_AT',
			timezone: 'UTC',
			dailyHour: 0,
			dailyMinute: 0,
			nextRunAt: nextDailyAtUtc(0, 0),
			enabled: true
		},
		update: {}
	});

	const tournamentJobs = [
		{ key: TOURNAMENT_INIT_JOB_KEY, name: 'Tournament — init qualifications', dayOfWeek: 0, hour: 0, minute: 0 },
		{
			key: TOURNAMENT_POOLS_START_JOB_KEY,
			name: 'Tournament — pools start + round 0',
			dayOfWeek: 0,
			hour: 0,
			minute: 0
		},
		{ key: TOURNAMENT_POOLS_R1_JOB_KEY, name: 'Tournament — pool round 1', dayOfWeek: 1, hour: 12, minute: 0 },
		{
			key: TOURNAMENT_POOLS_R2_JOB_KEY,
			name: 'Tournament — pool round 2 + bracket',
			dayOfWeek: 1,
			hour: 22,
			minute: 0
		},
		{ key: TOURNAMENT_FINALS_R0_JOB_KEY, name: 'Tournament — finals 1/16', dayOfWeek: 3, hour: 12, minute: 0 },
		{ key: TOURNAMENT_FINALS_R1_JOB_KEY, name: 'Tournament — finals 1/8', dayOfWeek: 4, hour: 12, minute: 0 },
		{ key: TOURNAMENT_FINALS_R2_JOB_KEY, name: 'Tournament — finals QF', dayOfWeek: 5, hour: 12, minute: 0 },
		{ key: TOURNAMENT_FINALS_R3_JOB_KEY, name: 'Tournament — finals SF', dayOfWeek: 6, hour: 12, minute: 0 },
		{ key: TOURNAMENT_FINALS_R4_JOB_KEY, name: 'Tournament — finals Final', dayOfWeek: 0, hour: 12, minute: 0 }
	];
	for (const job of tournamentJobs) {
		await prisma.jobDefinition.upsert({
			where: { key: job.key },
			create: {
				key: job.key,
				name: job.name,
				type: 'DAILY_AT',
				timezone: 'UTC',
				dailyHour: job.hour,
				dailyMinute: job.minute,
				nextRunAt: nextWeeklyAtUtc(job.dayOfWeek, job.hour, job.minute),
				lockTimeoutS: 300,
				enabled: true
			},
			update: {}
		});
	}
}
