import type { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';

import { prisma } from '../../prisma.js';

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
