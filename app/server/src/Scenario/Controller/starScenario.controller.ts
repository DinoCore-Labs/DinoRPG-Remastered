import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';

import type { Prisma } from '../../../../prisma/index.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';
import { getUserScenarioProgression, setUserScenarioProgression } from './scenarioProgress.controller.js';

type ScenarioTransaction = Prisma.TransactionClient;

const STAR_SCENARIO_KEY = 'star';
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

export async function advanceStarScenarioWithRewardTx(
	tx: ScenarioTransaction,
	input: {
		userId: string;
		expectedProgression: number;
		nextProgression: number;
	}
) {
	const current = await getUserScenarioProgression(tx, input.userId, STAR_SCENARIO_KEY);
	if (current.progression !== input.expectedProgression) {
		return false;
	}
	await addMagicStarTx(tx, input.userId);
	await setUserScenarioProgression(tx, {
		userId: input.userId,
		scenarioKey: STAR_SCENARIO_KEY,
		progression: input.nextProgression,
		tracking: current.tracking
	});
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
		expectedProgression: 7,
		nextProgression: 8
	});
}

/**
 * Vérifie si le déplacement doit déclencher le Megaloup du scénario Star.
 */
async function shouldStartStarMegawolfFight(input: ScenarioMoveFightInput): Promise<boolean> {
	if (input.toPlace !== PlaceEnum.DINOVILLE) {
		return false;
	}
	if (!STAR_MEGAWOLF_FROM_PLACES.includes(input.fromPlace)) {
		return false;
	}
	const scenario = await prisma.$transaction(tx => getUserScenarioProgression(tx, input.user.id, STAR_SCENARIO_KEY));
	return scenario.progression === 1;
}

/**
 * Ajoute un objet à l'inventaire dans la transaction du scénario.
 */
async function addUserItemTx(tx: ScenarioTransaction, userId: string, itemId: Item, quantity: number): Promise<void> {
	await tx.userItems.upsert({
		where: {
			itemId_userId: {
				itemId,
				userId
			}
		},
		create: {
			userId,
			itemId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});
}

/**
 * Traite les combats de déplacement du scénario Star.
 */
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
	if (winner) {
		await prisma.$transaction(async tx => {
			const currentScenario = await getUserScenarioProgression(tx, input.user.id, STAR_SCENARIO_KEY);
			/**
			 * La progression peut avoir changé entre le déclenchement
			 * et la résolution du combat.
			 */
			if (currentScenario.progression !== 1) {
				return;
			}
			await addUserItemTx(tx, input.user.id, Item.MAGIC_STAR, 1);
			await setUserScenarioProgression(tx, {
				userId: input.user.id,
				scenarioKey: STAR_SCENARIO_KEY,
				progression: 2
			});
		});
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
			progressed: winner,
			progression: winner ? 2 : 1
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
