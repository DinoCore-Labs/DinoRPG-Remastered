import type { FastifyInstance } from 'fastify';

import { ACCESS_TOKEN_COOKIE } from '../../src/config/cookie.js';

type TestAuthenticatedUser = {
	id: string;
	name: string;
	role: string;
	gameRulesAcceptedVersion: string | null;
};

export function createAuthCookie(server: FastifyInstance, user: TestAuthenticatedUser): string {
	const token = server.jwt.sign(
		{
			id: user.id,
			name: user.name,
			role: user.role,
			gameRulesAcceptedVersion: user.gameRulesAcceptedVersion
		},
		{
			expiresIn: '7d'
		}
	);
	return `${ACCESS_TOKEN_COOKIE}=${token}`;
}
