import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';

import { BotProgressionGoal } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

function isGoalComplete(goal: BotProgressionGoal, statusIds: Set<number>): boolean {
	switch (goal) {
		case BotProgressionGoal.SHAMAN_STRATEGY:
			return statusIds.has(DinozStatusId.STRATEGY_IN_130_LESSONS);
		case BotProgressionGoal.FORCEBRUT_TRAINING:
			return statusIds.has(DinozStatusId.TOURNA);
		case BotProgressionGoal.LANTERN:
			return statusIds.has(DinozStatusId.LANTERN);
	}
}

function chooseNextGoal(statusIds: Set<number>): BotProgressionGoal | null {
	if (!statusIds.has(DinozStatusId.STRATEGY_IN_130_LESSONS)) {
		return BotProgressionGoal.SHAMAN_STRATEGY;
	}
	if (!statusIds.has(DinozStatusId.TOURNA)) {
		return BotProgressionGoal.FORCEBRUT_TRAINING;
	}
	if (!statusIds.has(DinozStatusId.LANTERN)) {
		return BotProgressionGoal.LANTERN;
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

	if (currentGoal && !isGoalComplete(currentGoal, statusIds)) {
		return currentGoal;
	}

	const nextGoal = chooseNextGoal(statusIds);
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
