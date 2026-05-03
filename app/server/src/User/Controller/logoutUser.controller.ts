import { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieOptions } from '../../config/cookie.js';

export async function logoutUser(req: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie(ACCESS_TOKEN_COOKIE, authCookieOptions);

	return reply.send({ message: 'Logout successful' });
}
