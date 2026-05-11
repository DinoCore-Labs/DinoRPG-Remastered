import type { CookieSerializeOptions } from '@fastify/cookie';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const authCookieBaseOptions: CookieSerializeOptions = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax'
};

export const authCookieOptions: CookieSerializeOptions = {
	...authCookieBaseOptions,
	maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS
};
