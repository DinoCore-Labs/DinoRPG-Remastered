import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import {
	MAGNETITE_SCENARIO_KEY,
	MagnetiteProgression
} from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';

import { prisma } from '../../prisma.js';

export type BotMagnetiteProgressionStep =
	| {
			type: 'move';
			placeId: PlaceEnum;
	  }
	| {
			type: 'dialog';
			dialogId: string;
			preferredLinkIds: string[];
	  };

function moveOrDialog(
	currentPlaceId: number,
	placeId: PlaceEnum,
	dialogId: string,
	preferredLinkIds: string[]
): BotMagnetiteProgressionStep {
	if (currentPlaceId !== placeId) {
		return {
			type: 'move',
			placeId
		};
	}
	return {
		type: 'dialog',
		dialogId,
		preferredLinkIds
	};
}

export async function getBotMagnetiteProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotMagnetiteProgressionStep | null> {
	const [dinoz, scenario, magnetReward] = await Promise.all([
		prisma.dinoz.findFirst({
			where: {
				id: dinozId,
				userId
			},
			select: {
				placeId: true,
				life: true,
				state: true,
				status: {
					select: {
						statusId: true
					}
				}
			}
		}),
		prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					userId,
					scenarioKey: MAGNETITE_SCENARIO_KEY
				}
			},
			select: {
				progression: true
			}
		}),
		prisma.userRewards.findUnique({
			where: {
				rewardId_userId: {
					userId,
					rewardId: rewardIdByKey.magnet
				}
			},
			select: {
				id: true
			}
		})
	]);

	if (!dinoz || dinoz.life <= 0 || dinoz.state !== null) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	const progression =
		scenario?.progression ?? MagnetiteProgression.INITIAL_AMBUSH;

	switch (progression) {
		case MagnetiteProgression.INITIAL_AMBUSH:
			return {
				type: 'move',
				placeId: PlaceEnum.SYPHON_SIFFLEUR
			};

		case MagnetiteProgression.TALK_TO_KING:
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.CITADELLE_DU_ROI,
				'rocky_king_magnet1',
				['enter', 'events', 'magnet', 'magnet2', 'events2', 'me', 'team', 'team2', 'accept', 'leave']
			);

		case MagnetiteProgression.HUNT_DESTROYER:
			if (!statusIds.has(DinozStatusId.MAGNETITE_RANGER_SEEN)) {
				return moveOrDialog(
					dinoz.placeId,
					PlaceEnum.SYPHON_SIFFLEUR,
					'magnetite_strange_ranger',
					['view']
				);
			}
			return {
				type: 'move',
				placeId: PlaceEnum.TAUDIS_DES_ZAXA
			};

		case MagnetiteProgression.HUNT_NIGHTMARE:
			return {
				type: 'move',
				placeId: PlaceEnum.CAMP_DES_EMMEMMA
			};

		case MagnetiteProgression.HUNT_THUNDER:
			return {
				type: 'move',
				placeId: PlaceEnum.CAMPEMENT_DES_MATTMUT
			};

		case MagnetiteProgression.ENTER_TEAM_W_CAMP:
			return {
				type: 'move',
				placeId: PlaceEnum.REPAIRE_DE_LA_TEAM_W
			};

		case MagnetiteProgression.TALK_TO_CAPTAIN:
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.REPAIRE_DE_LA_TEAM_W,
				'magnetite_team_w_captain',
				['who', 'tell', 'hist1', 'hist2', 'hist3', 'hist4', 'hist5', 'ask', 'yes']
			);

		case MagnetiteProgression.RETURN_TO_KING:
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.CITADELLE_DU_ROI,
				'rocky_king_magnet7',
				['next', 'talk', 'cont', 'serv', 'sehd', 'control', 'serv2', 'ingr', 'sage', 'face', 'end', 'bye']
			);

		case MagnetiteProgression.PREPARE_POTION:
			if (!statusIds.has(DinozStatusId.CORAIL)) {
				return moveOrDialog(
					dinoz.placeId,
					PlaceEnum.MINES_DE_CORAIL,
					'coral_miner',
					['give']
				);
			}

			if (!statusIds.has(DinozStatusId.ICE_PIECE)) {
				if (!statusIds.has(DinozStatusId.FSPELE)) {
					return moveOrDialog(
						dinoz.placeId,
						PlaceEnum.GORGES_PROFONDES,
						'speleleologue',
						['talk', 'gla', 'ok', 'ok2', 'ok3', 'congel', 'congel2', 'thanks']
					);
				}
				return moveOrDialog(
					dinoz.placeId,
					PlaceEnum.GORGES_PROFONDES,
					'speleleologue_ice',
					['talk', 'next', 'prof', 'theo', 'ok']
				);
			}

			/*
			 * La Branche Fleurie est acquise via la chaîne
			 * du Gardien de la Forêt déjà gérée par son planner.
			 * Tant qu'elle manque, on laisse ce planner prendre
			 * le relais au lieu de dupliquer les missions ici.
			 */
			if (!statusIds.has(DinozStatusId.FLOWERING_BRANCH)) {
				return null;
			}

			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.BAO_BOB,
				'bao_bob',
				['question', 'quest4', 'ingr', 'potion']
			);

		case MagnetiteProgression.POTION_READY:
			return {
				type: 'move',
				placeId: PlaceEnum.GO_TO_STEPPES
			};

		case MagnetiteProgression.FINAL_ASSAULT:
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.CITADELLE_DU_ROI,
				'magnetite_citadel_guard_assault',
				['fight']
			);

		case MagnetiteProgression.FINAL_ASSAULT_WON:
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.CITADELLE_DU_ROI,
				'magnetite_team_w_captain_debrief',
				['ok', 'thanks', 'how', 'not', 'thanks2']
			);

		case MagnetiteProgression.CLAIM_REWARD:
			if (!magnetReward) {
				return moveOrDialog(
					dinoz.placeId,
					PlaceEnum.CITADELLE_DU_ROI,
					'rocky_king_magnet12',
					['not', 'not2', 'plan', 'ok', 'accept', 'thanks']
				);
			}
			return moveOrDialog(
				dinoz.placeId,
				PlaceEnum.CONFINS_DES_STEPPES,
				'magnetite_strange_ranger_epilogue',
				['ask', 'euh', 'end']
			);

		case MagnetiteProgression.COMPLETED:
		default:
			return null;
	}
}
