import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

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

describe('Dinoz lifecycle', () => {
	describe('naming', () => {
		it('allows the owner to name a newly adopted Dinoz exactly once', async () => {
			const user = await createTestUser({
				name: 'DinozOwner'
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'UnnamedDinoz',
				canRename: true
			});
			const cookie = createAuthCookie(server, user);
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/setname/${dinoz.id}`,
				headers: {
					cookie
				},
				payload: {
					name: 'Nox'
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				ok: true
			});
			const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updatedDinoz.name).toBe('Nox');
			expect(updatedDinoz.canRename).toBe(false);
			/*
			 * Le nommage correspond également
			 * à l'adoption du Dinoz dans le
			 * tutoriel.
			 *
			 * tutorial :
			 * 0 = adoption du Dinoz
			 * 1 = parler à Guide Michel
			 */
			const tutorial = await prisma.userScenario.findUniqueOrThrow({
				where: {
					scenarioKey_userId: {
						userId: user.id,
						scenarioKey: 'tutorial'
					}
				}
			});
			expect(tutorial.progression).toBe(1);
			/*
			 * Une seconde tentative de renommage
			 * doit être refusée.
			 */
			const secondResponse = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/setname/${dinoz.id}`,
				headers: {
					cookie
				},
				payload: {
					name: 'SecondName'
				}
			});
			expect(secondResponse.statusCode).toBe(400);
			/*
			 * Le nom initialement validé reste
			 * inchangé.
			 */
			const afterSecondAttempt = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(afterSecondAttempt.name).toBe('Nox');
			expect(afterSecondAttempt.canRename).toBe(false);
			/*
			 * Le tutoriel ne doit évidemment
			 * pas avancer une seconde fois.
			 */
			expect(
				(
					await prisma.userScenario.findUniqueOrThrow({
						where: {
							scenarioKey_userId: {
								userId: user.id,
								scenarioKey: 'tutorial'
							}
						}
					})
				).progression
			).toBe(1);
		});

		it('prevents a player from naming another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'RealOwner'
			});
			const attacker = await createTestUser({
				name: 'OtherPlayer'
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedDinoz',
				canRename: true
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/setname/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				},
				payload: {
					name: 'Stolen'
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchangedDinoz.name).toBe('ProtectedDinoz');
			expect(unchangedDinoz.canRename).toBe(true);
		});

		it('rejects an invalid Dinoz name without changing its state', async () => {
			const user = await createTestUser({
				name: 'InvalidNameOwner'
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'BeforeInvalidName',
				canRename: true
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/setname/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					name: 'Dinoz@Invalid!'
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'request.invalid'
			});
			const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchangedDinoz.name).toBe('BeforeInvalidName');
			expect(unchangedDinoz.canRename).toBe(true);
			const tutorial = await prisma.userScenario.findUniqueOrThrow({
				where: {
					scenarioKey_userId: {
						userId: user.id,
						scenarioKey: 'tutorial'
					}
				}
			});
			expect(tutorial.progression).toBe(0);
		});

		it('returns dinozNotFound for an unknown Dinoz', async () => {
			const user = await createTestUser({
				name: 'MissingDinozOwner'
			});
			const response = await server.inject({
				method: 'PUT',
				url: '/api/dinoz/setname/999999',
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					name: 'Nobody'
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozNotFound'
			});
		});

		it('accepts supported accented, numeric and compound names', async () => {
			const user = await createTestUser({
				name: 'FancyNameOwner'
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'BeforeFancyName',
				canRename: true
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/setname/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					name: "Étoile-42 d'Azur"
				}
			});
			expect(response.statusCode).toBe(200);
			const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updatedDinoz.name).toBe("Étoile-42 d'Azur");
			expect(updatedDinoz.canRename).toBe(false);
		});
	});
});
