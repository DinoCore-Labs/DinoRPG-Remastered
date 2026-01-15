import { randomUUID } from 'crypto';
import type { FastifyPluginAsync } from 'fastify';

const DEVICE_COOKIE = 'dz_device';

export const deviceCookiePlugin: FastifyPluginAsync = async server => {
	server.addHook('onRequest', async (req, reply) => {
		let deviceId = req.cookies?.[DEVICE_COOKIE];

		// cookie absent / invalide
		if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 16) {
			deviceId = randomUUID();

			const isProd = process.env.NODE_ENV === 'production';

			reply.setCookie(DEVICE_COOKIE, deviceId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: isProd, // en dev (http) => false, sinon le cookie ne se stocke pas
				maxAge: 60 * 60 * 24 * 400 // ~400 jours
			});
		}

		// dispo partout (optionnel)
		(req as any).deviceId = deviceId;
	});
};
