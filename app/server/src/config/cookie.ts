import type { CookieSerializeOptions } from '@fastify/cookie';

export const ACCESS_TOKEN_COOKIE = 'access_token';

export const authCookieOptions: CookieSerializeOptions = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax'
};
