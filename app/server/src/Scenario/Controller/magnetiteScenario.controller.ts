import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, type FightProcessResult, type FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { LifeEffect } from '@dinorpg/core/models/fight/transpiler.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { MagnetiteProgression } from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';

import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { getUserScenarioProgression, setUserScenarioProgression } from '../Controller/scenarioProgress.controller.js';
import { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';

const MAGNETITE_SCENARIO_KEY = 'magnet';

const INITIAL_AMBUSH_PLACE = PlaceEnum.SYPHON_SIFFLEUR;

const CAPTAIN_HEAL_AMOUNT = 300;

const INITIAL_TEAM_W_MONSTERS = [monsterByKey.wteam1, monsterByKey.wteam2, monsterByKey.wteam3];

type CaptainRescueState = {
	dinozId: number;
	/**
	 * Dégâts produits par le calcul normal du combat.
	 */
	rawHpLost: number;
	/**
	 * PV réellement retirés après l'intervention du Capitaine.
	 */
	finalHpLost: number;
	/**
	 * Quantité de PV rendue visuellement.
	 */
	healedHp: number;
};

/**
 * Vérifie si l'arrivée au Syphon doit lancer la première embuscade.
 */
async function shouldStartInitialAmbush(input: ScenarioMoveFightInput): Promise<boolean> {
	if (input.toPlace !== INITIAL_AMBUSH_PLACE) {
		return false;
	}
	const scenario = await prisma.$transaction(tx =>
		getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY)
	);
	return scenario.progression === MagnetiteProgression.INITIAL_AMBUSH;
}

/**
 * Calcule l'état final des Dinoz après le soin du Capitaine.
 *
 * Exemple :
 *
 * Vie avant le combat : 400
 * Dégâts subis : 350
 * Vie après le combat : 50
 * Soin du Capitaine : 300
 * Vie finale : 350
 * Perte réellement persistée : 50
 */
function applyCaptainRescue(input: ScenarioMoveFightInput, fightProcess: FightProcessResult): CaptainRescueState[] {
	const rescueStates: CaptainRescueState[] = [];
	for (const dinoz of input.team) {
		const attacker = fightProcess.attackers.find(fighter => fighter.dinozId === dinoz.id);
		if (!attacker) {
			continue;
		}
		const rawHpLost = attacker.hpLost;
		const lifeAfterFight = Math.max(0, dinoz.life - rawHpLost);
		const finalLife = Math.min(dinoz.maxLife, lifeAfterFight + CAPTAIN_HEAL_AMOUNT);
		const finalHpLost = Math.max(0, dinoz.life - finalLife);
		const healedHp = Math.max(0, finalLife - lifeAfterFight);
		rescueStates.push({
			dinozId: dinoz.id,
			rawHpLost,
			finalHpLost,
			healedHp
		});
		/**
		 * rewardFightVsMonsters utilise attacker.hpLost pour mettre à jour
		 * les PV en base.
		 *
		 * On remplace donc les dégâts bruts par la perte finale après soin.
		 */
		attacker.hpLost = finalHpLost;
	}
	/**
	 * L'ancien scénario force systématiquement la victoire après
	 * l'intervention du Capitaine.
	 */
	fightProcess.outcome = FightOutcome.AttackerWin;
	return rescueStates;
}

/**
 * Ajoute les animations de soin à la fin de l'historique.
 */
function buildCaptainHealSteps(fightProcess: FightProcessResult, rescueStates: CaptainRescueState[]): FightStep[] {
	const steps: FightStep[] = [];
	for (const rescue of rescueStates) {
		if (rescue.healedHp <= 0) {
			continue;
		}
		const fighter = fightProcess.fighters.find(entry => entry.id === rescue.dinozId && entry.attacker);
		if (!fighter) {
			continue;
		}
		steps.push({
			action: 'heal',
			fighter: {
				id: fighter.id,
				name: fighter.name,
				type: fighter.type,
				attacker: fighter.attacker
			},
			hp: rescue.healedHp,
			fx: LifeEffect.Normal
		});
	}
	return steps;
}

/**
 * Première embuscade de la Team W.
 */
async function processInitialAmbush(input: ScenarioMoveFightInput): Promise<FightResult> {
	/**
	 * 1. Calcul normal du combat contre les trois membres de la Team W.
	 */
	const fightProcess = calculateFightVsMonsters(input.team, input.user, input.toPlace, INITIAL_TEAM_W_MONSTERS);
	/**
	 * 2. Intervention du Capitaine :
	 *    - soin de 300 PV ;
	 *    - victoire forcée ;
	 *    - recalcul de la perte de PV réellement persistée.
	 */
	const rescueStates = applyCaptainRescue(input, fightProcess);
	/**
	 * 3. Ajout des animations de soin à la fin du combat.
	 */
	const captainHealSteps = buildCaptainHealSteps(fightProcess, rescueStates);
	fightProcess.steps.push(...captainHealSteps);
	/**
	 * 4. Application des conséquences.
	 *
	 * Le tableau de monstres est volontairement vide :
	 * aucun membre de la Team W ne donne d'XP ou d'or.
	 *
	 * Les PV, statuts et objets utilisés restent cependant traités.
	 */
	const result = await rewardFightVsMonsters(input.team, [], fightProcess, input.toPlace, input.user, {
		autoReequip: input.autoReequip,
		disableGoldReward: true
	});
	/**
	 * 5. Mise à jour de la progression et du lieu.
	 */
	const progressed = await prisma.$transaction(async tx => {
		const currentScenario = await getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY);
		if (currentScenario.progression !== MagnetiteProgression.INITIAL_AMBUSH) {
			return false;
		}
		await tx.dinoz.updateMany({
			where: {
				id: {
					in: input.team.map(dinoz => dinoz.id)
				}
			},
			data: {
				placeId: input.toPlace
			}
		});
		await setUserScenarioProgression(tx, {
			userId: input.user.id,
			scenarioKey: MAGNETITE_SCENARIO_KEY,
			progression: MagnetiteProgression.TALK_TO_KING
		});
		return true;
	});
	return {
		...result,
		/**
		 * Les trois membres de la Team W se sont enfuis.
		 */
		monsterKillCount: 0,
		source: 'scenario',
		scenario: {
			key: MAGNETITE_SCENARIO_KEY,
			fightKey: 'magnet_initial_ambush',
			progressed,
			progression: progressed ? MagnetiteProgression.TALK_TO_KING : MagnetiteProgression.INITIAL_AMBUSH
		},
		startText: {
			type: 'message',
			text: 'scenarios.magnet.texts.initialAmbush'
		},
		endText: {
			type: 'message',
			text: 'scenarios.magnet.texts.initialAmbushRescue'
		}
	};
}

/**
 * Point d'entrée des combats de déplacement de la Magnétite.
 */
export async function processMagnetiteScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	if (await shouldStartInitialAmbush(input)) {
		return processInitialAmbush(input);
	}

	return false;
}
