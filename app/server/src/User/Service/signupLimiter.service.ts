import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js'; // adapte si besoin
import { addDays, endOfMonthUTC, getClientIp, getDeviceId, hmacToken, monthKeyUTC } from '../../utils/signupLimits.js';

async function purgeExpired(now: Date) {
	// nettoyage opportuniste (léger)
	await prisma.signupDeviceMonthCounter.deleteMany({ where: { expiresAt: { lt: now } } });
	await prisma.signupIpMonthCounter.deleteMany({ where: { expiresAt: { lt: now } } });
}

/**
 * Increment ONLY if count < MAX (safe concurrency), else refuse.
 */
async function incrementMonthlyCounter(params: {
	model: 'device' | 'ip';
	monthKey: string;
	token: string;
	max: number;
	expiresAt: Date;
}) {
	const { model, monthKey, token, max, expiresAt } = params;

	if (model === 'device') {
		const updated = await prisma.signupDeviceMonthCounter.updateMany({
			where: { monthKey, deviceToken: token, count: { lt: max } },
			data: { count: { increment: 1 }, expiresAt }
		});
		if (updated.count === 1) return true;

		try {
			await prisma.signupDeviceMonthCounter.create({
				data: { monthKey, deviceToken: token, count: 1, expiresAt }
			});
			return true;
		} catch {
			const updated2 = await prisma.signupDeviceMonthCounter.updateMany({
				where: { monthKey, deviceToken: token, count: { lt: max } },
				data: { count: { increment: 1 }, expiresAt }
			});
			return updated2.count === 1;
		}
	}

	// model === 'ip'
	const updated = await prisma.signupIpMonthCounter.updateMany({
		where: { monthKey, ipToken: token, count: { lt: max } },
		data: { count: { increment: 1 }, expiresAt }
	});
	if (updated.count === 1) return true;

	try {
		await prisma.signupIpMonthCounter.create({
			data: { monthKey, ipToken: token, count: 1, expiresAt }
		});
		return true;
	} catch {
		const updated2 = await prisma.signupIpMonthCounter.updateMany({
			where: { monthKey, ipToken: token, count: { lt: max } },
			data: { count: { increment: 1 }, expiresAt }
		});
		return updated2.count === 1;
	}
}

export async function enforceSignupLimits(req: FastifyRequest) {
	const MAX_DEVICE = Number(process.env.MAX_ACCOUNTS_PER_DEVICE_PER_MONTH ?? 2);
	const MAX_IP = Number(process.env.MAX_ACCOUNTS_PER_IP_PER_MONTH ?? 3);
	const GRACE_DAYS = Number(process.env.SIGNUP_COUNTER_GRACE_DAYS ?? 7);

	const deviceSecret = process.env.DEVICE_TOKEN_SECRET;
	const ipSecret = process.env.IP_TOKEN_SECRET;

	if (!deviceSecret) throw new Error('Missing DEVICE_TOKEN_SECRET');
	if (!ipSecret) throw new Error('Missing IP_TOKEN_SECRET');

	const now = new Date();
	const monthKey = monthKeyUTC(now);
	const expiresAt = addDays(endOfMonthUTC(now), GRACE_DAYS);

	await purgeExpired(now);

	// 1) Device limit (le plus efficace)
	const deviceId = getDeviceId(req);
	if (!deviceId) throw new ExpectedError('Missing_device_cookie', { statusCode: 400 });

	const deviceTok = hmacToken(deviceSecret, deviceId);
	const okDevice = await incrementMonthlyCounter({
		model: 'device',
		monthKey,
		token: deviceTok,
		max: MAX_DEVICE,
		expiresAt
	});

	if (!okDevice) {
		throw new ExpectedError('Too_many_accounts_created_from_this_device_this_month', { statusCode: 429 });
	}

	// 2) IP limit (backup)
	const ip = getClientIp(req);
	if (!ip) {
		// si tu veux être strict : throw 400
		// sinon : skip IP check
		return;
	}

	const ipTok = hmacToken(ipSecret, ip);
	const okIp = await incrementMonthlyCounter({
		model: 'ip',
		monthKey,
		token: ipTok,
		max: MAX_IP,
		expiresAt
	});

	if (!okIp) {
		throw new ExpectedError('Too_many_accounts_created_from_this_network_this_month', { statusCode: 429 });
	}
}

export function isLimitError(e: any): e is ExpectedError {
	return e && typeof e.statusCode === 'number';
}
