import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';

import { Prisma } from '../../../../prisma/client.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import {
	calculateFightVsMonsters,
	DinozToRewardFight,
	rewardFightVsMonsters
} from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { DinozToGetFighter } from '../../utils/fight/fight.mapper.js';
import { getUserScenarioProgression, setUserScenarioProgression } from '../Controller/scenarioProgress.controller.js';

type ScenarioMoveFightInput = {
	user: {
		id: string;
		cooker: boolean;
		teacher: boolean;
		items: { itemId: number; quantity: number }[];
	};
	team: (DinozToGetFighter & DinozToRewardFight)[];
	dinozId: number;
	fromPlace: PlaceEnum;
	toPlace: PlaceEnum;
	autoReequip?: boolean;
};

type ScenarioTransaction = Prisma.TransactionClient;

const STAR_SCENARIO_KEY = 'star';
const STAR_MEGAWOLF_KEY: MonsterKey = 'megawolf';

const STAR_MEGAWOLF_FROM_PLACES = [PlaceEnum.FOUTAINE_DE_JOUVENCE, PlaceEnum.UNIVERSITE];

async function shouldStartStarMegawolfFight(input: ScenarioMoveFightInput) {
	if (input.toPlace !== PlaceEnum.DINOVILLE) {
		return false;
	}
	if (!STAR_MEGAWOLF_FROM_PLACES.includes(input.fromPlace)) {
		return false;
	}
	const scenario = await prisma.$transaction(tx => getUserScenarioProgression(tx, input.user.id, STAR_SCENARIO_KEY));
	return scenario.progression === 1;
}

async function addUserItemTx(tx: ScenarioTransaction, userId: string, itemId: Item, quantity: number) {
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

export async function processScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	const shouldStartMegawolf = await shouldStartStarMegawolfFight(input);
	if (!shouldStartMegawolf) {
		return false;
	}
	const monsters = [monsterByKey[STAR_MEGAWOLF_KEY]];
	const fightResult = calculateFightVsMonsters(input.team, input.user, input.toPlace, monsters);
	const result = await rewardFightVsMonsters(input.team, monsters, fightResult, input.toPlace, input.user, {
		autoReequip: input.autoReequip
	});
	const winner = fightResult.outcome === FightOutcome.AttackerWin;
	if (winner) {
		await prisma.$transaction(async tx => {
			const currentScenario = await getUserScenarioProgression(tx, input.user.id, STAR_SCENARIO_KEY);
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
