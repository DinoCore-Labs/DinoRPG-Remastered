import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, type FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { Monster, monsterList } from '@dinorpg/core/models/monster/monsterList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';

import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import type { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';
import { getUserScenarioProgression } from './scenarioProgress.controller.js';

const SCENARIO = 'kabuki';

/** These are virtual/actual locations from the original Motion Twin map. */
export function getKabukiMovePhase(
	progression: number,
	fromPlace: PlaceEnum,
	triggerPlace: PlaceEnum,
	toPlace: PlaceEnum
): 'lost' | 'final' | null {
	if (fromPlace !== PlaceEnum.MINES_DE_CORAIL) return null;
	if (progression === 19 && triggerPlace === PlaceEnum.ITLOST && toPlace === PlaceEnum.MINES_DE_CORAIL) return 'lost';
	if (progression === 20 && triggerPlace === PlaceEnum.ITOTEM && toPlace === PlaceEnum.ITOTEM) return 'final';
	return null;
}

/** MT XML monsters.xml: yakkb2 Ninjutsu and yakkb3 Kage. */
const NINJUTSU = {
	...monsterList[Monster.KABUKI_YAKUZI],
	skills: [Skill.INSAISISSABLE, Skill.DISQUE_VACUUM, Skill.PERCEPTION, Skill.AGILITE],
	name: 'Ninjutsu',
	display: 'dinoz:E9ERKdJzrAYd5P00',
	level: 10,
	hp: 100,
	elements: { fire: 0, wood: 1, water: 5, lightning: 2, air: 7 }
};
const KAGE = {
	...monsterList[Monster.KABUKI_YAKUZI],
	skills: [
		Skill.INSAISISSABLE,
		Skill.DISQUE_VACUUM,
		Skill.DISQUE_VACUUM,
		Skill.NUAGE_TOXIQUE,
		Skill.PERCEPTION,
		Skill.AGILITE
	],
	name: 'Kage',
	display: 'dinoz:E9OI0HBqXBb9dH00',
	level: 15,
	hp: 100,
	elements: { fire: 0, wood: 1, water: 7, lightning: 2, air: 8 }
};

/**
 * The summoned Kabuki sprites reuse the step05 implementation.
 * Their original ninja/disque/etc skills are NOT yet simulated by that implementation.
 */
export const KABUKI_TOTEM_OPPONENTS = [
	bossList[Boss.PR_IGOR],
	bossList[Boss.IGOR_BARBARA],
	bossList[Boss.IGOR_CHOUPETTE],
	bossList[Boss.IGOR_POUPOULE]
];
export const KABUKI_TOTEM_ALLIES = [bossList[Boss.YAKUZI], NINJUTSU, KAGE];

/** A narrative transition, not a combat: the lost route returns to Coral Mines. */
function lostIslandResult(): FightResult {
	return {
		fighters: [],
		goldEarned: 0,
		xpEarned: 0,
		levelUp: false,
		totalHpLost: 0,
		result: false,
		history: [],
		hpLost: [],
		itemsUsed: [],
		place: PlaceEnum.MINES_DE_CORAIL,
		movementEvent: { key: 'kabuki_lost_island', text: 'scenarios.kabuki.texts.totemLost' },
		source: 'scenario',
		scenario: { key: SCENARIO, fightKey: 'kabuki_lost_island', progressed: true, progression: 20 }
	};
}

/**
 * MT step 19 -> 20 occurs on the ITLOST technical passage. A CAS update
 * prevents duplicate progression. The group remains at Coral Mines.
 */
async function processLostRoute(input: ScenarioMoveFightInput): Promise<FightResult> {
	const claim = await prisma.userScenario.updateMany({
		where: { userId: input.user.id, scenarioKey: SCENARIO, progression: 19 },
		data: { progression: 20 }
	});
	const result = lostIslandResult();
	if (claim.count !== 1 && result.scenario) result.scenario.progressed = false;
	return result;
}

/**
 * MT final: the player is joined by Yakuzi and the two Kabukis against Igor.
 * The scripted dialogue/arrivals within the fight animation are still a
 * follow-up: this version keeps those allies in the initial fight roster.
 */
async function processFinalFight(input: ScenarioMoveFightInput): Promise<FightResult> {
	const fightProcess = calculateFightVsMonsters(
		input.team,
		input.user,
		PlaceEnum.ITOTEM,
		KABUKI_TOTEM_OPPONENTS,
		undefined,
		KABUKI_TOTEM_ALLIES,
		{ kabukiTotemOpening: true }
	);

	const result = await rewardFightVsMonsters(
		input.team,
		KABUKI_TOTEM_OPPONENTS,
		fightProcess,
		PlaceEnum.ITOTEM,
		input.user,
		{ autoReequip: input.autoReequip }
	);
	const won = fightProcess.outcome === FightOutcome.AttackerWin;
	let progressed = false;
	if (won) {
		progressed = await prisma.$transaction(async tx => {
			const claimed = await tx.userScenario.updateMany({
				where: { userId: input.user.id, scenarioKey: SCENARIO, progression: 20 },
				data: { progression: 21 }
			});
			if (claimed.count !== 1) return false;
			await tx.userRewards.createMany({
				data: [{ userId: input.user.id, rewardId: Reward.KAURA }],
				skipDuplicates: true
			});
			return true;
		});
		if (progressed) {
			await updateMultipleDinoz(
				input.team.map(d => d.id),
				{ placeId: PlaceEnum.ITOTEM }
			);
		}
	}
	return {
		...result,
		source: 'scenario',
		scenario: { key: SCENARIO, fightKey: 'kabuki_igor_totem', progressed, progression: progressed ? 21 : 20 },
		startText: { type: 'message', text: 'scenarios.kabuki.texts.totemFinalStart' },
		endText: won ? { type: 'message', text: 'scenarios.kabuki.texts.totemFinalEnd' } : undefined
	};
}

export async function processKabukiScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	if (input.fromPlace !== PlaceEnum.MINES_DE_CORAIL) return false;
	if (input.triggerPlace !== PlaceEnum.ITLOST && input.triggerPlace !== PlaceEnum.ITOTEM) return false;
	const progression = await prisma.$transaction(tx => getUserScenarioProgression(tx, input.user.id, SCENARIO));
	const phase = getKabukiMovePhase(progression.progression, input.fromPlace, input.triggerPlace, input.toPlace);
	if (phase === 'lost') return processLostRoute(input);
	if (phase === 'final') return processFinalFight(input);
	return false;
}
