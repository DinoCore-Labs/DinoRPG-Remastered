import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { STAR_SCENARIO_KEY, STAR_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/starScenario.js';

import type { Prisma } from '../../../../prisma/index.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';
import { getUserScenarioProgression } from './scenarioProgress.controller.js';

type ScenarioTransaction = Prisma.TransactionClient;

const STAR_MEGAWOLF_KEY: MonsterKey = 'megawolf';

const STAR_MEGAWOLF_FROM_PLACES = [PlaceEnum.FOUTAINE_DE_JOUVENCE, PlaceEnum.UNIVERSITE];

async function addMagicStarTx(tx: ScenarioTransaction, userId: string) {
	await tx.userItems.upsert({
		where: {
			itemId_userId: {
				itemId: Item.MAGIC_STAR,
				userId
			}
		},
		create: {
			userId,
			itemId: Item.MAGIC_STAR,
			quantity: 1
		},
		update: {
			quantity: {
				increment: 1
			}
		}
	});
}

/**
 * Fait progresser Star uniquement si le joueur
 * se trouve encore exactement à l'étape attendue.
 *
 * Le claim de progression et la récompense sont
 * réalisés dans la même transaction.
 *
 * Deux requêtes concurrentes ne peuvent donc pas
 * obtenir deux MAGIC_STAR pour la même étape.
 */
export async function advanceStarScenarioWithRewardTx(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		expectedProgression: number;
		nextProgression: number;
	}
) {
	const claim = await tx.userScenario.updateMany({
		where: {
			userId: input.userId,
			scenarioKey: STAR_SCENARIO_KEY,
			progression: input.expectedProgression
		},
		data: {
			progression: input.nextProgression
		}
	});
	if (claim.count !== 1) {
		return false;
	}
	await addMagicStarTx(tx, input.userId);
	return true;
}

export async function advanceStarScenarioOnNaturalResurrectTx(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		deathPlaceId: PlaceEnum;
		resurrectPlaceId: PlaceEnum;
	}
) {
	if (input.deathPlaceId !== PlaceEnum.JUNGLE_SAUVAGE) {
		return false;
	}
	if (input.resurrectPlaceId !== PlaceEnum.DINOVILLE) {
		return false;
	}
	return advanceStarScenarioWithRewardTx(tx, {
		userId: input.userId,
		expectedProgression: STAR_SCENARIO_STEPS.NATURAL_RESURRECT,
		nextProgression: STAR_SCENARIO_STEPS.FINAL
	});
}

async function shouldStartStarMegawolfFight(input: ScenarioMoveFightInput): Promise<boolean> {
	if (input.toPlace !== PlaceEnum.DINOVILLE) {
		return false;
	}
	if (!STAR_MEGAWOLF_FROM_PLACES.includes(input.fromPlace)) {
		return false;
	}
	const scenario = await prisma.$transaction(tx => getUserScenarioProgression(tx, input.user.id, STAR_SCENARIO_KEY));
	return scenario.progression === STAR_SCENARIO_STEPS.MEGAWOLF;
}

export async function processStarScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	const shouldStartMegawolf = await shouldStartStarMegawolfFight(input);
	if (!shouldStartMegawolf) {
		return false;
	}
	const monsters = [monsterByKey[STAR_MEGAWOLF_KEY]];
	const fightProcess = calculateFightVsMonsters(input.team, input.user, input.toPlace, monsters);
	const result = await rewardFightVsMonsters(input.team, monsters, fightProcess, input.toPlace, input.user, {
		autoReequip: input.autoReequip
	});
	const winner = fightProcess.outcome === FightOutcome.AttackerWin;
	let progressed = false;
	if (winner) {
		progressed = await prisma.$transaction(tx =>
			advanceStarScenarioWithRewardTx(tx, {
				userId: input.user.id,
				expectedProgression: STAR_SCENARIO_STEPS.MEGAWOLF,
				nextProgression: STAR_SCENARIO_STEPS.MERGUEZ_SELLER
			})
		);
		await updateMultipleDinoz(
			input.team.map(dinoz => dinoz.id),
			{
				placeId: input.toPlace
			}
		);
	}
	return {
		...result,
		source: 'scenario',
		scenario: {
			key: STAR_SCENARIO_KEY,
			fightKey: 'star_megawolf',
			progressed,
			progression: winner ? STAR_SCENARIO_STEPS.MERGUEZ_SELLER : STAR_SCENARIO_STEPS.MEGAWOLF
		},
		startText: {
			type: 'message',
			text: 'scenarios.star.texts.fightMegawolf'
		},
		endText: winner
			? {
					type: 'message',
					text: 'scenarios.star.texts.fightStarFound'
				}
			: undefined
	};
}
