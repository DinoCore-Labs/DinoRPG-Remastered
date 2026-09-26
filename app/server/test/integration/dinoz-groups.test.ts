import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
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

describe('Dinoz groups', () => {
	describe('follow', () => {
		it('allows a Dinoz to follow another owned Dinoz at the same place', async () => {
			const user = await createTestUser({
				name: 'FollowOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'Leader',
				canRename: false,
				placeId: PlaceEnum.DINOVILLE
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'Follower',
				canRename: false,
				placeId: PlaceEnum.DINOVILLE
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const updatedFollower = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: follower.id
				}
			});
			expect(updatedFollower.leaderId).toBe(leader.id);
			const updatedLeader = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				},
				include: {
					followers: true
				}
			});

			expect(updatedLeader.followers.map(dinoz => dinoz.id)).toEqual([follower.id]);
		});

		it('prevents a Dinoz from following itself', async () => {
			const user = await createTestUser({
				name: 'SelfFollowOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${dinoz.id}/follow/${dinoz.id}`,
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
			expect(unchanged.leaderId).toBeNull();
		});

		it('requires both Dinoz to be named before creating a group', async () => {
			const user = await createTestUser({
				name: 'UnnamedGroupOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'NamedLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'UnnamedFollower',
				canRename: true
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('requires both Dinoz to be at the same place', async () => {
			const user = await createTestUser({
				name: 'DifferentPlaceOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'DinovilleLeader',
				canRename: false,
				placeId: PlaceEnum.DINOVILLE
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'PortFollower',
				canRename: false,
				placeId: PlaceEnum.PORT_DE_PRECHE
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('prevents a Dinoz that already belongs to a group from following another leader', async () => {
			const user = await createTestUser({
				name: 'AlreadyGroupedOwner',
				withTutorial: false
			});
			const firstLeader = await createTestDinoz({
				userId: user.id,
				name: 'FirstLeader',
				canRename: false
			});
			const secondLeader = await createTestDinoz({
				userId: user.id,
				name: 'SecondLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'AlreadyFollower',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: firstLeader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${secondLeader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBe(firstLeader.id);
		});

		it('prevents following a leader that already has the maximum number of followers', async () => {
			const user = await createTestUser({
				name: 'FullGroupOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'FullLeader',
				canRename: false
			});
			const firstFollower = await createTestDinoz({
				userId: user.id,
				name: 'FirstFollower',
				canRename: false
			});
			const secondFollower = await createTestDinoz({
				userId: user.id,
				name: 'SecondFollower',
				canRename: false
			});
			const rejectedFollower = await createTestDinoz({
				userId: user.id,
				name: 'RejectedFollower',
				canRename: false
			});
			/*
			 * La capacité de base est actuellement
			 * de deux followers.
			 */
			await prisma.dinoz.updateMany({
				where: {
					id: {
						in: [firstFollower.id, secondFollower.id]
					}
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${rejectedFollower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'maxFollowers'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: rejectedFollower.id
						}
					})
				).leaderId
			).toBeNull();
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: leader.id
					}
				})
			).toBe(2);
		});

		it('prevents using another player Dinoz as a group member', async () => {
			const owner = await createTestUser({
				name: 'GroupRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'GroupAttacker',
				withTutorial: false
			});
			const protectedLeader = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedLeader',
				canRename: false
			});
			const attackerFollower = await createTestDinoz({
				userId: attacker.id,
				name: 'AttackerFollower',
				canRename: false
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${attackerFollower.id}/follow/${protectedLeader.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: attackerFollower.id
				}
			});

			expect(unchanged.leaderId).toBeNull();
		});
	});

	describe('unfollow', () => {
		it('removes a follower from its group', async () => {
			const user = await createTestUser({
				name: 'UnfollowOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'UnfollowLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'UnfollowFollower',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/unfollow`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: leader.id
					}
				})
			).toBe(0);
		});

		it('prevents a player from removing another player Dinoz from its group', async () => {
			const owner = await createTestUser({
				name: 'UnfollowRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'UnfollowAttacker',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedFollower',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/unfollow`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBe(leader.id);
		});
	});

	describe('disband', () => {
		it('detaches every follower from the leader', async () => {
			const user = await createTestUser({
				name: 'DisbandOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'DisbandLeader',
				canRename: false
			});
			const firstFollower = await createTestDinoz({
				userId: user.id,
				name: 'DisbandFollowerA',
				canRename: false
			});
			const secondFollower = await createTestDinoz({
				userId: user.id,
				name: 'DisbandFollowerB',
				canRename: false
			});
			await prisma.dinoz.updateMany({
				where: {
					id: {
						in: [firstFollower.id, secondFollower.id]
					}
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${leader.id}/disband`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const followers = await prisma.dinoz.findMany({
				where: {
					id: {
						in: [firstFollower.id, secondFollower.id]
					}
				},
				orderBy: {
					id: 'asc'
				}
			});
			expect(followers.every(dinoz => dinoz.leaderId === null)).toBe(true);
			/*
			 * Le leader lui-même reste intact.
			 */
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: leader.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('prevents a player from disbanding another player group', async () => {
			const owner = await createTestUser({
				name: 'DisbandRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'DisbandAttacker',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedDisbandLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedDisbandFollower',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${leader.id}/disband`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBe(leader.id);
		});
	});

	describe('change leader', () => {
		it('promotes a follower and reattaches the whole group to the new leader', async () => {
			const user = await createTestUser({
				name: 'ChangeLeaderOwner',
				withTutorial: false
			});
			const currentLeader = await createTestDinoz({
				userId: user.id,
				name: 'CurrentLeader',
				canRename: false
			});
			const newLeader = await createTestDinoz({
				userId: user.id,
				name: 'FutureLeader',
				canRename: false
			});
			const otherFollower = await createTestDinoz({
				userId: user.id,
				name: 'OtherFollower',
				canRename: false
			});
			await prisma.dinoz.updateMany({
				where: {
					id: {
						in: [newLeader.id, otherFollower.id]
					}
				},
				data: {
					leaderId: currentLeader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${newLeader.id}/change/${currentLeader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const [updatedCurrentLeader, updatedNewLeader, updatedOtherFollower] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: currentLeader.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: newLeader.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: otherFollower.id
					}
				})
			]);
			/*
			 * Le follower sélectionné devient
			 * le nouveau leader.
			 */
			expect(updatedNewLeader.leaderId).toBeNull();
			/*
			 * L'ancien leader devient follower.
			 */
			expect(updatedCurrentLeader.leaderId).toBe(newLeader.id);
			/*
			 * Tous les autres followers suivent
			 * maintenant le nouveau leader.
			 */
			expect(updatedOtherFollower.leaderId).toBe(newLeader.id);
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: newLeader.id
					}
				})
			).toBe(2);
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: currentLeader.id
					}
				})
			).toBe(0);
		});

		it('refuses to make a non-follower the new leader', async () => {
			const user = await createTestUser({
				name: 'InvalidChangeLeaderOwner',
				withTutorial: false
			});
			const standalone = await createTestDinoz({
				userId: user.id,
				name: 'Standalone',
				canRename: false
			});
			const target = await createTestDinoz({
				userId: user.id,
				name: 'UnusedTarget',
				canRename: false
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${standalone.id}/change/${target.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: standalone.id
						}
					})
				).leaderId
			).toBeNull();
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: target.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('prevents changing the leader when the promoted Dinoz cannot support the resulting group size', async () => {
			const user = await createTestUser({
				name: 'TooLargeChangeLeaderOwner',
				withTutorial: false
			});
			const currentLeader = await createTestDinoz({
				userId: user.id,
				name: 'LargeGroupLeader',
				canRename: false
			});
			const newLeader = await createTestDinoz({
				userId: user.id,
				name: 'LimitedFutureLeader',
				canRename: false
			});
			const followerA = await createTestDinoz({
				userId: user.id,
				name: 'LargeFollowerA',
				canRename: false
			});
			const followerB = await createTestDinoz({
				userId: user.id,
				name: 'LargeFollowerB',
				canRename: false
			});
			/*
			 * On prépare volontairement en DB
			 * un groupe de trois followers.
			 *
			 * Le nouveau leader a une capacité
			 * de base de deux followers.
			 */
			await prisma.dinoz.updateMany({
				where: {
					id: {
						in: [newLeader.id, followerA.id, followerB.id]
					}
				},
				data: {
					leaderId: currentLeader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${newLeader.id}/change/${currentLeader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'maxFollowers'
			});
			/*
			 * Le groupe doit rester exactement
			 * dans son état précédent.
			 */
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: newLeader.id
						}
					})
				).leaderId
			).toBe(currentLeader.id);
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: currentLeader.id
					}
				})
			).toBe(3);
			expect(
				await prisma.dinoz.count({
					where: {
						leaderId: newLeader.id
					}
				})
			).toBe(0);
		});

		it('prevents a player from changing the leader of another player group', async () => {
			const owner = await createTestUser({
				name: 'ChangeLeaderRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'ChangeLeaderAttacker',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedOldLeader',
				canRename: false
			});
			const follower = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedFutureLeader',
				canRename: false
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/change/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBe(leader.id);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: leader.id
						}
					})
				).leaderId
			).toBeNull();
		});
	});
});
