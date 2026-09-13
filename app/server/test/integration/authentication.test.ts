import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ACCESS_TOKEN_COOKIE } from '../../src/config/cookie.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { cleanDatabase } from '../helpers/database.js';

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
	await prisma.$disconnect();
});

describe('authentication flow', () => {
	it('registers, logs in and retrieves the authenticated user', async () => {
		const name = 'IntegrationPlayer';
		const password = 'integration-password';
		//--------------------------------------------------
		// REGISTER
		//--------------------------------------------------
		const registerResponse = await server.inject({
			method: 'POST',
			url: '/api/users/register',
			headers: {
				'user-agent': 'DinoRPG integration tests'
			},
			payload: {
				name,
				password,
				gameRulesVersion: GAME_RULES_VERSION
			}
		});
		expect(registerResponse.statusCode).toBe(201);
		const registeredUser = registerResponse.json<{
			id: string;
			name: string;
		}>();
		expect(registeredUser).toMatchObject({
			name
		});
		expect(registeredUser.id).toBeTypeOf('string');
		//--------------------------------------------------
		// VERIFY DATABASE
		//--------------------------------------------------
		const userInDatabase = await prisma.user.findUnique({
			where: {
				id: registeredUser.id
			},
			include: {
				wallets: true,
				ranking: true,
				profile: true,
				scenarios: true
			}
		});
		expect(userInDatabase).not.toBeNull();
		expect(userInDatabase?.name).toBe(name);
		expect(userInDatabase?.wallets.length).toBeGreaterThan(0);
		expect(userInDatabase?.ranking).not.toBeNull();
		expect(userInDatabase?.profile).not.toBeNull();
		expect(
			userInDatabase?.scenarios.some(scenario => scenario.scenarioKey === 'tutorial' && scenario.progression === 0)
		).toBe(true);
		//--------------------------------------------------
		// LOGIN
		//--------------------------------------------------
		const loginResponse = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {
				name,
				password
			}
		});
		expect(loginResponse.statusCode).toBe(200);
		expect(loginResponse.json()).toEqual({
			success: true
		});
		const accessTokenCookie = extractCookie(loginResponse.headers['set-cookie'], ACCESS_TOKEN_COOKIE);
		expect(accessTokenCookie).toContain(`${ACCESS_TOKEN_COOKIE}=`);
		//--------------------------------------------------
		// /ME
		//--------------------------------------------------
		const meResponse = await server.inject({
			method: 'GET',
			url: '/api/users/me',
			headers: {
				cookie: accessTokenCookie
			}
		});
		expect(meResponse.statusCode).toBe(200);
		const me = meResponse.json();
		expect(me).toMatchObject({
			id: registeredUser.id,
			name,
			gameRules: {
				currentVersion: GAME_RULES_VERSION,
				acceptedVersion: GAME_RULES_VERSION,
				required: false
			}
		});
		expect(me.gold).toBeTypeOf('number');
		expect(me.treasureTicket).toBeTypeOf('number');
	});
});
