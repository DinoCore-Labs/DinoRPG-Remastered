import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome, FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MissionFightGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozMissions, User } from '../../../../prisma/index.js';
import { updateMultipleDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { advanceDinozMissionOnFight, advanceDinozMissionOnMove } from '../../Mission/Controller/mission.progress.js';
import { resolveCurrentMission } from '../../Mission/Service/missionCurrent.service.js';
import { prisma } from '../../prisma.js';
import { DinozToGetFighter } from '../../utils/fight/fight.mapper.js';
import { UserForConditionCheck } from '../../utils/user/userConditionCheck.js';
import { calculateFightVsMonsters, type DinozToRewardFight, rewardFightVsMonsters } from './fight.service.js';

type DinozToCheckMissionFight = {
	id: number;
	placeId: PlaceEnum | null;
	missions: Pick<DinozMissions, 'id' | 'missionKey' | 'progression' | 'tracking' | 'isCompleted'>[];
};

type MovementListenerUser = Pick<User, 'id' | 'teacher' | 'cooker'> &
	UserForConditionCheck & {
		items: {
			itemId: number;
			quantity: number;
		}[];
	};

type MovementListenerDinoz = DinozToGetFighter & DinozToRewardFight & DinozToCheckMissionFight;

type MovementListenerOptions = {
	autoReequip?: boolean;
	/**
	 * Lieu réellement sélectionné par le joueur avant l'application
	 * éventuelle de gotoPlaceId.
	 */
	triggerPlace?: PlaceEnum;
};

type TriggeredMissionFight = {
	dinozId: number;
	missionKey: string;
	monsterKeys: MissionFightGoal['monsterKeys'];
};

function getTriggeredMissionFightOnMove(
	member: DinozToCheckMissionFight,
	finalPlace: PlaceEnum
): TriggeredMissionFight | null {
	const resolvedMission = resolveCurrentMission(member.missions, member.placeId);
	if (!resolvedMission?.currentGoal) {
		return null;
	}
	const currentGoal = resolvedMission.currentGoal;
	if (currentGoal.type !== 'AT') {
		return null;
	}
	if (currentGoal.place == null || currentGoal.place !== finalPlace) {
		return null;
	}
	const nextGoal = resolvedMission.definition.goals[resolvedMission.state.progression + 1] ?? null;
	if (!nextGoal || nextGoal.type !== 'FIGHT') {
		return null;
	}
	return {
		dinozId: member.id,
		missionKey: resolvedMission.state.missionKey,
		monsterKeys: nextGoal.monsterKeys
	};
}

function sameTriggeredFight(a: TriggeredMissionFight, b: TriggeredMissionFight): boolean {
	if (a.missionKey !== b.missionKey) {
		return false;
	}
	if (a.monsterKeys.length !== b.monsterKeys.length) {
		return false;
	}
	for (let i = 0; i < a.monsterKeys.length; i += 1) {
		if (a.monsterKeys[i] !== b.monsterKeys[i]) {
			return false;
		}
	}
	return true;
}

async function processTowerGuardianFight(
	user: MovementListenerUser,
	team: MovementListenerDinoz[],
	finalPlace: PlaceEnum,
	options: MovementListenerOptions
): Promise<FightResult | false> {
	/*
	 * TOUR_SOMBRE_ENTREE est un lieu virtuel qui redirige vers
	 * TOUR_SOMBRE grâce à gotoPlaceId.
	 *
	 * Nous testons les deux valeurs afin que le combat ne puisse être
	 * déclenché que par le déplacement "Entrer dans la Tour Sombre".
	 */
	if (options.triggerPlace !== PlaceEnum.TOUR_SOMBRE_ENTREE || finalPlace !== PlaceEnum.TOUR_SOMBRE) {
		return false;
	}
	const monsters = [bossList[Boss.TOWER_GUARDIAN]];
	const fightResult = calculateFightVsMonsters(team, user, finalPlace, monsters);
	const result = await rewardFightVsMonsters(team, monsters, fightResult, finalPlace, user, {
		autoReequip: options.autoReequip
	});
	const winner = fightResult.outcome === FightOutcome.AttackerWin;
	if (!winner) {
		/*
		 * En cas de défaite, les Dinoz restent devant la Tour Sombre.
		 * Les pertes de vie et les objets utilisés ont déjà été traités
		 * par rewardFightVsMonsters().
		 */
		return {
			...result,
			background: placeListv2[PlaceEnum.TOUR_SOMBRE_ENTREE].background
		};
	}
	const teamIds = team.map(dinoz => dinoz.id);
	/*
	 * En cas de victoire :
	 *
	 * - chaque Dinoz ayant participé reçoit la Clé de Sylvenoire ;
	 * - tout le groupe est téléporté au Marais Collant.
	 *
	 * Le statut et le déplacement sont appliqués dans une seule
	 * transaction afin d'éviter un état partiellement enregistré.
	 */
	await prisma.$transaction(async tx => {
		for (const dinozId of teamIds) {
			await tx.dinozStatus.upsert({
				where: {
					statusId_dinozId: {
						dinozId,
						statusId: DinozStatusId.SYLVENOIRE_KEY
					}
				},
				update: {},
				create: {
					dinozId,
					statusId: DinozStatusId.SYLVENOIRE_KEY
				}
			});
		}
		await tx.dinoz.updateMany({
			where: {
				id: {
					in: teamIds
				}
			},
			data: {
				placeId: PlaceEnum.MARAIS_COLLANT
			}
		});
	});
	return {
		...result,
		/*
		 * Cette propriété permet au résumé du combat d'afficher :
		 * "Vous avez reçu : Clé de Sylvenoire".
		 */
		statusReward: DinozStatusId.SYLVENOIRE_KEY,
		/*
		 * Le combat se déroule visuellement devant l'entrée de la Tour,
		 * même si finalPlace vaut TOUR_SOMBRE.
		 */
		background: placeListv2[PlaceEnum.TOUR_SOMBRE_ENTREE].background
	};
}

export async function movementListener(
	user: MovementListenerUser,
	team: MovementListenerDinoz[],
	finalPlace: PlaceEnum,
	activeDinoz: number,
	options: MovementListenerOptions = {}
): Promise<FightResult | false> {
	const towerGuardianFight = await processTowerGuardianFight(user, team, finalPlace, options);
	if (towerGuardianFight) {
		return towerGuardianFight;
	}
	const orderedTeam = [
		...team.filter(member => member.id === activeDinoz),
		...team.filter(member => member.id !== activeDinoz)
	];
	const triggeredFights = orderedTeam
		.map(member => getTriggeredMissionFightOnMove(member, finalPlace))
		.filter((fight): fight is TriggeredMissionFight => fight !== null);
	const triggeredFight = triggeredFights[0];
	if (!triggeredFight) {
		return false;
	}
	const monsters = triggeredFight.monsterKeys.map(monsterKey => {
		const monster = monsterByKey[monsterKey];
		if (!monster) {
			throw new ExpectedError(`Unknown mission monster key "${monsterKey}"`);
		}
		return monster;
	});
	const fightResult = calculateFightVsMonsters(team, user, finalPlace, monsters);
	const result = await rewardFightVsMonsters(team, monsters, fightResult, finalPlace, user, {
		autoReequip: options.autoReequip
	});
	const winner = fightResult.outcome === FightOutcome.AttackerWin;
	if (winner) {
		const teamIds = team.map(dinoz => dinoz.id);
		await updateMultipleDinoz(teamIds, { placeId: finalPlace });
		const dinozIdsToAdvance = triggeredFights
			.filter(fight => sameTriggeredFight(fight, triggeredFight))
			.map(fight => fight.dinozId);
		await prisma.$transaction(async tx => {
			for (const dinozId of dinozIdsToAdvance) {
				await advanceDinozMissionOnMove(tx, {
					dinozId,
					place: finalPlace
				});
				await advanceDinozMissionOnFight(tx, {
					dinozId
				});
			}
		});
	}
	return result;
}
