import type { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { prisma } from '../../prisma.js';

export type BotPlaceExperienceSnapshot = {
	placeId: number;
	visits: number;
	gatherAttempts: number;
	gatherSuccesses: number;
	gatherValue: number;
	fights: number;
	wins: number;
	losses: number;
	hpLost: number;
	lastVisitedAt: Date | null;
};

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function resolveArrivalPlaceId(placeId: number): number {
	const place = Object.values(placeListv2).find(entry => entry.placeId === placeId);
	return place?.gotoPlaceId ?? placeId;
}

export async function getBotPlaceExperienceMap(
	dinozId: number
): Promise<Map<number, BotPlaceExperienceSnapshot>> {
	const memories = await prisma.botDinozPlaceMemory.findMany({
		where: {
			dinozId
		},
		select: {
			placeId: true,
			visits: true,
			gatherAttempts: true,
			gatherSuccesses: true,
			gatherValue: true,
			fights: true,
			wins: true,
			losses: true,
			hpLost: true,
			lastVisitedAt: true
		}
	});
	return new Map(memories.map(memory => [memory.placeId, memory]));
}

export function getBotExplorationExperienceBonus(
	experience: Map<number, BotPlaceExperienceSnapshot>,
	targetPlaceId: number
): number {
	const placeId = resolveArrivalPlaceId(targetPlaceId);
	const memory = experience.get(placeId);
	if (!memory || memory.visits === 0) return 120;

	const visitPenalty = Math.min(120, memory.visits * 25);
	return 90 - visitPenalty;
}

export function getBotGatherExperienceBonus(
	experience: Map<number, BotPlaceExperienceSnapshot>,
	placeId: number
): number {
	const memory = experience.get(placeId);
	if (!memory || memory.gatherAttempts === 0) return 0;

	const averageValue = memory.gatherValue / memory.gatherAttempts;
	const successRate = memory.gatherSuccesses / memory.gatherAttempts;
	return clamp(Math.round(averageValue / 100) + Math.round(successRate * 40), 0, 120);
}

export function getBotFightExperienceBonus(
	experience: Map<number, BotPlaceExperienceSnapshot>,
	placeId: number,
	maxLife: number
): number {
	const memory = experience.get(placeId);
	if (!memory || memory.fights === 0) return 0;

	const winRate = memory.wins / memory.fights;
	const averageHpLost = memory.hpLost / memory.fights;
	const damageRatio = averageHpLost / Math.max(1, maxLife);
	const confidence = Math.round((winRate - 0.5) * 120 - damageRatio * 70);
	return clamp(confidence, -90, 70);
}

async function getBotDinozPlace(dinozId: number): Promise<number | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			user: {
				isBot: true
			}
		},
		select: {
			placeId: true
		}
	});
	return dinoz?.placeId ?? null;
}

function getGatherValue(result: GatherResult): number {
	const itemValue = result.rewards.item.reduce(
		(total, item) => total + Math.max(0, item.price) * Math.max(1, item.quantity),
		0
	);
	const ingredientValue = result.rewards.ingredients.reduce(
		(total, ingredient) =>
			total + Math.max(0, ingredient.price) * Math.max(1, ingredient.quantity ?? 1),
		0
	);
	return (
		Math.max(0, result.rewards.gold) +
		Math.max(0, result.gridCompletionGoldReward) +
		itemValue +
		ingredientValue
	);
}

export async function recordBotPlaceVisit(dinozId: number, placeId?: number): Promise<void> {
	const resolvedPlaceId = placeId ?? (await getBotDinozPlace(dinozId));
	if (resolvedPlaceId == null) return;

	await prisma.botDinozPlaceMemory.upsert({
		where: {
			dinozId_placeId: {
				dinozId,
				placeId: resolvedPlaceId
			}
		},
		create: {
			dinozId,
			placeId: resolvedPlaceId,
			visits: 1,
			lastVisitedAt: new Date()
		},
		update: {
			visits: {
				increment: 1
			},
			lastVisitedAt: new Date()
		}
	});
}

export async function recordBotGatherExperience(dinozId: number, result: GatherResult): Promise<void> {
	const placeId = await getBotDinozPlace(dinozId);
	if (placeId == null) return;

	const gatherValue = getGatherValue(result);
	await prisma.botDinozPlaceMemory.upsert({
		where: {
			dinozId_placeId: {
				dinozId,
				placeId
			}
		},
		create: {
			dinozId,
			placeId,
			gatherAttempts: 1,
			gatherSuccesses: gatherValue > 0 ? 1 : 0,
			gatherValue,
			lastGatherAt: new Date()
		},
		update: {
			gatherAttempts: {
				increment: 1
			},
			gatherSuccesses: gatherValue > 0 ? { increment: 1 } : undefined,
			gatherValue: {
				increment: gatherValue
			},
			lastGatherAt: new Date()
		}
	});
}

export async function recordBotFightExperience(
	dinozId: number,
	placeId: number,
	won: boolean,
	hpLost: number
): Promise<void> {
	await prisma.botDinozPlaceMemory.upsert({
		where: {
			dinozId_placeId: {
				dinozId,
				placeId
			}
		},
		create: {
			dinozId,
			placeId,
			fights: 1,
			wins: won ? 1 : 0,
			losses: won ? 0 : 1,
			hpLost: Math.max(0, hpLost),
			lastFightAt: new Date()
		},
		update: {
			fights: {
				increment: 1
			},
			wins: won ? { increment: 1 } : undefined,
			losses: won ? undefined : { increment: 1 },
			hpLost: {
				increment: Math.max(0, hpLost)
			},
			lastFightAt: new Date()
		}
	});
}
