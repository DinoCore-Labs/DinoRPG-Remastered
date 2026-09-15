import { UserRole } from '@dinorpg/core/models/user/userRole.js';
import { JWT } from '@fastify/jwt';

import { Role } from '../../../prisma/index.js';

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT;
	}
	export interface FastifyInstance {
		authenticate: any;
		noAuth: any;
		admin: any;
		moderator: any;
	}
}

type UserPayload = {
	id: string;
	name: string;
	role?: Role;
	gameRulesAcceptedVersion?: string | null;
};

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: UserPayload;
	}
}
