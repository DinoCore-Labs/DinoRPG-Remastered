import { GAME_RULES_VERSION, GameRulesAcceptance } from '@dinorpg/core/models/game/gameRules.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieOptions } from '../../config/cookie.js';
import { prisma } from '../../prisma.js';
import type { AcceptGameRulesInput } from '../Schema/user.schema.js';

export async function acceptGameRules(
	req: FastifyRequest<{
		Body: AcceptGameRulesInput;
	}>,
	reply: FastifyReply
) {
	const userId = req.user.id;
	const acceptedAt = new Date();
	const user = await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			gameRulesAcceptedVersion: GAME_RULES_VERSION,
			gameRulesAcceptedAt: acceptedAt
		},
		select: {
			id: true,
			name: true,
			role: true
		}
	});
	/*
	 * Le JWT est renouvelé afin que les requêtes suivantes connaissent
	 * immédiatement la nouvelle version acceptée.
	 */
	const token = req.jwt.sign(
		{
			id: user.id,
			name: user.name,
			role: user.role,
			gameRulesAcceptedVersion: GAME_RULES_VERSION
		},
		{
			expiresIn: '7d'
		}
	);
	reply.setCookie(ACCESS_TOKEN_COOKIE, token, {
		...authCookieOptions
	});
	const response: GameRulesAcceptance = {
		currentVersion: GAME_RULES_VERSION,
		acceptedVersion: GAME_RULES_VERSION,
		acceptedAt: acceptedAt.toISOString(),
		required: false
	};
	return reply.send(response);
}
