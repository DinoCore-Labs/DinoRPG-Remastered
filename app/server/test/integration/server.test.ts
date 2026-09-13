import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let server: FastifyInstance;

beforeAll(async () => {
	process.env.NODE_ENV = 'test';
	process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@127.0.0.1:5432/dinorpg_test';
	process.env.API_URL = 'http://127.0.0.1:8081';
	process.env.SELF_URL = 'http://127.0.0.1:8080';
	const { default: buildServer } = await import('../../src/server.js');
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

afterAll(async () => {
	await server.close();
});

describe('Fastify server', () => {
	it('returns the healthcheck', async () => {
		const response = await server.inject({
			method: 'GET',
			url: '/healthcheck'
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			status: 'OK'
		});
	});
	it('creates a device cookie', async () => {
		const response = await server.inject({
			method: 'GET',
			url: '/healthcheck'
		});
		const cookie = String(response.headers['set-cookie']);
		expect(cookie).toContain('dz_device_cookie=');
	});
	it('rejects access to an authenticated route without a token', async () => {
		const response = await server.inject({
			method: 'GET',
			url: '/api/users/me'
		});
		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			message: 'Authentication required'
		});
	});
	it('validates the login payload', async () => {
		const response = await server.inject({
			method: 'POST',
			url: '/api/users/login',
			payload: {}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'request.invalid'
		});
	});
});
