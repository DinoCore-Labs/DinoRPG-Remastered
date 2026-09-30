import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { BotProgressionGoal } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

function isGoalComplete(
	goal: BotProgressionGoal,
	statusIds: Set<number>,
	placeId: number
): boolean {
	switch (goal) {
		case BotProgressionGoal.SHAMAN_STRATEGY:
			return statusIds.has(DinozStatusId.STRATEGY_IN_130_LESSONS);
		case BotProgressionGoal.FORCEBRUT_TRAINING:
			return statusIds.has(DinozStatusId.TOURNA);
		case BotProgressionGoal.LANTERN:
			return statusIds.has(DinozStatusId.LANTERN);
		case BotProgressionGoal.KORGON_FLIPPERS:
			return statusIds.has(DinozStatusId.FLIPPERS);
		case BotProgressionGoal.SYLVENOIRE_KEY:
			return statusIds.has(DinozStatusId.SYLVENOIRE_KEY);
		case BotProgressionGoal.STEPPES_ACCESS: {
			const place = Object.values(placeListv2).find(entry => entry.placeId === placeId);
			return place?.map === MapZone.STEPPE;
		}
	}
}

function chooseNextGoal(
	statusIds: Set<number>,
	canAttemptSylvenoire: boolean
): BotProgressionGoal | null {
	if (!statusIds.has(DinozStatusId.STRATEGY_IN_130_LESSONS)) {
		return BotProgressionGoal.SHAMAN_STRATEGY;
	}
	if (!statusIds.has(DinozStatusId.TOURNA)) {
		return BotProgressionGoal.FORCEBRUT_TRAINING;
	}
	if (!statusIds.has(DinozStatusId.LANTERN)) {
		return BotProgressionGoal.LANTERN;
	}
	if (!statusIds.has(DinozStatusId.FLIPPERS)) {
		return BotProgressionGoal.KORGON_FLIPPERS;
	}
	if (
		canAttemptSylvenoire &&
		!statusIds.has(DinozStatusId.SYLVENOIRE_KEY)
	) {
		return BotProgressionGoal.SYLVENOIRE_KEY;
	}
	if (statusIds.has(DinozStatusId.SYLVENOIRE_KEY)) {
		return BotProgressionGoal.STEPPES_ACCESS;
	}
	return null;
}

export async function getOrAssignBotProgressionGoal(
	userId: string,
	dinozId: number
): Promise<BotProgressionGoal | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId,
			user: {
				isBot: true
			}
		},
		select: {
			placeId: true,
			status: {
				select: {
					statusId: true
				}
			},
			botMemory: {
				select: {
					goal: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	const currentGoal = dinoz.botMemory?.goal ?? null;
	const eligibleDinozCount = await prisma.dinoz.count({
		where: {
			userId,
			life: { gt: 0 },
			state: null,
			status: {
				some: {
					statusId: DinozStatusId.FLIPPERS
				}
			}
		}
	});
	const canAttemptSylvenoire = eligibleDinozCount >= 7;

	if (
		currentGoal &&
		currentGoal === BotProgressionGoal.SYLVENOIRE_KEY &&
		!canAttemptSylvenoire
	) {
		await prisma.botDinozMemory.deleteMany({
			where: { dinozId }
		});
	} else if (currentGoal && !isGoalComplete(currentGoal, statusIds, dinoz.placeId)) {
		return currentGoal;
	}

	const nextGoal = chooseNextGoal(statusIds, canAttemptSylvenoire);
	if (!nextGoal) {
		if (currentGoal) {
			await prisma.botDinozMemory.deleteMany({
				where: { dinozId }
			});
		}
		return null;
	}

	await prisma.botDinozMemory.upsert({
		where: { dinozId },
		create: {
			dinozId,
			goal: nextGoal
		},
		update: {
			goal: nextGoal,
			targetPlaceId: null,
			assignedAt: new Date()
		}
	});

	return nextGoal;
}

export async function clearBotProgressionGoal(dinozId: number): Promise<void> {
	await prisma.botDinozMemory.deleteMany({
		where: { dinozId }
	});
}
