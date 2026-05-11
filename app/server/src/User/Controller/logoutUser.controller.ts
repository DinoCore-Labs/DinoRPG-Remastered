import { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieBaseOptions } from '../../config/cookie.js';

export async function logoutUser(req: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie(ACCESS_TOKEN_COOKIE, authCookieBaseOptions);
	return reply.send({ message: 'Logout successful' });
}
