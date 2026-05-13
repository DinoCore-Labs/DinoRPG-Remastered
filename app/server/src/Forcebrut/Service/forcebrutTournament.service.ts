import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxXp } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { Prisma } from '../../../../prisma/index.js';
import { calculateFightBetweenPlayers } from '../../Fight/Service/fight.service.js';
import { removeItemFromDinoz } from '../../Inventory/Controller/removeItemFromDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { calculateXPBonus, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getRandomNumber } from '../../utils/dinoz/displayDinoz.js';
import { DinozToGetFighter, STANDARD_PVP_RULES } from '../../utils/fight/fight.mapper.js';

type ForcebrutParams = {
	id: string;
};

const FORBIDDEN_FORCEBRUT_SKILLS = new Set<number>([Skill.TROU_NOIR, Skill.HYPNOSE, Skill.SYLPHIDES]);

function getNextMedalStatus(step: number): DinozStatusId | null {
	switch (step) {
		case 10:
			return DinozStatusId.BRONZE_MEDAL_FORCEBRUT;
		case 20:
			return DinozStatusId.SILVER_MEDAL_FORCEBRUT;
		case 30:
			return DinozStatusId.GOLD_MEDAL_FORCEBRUT;
		case 40:
			return DinozStatusId.DIAMOND_MEDAL_FORCEBRUT;
		default:
			return null;
	}
}

function calculateForcebrutXp(opponentLevel: number, dinozLevel: number) {
	const levelRatio = opponentLevel / Math.max(dinozLevel, 1);
	const baseXp = opponentLevel * 3 + 10;
	return Math.max(1, Math.round(baseXp * Math.max(0.35, levelRatio)));
}

async function consumeIrmaPotionTx(tx: Prisma.TransactionClient, userId: string) {
	const irmaItemId = itemList[Item.POTION_IRMA].itemId;
	const result = await tx.userItems.updateMany({
		where: {
			userId,
			itemId: irmaItemId,
			quantity: {
				gte: 1
			}
		},
		data: {
			quantity: {
				decrement: 1
			}
		}
	});
	if (result.count !== 1) {
		throw new ExpectedError('forcebrut.notEnoughIrma', { statusCode: 400 });
	}
	await tx.userItems.deleteMany({
		where: {
			userId,
			itemId: irmaItemId,
			quantity: {
				lte: 0
			}
		}
	});
}

function mapOpponentToFighter(opponent: {
	id: number;
	name: string;
	display: string;
	level: number;
	maxLife: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skillIds: number[];
}): DinozToGetFighter {
	const FORCEBRUT_OPPONENT_ID_OFFSET = 1_000_000_000;
	return {
		id: FORCEBRUT_OPPONENT_ID_OFFSET + opponent.id,
		userId: null,
		name: opponent.name,
		display: opponent.display,
		level: opponent.level,
		life: opponent.maxLife,
		maxLife: opponent.maxLife,
		nbrUpFire: opponent.nbrUpFire,
		nbrUpWood: opponent.nbrUpWood,
		nbrUpWater: opponent.nbrUpWater,
		nbrUpLightning: opponent.nbrUpLightning,
		nbrUpAir: opponent.nbrUpAir,
		skills: opponent.skillIds.filter(skillId => !FORBIDDEN_FORCEBRUT_SKILLS.has(skillId)).map(skillId => ({ skillId })),
		items: [],
		status: [],
		catches: []
	};
}

export async function getForcebrutOpponent(req: FastifyRequest<{ Params: ForcebrutParams }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			id: true,
			placeId: true,
			life: true,
			state: true,
			FBTournamentStep: true,
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { statusCode: 404 });
	}
	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) {
		throw new ExpectedError('forcebrut.wrongPlace', { statusCode: 400 });
	}
	if (!isAlive(dinoz)) {
		throw new ExpectedError('dead', { statusCode: 400 });
	}
	if (!dinoz.status.some(status => status.statusId === DinozStatusId.TOURNA)) {
		throw new ExpectedError('forcebrut.notRegistered', { statusCode: 400 });
	}
	const currentStep = dinoz.FBTournamentStep ?? 0;
	const nextStep = currentStep + 1;
	const nextOpponent = await prisma.forcebrutTournamentOpponent.findFirst({
		where: {
			step: nextStep,
			enabled: true
		},
		select: {
			id: true,
			step: true,
			name: true,
			display: true,
			level: true
		}
	});
	if (nextOpponent) {
		return reply.send({
			...nextOpponent,
			canFight: true,
			completed: false
		});
	}
	if (currentStep > 0) {
		const lastOpponent = await prisma.forcebrutTournamentOpponent.findFirst({
			where: {
				step: currentStep,
				enabled: true
			},
			select: {
				id: true,
				step: true,
				name: true,
				display: true,
				level: true
			}
		});
		if (lastOpponent) {
			return reply.send({
				...lastOpponent,
				canFight: false,
				completed: true
			});
		}
	}
	throw new ExpectedError('forcebrut.noOpponent', { statusCode: 404 });
}

export async function fightForcebrutOpponent(req: FastifyRequest<{ Params: ForcebrutParams }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			id: true,
			userId: true,
			name: true,
			display: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			placeId: true,
			state: true,
			FBTournamentStep: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			status: {
				select: {
					statusId: true
				}
			},
			skills: {
				where: {
					state: true
				},
				select: {
					skillId: true
				}
			},
			items: {
				select: {
					itemId: true
				}
			},
			catches: {
				select: {
					id: true,
					hp: true,
					monsterId: true
				}
			},
			user: {
				select: {
					id: true,
					cooker: true,
					teacher: true
				}
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { statusCode: 404 });
	}
	if (dinoz.placeId !== PlaceEnum.FORCEBRUT) {
		throw new ExpectedError('forcebrut.wrongPlace', { statusCode: 400 });
	}
	if (dinoz.state !== null) {
		throw new ExpectedError('forcebrut.unavailableDinoz', { statusCode: 400 });
	}
	if (!isAlive(dinoz)) {
		throw new ExpectedError('dead', { statusCode: 400 });
	}
	if (!dinoz.status.some(status => status.statusId === DinozStatusId.TOURNA)) {
		throw new ExpectedError('forcebrut.notRegistered', { statusCode: 400 });
	}
	const opponent = await prisma.forcebrutTournamentOpponent.findFirst({
		where: {
			step: dinoz.FBTournamentStep + 1,
			enabled: true
		}
	});
	if (!opponent) {
		throw new ExpectedError('forcebrut.noOpponent', { statusCode: 404 });
	}
	const playerFighter: DinozToGetFighter = {
		...dinoz,
		skills: dinoz.skills.filter(skill => !FORBIDDEN_FORCEBRUT_SKILLS.has(skill.skillId)),
		catches: []
	};
	const opponentFighter = mapOpponentToFighter(opponent);
	const fightResult = calculateFightBetweenPlayers(
		STANDARD_PVP_RULES,
		[playerFighter],
		dinoz.user.cooker,
		[opponentFighter],
		false,
		PlaceEnum.FORCEBRUT
	);
	const victory = fightResult.outcome === FightOutcome.AttackerWin;
	const attacker = fightResult.attackers.find(fighter => fighter.dinozId === dinoz.id);

	if (!attacker) {
		throw new ExpectedError(`Attacker ${dinoz.id} doesn't exist.`);
	}
	let goldEarned = 0;
	let xpEarned = 0;
	let levelUp = false;
	let statusReward: DinozStatusId | null = null;
	if (victory) {
		const goldMultiplierRoll = getRandomNumber(0, 100);
		let goldMultiplier = 1;
		if (goldMultiplierRoll < 1) goldMultiplier = 10;
		else if (goldMultiplierRoll < 11) goldMultiplier = 3;
		goldEarned = (getRandomNumber(0, 10) + 28) * 10 * goldMultiplier;
		xpEarned = calculateForcebrutXp(opponent.level, dinoz.level);
		xpEarned = calculateXPBonus(dinoz, xpEarned, dinoz.user);
		const maxXp = getMaxXp(dinoz);
		if (dinoz.experience >= maxXp) {
			levelUp = true;
			xpEarned = 0;
		} else if (dinoz.experience + xpEarned >= maxXp) {
			levelUp = true;
		}
		statusReward = getNextMedalStatus(dinoz.FBTournamentStep + 1);
	}
	await prisma.$transaction(async tx => {
		await consumeIrmaPotionTx(tx, userId);

		await tx.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				life: {
					decrement: attacker.hpLost
				},
				experience: {
					increment: victory ? xpEarned : 0
				},
				FBTournamentStep: {
					increment: victory ? 1 : 0
				}
			}
		});
		if (victory && goldEarned > 0) {
			await tx.userWallet.update({
				where: {
					userId_type: {
						userId,
						type: 'GOLD'
					}
				},
				data: {
					amount: {
						increment: goldEarned
					}
				}
			});
		}
		if (victory && statusReward !== null) {
			await tx.dinozStatus.upsert({
				where: {
					statusId_dinozId: {
						statusId: statusReward,
						dinozId: dinoz.id
					}
				},
				update: {},
				create: {
					statusId: statusReward,
					dinozId: dinoz.id
				}
			});
		}
	});
	let merguezUsed = 0;
	for (const fighter of fightResult.attackers) {
		for (const itemUsed of fighter.itemsUsed) {
			const itemRef = itemList[itemUsed];

			if (itemRef.itemType === ItemType.CLASSIC) {
				await removeItemFromDinoz(fighter.dinozId, itemUsed);
			}

			if (itemUsed === Item.GOBLIN_MERGUEZ) {
				merguezUsed++;
			}
		}
	}

	if (merguezUsed > 0) {
		await incrementUserStat(StatTracking.MERGUEZ, userId, merguezUsed);
	}

	const fighters = fightResult.fighters.map(fighter => ({
		id: fighter.id,
		type: fighter.type,
		name: fighter.name,
		display: fighter.display,
		attacker: fighter.attacker,
		maxHp: fighter.maxHp,
		startingHp: fighter.startingHp,
		currentHp: fighter.startingHp,
		energy: fighter.energy,
		maxEnergy: fighter.maxEnergy,
		energyRecovery: fighter.energyRecovery,
		costume: fighter.costume,
		dark: fighter.dark,
		size: fighter.size,
		entrance: fighter.entrance
	}));

	return reply.send({
		fighters,
		goldEarned: victory ? goldEarned : 0,
		xpEarned: victory ? xpEarned : 0,
		levelUp: victory ? levelUp : false,
		totalHpLost: attacker.hpLost,
		result: victory,
		history: fightResult.steps,
		hpLost: [
			{
				id: dinoz.id,
				hpLost: attacker.hpLost
			}
		],
		itemsUsed: [
			{
				id: dinoz.id,
				itemsUsed: attacker.itemsUsed
			}
		],
		place: PlaceEnum.FORCEBRUT,
		statusReward,
		opponentStep: opponent.step
	});
}
