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

type MagnetiteProgressionValue = (typeof MagnetiteProgression)[keyof typeof MagnetiteProgression];

type TeamWEncounter = {
	triggerPlace: PlaceEnum;
	progression: MagnetiteProgressionValue;
	nextProgression: MagnetiteProgressionValue;
	monsterKey: 'wteam1' | 'wteam2' | 'wteam3';
	fightKey: string;
	/**
	 * Texte affiché à la fin lorsque le joueur gagne.
	 */
	winTextKey: string;
};

const TEAM_W_START_TEXT_KEY = 'scenarios.magnet.texts.fightWTeamStart';

const TEAM_W_LOST_TEXT_KEY = 'scenarios.magnet.texts.fightWTeamLost';

const FIRST_GROUBOURIN_PLACE = PlaceEnum.REPAIRE_DE_LA_TEAM_W;

const FIRST_GROUBOURIN_MONSTER = monsterByKey.wbour1;

const TEAM_W_END_TEXT_KEY = 'scenarios.magnet.texts.fightWTeamEnd';

/**
 * Combats individuels contre les trois membres de la Team W.
 */
const TEAM_W_ENCOUNTERS: readonly TeamWEncounter[] = [
	{
		triggerPlace: PlaceEnum.TAUDIS_DES_ZAXA,
		progression: MagnetiteProgression.HUNT_DESTROYER,
		nextProgression: MagnetiteProgression.HUNT_NIGHTMARE,
		monsterKey: 'wteam1',
		fightKey: 'magnet_wteam_1',
		winTextKey: 'scenarios.magnet.texts.fightWTeamWon1'
	},
	{
		triggerPlace: PlaceEnum.CAMP_DES_EMMEMMA,
		progression: MagnetiteProgression.HUNT_NIGHTMARE,
		nextProgression: MagnetiteProgression.HUNT_THUNDER,
		monsterKey: 'wteam2',
		fightKey: 'magnet_wteam_2',
		winTextKey: 'scenarios.magnet.texts.fightWTeamWon2'
	},
	{
		triggerPlace: PlaceEnum.CAMPEMENT_DES_MATTMUT,
		progression: MagnetiteProgression.HUNT_THUNDER,
		nextProgression: MagnetiteProgression.ENTER_TEAM_W_CAMP,
		monsterKey: 'wteam3',
		fightKey: 'magnet_wteam_3',
		winTextKey: 'scenarios.magnet.texts.fightWTeamWon3'
	}
];

type CaptainRescueState = {
	dinozId: number;
	/**
	 * Quantité de PV rendue au Dinoz par le Capitaine.
	 */
	healedHp: number;
	/**
	 * Indique que le Dinoz était à 0 PV à la fin
	 * de la simulation du combat.
	 * Dans ce cas, l'animation doit exécuter :
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
 * Cherche un combat individuel Team W correspondant :
 * - au passage réellement sélectionné ;
 * - à la progression actuelle du scénario.
 */
async function findTeamWEncounter(input: ScenarioMoveFightInput): Promise<TeamWEncounter | undefined> {
	/**
	 * On vérifie d'abord le lieu afin d'éviter une requête
	 * en base sur tous les déplacements ordinaires.
	 */
	const encounterByPlace = TEAM_W_ENCOUNTERS.find(encounter => encounter.triggerPlace === input.triggerPlace);
	if (!encounterByPlace) {
		return undefined;
	}
	const scenario = await prisma.$transaction(tx =>
		getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY)
	);
	if (scenario.progression !== encounterByPlace.progression) {
		return undefined;
	}
	return encounterByPlace;
}

/**
 * Vérifie si l'entrée dans le Repaire de la Team W
 * doit déclencher le premier combat contre Groubourin.
 */
async function shouldStartFirstGroubourinEncounter(input: ScenarioMoveFightInput): Promise<boolean> {
	/**
	 * On vérifie le lieu réellement sélectionné..
	 */
	if (input.triggerPlace !== FIRST_GROUBOURIN_PLACE) {
		return false;
	}
	const scenario = await prisma.$transaction(tx =>
		getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY)
	);
	return scenario.progression === MagnetiteProgression.ENTER_TEAM_W_CAMP;
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
 * Retire l'étape de mort d'un combattant précis.
 *
 * Groubourin ne meurt pas pendant cette rencontre :
 * le combat est interrompu avant sa conclusion narrative.
 */
function removeFighterDeathStep(fightProcess: FightProcessResult, fighterId: number): void {
	fightProcess.steps = fightProcess.steps.filter(step => {
		if (step.action !== 'death') {
			return true;
		}
		return step.fighter.id !== fighterId;
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
 * Le membre de la Team W ne meurt pas réellement.
 * Il quitte le terrain après avoir prononcé son texte de fin.
 */
function buildTeamWMemberEscapeStep(teamWMember: FighterRecap): FightStep {
	return {
		action: 'leave',
		fighter: toStepFighter(teamWMember)
	};
}

/**
 * Retrouve Groubourin dans les combattants générés
 * par le moteur.
 */
function getFirstGroubourinFighter(fightProcess: FightProcessResult): FighterRecap {
	const fighter = fightProcess.fighters.find(entry => !entry.attacker && entry.name === FIRST_GROUBOURIN_MONSTER.name);
	if (!fighter) {
		throw new Error('Unable to find wbour1 in the first Team W lair encounter.');
	}
	return fighter;
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
 * Traite un combat individuel contre un membre de la Team W.
 */
/**
 * Traite l'un des trois combats individuels
 * contre un membre de la Team W.
 */
async function processTeamWEncounter(input: ScenarioMoveFightInput, encounter: TeamWEncounter): Promise<FightResult> {
	const monster = monsterByKey[encounter.monsterKey];
	const fightProcess = calculateFightVsMonsters(input.team, input.user, input.toPlace, [monster]);
	/**
	 * Contrairement à l'embuscade initiale,
	 * la victoire n'est jamais forcée.
	 */
	const won = fightProcess.outcome === FightOutcome.AttackerWin;
	if (won) {
		const [teamWMember] = getInitialTeamWFighters(fightProcess);
		if (!teamWMember) {
			throw new Error(`Unable to find Team W fighter "${encounter.monsterKey}".`);
		}
		/**
		 * Le membre Team W a été vaincu, mais ne meurt pas.
		 *
		 * On retire son animation DEAD afin qu'il puisse
		 * ensuite jouer son animation ESCAPE.
		 */
		removeTeamWDeathSteps(fightProcess);
		fightProcess.steps.push(buildTeamWMemberEscapeStep(teamWMember));
	}
	/**
	 * Aucun membre Team W ne donne :
	 * - d'XP ;
	 * - d'or ;
	 * - de récompense ;
	 * - de kill.
	 *
	 * Les dégâts, statuts et objets consommés sont
	 * néanmoins appliqués normalement.
	 */
	const result = await rewardFightVsMonsters(input.team, [], fightProcess, input.toPlace, input.user, {
		autoReequip: input.autoReequip,
		disableGoldReward: true
	});
	let progressed = false;
	/**
	 * La progression du scénario et le déplacement
	 * ne sont validés qu'en cas de victoire.
	 */
	if (won) {
		progressed = await prisma.$transaction(async tx => {
			const currentScenario = await getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY);
			if (currentScenario.progression !== encounter.progression) {
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
				progression: encounter.nextProgression
			});
			return true;
		});
	}
	return {
		...result,
		/**
		 * Le membre Team W s'enfuit en cas de victoire.
		 * Il n'est jamais comptabilisé comme tué.
		 */
		monsterKillCount: 0,
		source: 'scenario',
		scenario: {
			key: MAGNETITE_SCENARIO_KEY,
			fightKey: encounter.fightKey,
			progressed,
			progression: progressed ? encounter.nextProgression : encounter.progression
		},
		/**
		 * Même texte au début des trois combats.
		 */
		startText: {
			type: 'message',
			text: TEAM_W_START_TEXT_KEY
		},
		/**
		 * Texte de fin différent selon le résultat :
		 *
		 * - victoire : won1, won2 ou won3 ;
		 * - défaite : lost.
		 */
		endText: {
			type: 'message',
			text: won ? encounter.winTextKey : TEAM_W_LOST_TEXT_KEY
		}
	};
}

/**
 * Traite la première rencontre contre Groubourin
 * dans le Repaire de la Team W.
 *
 * Ce combat est narrativement interrompu :
 * - Groubourin ne meurt pas ;
 * - aucune récompense n'est accordée ;
 * - aucun kill n'est compté ;
 * - le résultat est considéré comme positif pour le scénario ;
 * - la progression passe de 5 à 6.
 */
async function processFirstGroubourinEncounter(input: ScenarioMoveFightInput): Promise<FightResult> {
	/**
	 * 1. Calcul du combat avec Groubourin.
	 */
	const fightProcess = calculateFightVsMonsters(input.team, input.user, input.toPlace, [FIRST_GROUBOURIN_MONSTER]);
	/**
	 * 2. Récupération de sa représentation dans
	 * le résultat du moteur.
	 */
	const groubourin = getFirstGroubourinFighter(fightProcess);
	/**
	 * 3. Groubourin n'est pas tué.
	 *
	 * Même si la simulation normale avait produit une
	 * étape death pour lui, celle-ci est retirée.
	 */
	removeFighterDeathStep(fightProcess, groubourin.id);
	/**
	 * 4. L'affrontement est narrativement validé.
	 *
	 * Il ne s'agit pas d'une véritable victoire sur Groubourin :
	 * cette issue sert à indiquer au reste du système que
	 * l'événement scénarisé est terminé avec succès.
	 */
	fightProcess.outcome = FightOutcome.AttackerWin;
	/**
	 * 5. Application des conséquences du combat.
	 *
	 * Le tableau des monstres récompensés est vide :
	 * - aucune XP ;
	 * - aucun or ;
	 * - aucun drop ;
	 * - aucune récompense liée à Groubourin.
	 *
	 * Les dégâts subis, objets consommés et statuts sont
	 * toutefois traités par rewardFightVsMonsters.
	 */
	const result = await rewardFightVsMonsters(input.team, [], fightProcess, input.toPlace, input.user, {
		autoReequip: input.autoReequip,
		disableGoldReward: true
	});
	/**
	 * 6. Installation dans le Repaire et progression
	 * du scénario.
	 */
	const progressed = await prisma.$transaction(async tx => {
		const currentScenario = await getUserScenarioProgression(tx, input.user.id, MAGNETITE_SCENARIO_KEY);
		/**
		 * Protection contre une double résolution.
		 */
		if (currentScenario.progression !== MagnetiteProgression.ENTER_TEAM_W_CAMP) {
			return false;
		}
		/**
		 * Le groupe entre dans le Repaire.
		 */
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
		/**
		 * Étape suivante :
		 * discussion avec la Team W.
		 */
		await setUserScenarioProgression(tx, {
			userId: input.user.id,
			scenarioKey: MAGNETITE_SCENARIO_KEY,
			progression: MagnetiteProgression.TALK_TO_CAPTAIN
		});
		return true;
	});
	return {
		...result,
		/**
		 * Groubourin est toujours vivant.
		 */
		monsterKillCount: 0,
		source: 'scenario',
		scenario: {
			key: MAGNETITE_SCENARIO_KEY,
			fightKey: 'magnet_first_bigbeastly',
			progressed,
			progression: progressed ? MagnetiteProgression.TALK_TO_CAPTAIN : MagnetiteProgression.ENTER_TEAM_W_CAMP
		},
		/**
		 * Texte original commun aux combats Team W.
		 */
		startText: {
			type: 'message',
			text: TEAM_W_START_TEXT_KEY
		},
		/**
		 * Texte original de l'interruption.
		 */
		endText: {
			type: 'message',
			text: TEAM_W_END_TEXT_KEY
		}
	};
}

/**
 * Point d'entrée des combats déclenchés
 * par les déplacements de la Magnétite.
 */
export async function processMagnetiteScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	/**
	 * Étape 0 : embuscade initiale.
	 */
	if (await shouldStartInitialAmbush(input)) {
		return processInitialAmbush(input);
	}
	/**
	 * Étapes 2, 3 et 4 :
	 * Destructeur, Nightmare et Tonnerre.
	 */
	const teamWEncounter = await findTeamWEncounter(input);
	if (teamWEncounter) {
		return processTeamWEncounter(input, teamWEncounter);
	}
	/**
	 * Étape 5 :
	 * premier combat contre Groubourin dans le Repaire.
	 */
	if (await shouldStartFirstGroubourinEncounter(input)) {
		return processFirstGroubourinEncounter(input);
	}
	return false;
}
