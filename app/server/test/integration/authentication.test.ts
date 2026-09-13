import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ACCESS_TOKEN_COOKIE } from '../../src/config/cookie.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser, TEST_USER_PASSWORD } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

function extractCookie(rawHeader: string | string[] | number | undefined, name: string): string {
	const values = Array.isArray(rawHeader) ? rawHeader : rawHeader !== undefined ? [String(rawHeader)] : [];
	const cookie = values.find(value => value.startsWith(`${name}=`));
	if (!cookie) {
		throw new Error(`Cookie "${name}" was not found in response.`);
	}
	return cookie.split(';')[0];
}

beforeAll(async () => {
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await server.close();
});

describe('authentication', () => {
	it('registers a new player', async () => {
		const response = await server.inject({
			method: 'POST',
			url: '/api/users/register',
			payload: {
				name: 'RegisterPlayer',
				password: TEST_USER_PASSWORD,
				gameRulesVersion: GAME_RULES_VERSION
			}
		});
		expect(response.statusCode).toBe(201);
		const registeredUser = response.json<{
			id: string;
			name: string;
		}>();
		expect(registeredUser).toMatchObject({
			name: 'RegisterPlayer'
		});
		expect(registeredUser.id).toBeTypeOf('string');
		const user = await prisma.user.findUnique({
			where: {
				id: registeredUser.id
			},
			include: {
				profile: true,
				ranking: true,
				wallets: true,
				scenarios: true
			}
		});
		expect(user).not.toBeNull();
		expect(user?.profile).not.toBeNull();
		expect(user?.ranking).not.toBeNull();
		expect(user?.wallets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'GOLD'
				}),
				expect.objectContaining({
					type: 'TREASURE_TICKET'
				})
			])
		);
		expect(user?.scenarios).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					scenarioKey: 'tutorial',
					progression: 0
				})
			])
		);
	});

	it('logs in an existing player and accesses /me', async () => {
		const user = await createTestUser({
			name: 'LoginPlayer'
		});
		const loginResponse = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {
				name: user.name,
				password: TEST_USER_PASSWORD
			}
		});
		expect(loginResponse.statusCode).toBe(200);
		expect(loginResponse.json()).toEqual({
			success: true
		});
		const accessTokenCookie = extractCookie(loginResponse.headers['set-cookie'], ACCESS_TOKEN_COOKIE);
		expect(accessTokenCookie).toContain(`${ACCESS_TOKEN_COOKIE}=`);
		const meResponse = await server.inject({
			method: 'GET',
			url: '/api/users/me',
			headers: {
				cookie: accessTokenCookie
			}
		});
		expect(meResponse.statusCode).toBe(200);
		expect(meResponse.json()).toMatchObject({
			id: user.id,
			name: user.name,
			role: 'PLAYER',
			gameRules: {
				currentVersion: GAME_RULES_VERSION,
				acceptedVersion: GAME_RULES_VERSION,
				required: false
			}
		});
	});

	it('rejects an invalid password', async () => {
		const user = await createTestUser({
			name: 'WrongPasswordPlayer'
		});
		const response = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {
				name: user.name,
				password: 'wrong-password'
			}
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			code: 'Invalid_credentials'
		});
	});

	it('rejects an unknown user', async () => {
		const response = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {
				name: 'UnknownPlayer',
				password: TEST_USER_PASSWORD
			}
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toMatchObject({
			code: 'Invalid_credentials'
		});
	});

	it('rejects registration with an existing name', async () => {
		const user = await createTestUser({
			name: 'DuplicatePlayer'
		});
		const response = await server.inject({
			method: 'POST',
			url: '/api/users/register',
			payload: {
				name: user.name,
				password: TEST_USER_PASSWORD,
				gameRulesVersion: GAME_RULES_VERSION
			}
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			message: 'User already exists with this name'
		});
	});

	it('logs out and prevents access to /me', async () => {
		const user = await createTestUser({
			name: 'LogoutPlayer'
		});
		const loginResponse = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {
				name: user.name,
				password: TEST_USER_PASSWORD
			}
		});
		expect(loginResponse.statusCode).toBe(200);
		const accessTokenCookie = extractCookie(loginResponse.headers['set-cookie'], ACCESS_TOKEN_COOKIE);
		const logoutResponse = await server.inject({
			method: 'DELETE',
			url: '/api/users/logout',
			headers: {
				cookie: accessTokenCookie
			}
		});
		expect(logoutResponse.statusCode).toBe(200);
		expect(logoutResponse.json()).toEqual({
			message: 'Logout successful'
		});
		const clearedAccessTokenCookie = extractCookie(logoutResponse.headers['set-cookie'], ACCESS_TOKEN_COOKIE);
		expect(clearedAccessTokenCookie).toBe(`${ACCESS_TOKEN_COOKIE}=`);
		const meResponse = await server.inject({
			method: 'GET',
			url: '/api/users/me',
			headers: {
				cookie: clearedAccessTokenCookie
			}
		});
		expect(meResponse.statusCode).toBe(401);
		expect(meResponse.json()).toEqual({
			message: 'Authentication required'
		});
	});
});
