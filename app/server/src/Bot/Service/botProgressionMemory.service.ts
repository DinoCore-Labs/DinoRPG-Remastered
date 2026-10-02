import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import { MAGNETITE_SCENARIO_KEY, MagnetiteProgression } from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { BotProgressionGoal } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

function isGoalComplete(
	goal: BotProgressionGoal,
	statusIds: Set<number>,
	rewardIds: Set<number>,
	placeId: number,
	magnetiteProgression: number
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
		case BotProgressionGoal.MAGNETITE:
			return magnetiteProgression >= MagnetiteProgression.COMPLETED;
		case BotProgressionGoal.HIPPOCLAMP_TROPHY:
			return rewardIds.has(Reward.HIPPO);
		case BotProgressionGoal.PTEROZ_TROPHY:
			return rewardIds.has(Reward.PTEROZ);
		case BotProgressionGoal.ROCKY_TROPHY:
			return rewardIds.has(Reward.ROCKY);
	}
}

function chooseNextGoal(
	statusIds: Set<number>,
	rewardIds: Set<number>,
	level: number,
	canAttemptSylvenoire: boolean,
	placeId: number,
	magnetiteProgression: number
): BotProgressionGoal | null {
	if (level >= 8 && !rewardIds.has(Reward.HIPPO)) {
		return BotProgressionGoal.HIPPOCLAMP_TROPHY;
	}
	if (level >= 8 && !rewardIds.has(Reward.PTEROZ)) {
		return BotProgressionGoal.PTEROZ_TROPHY;
	}
	if (level >= 13 && !rewardIds.has(Reward.ROCKY)) {
		return BotProgressionGoal.ROCKY_TROPHY;
	}
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
		const place = Object.values(placeListv2).find(entry => entry.placeId === placeId);
		if (place?.map !== MapZone.STEPPE) {
			return BotProgressionGoal.STEPPES_ACCESS;
		}
		if (magnetiteProgression < MagnetiteProgression.COMPLETED) {
			return BotProgressionGoal.MAGNETITE;
		}
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
			level: true,
			status: {
				select: {
					statusId: true
				}
			},
			botMemory: {
				select: {
					goal: true
				}
			},
			user: {
				select: {
					rewards: {
						select: {
							rewardId: true
						}
					}
				}
			}
		}
	});
	if (!dinoz) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	const rewardIds = new Set(dinoz.user.rewards.map(reward => reward.rewardId));
	const currentGoal = dinoz.botMemory?.goal ?? null;
	const availableTrophyGoal =
		dinoz.level >= 8 && !rewardIds.has(Reward.HIPPO)
			? BotProgressionGoal.HIPPOCLAMP_TROPHY
			: dinoz.level >= 8 && !rewardIds.has(Reward.PTEROZ)
				? BotProgressionGoal.PTEROZ_TROPHY
				: dinoz.level >= 13 && !rewardIds.has(Reward.ROCKY)
					? BotProgressionGoal.ROCKY_TROPHY
					: null;
	const magnetiteScenario = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: MAGNETITE_SCENARIO_KEY
			}
		},
		select: {
			progression: true
		}
	});
	const magnetiteProgression =
		magnetiteScenario?.progression ?? MagnetiteProgression.INITIAL_AMBUSH;
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
	} else if (
		currentGoal &&
		!isGoalComplete(
			currentGoal,
			statusIds,
			rewardIds,
			dinoz.placeId,
			magnetiteProgression
		)
	) {
		const currentIsTrophyGoal =
			currentGoal === BotProgressionGoal.HIPPOCLAMP_TROPHY ||
			currentGoal === BotProgressionGoal.PTEROZ_TROPHY ||
			currentGoal === BotProgressionGoal.ROCKY_TROPHY;

		if (currentIsTrophyGoal || !availableTrophyGoal) {
			return currentGoal;
		}
	}

	const nextGoal = chooseNextGoal(
		statusIds,
		rewardIds,
		dinoz.level,
		canAttemptSylvenoire,
		dinoz.placeId,
		magnetiteProgression
	);
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
