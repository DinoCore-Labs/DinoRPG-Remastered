import { prisma } from '../../prisma.js';
import { makeDinozFollow } from '../../Dinoz/Service/followDinoz.service.js';
import { makeDinozUnfollow } from '../../Dinoz/Service/unfollowDinoz.service.js';
import { getBotMissionIntent } from './botMission.service.js';

export async function getBotGroupPlan(userId: string): Promise<{ leaderId: number; followerId: number } | null> {
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
			}
		}
	});

	const candidates = dinoz.filter(entry => entry.life > 0 && entry.followers.length === 0);
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
			leaderId: true
		}
	});

	for (const follower of followers) {
		const intent = await getBotMissionIntent(follower.id);
		if (!intent) continue;

		if (
			intent.type === 'move' ||
			intent.type === 'dialog' ||
			intent.type === 'interact' ||
			intent.type === 'wait'
		) {
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
