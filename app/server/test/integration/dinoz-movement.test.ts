import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
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

async function createStrongDinoz(userId: string, placeId: PlaceEnum = PlaceEnum.DINOVILLE, name?: string) {
	return createTestDinoz({
		userId,
		name,
		canRename: false,
		placeId,
		level: 1,
		life: 100_000,
		maxLife: 100_000,
		nbrUpFire: 1000,
		nbrUpWood: 1000,
		nbrUpWater: 1000,
		nbrUpLightning: 1000,
		nbrUpAir: 1000,
		fight: true
	});
}

async function getMoveCount(userId: string): Promise<number> {
	const tracking = await prisma.userTracking.findUnique({
		where: {
			stat_userId: {
				userId,
				stat: StatTracking.MOVES
			}
		}
	});
	return tracking?.quantity ?? 0;
}

describe('Dinoz movement', () => {
	it('moves a Dinoz to an adjacent place and consumes its fight action', async () => {
		const user = await createTestUser({
			name: 'MovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'MovingDinoz');
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(200);
		const updated = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updated.placeId).toBe(PlaceEnum.UNIVERSITE);
		expect(updated.fight).toBe(false);
		expect(await getMoveCount(user.id)).toBe(1);
	});

	it('moves the whole Dinoz group together', async () => {
		const user = await createTestUser({
			name: 'GroupMovementOwner',
			withTutorial: false
		});
		const leader = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'MovementLeader');
		const follower = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'MovementFollower');
		await prisma.dinoz.update({
			where: {
				id: follower.id
			},
			data: {
				leaderId: leader.id
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: leader.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});

		expect(response.statusCode).toBe(200);
		const [updatedLeader, updatedFollower] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			}),
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			})
		]);
		expect(updatedLeader.placeId).toBe(PlaceEnum.UNIVERSITE);
		expect(updatedFollower.placeId).toBe(PlaceEnum.UNIVERSITE);
		expect(updatedLeader.fight).toBe(false);
		expect(updatedFollower.fight).toBe(false);
		expect(updatedFollower.leaderId).toBe(leader.id);
		/*
		 * Un mouvement de groupe compte
		 * comme un déplacement joueur,
		 * pas un déplacement par Dinoz.
		 */
		expect(await getMoveCount(user.id)).toBe(1);
	});

	it('prevents a follower from moving the group', async () => {
		const user = await createTestUser({
			name: 'FollowerMovementOwner',
			withTutorial: false
		});
		const leader = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'StaticLeader');
		const follower = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'MovingFollower');
		await prisma.dinoz.update({
			where: {
				id: follower.id
			},
			data: {
				leaderId: leader.id
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: follower.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notLeader'
		});
		const [unchangedLeader, unchangedFollower] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			}),
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			})
		]);
		expect(unchangedLeader.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchangedFollower.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchangedFollower.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents a dead Dinoz from moving', async () => {
		const user = await createTestUser({
			name: 'DeadMovementOwner',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			name: 'DeadMover',
			canRename: false,
			placeId: PlaceEnum.DINOVILLE,
			life: 0,
			fight: true
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dead'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents movement when the Dinoz has no fight action available', async () => {
		const user = await createTestUser({
			name: 'NoActionMovementOwner',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			name: 'NoActionMover',
			canRename: false,
			placeId: PlaceEnum.DINOVILLE,
			fight: false
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'missingIrma'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(false);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents movement to the current place', async () => {
		const user = await createTestUser({
			name: 'SamePlaceMovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.DINOVILLE
			}
		});
		expect(response.statusCode).toBe(400);
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents movement to a non-adjacent place', async () => {
		const user = await createTestUser({
			name: 'NonAdjacentMovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE);
		/*
		 * Papy Joe n'est pas directement
		 * adjacent à Dinoville.
		 */
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.PAPY_JOE
			}
		});
		expect(response.statusCode).toBe(400);
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents movement to an unknown place', async () => {
		const user = await createTestUser({
			name: 'UnknownPlaceMovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: 999_999
			}
		});
		expect(response.statusCode).toBe(400);
		expect(
			(
				await prisma.dinoz.findUniqueOrThrow({
					where: {
						id: dinoz.id
					}
				})
			).placeId
		).toBe(PlaceEnum.DINOVILLE);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('enforces movement conditions before leaving the current place', async () => {
		const user = await createTestUser({
			name: 'MovementConditionOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'NoDinoplazaAccess');
		/*
		 * Dinoville → GO_TO_DINOPLAZA
		 * nécessite fx(plaza).
		 */
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.GO_TO_DINOPLAZA
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'missingStatus'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('resolves a goto place when the movement condition is fulfilled', async () => {
		const user = await createTestUser({
			name: 'GotoMovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'DinoplazaTraveler');
		await prisma.dinozStatus.create({
			data: {
				dinozId: dinoz.id,
				statusId: DinozStatusId.DINOPLAZA
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.GO_TO_DINOPLAZA
			}
		});
		expect(response.statusCode).toBe(200);
		const updated = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		/*
		 * GO_TO_DINOPLAZA est un lieu virtuel.
		 * La destination réellement enregistrée
		 * est DINOPLAZA.
		 */
		expect(updated.placeId).toBe(PlaceEnum.DINOPLAZA);
		expect(updated.fight).toBe(false);
		expect(await getMoveCount(user.id)).toBe(1);
	});

	it('detaches unavailable followers before moving the remaining group', async () => {
		const user = await createTestUser({
			name: 'UnavailableFollowerMovementOwner',
			withTutorial: false
		});
		const leader = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'AvailableMovementLeader');
		const follower = await createTestDinoz({
			userId: user.id,
			name: 'RestingMovementFollower',
			canRename: false,
			placeId: PlaceEnum.DINOVILLE,
			fight: true
		});
		await prisma.dinoz.update({
			where: {
				id: follower.id
			},
			data: {
				leaderId: leader.id,
				state: 'resting',
				stateTimer: new Date()
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: leader.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(200);
		const [updatedLeader, updatedFollower] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			}),
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			})
		]);
		expect(updatedLeader.placeId).toBe(PlaceEnum.UNIVERSITE);
		expect(updatedLeader.fight).toBe(false);
		/*
		 * Le follower indisponible quitte le
		 * groupe et reste à son emplacement.
		 */
		expect(updatedFollower.leaderId).toBeNull();
		expect(updatedFollower.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(updatedFollower.state).toBe('resting');
		expect(updatedFollower.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(1);
	});

	it('prevents movement while a group member is concentrating', async () => {
		const user = await createTestUser({
			name: 'ConcentrationMovementOwner',
			withTutorial: false
		});
		const leader = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'ConcentrationMovementLeader');
		const follower = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'ConcentratingMovementFollower');
		await prisma.dinoz.update({
			where: {
				id: follower.id
			},
			data: {
				leaderId: leader.id
			}
		});
		const session = await prisma.dinozConcentrationSession.create({
			data: {
				scopeKey: `user:${user.id}`
			}
		});
		await prisma.dinozConcentration.create({
			data: {
				dinozId: follower.id,
				sessionId: session.id
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				dinozId: leader.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dinozConcentrating',
			params: {
				dinozId: follower.id
			}
		});
		const [unchangedLeader, unchangedFollower] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			}),
			prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			})
		]);
		expect(unchangedLeader.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchangedFollower.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchangedLeader.fight).toBe(true);
		expect(unchangedFollower.fight).toBe(true);
		expect(await getMoveCount(user.id)).toBe(0);
	});

	it('prevents moving another player Dinoz', async () => {
		const owner = await createTestUser({
			name: 'MovementRealOwner',
			withTutorial: false
		});
		const attacker = await createTestUser({
			name: 'MovementAttacker',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(owner.id, PlaceEnum.DINOVILLE, 'ProtectedMover');
		const response = await server.inject({
			method: 'PUT',
			url: '/api/dinoz/move',
			headers: {
				cookie: createAuthCookie(server, attacker)
			},
			payload: {
				dinozId: dinoz.id,
				placeId: PlaceEnum.UNIVERSITE
			}
		});
		expect(response.statusCode).toBe(400);
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(unchanged.fight).toBe(true);
		expect(await getMoveCount(attacker.id)).toBe(0);
	});

	it('serializes concurrent movements for the same user', async () => {
		const user = await createTestUser({
			name: 'ConcurrentMovementOwner',
			withTutorial: false
		});
		const dinoz = await createStrongDinoz(user.id, PlaceEnum.DINOVILLE, 'ConcurrentMover');
		const cookie = createAuthCookie(server, user);
		const move = () =>
			server.inject({
				method: 'PUT',
				url: '/api/dinoz/move',
				headers: {
					cookie
				},
				payload: {
					dinozId: dinoz.id,
					placeId: PlaceEnum.UNIVERSITE
				}
			});
		const responses = await Promise.all([move(), move()]);
		/*
		 * La première requête déplace le Dinoz
		 * et consomme son action.
		 *
		 * La seconde s'exécute ensuite grâce
		 * au gameplay advisory lock et doit
		 * constater que l'action n'est plus
		 * disponible.
		 */
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
		const updated = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updated.placeId).toBe(PlaceEnum.UNIVERSITE);
		expect(updated.fight).toBe(false);
		/*
		 * Surtout : le mouvement métier
		 * n'est enregistré qu'une fois.
		 */
		expect(await getMoveCount(user.id)).toBe(1);
	});
});
