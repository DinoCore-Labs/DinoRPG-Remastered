import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import {
	type FighterRecap,
	FightOutcome,
	type FightProcessResult,
	type FightResult
} from '@dinorpg/core/models/fight/fightResult.js';
import type { FightStep, StepFighter } from '@dinorpg/core/models/fight/fightStep.js';
import { EntranceEffect, LifeEffect } from '@dinorpg/core/models/fight/transpiler.js';
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

const INITIAL_TEAM_W_NAMES = new Set(INITIAL_TEAM_W_MONSTERS.map(monster => monster.name));

type CaptainRescueState = {
	dinozId: number;

	/**
	 * Quantité de PV rendue au Dinoz par le Capitaine.
	 */
	healedHp: number;

	/**
	 * Indique que le Dinoz était à 0 PV à la fin
	 * de la simulation du combat.
	 *
	 * Dans ce cas, l'animation doit exécuter :
	 *
	 * death -> revive -> heal
	 */
	wasDead: boolean;
};

/**
 * Vérifie si l'arrivée au Syphon doit déclencher
 * la première embuscade de la Team W.
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
 * Retourne le prochain identifiant négatif disponible.
 *
 * Les monstres et les invocations utilisent déjà des
 * identifiants négatifs. Le Capitaine doit donc recevoir
 * un identifiant qui ne rentre pas en conflit avec eux.
 */
function getNextScenarioFighterId(fighters: FighterRecap[]): number {
	const lowestId = Math.min(0, ...fighters.map(fighter => fighter.id));

	return lowestId - 1;
}

/**
 * Transforme un FighterRecap en référence légère
 * utilisable dans les FightStep.
 */
function toStepFighter(fighter: FighterRecap): StepFighter {
	return {
		id: fighter.id,
		name: fighter.name,
		type: fighter.type,
		attacker: fighter.attacker
	};
}

/**
 * Crée la représentation visuelle du Capitaine.
 *
 * Le Capitaine est ajouté après le calcul du combat :
 * - il ne possède aucun tour ;
 * - il ne peut pas être ciblé ;
 * - il ne participe pas à la détermination du vainqueur ;
 * - il ne donne aucune récompense.
 */
function createCaptainRecap(fightProcess: FightProcessResult): FighterRecap {
	const captain = monsterByKey.wteamc;

	return {
		id: getNextScenarioFighterId(fightProcess.fighters),

		type: FighterType.REINFORCEMENT,

		name: captain.name,
		display: captain.display,

		/**
		 * Le Capitaine apparaît du côté de la Team W.
		 */
		attacker: false,

		maxHp: captain.hp,
		startingHp: captain.hp,

		energy: 0,
		maxEnergy: 0,
		energyRecovery: 0,

		dark: captain.dark,
		size: captain.size,

		entrance: captain.entrance ?? EntranceEffect.RUN
	};
}

/**
 * Récupère uniquement les trois membres initiaux
 * de la Team W.
 *
 * Les invocations du Dinoz ne sont pas concernées,
 * car elles se trouvent du côté attaquant.
 */
function getInitialTeamWFighters(fightProcess: FightProcessResult): FighterRecap[] {
	return fightProcess.fighters.filter(fighter => !fighter.attacker && INITIAL_TEAM_W_NAMES.has(fighter.name));
}

/**
 * Calcule l'état final des Dinoz après le soin
 * du Capitaine.
 *
 * rewardFightVsMonsters utilise attacker.hpLost
 * pour persister les pertes de PV.
 *
 * On remplace donc les dégâts bruts par la perte
 * restante après le soin du Capitaine.
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
			healedHp,
			wasDead: lifeAfterFight === 0 && finalLife > 0
		});

		/**
		 * Valeur utilisée par rewardFightVsMonsters
		 * pour persister les PV du Dinoz.
		 */
		attacker.hpLost = finalHpLost;
	}

	/**
	 * L'intervention du Capitaine force la victoire
	 * scénaristique.
	 */
	fightProcess.outcome = FightOutcome.AttackerWin;

	return rescueStates;
}

/**
 * Retire uniquement les étapes de mort des membres
 * de la Team W.
 *
 * Les membres de la Team W ne sont pas réellement tués :
 * ils doivent rester présents afin de pouvoir s'enfuir
 * après l'intervention du Capitaine.
 *
 * Les étapes de mort des Dinoz sont conservées.
 * Le front doit donc jouer DEAD avant REVIVE.
 */
function removeTeamWDeathSteps(fightProcess: FightProcessResult): void {
	const teamWFighterIds = new Set(getInitialTeamWFighters(fightProcess).map(fighter => fighter.id));

	fightProcess.steps = fightProcess.steps.filter(step => {
		if (step.action !== 'death') {
			return true;
		}

		return !teamWFighterIds.has(step.fighter.id);
	});
}

/**
 * Construit la scène jouée après le combat :
 *
 * 1. arrivée du Capitaine ;
 * 2. dialogue du Capitaine ;
 * 3. annonce du soin ;
 * 4. résurrection des Dinoz morts ;
 * 5. soin de tous les Dinoz ;
 * 6. fuite des trois membres de la Team W ;
 * 7. fuite du Capitaine.
 */
function buildCaptainPostlude(
	fightProcess: FightProcessResult,
	captain: FighterRecap,
	rescueStates: CaptainRescueState[]
): FightStep[] {
	const steps: FightStep[] = [];

	/**
	 * Le Capitaine entre sur le terrain.
	 */
	steps.push({
		action: 'arrive',
		fid: captain.id
	});

	/**
	 * Premier dialogue.
	 */
	steps.push({
		action: 'fightText',
		text: {
			type: 'talk',
			speakerFid: captain.id,
			text: 'scenarios.magnet.texts.initialAmbushRescue'
		}
	});

	/**
	 * Annonce du soin.
	 */
	steps.push({
		action: 'fightText',
		text: {
			type: 'talk',
			speakerFid: captain.id,
			text: 'scenarios.magnet.texts.initialAmbushRegeneration'
		}
	});

	for (const rescue of rescueStates) {
		const fighter = fightProcess.fighters.find(entry => entry.id === rescue.dinozId);

		if (!fighter) {
			continue;
		}

		const stepFighter = toStepFighter(fighter);

		/**
		 * Le Dinoz doit être relevé avant de recevoir
		 * son animation de soin.
		 *
		 * L'étape death précédente reste bien présente
		 * dans l'historique.
		 */
		if (rescue.wasDead) {
			steps.push({
				action: 'revive',
				fighter: stepFighter
			});
		}

		/**
		 * Le soin est joué après la résurrection.
		 */
		if (rescue.healedHp > 0) {
			steps.push({
				action: 'heal',
				fighter: stepFighter,
				hp: rescue.healedHp,
				fx: LifeEffect.Heal
			});
		}
	}

	/**
	 * Les trois membres de la Team W s'enfuient.
	 */
	for (const fighter of getInitialTeamWFighters(fightProcess)) {
		steps.push({
			action: 'leave',
			fighter: toStepFighter(fighter)
		});
	}

	/**
	 * Le Capitaine quitte également le terrain.
	 */
	steps.push({
		action: 'leave',
		fighter: toStepFighter(captain)
	});

	return steps;
}

/**
 * Traite la première embuscade de la Team W.
 */
async function processInitialAmbush(input: ScenarioMoveFightInput): Promise<FightResult> {
	/**
	 * 1. Calcul normal du combat contre Destructeur,
	 * Nightmare et Tonnerre.
	 */
	const fightProcess = calculateFightVsMonsters(input.team, input.user, input.toPlace, INITIAL_TEAM_W_MONSTERS);

	/**
	 * 2. Application fonctionnelle du sauvetage :
	 *    - calcul du soin ;
	 *    - victoire forcée ;
	 *    - recalcul des pertes de PV persistées.
	 */
	const rescueStates = applyCaptainRescue(input, fightProcess);

	/**
	 * 3. Les membres de la Team W doivent pouvoir
	 * s'enfuir, même si le calcul les avait tués.
	 *
	 * Les morts des Dinoz restent dans l'historique.
	 */
	removeTeamWDeathSteps(fightProcess);

	/**
	 * 4. Ajout du Capitaine uniquement dans
	 * la représentation visuelle.
	 */
	const captain = createCaptainRecap(fightProcess);

	fightProcess.fighters.push(captain);

	/**
	 * 5. Ajout de la scène :
	 *
	 * arrive -> talk -> revive -> heal -> leave
	 */
	fightProcess.steps.push(...buildCaptainPostlude(fightProcess, captain, rescueStates));

	/**
	 * 6. Application des conséquences.
	 *
	 * La liste des monstres récompensés est vide :
	 * - aucune XP ;
	 * - aucun or ;
	 * - aucune récompense ;
	 * - aucun kill.
	 */
	const result = await rewardFightVsMonsters(input.team, [], fightProcess, input.toPlace, input.user, {
		autoReequip: input.autoReequip,
		disableGoldReward: true
	});

	/**
	 * 7. Déplacement du groupe et progression
	 * du scénario.
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
		 * Aucun membre de la Team W n'est tué.
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
		}
	};
}

/**
 * Point d'entrée des combats déclenchés
 * par les déplacements de la Magnétite.
 */
export async function processMagnetiteScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	if (await shouldStartInitialAmbush(input)) {
		return processInitialAmbush(input);
	}

	return false;
}
