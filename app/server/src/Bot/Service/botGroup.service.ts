import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { BotDinozRole } from '../../../../prisma/index.js';
import { makeDinozFollow } from '../../Dinoz/Service/followDinoz.service.js';
import { makeDinozUnfollow } from '../../Dinoz/Service/unfollowDinoz.service.js';
import { prisma } from '../../prisma.js';
import { getBotMissionIntent } from './botMission.service.js';

const BOT_REGROUP_COOLDOWN_MS = 15 * 60 * 1000;

function hasGatherAtPlace(placeId: number): boolean {
	const place = Object.values(placeListv2).find(entry => entry.placeId === placeId);
	return Boolean(place?.gathers && place.gathers.length > 0);
}

function getRolePriority(role: BotDinozRole | null | undefined): number {
	switch (role) {
		case BotDinozRole.FIGHTER:
			return 3;
		case null:
		case undefined:
			return 2;
		case BotDinozRole.GATHERER:
			return 1;
		case BotDinozRole.EXPLORER:
			return 0;
	}
}

async function wasBotRecentlyUngrouped(userId: string): Promise<boolean> {
	const recentUngroup = await prisma.botActionLog.findFirst({
		where: {
			botProfile: {
				userId
			},
			action: 'ungroup',
			success: true,
			createdAt: {
				gte: new Date(Date.now() - BOT_REGROUP_COOLDOWN_MS)
			}
		},
		select: {
			id: true
		}
	});
	return recentUngroup !== null;
}

export async function getBotGroupPlan(userId: string): Promise<{ leaderId: number; followerId: number } | null> {
	if (await wasBotRecentlyUngrouped(userId)) {
		return null;
	}

	const dinoz = await prisma.dinoz.findMany({
		where: {
			userId,
			state: null,
			leaderId: null
		},
		select: {
			id: true,
			level: true,
			life: true,
			maxLife: true,
			placeId: true,
			followers: {
				select: { id: true }
			},
			botMemory: {
				select: {
					role: true,
					targetPlaceId: true
				}
			}
		}
	});

	const candidates: typeof dinoz = [];
	for (const entry of dinoz) {
		if (entry.life <= 0 || entry.followers.length > 0) continue;
		if (entry.botMemory?.role === BotDinozRole.EXPLORER) continue;
		if (entry.botMemory?.targetPlaceId != null) continue;
		if (entry.botMemory?.role === BotDinozRole.GATHERER && hasGatherAtPlace(entry.placeId)) continue;
		if (await getBotMissionIntent(entry.id)) continue;
		candidates.push(entry);
	}
	if (candidates.length < 2) return null;

	const byPlace = new Map<number, typeof candidates>();
	for (const entry of candidates) {
		const list = byPlace.get(entry.placeId) ?? [];
		list.push(entry);
		byPlace.set(entry.placeId, list);
	}

	for (const group of byPlace.values()) {
		if (group.length < 2) continue;

		const sorted = [...group].sort((a, b) => {
			const roleDifference = getRolePriority(b.botMemory?.role) - getRolePriority(a.botMemory?.role);
			if (roleDifference !== 0) return roleDifference;
			if (b.level !== a.level) return b.level - a.level;
			const aRatio = a.maxLife > 0 ? a.life / a.maxLife : 0;
			const bRatio = b.maxLife > 0 ? b.life / b.maxLife : 0;
			return bRatio - aRatio;
		});

		return {
			leaderId: sorted[0].id,
			followerId: sorted[1].id
		};
	}

	return null;
}

export async function createBotGroup(userId: string): Promise<boolean> {
	const plan = await getBotGroupPlan(userId);
	if (!plan) return false;

	await makeDinozFollow(userId, plan.followerId, plan.leaderId);
	return true;
}

export async function getBotUngroupPlan(userId: string): Promise<number | null> {
	const followers = await prisma.dinoz.findMany({
		where: {
			userId,
			leaderId: { not: null },
			state: null
		},
		select: {
			id: true,
			placeId: true,
			leaderId: true,
			botMemory: {
				select: {
					role: true,
					targetPlaceId: true
				}
			}
		}
	});

	for (const follower of followers) {
		if (follower.botMemory?.targetPlaceId != null) {
			return follower.id;
		}
		if (follower.botMemory?.role === BotDinozRole.EXPLORER) {
			return follower.id;
		}
		if (follower.botMemory?.role === BotDinozRole.GATHERER && hasGatherAtPlace(follower.placeId)) {
			return follower.id;
		}

		const intent = await getBotMissionIntent(follower.id);
		if (!intent) continue;

		if (intent.type === 'move' || intent.type === 'dialog' || intent.type === 'interact' || intent.type === 'wait') {
			return follower.id;
		}
	}

	return null;
}

export async function ungroupBotDinoz(userId: string): Promise<boolean> {
	const dinozId = await getBotUngroupPlan(userId);
	if (dinozId == null) return false;

	await makeDinozUnfollow(userId, dinozId);
	return true;
}
