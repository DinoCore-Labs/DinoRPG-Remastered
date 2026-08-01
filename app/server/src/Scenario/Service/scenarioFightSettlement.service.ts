import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { FightProcessResult, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightRewardOptions } from '@dinorpg/core/models/fight/fightReward.js';
import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { type DinozToRewardFight, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';

type FightRewardUser = Parameters<typeof rewardFightVsMonsters>[4];

export type ScenarioFightSettlementInput = {
	/**
	 * Dinoz ayant réellement participé au combat.
	 */
	team: DinozToRewardFight[];
	/**
	 * Tous les monstres présents dans le combat.
	 *
	 * Cette liste sert principalement à vérifier qu'un monstre récompensé
	 * était réellement présent dans l'affrontement.
	 */
	encounteredMonsters: MonsterFiche[];
	/**
	 * Monstres donnant réellement de l'XP, de l'or et des récompenses.
	 *
	 * Exemples :
	 * - [] pour un membre de la Team W qui s'enfuit ;
	 * - [wbour2] pour le combat final.
	 */
	rewardedMonsters: MonsterFiche[];
	/**
	 * Résultat brut produit par calculateFightVsMonsters.
	 */
	fightResult: FightProcessResult;
	place: PlaceEnum;
	user: FightRewardUser;
	/**
	 * Nombre de monstres à ajouter à StatTracking.KILL_M.
	 */
	monsterKillCount: number;
	options?: FightRewardOptions;
};

export async function settleScenarioFight(input: ScenarioFightSettlementInput): Promise<FightResult> {
	const encounteredMonsterIds = new Set(input.encounteredMonsters.map(monster => monster.id));
	const invalidRewardedMonster = input.rewardedMonsters.find(monster => !encounteredMonsterIds.has(monster.id));
	if (invalidRewardedMonster) {
		throw new ExpectedError(`Monster ${invalidRewardedMonster.id} cannot be rewarded because it was not encountered.`);
	}
	const result = await rewardFightVsMonsters(
		input.team,
		input.rewardedMonsters,
		input.fightResult,
		input.place,
		input.user,
		input.options
	);
	return {
		...result,
		monsterKillCount: input.monsterKillCount
	};
}
