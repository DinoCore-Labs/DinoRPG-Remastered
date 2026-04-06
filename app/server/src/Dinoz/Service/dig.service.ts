import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { DigReward } from '@dinorpg/core/models/dinoz/digTreasure.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { MoneyType } from '../../../../prisma/index.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addMoney } from '../../User/Controller/money.controller.js';
import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';
import { digTreasures } from '../Controller/digTreasures.controller.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../Controller/dinozStatus.controller.js';

function hasStatus(statusIds: Set<number>, statusId: DinozStatusId) {
	return statusIds.has(statusId);
}

function getRandomGold(min = 0, max = 1000) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function applyDigReward(userId: string, dinozId: number, reward: DigReward) {
	switch (reward.type) {
		case 'status':
			await addStatusToDinoz(dinozId, reward.statusId);
			return reward;
		case 'item':
			await addItemToInventory(userId, reward.itemId, reward.quantity);
			return reward;
		/*case 'scenario':
			await setScenarioProgress(tx, userId, reward.scenarioKey, reward.progression);
			return reward;*/
	}
}

async function breakShovel(dinozId: number, statusIds: Set<number>) {
	if (hasStatus(statusIds, DinozStatusId.SHOVEL)) {
		await removeStatusFromDinoz(dinozId, DinozStatusId.SHOVEL);
		await addStatusToDinoz(dinozId, DinozStatusId.BROKEN_SHOVEL);
		return;
	}

	if (hasStatus(statusIds, DinozStatusId.ENHANCED_SHOVEL)) {
		const shouldBreak = Math.random() < 0.25;

		if (shouldBreak) {
			await removeStatusFromDinoz(dinozId, DinozStatusId.ENHANCED_SHOVEL);
			await addStatusToDinoz(dinozId, DinozStatusId.BROKEN_ENHANCED_SHOVEL);
		}
	}
}

export async function digWithDinoz(userId: string, dinozId: number) {
	const player = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			ranking: {
				select: {
					dinozCount: true,
					points: true
				}
			},
			items: {
				select: {
					itemId: true,
					quantity: true
				}
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			rewards: {
				select: {
					rewardId: true
				}
			},
			wallets: {
				where: {
					type: MoneyType.GOLD
				},
				select: {
					amount: true
				}
			},
			dinoz: {
				select: {
					id: true,
					level: true,
					life: true,
					placeId: true,
					raceId: true,
					status: {
						select: {
							statusId: true
						}
					},
					skills: {
						select: {
							skillId: true
						}
					},
					items: {
						select: {
							itemId: true
						}
					}
				}
			}
		}
	});

	if (!player) {
		throw new ExpectedError(`User ${userId} not found`);
	}

	const activeDinoz = player.dinoz.find(dinoz => dinoz.id === dinozId);

	if (!activeDinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} not found`);
	}

	const statusIds = new Set(activeDinoz.status.map(status => status.statusId));

	if (!hasStatus(statusIds, DinozStatusId.SHOVEL) && !hasStatus(statusIds, DinozStatusId.ENHANCED_SHOVEL)) {
		throw new ExpectedError(`Dinoz ${dinozId} cannot dig`);
	}

	if (activeDinoz.placeId === PlaceEnum.MINES_DE_CORAIL) {
		throw new ExpectedError('shovelMine');
	}

	if (activeDinoz.life <= 0) {
		throw new ExpectedError('dead');
	}

	const conditionContext = buildConditionContext(player, dinozId, defaultConditionKeyMaps);

	const treasure = digTreasures.find(entry => {
		if (entry.place !== activeDinoz.placeId) return false;
		if (!entry.cond) return true;

		return checkCondition(entry.cond, conditionContext);
	});

	return prisma.$transaction(async () => {
		const rewards = [];

		if (treasure) {
			for (const reward of treasure.rewards) {
				rewards.push(await applyDigReward(player.id, activeDinoz.id, reward));
			}
		} else {
			const gold = getRandomGold();
			await addMoney(player.id, gold);
			rewards.push({ type: 'gold', amount: gold });
		}

		await breakShovel(activeDinoz.id, statusIds);
		await incrementUserStat(StatTracking.BROKEN_SHOVEL, player.id, 1);

		return {
			treasureId: treasure?.id ?? null,
			rewards
		};
	});
}

type DigWithDinozRequest = FastifyRequest<{
	Params: {
		id: number;
	};
}>;

export async function digWithDinozHandler(req: DigWithDinozRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const dinozId = req.params.id;

	const result = await digWithDinoz(userId, dinozId);

	return reply.send(result);
}
