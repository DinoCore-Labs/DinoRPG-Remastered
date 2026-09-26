import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { startDinozConcentration } from '../../src/Dinoz/Controller/concentrationDinoz.controller.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

const IRMA_ITEM_ID = itemList[Item.POTION_IRMA].itemId;

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

async function addIrma(userId: string, quantity: number): Promise<void> {
	await prisma.userItems.upsert({
		where: {
			itemId_userId: {
				userId,
				itemId: IRMA_ITEM_ID
			}
		},
		create: {
			userId,
			itemId: IRMA_ITEM_ID,
			quantity
		},
		update: {
			quantity
		}
	});
}

async function getIrmaQuantity(userId: string): Promise<number> {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId: IRMA_ITEM_ID
			}
		}
	});
	return item?.quantity ?? 0;
}

async function getItemUsedStat(userId: string): Promise<number> {
	const tracking = await prisma.userTracking.findUnique({
		where: {
			stat_userId: {
				userId,
				stat: StatTracking.ITEM_USED
			}
		}
	});
	return tracking?.quantity ?? 0;
}

async function addDinozStatus(dinozId: number, statusId: DinozStatusId): Promise<void> {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

async function createConcentrationReadyDinoz(userId: string, name: string) {
	const dinoz = await createTestDinoz({
		userId,
		name,
		canRename: false,
		placeId: PlaceEnum.BAO_BOB
	});
	await addDinozStatus(dinoz.id, DinozStatusId.FLIPPERS);
	return dinoz;
}

async function startConcentration(userId: string, dinozId: number) {
	return prisma.$transaction(tx => startDinozConcentration(tx, userId, dinozId));
}

describe('Dinoz actions', () => {
	describe('Irma potion', () => {
		it('restores actions using remaining without consuming an Irma potion', async () => {
			const user = await createTestUser({
				name: 'IrmaActionOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				remaining: 3,
				fight: false,
				gather: true
			});
			/*
			 * Aucun objet Irma n'est donné
			 * volontairement.
			 *
			 * remaining > 0 doit suffire.
			 */
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				category: ItemEffect.ACTION,
				value: 0
			});
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updated.fight).toBe(true);
			expect(updated.gather).toBe(true);
			expect(updated.remaining).toBe(2);
			expect(await getIrmaQuantity(user.id)).toBe(0);
			/*
			 * ITEM_USED correspond aux véritables
			 * objets consommés.
			 *
			 * Ici aucune potion n'a été utilisée.
			 */
			expect(await getItemUsedStat(user.id)).toBe(0);
		});

		it('consumes one Irma when no remaining action is available', async () => {
			const user = await createTestUser({
				name: 'IrmaPotionOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				remaining: 0,
				fight: false,
				gather: false
			});
			await addIrma(user.id, 2);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				category: ItemEffect.ACTION,
				value: 1
			});
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updated.fight).toBe(true);
			expect(updated.gather).toBe(true);
			/*
			 * Une potion ne redonne pas de
			 * remaining : elle rend directement
			 * les actions disponibles.
			 */
			expect(updated.remaining).toBe(0);
			expect(await getIrmaQuantity(user.id)).toBe(1);
			expect(await getItemUsedStat(user.id)).toBe(1);
		});

		it('removes the inventory row when the last Irma potion is consumed', async () => {
			const user = await createTestUser({
				name: 'LastIrmaOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				remaining: 0,
				fight: false,
				gather: true
			});
			await addIrma(user.id, 1);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				value: 1
			});
			expect(
				await prisma.userItems.count({
					where: {
						userId: user.id,
						itemId: IRMA_ITEM_ID
					}
				})
			).toBe(0);
			expect(await getItemUsedStat(user.id)).toBe(1);
		});

		it('handles mixed action and potion recovery across a Dinoz group', async () => {
			const user = await createTestUser({
				name: 'GroupIrmaOwner',
				withTutorial: false
			});
			/*
			 * Leader :
			 * remaining = 0
			 * → nécessite une Irma.
			 */
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'IrmaLeader',
				canRename: false,
				remaining: 0,
				fight: false,
				gather: false
			});
			/*
			 * Follower A :
			 * remaining = 2
			 * → utilise simplement une action.
			 */
			const followerWithAction = await createTestDinoz({
				userId: user.id,
				name: 'ActionFollower',
				canRename: false,
				remaining: 2,
				fight: false,
				gather: true
			});
			/*
			 * Follower B :
			 * remaining = 0
			 * → nécessite également une Irma.
			 */
			const followerWithNoAction = await createTestDinoz({
				userId: user.id,
				name: 'IrmaFollower',
				canRename: false,
				remaining: 0,
				fight: true,
				gather: false
			});
			await prisma.dinoz.update({
				where: {
					id: followerWithAction.id
				},
				data: {
					leaderId: leader.id
				}
			});
			await prisma.dinoz.update({
				where: {
					id: followerWithNoAction.id
				},
				data: {
					leaderId: leader.id
				}
			});
			/*
			 * Exactement deux Dinoz nécessitent
			 * une vraie potion.
			 */
			await addIrma(user.id, 2);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${leader.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				category: ItemEffect.ACTION,
				value: 2
			});
			const [updatedLeader, updatedActionFollower, updatedIrmaFollower] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: leader.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: followerWithAction.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: followerWithNoAction.id
					}
				})
			]);
			/*
			 * Tous les membres récupèrent
			 * fight + gather.
			 */
			for (const member of [updatedLeader, updatedActionFollower, updatedIrmaFollower]) {
				expect(member.fight).toBe(true);
				expect(member.gather).toBe(true);
			}
			/*
			 * Leader :
			 * Irma consommée.
			 */
			expect(updatedLeader.remaining).toBe(0);
			/*
			 * Follower A :
			 * une action naturelle consommée.
			 */
			expect(updatedActionFollower.remaining).toBe(1);
			/*
			 * Follower B :
			 * Irma consommée.
			 */
			expect(updatedIrmaFollower.remaining).toBe(0);
			/*
			 * Les deux Irma ont été utilisées.
			 */
			expect(await getIrmaQuantity(user.id)).toBe(0);
			expect(await getItemUsedStat(user.id)).toBe(2);
		});

		it('does not modify the group when there are not enough Irma potions', async () => {
			const user = await createTestUser({
				name: 'NotEnoughIrmaOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'PoorIrmaLeader',
				canRename: false,
				remaining: 0,
				fight: false,
				gather: false
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'PoorIrmaFollower',
				canRename: false,
				remaining: 0,
				fight: false,
				gather: true
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			/*
			 * Deux Irma seraient nécessaires,
			 * mais le joueur n'en possède qu'une.
			 */
			await addIrma(user.id, 1);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${leader.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'notEnoughIrma'
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
			expect(unchangedLeader.fight).toBe(false);
			expect(unchangedLeader.gather).toBe(false);
			expect(unchangedLeader.remaining).toBe(0);
			expect(unchangedFollower.fight).toBe(false);
			expect(unchangedFollower.gather).toBe(true);
			expect(unchangedFollower.remaining).toBe(0);
			/*
			 * L'inventaire doit rester intact.
			 */
			expect(await getIrmaQuantity(user.id)).toBe(1);
			expect(await getItemUsedStat(user.id)).toBe(0);
		});

		it('does nothing when every action is already available', async () => {
			const user = await createTestUser({
				name: 'UnusedIrmaOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false,
				remaining: 0,
				fight: true,
				gather: true
			});
			await addIrma(user.id, 3);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/irma`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				category: ItemEffect.ACTION,
				value: 0
			});
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.remaining).toBe(0);
			expect(unchanged.fight).toBe(true);
			expect(unchanged.gather).toBe(true);
			expect(await getIrmaQuantity(user.id)).toBe(3);
			expect(await getItemUsedStat(user.id)).toBe(0);
		});

		it('prevents a player from using Irma on another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'IrmaRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'IrmaAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false,
				remaining: 0,
				fight: false,
				gather: false
			});
			await addIrma(attacker.id, 1);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/irma`,
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
			expect(unchanged.remaining).toBe(0);
			expect(unchanged.fight).toBe(false);
			expect(unchanged.gather).toBe(false);
			/*
			 * L'attaquant ne perd évidemment
			 * pas sa potion.
			 */
			expect(await getIrmaQuantity(attacker.id)).toBe(1);
		});
	});

	describe('concentration', () => {
		it('starts concentration at Bao Bob with Flippers', async () => {
			const user = await createTestUser({
				name: 'ConcentrationOwner',
				withTutorial: false
			});
			const dinoz = await createConcentrationReadyDinoz(user.id, 'ConcentratingDinoz');
			const result = await startConcentration(user.id, dinoz.id);
			expect(result).toMatchObject({
				participantCount: 1,
				portalOpened: false
			});
			const participation = await prisma.dinozConcentration.findUniqueOrThrow({
				where: {
					dinozId: dinoz.id
				},
				include: {
					session: true
				}
			});
			expect(participation.sessionId).toBe(result.sessionId);
			expect(participation.session.scopeKey).toBe(`user:${user.id}`);
			expect(participation.session.state).toBe('GATHERING');
			expect(participation.session.openedAt).toBeNull();
		});

		it('requires Bao Bob and Flippers to start concentration', async () => {
			const user = await createTestUser({
				name: 'InvalidConcentrationOwner',
				withTutorial: false
			});
			const wrongPlace = await createTestDinoz({
				userId: user.id,
				name: 'WrongPlace',
				canRename: false,
				placeId: PlaceEnum.DINOVILLE
			});
			await addDinozStatus(wrongPlace.id, DinozStatusId.FLIPPERS);
			await expect(startConcentration(user.id, wrongPlace.id)).rejects.toMatchObject({
				code: 'concentrationInvalidPlace'
			});
			const missingFlippers = await createTestDinoz({
				userId: user.id,
				name: 'MissingFlippers',
				canRename: false,
				placeId: PlaceEnum.BAO_BOB
			});
			await expect(startConcentration(user.id, missingFlippers.id)).rejects.toMatchObject({
				code: 'concentrationMissingFlippers'
			});
			expect(await prisma.dinozConcentration.count()).toBe(0);
			expect(await prisma.dinozConcentrationSession.count()).toBe(0);
		});

		it('detaches the Dinoz and its followers from their group when concentration starts', async () => {
			const user = await createTestUser({
				name: 'ConcentrationGroupOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'GroupLeader',
				canRename: false,
				placeId: PlaceEnum.BAO_BOB
			});
			const concentrating = await createConcentrationReadyDinoz(user.id, 'GroupMiddle');
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'GroupFollower',
				canRename: false,
				placeId: PlaceEnum.BAO_BOB
			});
			/*
			 * Leader
			 *   ↓
			 * GroupMiddle
			 *   ↓
			 * GroupFollower
			 */
			await prisma.dinoz.update({
				where: {
					id: concentrating.id
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
					leaderId: concentrating.id
				}
			});
			await startConcentration(user.id, concentrating.id);
			const [updatedConcentrating, updatedFollower] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: concentrating.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: follower.id
					}
				})
			]);
			expect(updatedConcentrating.leaderId).toBeNull();
			expect(updatedFollower.leaderId).toBeNull();
			expect(
				await prisma.dinozConcentration.count({
					where: {
						dinozId: concentrating.id
					}
				})
			).toBe(1);
		});

		it('reuses the same gathering session for Dinoz in the same scope', async () => {
			const user = await createTestUser({
				name: 'SharedConcentrationOwner',
				withTutorial: false
			});
			const first = await createConcentrationReadyDinoz(user.id, 'FirstConcentrator');
			const second = await createConcentrationReadyDinoz(user.id, 'SecondConcentrator');
			const firstResult = await startConcentration(user.id, first.id);
			const secondResult = await startConcentration(user.id, second.id);
			expect(firstResult.sessionId).toBe(secondResult.sessionId);
			expect(firstResult.participantCount).toBe(1);
			expect(secondResult.participantCount).toBe(2);
			expect(await prisma.dinozConcentrationSession.count()).toBe(1);
			expect(
				await prisma.dinozConcentration.count({
					where: {
						sessionId: firstResult.sessionId
					}
				})
			).toBe(2);
		});

		it('serializes concurrent concentration starts and opens the portal exactly at seven Dinoz', async () => {
			const user = await createTestUser({
				name: 'PortalOpeningOwner',
				withTutorial: false
			});
			const dinozList = await Promise.all(
				Array.from({ length: 7 }, (_, index) => createConcentrationReadyDinoz(user.id, `PortalDinoz${index}`))
			);
			/*
			 * Toutes les requêtes arrivent
			 * en même temps.
			 *
			 * Le pg_advisory_xact_lock doit
			 * sérialiser les modifications
			 * d'une même scope.
			 */
			const results = await Promise.all(dinozList.map(dinoz => startConcentration(user.id, dinoz.id)));
			/*
			 * Il ne doit exister qu'une
			 * seule session.
			 */
			const sessions = await prisma.dinozConcentrationSession.findMany();
			expect(sessions).toHaveLength(1);
			const session = sessions[0];
			expect(session).toBeDefined();
			if (!session) {
				throw new Error('Concentration session missing');
			}
			expect(session.scopeKey).toBe(`user:${user.id}`);
			expect(session.state).toBe('OPEN');
			expect(session.openedAt).not.toBeNull();
			expect(
				await prisma.dinozConcentration.count({
					where: {
						sessionId: session.id
					}
				})
			).toBe(7);
			/*
			 * Les compteurs retournés doivent
			 * couvrir exactement 1 → 7.
			 */
			expect(results.map(result => result.participantCount).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
			/*
			 * Une seule transaction est celle
			 * qui ouvre réellement le portail.
			 */
			expect(results.filter(result => result.portalOpened)).toHaveLength(1);
			expect(results.find(result => result.portalOpened)?.participantCount).toBe(7);
		});

		it('allows a Dinoz to stop concentrating before the portal opens', async () => {
			const user = await createTestUser({
				name: 'StopConcentrationOwner',
				withTutorial: false
			});
			const first = await createConcentrationReadyDinoz(user.id, 'StopFirst');
			const second = await createConcentrationReadyDinoz(user.id, 'StopSecond');
			const firstResult = await startConcentration(user.id, first.id);
			await startConcentration(user.id, second.id);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${first.id}/stop-concentration`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toEqual({
				ok: true
			});
			expect(
				await prisma.dinozConcentration.findUnique({
					where: {
						dinozId: first.id
					}
				})
			).toBeNull();
			/*
			 * Le second participant reste
			 * dans la session.
			 */
			expect(
				await prisma.dinozConcentration.count({
					where: {
						sessionId: firstResult.sessionId
					}
				})
			).toBe(1);
			expect(
				await prisma.dinozConcentrationSession.count({
					where: {
						id: firstResult.sessionId
					}
				})
			).toBe(1);
			/*
			 * Lorsque le dernier participant
			 * quitte à son tour, la session
			 * GATHERING est supprimée.
			 */
			const secondResponse = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${second.id}/stop-concentration`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(secondResponse.statusCode).toBe(200);
			expect(
				await prisma.dinozConcentrationSession.count({
					where: {
						id: firstResult.sessionId
					}
				})
			).toBe(0);
		});

		it('refuses to enter the portal before seven Dinoz are concentrating', async () => {
			const user = await createTestUser({
				name: 'EarlyPortalOwner',
				withTutorial: false
			});
			const dinoz = await createConcentrationReadyDinoz(user.id, 'EarlyPortalDinoz');
			await startConcentration(user.id, dinoz.id);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/enter-portal`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'concentrationNotCompleted'
			});
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.placeId).toBe(PlaceEnum.BAO_BOB);
			expect(
				await prisma.dinozConcentration.count({
					where: {
						dinozId: dinoz.id
					}
				})
			).toBe(1);
		});

		it('refuses to stop concentration after the portal has opened', async () => {
			const user = await createTestUser({
				name: 'OpenedPortalStopOwner',
				withTutorial: false
			});
			const dinozList = await Promise.all(
				Array.from({ length: 7 }, (_, index) => createConcentrationReadyDinoz(user.id, `OpenedPortal${index}`))
			);
			for (const dinoz of dinozList) {
				await startConcentration(user.id, dinoz.id);
			}
			const selected = dinozList[0];
			if (!selected) {
				throw new Error('Expected concentration Dinoz');
			}
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${selected.id}/stop-concentration`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'concentrationCannotStopAfterOpening'
			});
			expect(await prisma.dinozConcentration.count()).toBe(7);
			const session = await prisma.dinozConcentrationSession.findFirstOrThrow();
			expect(session.state).toBe('OPEN');
		});

		it('teleports Dinoz through an open portal and removes the concentration session after the last participant', async () => {
			const user = await createTestUser({
				name: 'PortalTravelOwner',
				withTutorial: false
			});
			const dinozList = await Promise.all(
				Array.from({ length: 7 }, (_, index) => createConcentrationReadyDinoz(user.id, `Traveler${index}`))
			);
			for (const dinoz of dinozList) {
				await startConcentration(user.id, dinoz.id);
			}
			const session = await prisma.dinozConcentrationSession.findFirstOrThrow();
			expect(session.state).toBe('OPEN');
			const cookie = createAuthCookie(server, user);
			for (let index = 0; index < dinozList.length; index++) {
				const dinoz = dinozList[index];
				if (!dinoz) {
					throw new Error('Expected portal participant');
				}
				const response = await server.inject({
					method: 'POST',
					url: `/api/dinoz/${dinoz.id}/enter-portal`,
					headers: {
						cookie
					}
				});
				expect(response.statusCode).toBe(200);
				expect(response.json()).toEqual({
					ok: true,
					placeId: PlaceEnum.PORTAIL
				});
				const teleported = await prisma.dinoz.findUniqueOrThrow({
					where: {
						id: dinoz.id
					}
				});
				expect(teleported.placeId).toBe(PlaceEnum.PORTAIL);
				/*
				 * Le Dinoz quitte immédiatement
				 * les participants.
				 */
				expect(
					await prisma.dinozConcentration.findUnique({
						where: {
							dinozId: dinoz.id
						}
					})
				).toBeNull();
				const remaining = dinozList.length - index - 1;
				expect(
					await prisma.dinozConcentration.count({
						where: {
							sessionId: session.id
						}
					})
				).toBe(remaining);
			}
			/*
			 * Le dernier passage détruit
			 * la session désormais vide.
			 */
			expect(
				await prisma.dinozConcentrationSession.findUnique({
					where: {
						id: session.id
					}
				})
			).toBeNull();
		});

		it('prevents another player from stopping a Dinoz concentration', async () => {
			const owner = await createTestUser({
				name: 'ConcentrationRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'ConcentrationAttacker',
				withTutorial: false
			});
			const dinoz = await createConcentrationReadyDinoz(owner.id, 'ProtectedConcentrator');
			await startConcentration(owner.id, dinoz.id);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/stop-concentration`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			/*
			 * La participation du propriétaire
			 * reste intacte.
			 */
			expect(
				await prisma.dinozConcentration.count({
					where: {
						dinozId: dinoz.id
					}
				})
			).toBe(1);
		});
	});
});
