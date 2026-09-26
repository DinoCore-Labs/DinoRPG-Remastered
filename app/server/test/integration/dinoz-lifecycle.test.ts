import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { getUserMaxDinoz } from '../../src/Dinoz/Controller/getActiveDinoz.js';
import { applyUnfreezeIfNeeded } from '../../src/Dinoz/Controller/getUnfreezeDinoz.controller.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { UNFREEZE_DURATION_IN_MS } from '../../src/utils/dinoz/canFreezeDinozAction.js';
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

async function addDinozStatus(dinozId: number, statusId: DinozStatusId): Promise<void> {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

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

	describe('freeze and unfreeze', () => {
		it('freezes an eligible Dinoz at Gorges Profondes', async () => {
			const user = await createTestUser({
				name: 'FreezeOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			await addDinozStatus(dinoz.id, DinozStatusId.FSPELE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				success: true
			});
			const frozen = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(frozen.state).toBe('frozen');
			expect(frozen.stateTimer).toBeNull();
		});

		it('detaches a Dinoz and all its followers when freezing it', async () => {
			const user = await createTestUser({
				name: 'FreezeGroupOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'FreezeLeader',
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			const frozenDinoz = await createTestDinoz({
				userId: user.id,
				name: 'FreezeMiddle',
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'FreezeFollower',
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			await addDinozStatus(frozenDinoz.id, DinozStatusId.FSPELE);
			/*
			 * Leader
			 *   ↓
			 * FreezeMiddle
			 *   ↓
			 * Follower
			 */
			await prisma.dinoz.update({
				where: {
					id: frozenDinoz.id
				},
				data: {
					leaderId: leader.id
				}
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: frozenDinoz.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${frozenDinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const [updatedFrozen, updatedFollower] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: frozenDinoz.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: follower.id
					}
				})
			]);
			expect(updatedFrozen.state).toBe('frozen');
			/*
			 * Le Dinoz gelé ne suit plus
			 * son ancien leader.
			 */
			expect(updatedFrozen.leaderId).toBeNull();
			/*
			 * Et ses followers sont
			 * également détachés.
			 */
			expect(updatedFollower.leaderId).toBeNull();
			/*
			 * L'ancien leader reste
			 * évidemment intact.
			 */
			const unchangedLeader = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			});
			expect(unchangedLeader.state).toBeNull();
		});

		it('refuses to freeze a Dinoz outside Gorges Profondes', async () => {
			const user = await createTestUser({
				name: 'WrongFreezePlaceOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				placeId: PlaceEnum.DINOVILLE
			});
			await addDinozStatus(dinoz.id, DinozStatusId.FSPELE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.state).toBeNull();
			expect(unchanged.stateTimer).toBeNull();
		});

		it('refuses to freeze a Dinoz without the required FSPELE status', async () => {
			const user = await createTestUser({
				name: 'NoFreezeStatusOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});

			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.state).toBeNull();
		});

		it('refuses to freeze a dead Dinoz', async () => {
			const user = await createTestUser({
				name: 'DeadFreezeOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				life: 0,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			await addDinozStatus(dinoz.id, DinozStatusId.FSPELE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.life).toBe(0);
			expect(unchanged.state).toBeNull();
		});

		it('prevents a player from freezing another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'FreezeRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'FreezeAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false,
				placeId: PlaceEnum.GORGES_PROFONDES
			});
			await addDinozStatus(dinoz.id, DinozStatusId.FSPELE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/freeze`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.state).toBeNull();
		});

		it('starts a 24 hour unfreeze timer for a frozen Dinoz', async () => {
			const user = await createTestUser({
				name: 'UnfreezeOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'frozen',
					stateTimer: null
				}
			});
			const beforeRequest = Date.now();
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/unfreeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			const afterRequest = Date.now();
			expect(response.statusCode).toBe(200);
			const body = response.json() as {
				success: boolean;
				unfreezeAt: string;
			};
			expect(body.success).toBe(true);
			const unfreezeAt = new Date(body.unfreezeAt).getTime();
			/*
			 * Le timer doit correspondre
			 * à environ 24 heures.
			 *
			 * On encadre avec les timestamps
			 * avant/après la requête pour
			 * éviter un test fragile.
			 */
			expect(unfreezeAt).toBeGreaterThanOrEqual(beforeRequest + UNFREEZE_DURATION_IN_MS);
			expect(unfreezeAt).toBeLessThanOrEqual(afterRequest + UNFREEZE_DURATION_IN_MS);
			const unfreezing = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unfreezing.state).toBe('unfreezing');
			expect(unfreezing.stateTimer?.getTime()).toBe(unfreezeAt);
		});

		it('refuses to unfreeze when the active Dinoz limit is already reached', async () => {
			const user = await createTestUser({
				name: 'FullUnfreezeOwner',
				withTutorial: false
			});
			const frozenDinoz = await createTestDinoz({
				userId: user.id,
				name: 'FrozenExtraDinoz',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: frozenDinoz.id
				},
				data: {
					state: 'frozen'
				}
			});
			const maxDinoz = getUserMaxDinoz({
				leader: false,
				messie: false
			});
			/*
			 * Le Dinoz gelé n'est pas compté
			 * parmi les Dinoz actifs.
			 *
			 * On crée donc exactement la
			 * capacité maximale en plus.
			 */
			for (let index = 0; index < maxDinoz; index++) {
				await createTestDinoz({
					userId: user.id,
					name: `ActiveDinoz${index}`,
					canRename: false
				});
			}
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${frozenDinoz.id}/unfreeze`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: frozenDinoz.id
				}
			});
			expect(unchanged.state).toBe('frozen');
			expect(unchanged.stateTimer).toBeNull();
		});

		it('prevents a player from unfreezing another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'UnfreezeRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'UnfreezeAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'frozen'
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/unfreeze`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.state).toBe('frozen');
		});

		it('completes unfreezing when the timer has expired', async () => {
			const user = await createTestUser({
				name: 'FinishedUnfreezeOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'unfreezing',
					stateTimer: new Date(Date.now() - 1000)
				}
			});
			/*
			 * Le dégel est appliqué paresseusement.
			 *
			 * C'est cette fonction que le chargement
			 * du menu utilise pour vérifier si les
			 * 24 heures sont écoulées.
			 */
			const result = await prisma.$transaction(tx => applyUnfreezeIfNeeded(tx, dinoz.id));
			expect(result).toMatchObject({
				id: dinoz.id,
				state: null,
				stateTimer: null
			});
			const unfrozen = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unfrozen.state).toBeNull();
			expect(unfrozen.stateTimer).toBeNull();
		});

		it('keeps the Dinoz unfreezing while the timer has not expired', async () => {
			const user = await createTestUser({
				name: 'PendingUnfreezeOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			const futureTimer = new Date(Date.now() + 60 * 60 * 1000);
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'unfreezing',
					stateTimer: futureTimer
				}
			});
			const result = await prisma.$transaction(tx => applyUnfreezeIfNeeded(tx, dinoz.id));
			expect(result).toMatchObject({
				id: dinoz.id,
				state: 'unfreezing'
			});
			expect(result?.stateTimer?.getTime()).toBe(futureTimer.getTime());
			const stillUnfreezing = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(stillUnfreezing.state).toBe('unfreezing');
			expect(stillUnfreezing.stateTimer?.getTime()).toBe(futureTimer.getTime());
		});
	});
});
