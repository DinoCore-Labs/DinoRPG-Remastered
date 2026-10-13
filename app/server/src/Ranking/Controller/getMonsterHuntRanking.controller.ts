import type {
	MonsterHuntRankingEdition,
	MonsterHuntRankingResponse
} from '@dinorpg/core/models/ranking/rankingEntry.js';

import { prisma } from '../../prisma.js';

const MONSTER_HUNT_RANKING_PAGE_SIZE = 50;

export async function getMonsterHuntRanking(
	huntId: string,
	page: number = 1,
	pageSize: number = MONSTER_HUNT_RANKING_PAGE_SIZE
): Promise<MonsterHuntRankingResponse | null> {
	const hunt = await prisma.monsterHunt.findUnique({
		where: {
			id: huntId
		},
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			startAt: true,
			endAt: true
		}
	});
	if (!hunt) {
		return null;
	}
	const safePage = Math.max(1, page);
	const safePageSize = Math.max(1, Math.min(pageSize, 100));
	const skip = (safePage - 1) * safePageSize;
	const [participants, total] = await Promise.all([
		prisma.monsterHuntParticipant.findMany({
			where: {
				huntId
			},
			/*
			 * Historical Monster Hunt ranking is based on points.
			 *
			 * objects DESC is only a deterministic tie-breaker:
			 * there is currently no evidence that MT historically
			 * used it to resolve equal scores.
			 */
			orderBy: [
				{
					points: 'desc'
				},
				{
					objects: 'desc'
				},
				{
					createdAt: 'asc'
				}
			],
			skip,
			take: safePageSize,
			select: {
				user: {
					select: {
						id: true,
						name: true
					}
				},
				points: true,
				objects: true,
				loot: {
					where: {
						count: {
							gt: 0
						}
					},
					orderBy: {
						pointsEarned: 'desc'
					},
					select: {
						count: true,
						pointsEarned: true,
						lootDefinition: {
							select: {
								lootKey: true,
								nameKey: true,
								icon: true,
								points: true
							}
						}
					}
				}
			}
		}),
		prisma.monsterHuntParticipant.count({
			where: {
				huntId
			}
		})
	]);
	return {
		hunt: {
			id: hunt.id,
			name: hunt.name,
			slug: hunt.slug,
			status: hunt.status,
			startAt: hunt.startAt.toISOString(),
			endAt: hunt.endAt.toISOString(),
			participantCount: total
		},
		total,
		page: safePage,
		pageSize: safePageSize,
		ranking: participants.map((participant, index) => ({
			position: skip + index + 1,
			user: {
				id: participant.user.id,
				name: participant.user.name
			},
			points: participant.points,
			objects: participant.objects,
			loot: participant.loot.map(entry => ({
				lootKey: entry.lootDefinition.lootKey,
				nameKey: entry.lootDefinition.nameKey,
				icon: entry.lootDefinition.icon,
				points: entry.lootDefinition.points,
				count: entry.count,
				pointsEarned: entry.pointsEarned
			}))
		}))
	};
}

export async function getMonsterHuntRankingEditions(): Promise<MonsterHuntRankingEdition[]> {
	const hunts = await prisma.monsterHunt.findMany({
		/*
		 * Draft editions must not be visible publicly.
		 */
		where: {
			status: {
				not: 'DRAFT'
			}
		},
		orderBy: [
			{
				startAt: 'desc'
			}
		],
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			startAt: true,
			endAt: true,
			_count: {
				select: {
					participants: true
				}
			}
		}
	});
	return hunts.map(hunt => ({
		id: hunt.id,
		name: hunt.name,
		slug: hunt.slug,
		status: hunt.status,
		startAt: hunt.startAt.toISOString(),
		endAt: hunt.endAt.toISOString(),
		participantCount: hunt._count.participants
	}));
}

export async function getMonsterHuntUserRank(
	huntId: string,
	userId: string
): Promise<{
	position: number;
	points: number;
	objects: number;
} | null> {
	const participant = await prisma.monsterHuntParticipant.findUnique({
		where: {
			huntId_userId: {
				huntId,
				userId
			}
		},
		select: {
			points: true,
			objects: true
		}
	});
	if (!participant) {
		return null;
	}
	const playersAhead = await prisma.monsterHuntParticipant.count({
		where: {
			huntId,
			OR: [
				{
					points: {
						gt: participant.points
					}
				},
				{
					points: participant.points,
					objects: {
						gt: participant.objects
					}
				}
			]
		}
	});
	return {
		position: playersAhead + 1,
		points: participant.points,
		objects: participant.objects
	};
}
