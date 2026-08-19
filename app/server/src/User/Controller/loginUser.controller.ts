import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieOptions } from '../../config/cookie.js';
import { prisma } from '../../prisma.js';
import { LoginUserInput } from '../Schema/user.schema.js';

const DUMMY_PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export async function loginUser(
	req: FastifyRequest<{
		Body: LoginUserInput;
	}>,
	reply: FastifyReply
) {
	const { name, password } = req.body;
	const user = await prisma.user.findUnique({ where: { name: name } });
	const isMatch = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);
	if (!user || !isMatch) {
		throw new ExpectedError('Invalid_credentials', {
			statusCode: 401
		});
	}
	if (user.bannedUntil && user.bannedUntil > new Date()) {
		throw new ExpectedError('Account_banned_until', {
			statusCode: 403,
			params: {
				date: user.bannedUntil.toLocaleDateString('fr-FR'),
				time: user.bannedUntil.toLocaleTimeString('fr-FR'),
				reason: user.banReason || 'Non spécifiée'
			}
		});
	}
	const payload = {
		id: user.id,
		name: user.name,
		role: user.role,
		gameRulesAcceptedVersion: user.gameRulesAcceptedVersion
	};
	const token = req.jwt.sign(payload, { expiresIn: '7d' });
	reply.setCookie(ACCESS_TOKEN_COOKIE, token, {
		...authCookieOptions
	});
	return reply.send({ success: true });
}
