import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

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
});
