import { FastifyReply, FastifyRequest } from 'fastify';

export async function logoutUser(req: FastifyRequest, reply: FastifyReply) {
	reply.clearCookie('access_token', {
		path: '/',
		sameSite: 'lax'
	});

	return reply.send({ message: 'Logout successful' });
}
