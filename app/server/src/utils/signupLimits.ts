import crypto from 'crypto';
import type { FastifyRequest } from 'fastify';

export function monthKeyUTC(d = new Date()): string {
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, '0');
	return `${y}-${m}`;
}

export function endOfMonthUTC(d: Date): Date {
	const y = d.getUTCFullYear();
	const m = d.getUTCMonth();
	return new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0) - 1);
}

export function addDays(d: Date, days: number): Date {
	return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

export function hmacToken(secret: string, value: string): string {
	return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function getClientIp(req: FastifyRequest): string | null {
	const ip = req.ip || null;
	if (!ip) return null;
	return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
}

export function getDeviceId(req: FastifyRequest): string | null {
	const deviceId = (req as any).deviceId ?? req.cookies?.dz_device;
	if (!deviceId || typeof deviceId !== 'string') return null;
	return deviceId;
}
