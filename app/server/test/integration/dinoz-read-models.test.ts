import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { MAGNETITE_SCENARIO_KEY, MagnetiteProgression } from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
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
	/*
	 * getAvailableActions() demande
	 * toujours le lieu du marchand
	 * itinérant.
	 *
	 * Les tests d'intégration partent
	 * d'une DB vide, on seed donc le
	 * secret système minimal nécessaire.
	 */
	await prisma.secret.create({
		data: {
			key: 'itinerant',
			value: String(PlaceEnum.NOWHERE)
		}
	});
});

afterAll(async () => {
	await server.close();
});

describe('Dinoz read models', () => {
	describe('fiche', () => {
		it('returns the owned Dinoz fiche', async () => {
			const user = await createTestUser({
				name: 'FicheOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'FicheDinoz',
				canRename: false,
				placeId: PlaceEnum.DINOVILLE,
				level: 7,
				life: 73,
				maxLife: 120,
				experience: 42,
				remaining: 2,
				fight: true,
				gather: false
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/fiche/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				id: dinoz.id,
				name: 'FicheDinoz',
				level: 7,
				life: 73,
				maxLife: 120,
				experience: 42,
				placeId: PlaceEnum.DINOVILLE,
				remaining: 2,
				fight: true,
				gather: false
			});
			expect(Array.isArray(response.json().actions)).toBe(true);
		});

		it('keeps the Team W secret shop visible after completing the Magnetite scenario', async () => {
			const user = await createTestUser({
				name: 'SecretShopOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'SecretShopDinoz',
				canRename: false,
				placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W
			});
			await prisma.userScenario.create({
				data: {
					userId: user.id,
					scenarioKey: MAGNETITE_SCENARIO_KEY,
					progression: MagnetiteProgression.FINAL_ASSAULT_WON
				}
			});
			const cookie = createAuthCookie(server, user);
			const hasSecretShopAction = async () => {
				const response = await server.inject({
					method: 'GET',
					url: `/api/dinoz/fiche/${dinoz.id}`,
					headers: {
						cookie
					}
				});
				expect(response.statusCode).toBe(200);
				const body = response.json() as {
					actions: Array<{
						name: string;
						prop?: number;
					}>;
				};
				return body.actions.some(
					action => action.name === 'shop' && action.prop === shopListV2.STEPS_SECRET_SHOP.shopId
				);
			};
			expect(await hasSecretShopAction()).toBe(false);
			await prisma.userScenario.update({
				where: {
					scenarioKey_userId: {
						userId: user.id,
						scenarioKey: MAGNETITE_SCENARIO_KEY
					}
				},
				data: {
					progression: MagnetiteProgression.CLAIM_REWARD
				}
			});
			expect(await hasSecretShopAction()).toBe(true);
			await prisma.userScenario.update({
				where: {
					scenarioKey_userId: {
						userId: user.id,
						scenarioKey: MAGNETITE_SCENARIO_KEY
					}
				},
				data: {
					progression: MagnetiteProgression.COMPLETED
				}
			});
			expect(await hasSecretShopAction()).toBe(true);
		});

		it('returns dinozNotFound for an unknown Dinoz', async () => {
			const user = await createTestUser({
				name: 'UnknownFicheOwner',
				withTutorial: false
			});
			const response = await server.inject({
				method: 'GET',
				url: '/api/dinoz/fiche/999999',
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozNotFound'
			});
		});

		it('prevents reading another player Dinoz and does not trigger lazy updates', async () => {
			const owner = await createTestUser({
				name: 'ProtectedFicheOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'FicheAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedFicheDinoz',
				canRename: false
			});
			const expiredTimer = new Date(Date.now() - 60_000);
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'unfreezing',
					stateTimer: expiredTimer
				}
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/fiche/${dinoz.id}`,
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
			/*
			 * Le timer est expiré mais le
			 * dégel ne doit surtout pas être
			 * déclenché par l'attaquant.
			 */
			expect(unchanged.state).toBe('unfreezing');
			expect(unchanged.stateTimer?.getTime()).toBe(expiredTimer.getTime());
		});

		it('completes an expired unfreeze when the owner opens the fiche', async () => {
			const user = await createTestUser({
				name: 'LazyUnfreezeFicheOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'LazyUnfreezeFicheDinoz',
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
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/fiche/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				id: dinoz.id,
				state: null
			});
			const unfrozen = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unfrozen.state).toBeNull();
			expect(unfrozen.stateTimer).toBeNull();
		});

		it('applies pending rest regeneration when the fiche is opened', async () => {
			const user = await createTestUser({
				name: 'LazyRestFicheOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'LazyRestFicheDinoz',
				canRename: false,
				life: 40,
				maxLife: 100
			});
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					state: 'resting',
					stateTimer: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5000)
				}
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/fiche/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				id: dinoz.id,
				life: 42,
				state: 'resting'
			});
			expect(response.json().rest).not.toBeNull();
			const resting = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(resting.life).toBe(42);
			expect(resting.state).toBe('resting');
		});
	});

	describe('menu', () => {
		it('returns only the authenticated player Dinoz', async () => {
			const user = await createTestUser({
				name: 'MenuOwner',
				withTutorial: false
			});
			const otherUser = await createTestUser({
				name: 'OtherMenuOwner',
				withTutorial: false
			});
			const first = await createTestDinoz({
				userId: user.id,
				name: 'MenuFirst',
				canRename: false
			});
			const second = await createTestDinoz({
				userId: user.id,
				name: 'MenuSecond',
				canRename: false
			});
			const foreign = await createTestDinoz({
				userId: otherUser.id,
				name: 'ForeignMenuDinoz',
				canRename: false
			});
			const response = await server.inject({
				method: 'GET',
				url: '/api/dinoz/menu',
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json() as Array<{
				id: number;
				name: string;
			}>;
			expect(body.map(dinoz => dinoz.id)).toEqual(expect.arrayContaining([first.id, second.id]));
			expect(body).toHaveLength(2);
			expect(body.some(dinoz => dinoz.id === foreign.id)).toBe(false);
		});

		it('applies lazy Dinoz updates before returning the menu', async () => {
			const user = await createTestUser({
				name: 'LazyMenuOwner',
				withTutorial: false
			});
			const unfreezing = await createTestDinoz({
				userId: user.id,
				name: 'MenuUnfreezing',
				canRename: false
			});
			const resting = await createTestDinoz({
				userId: user.id,
				name: 'MenuResting',
				canRename: false,
				life: 40,
				maxLife: 100
			});
			await prisma.dinoz.update({
				where: {
					id: unfreezing.id
				},
				data: {
					state: 'unfreezing',
					stateTimer: new Date(Date.now() - 1000)
				}
			});
			await prisma.dinoz.update({
				where: {
					id: resting.id
				},
				data: {
					state: 'resting',
					stateTimer: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5000)
				}
			});
			const response = await server.inject({
				method: 'GET',
				url: '/api/dinoz/menu',
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json() as Array<{
				id: number;
				state: string | null;
				life: number;
				rest: object | null;
			}>;
			const unfrozenResult = body.find(dinoz => dinoz.id === unfreezing.id);
			const restingResult = body.find(dinoz => dinoz.id === resting.id);
			expect(unfrozenResult).toMatchObject({
				state: null
			});
			expect(restingResult).toMatchObject({
				state: 'resting',
				life: 42
			});
			expect(restingResult?.rest).not.toBeNull();
			const [unfrozenDb, restingDb] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: unfreezing.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: resting.id
					}
				})
			]);
			expect(unfrozenDb.state).toBeNull();
			expect(unfrozenDb.stateTimer).toBeNull();
			expect(restingDb.life).toBe(42);
		});
	});
});
