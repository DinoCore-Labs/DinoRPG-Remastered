import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
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

	describe('rest', () => {
		it('starts resting when the Dinoz is below half life', async () => {
			const user = await createTestUser({
				name: 'RestingOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 40,
				maxLife: 100,
				fight: true
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/rest`,
				headers: {
					cookie: createAuthCookie(server, user)
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
			expect(updatedDinoz.state).toBe('resting');

			expect(updatedDinoz.stateTimer).not.toBeNull();
			/*
			 * Le début du repos ne soigne
			 * pas immédiatement le Dinoz.
			 */
			expect(updatedDinoz.life).toBe(40);
		});

		it('applies elapsed regeneration when stopping rest', async () => {
			const user = await createTestUser({
				name: 'RestHealingOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 40,
				maxLife: 100
			});
			/*
			 * Sans compétence particulière :
			 *
			 * regen = 1 PV / heure.
			 *
			 * On simule un repos commencé
			 * un peu plus de 2 heures auparavant
			 * pour garantir exactement 2 ticks.
			 */
			const stateTimer = new Date(Date.now() - 2 * 60 * 60 * 1000 - 60 * 1000);
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'resting',
					stateTimer
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/stop-rest`,
				headers: {
					cookie: createAuthCookie(server, user)
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
			expect(updatedDinoz.life).toBe(42);
			expect(updatedDinoz.state).toBeNull();
			expect(updatedDinoz.stateTimer).toBeNull();
		});

		it('refuses rest when the Dinoz has at least half of its life', async () => {
			const user = await createTestUser({
				name: 'HealthyRestOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 50,
				maxLife: 100,
				fight: true
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/rest`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchangedDinoz.life).toBe(50);
			expect(unchangedDinoz.state).toBeNull();
			expect(unchangedDinoz.stateTimer).toBeNull();
		});

		it('prevents a player from putting another player Dinoz to rest', async () => {
			const owner = await createTestUser({
				name: 'RestRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'RestAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false,
				life: 20,
				maxLife: 100
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/rest`,
				headers: {
					cookie: createAuthCookie(server, attacker)
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
			expect(unchangedDinoz.state).toBeNull();
			expect(unchangedDinoz.life).toBe(20);
		});

		it('refuses to stop resting when the Dinoz is not resting', async () => {
			const user = await createTestUser({
				name: 'NotRestingOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/stop-rest`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'notResting'
			});
		});
	});

	describe('resurrection', () => {
		it('naturally resurrects a dead Dinoz and resets its core state', async () => {
			const user = await createTestUser({
				name: 'ResurrectionOwner',
				withTutorial: false
			});
			const groupLeader = await createTestDinoz({
				userId: user.id,
				name: 'GroupLeader',
				canRename: false
			});
			const deadDinoz = await createTestDinoz({
				userId: user.id,
				name: 'DeadDinoz',
				canRename: false,
				life: 0,
				maxLife: 100,
				experience: 101,
				placeId: PlaceEnum.PAPY_JOE
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'Follower',
				canRename: false
			});
			/*
			 * On place le Dinoz mort au milieu
			 * d'une chaîne de groupe :
			 *
			 * GroupLeader
			 *      ↓
			 * DeadDinoz
			 *      ↓
			 * Follower
			 *
			 * La résurrection doit le sortir
			 * complètement du groupe.
			 */
			await prisma.dinoz.update({
				where: {
					id: deadDinoz.id
				},
				data: {
					leaderId: groupLeader.id
				}
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: deadDinoz.id
				}
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/resurrect/${deadDinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const resurrected = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: deadDinoz.id
				}
			});
			/*
			 * Résurrection naturelle :
			 * - 1 PV ;
			 * - moitié de l'XP arrondie ;
			 * - retour à Dinoville.
			 */
			expect(resurrected.life).toBe(1);
			expect(resurrected.experience).toBe(Math.round(101 / 2));
			expect(resurrected.placeId).toBe(PlaceEnum.DINOVILLE);
			/*
			 * Il ne suit plus personne.
			 */
			expect(resurrected.leaderId).toBeNull();
			/*
			 * Et ses anciens followers
			 * sont également détachés.
			 */
			const updatedFollower = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			});
			expect(updatedFollower.leaderId).toBeNull();
			/*
			 * La résurrection naturelle incrémente
			 * le compteur de morts.
			 */
			const deathTracking = await prisma.userTracking.findUniqueOrThrow({
				where: {
					stat_userId: {
						stat: StatTracking.DEATHS,
						userId: user.id
					}
				}
			});
			expect(deathTracking.quantity).toBe(1);
		});

		it('prevents a player from resurrecting another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'DeadDinozOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'ResurrectionAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false,
				life: 0,
				experience: 80,
				placeId: PlaceEnum.PAPY_JOE
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/resurrect/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
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
			expect(unchangedDinoz.life).toBe(0);
			expect(unchangedDinoz.experience).toBe(80);
			expect(unchangedDinoz.placeId).toBe(PlaceEnum.PAPY_JOE);
			expect(
				await prisma.userTracking.count({
					where: {
						userId: owner.id,
						stat: StatTracking.DEATHS
					}
				})
			).toBe(0);
		});

		it('refuses to resurrect a Dinoz that is still alive', async () => {
			const user = await createTestUser({
				name: 'AliveDinozOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 25,
				maxLife: 100,
				experience: 80,
				placeId: PlaceEnum.PAPY_JOE
			});
			const response = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/resurrect/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchangedDinoz.life).toBe(25);
			expect(unchangedDinoz.experience).toBe(80);
			expect(unchangedDinoz.placeId).toBe(PlaceEnum.PAPY_JOE);
			expect(
				await prisma.userTracking.count({
					where: {
						userId: user.id,
						stat: StatTracking.DEATHS
					}
				})
			).toBe(0);
		});

		it('cannot naturally resurrect the same Dinoz twice', async () => {
			const user = await createTestUser({
				name: 'DoubleResurrectionOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 0,
				experience: 100,
				placeId: PlaceEnum.PAPY_JOE
			});
			const cookie = createAuthCookie(server, user);
			const firstResponse = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/resurrect/${dinoz.id}`,
				headers: {
					cookie
				}
			});
			expect(firstResponse.statusCode).toBe(200);
			const secondResponse = await server.inject({
				method: 'PUT',
				url: `/api/dinoz/resurrect/${dinoz.id}`,
				headers: {
					cookie
				}
			});
			expect(secondResponse.statusCode).toBe(400);
			const resurrected = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(resurrected.life).toBe(1);
			/*
			 * 100 -> 50 lors de la première
			 * résurrection uniquement.
			 */
			expect(resurrected.experience).toBe(50);
			const deathTracking = await prisma.userTracking.findUniqueOrThrow({
				where: {
					stat_userId: {
						stat: StatTracking.DEATHS,
						userId: user.id
					}
				}
			});
			expect(deathTracking.quantity).toBe(1);
		});
	});
});
