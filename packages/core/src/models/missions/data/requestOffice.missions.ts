import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';
import type { MissionValidateGoal } from '../missionGoal.js';

const REQUEST_OFFICE_GROUP = 'dquest';

const requestOfficeValidateGoal = (): MissionValidateGoal => ({
	type: 'VALIDATE',
	npcKey: 'request_office',
	place: PlaceEnum.AVANT_POSTE_ROCKY,
	nameKey: 'npc.requestOffice.name'
});

export const requestOfficeMissions: MissionDefinition[] = [
	{
		key: 'dexplo',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.dexplo.name',
		beginKey: 'missions.requestOffice.dexplo.begin',
		endKey: 'missions.requestOffice.dexplo.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.CROISEE_DES_NOMADES,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'dexplo_take_notes_crossroads',
				place: PlaceEnum.CROISEE_DES_NOMADES,
				nameKey: 'missions.requestOffice.dexplo.takeNotesCrossroads.name',
				descriptionKey: 'missions.requestOffice.dexplo.takeNotesCrossroads.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.SENTIER_DE_TOUTEMBA,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'dexplo_take_notes_toutemba',
				place: PlaceEnum.SENTIER_DE_TOUTEMBA,
				nameKey: 'missions.requestOffice.dexplo.takeNotesToutemba.name',
				descriptionKey: 'missions.requestOffice.dexplo.takeNotesToutemba.description'
			},
			{
				type: 'ACTION',
				actionKey: 'dexplo_climb_cliff',
				place: PlaceEnum.SENTIER_DE_TOUTEMBA,
				nameKey: 'missions.requestOffice.dexplo.climbCliff.name',
				descriptionKey: 'missions.requestOffice.dexplo.climbCliff.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'dexplo_take_more_notes',
					nameKey: 'missions.requestOffice.dexplo.takeMoreNotes.name',
					place: PlaceEnum.SENTIER_DE_TOUTEMBA,
					monsterKeys: ['brig1', 'brig1', 'brig1'],
					allyKeys: [],
					background: 'm_step_cliff',
					beginText: 'missions.requestOffice.dexplo.takeMoreNotes.begin',
					winText: 'missions.requestOffice.dexplo.takeMoreNotes.win'
				}
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 70 },
			{ type: 'GOLD', value: 1500 }
		],
		labels: {},
		limit: 35
	},

	{
		key: 'dcarav',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.dcarav.name',
		beginKey: 'missions.requestOffice.dcarav.begin',
		endKey: 'missions.requestOffice.dcarav.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'TALK',
				npcKey: 'soulef_moissa_dcarav_start',
				place: PlaceEnum.AVANT_POSTE_ROCKY,
				nameKey: 'missions.requestOffice.common.soulefMoissa.name',
				textKey: 'missions.requestOffice.dcarav.soulefMoissaStart.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'dcarav_carrier',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.dcarav.carrier.name',
				textKey: 'missions.requestOffice.dcarav.carrier.text'
			},
			{
				type: 'ACTION',
				actionKey: 'dcarav_pick_up_crates',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.dcarav.pickUpCrates.name',
				descriptionKey: 'missions.requestOffice.dcarav.pickUpCrates.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.CITADELLE_DU_ROI,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'dcarav_citadel_break',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.dcarav.citadelBreak.name',
				descriptionKey: 'missions.requestOffice.dcarav.citadelBreak.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'dcarav_delivery_service',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				nameKey: 'missions.requestOffice.dcarav.deliveryService.name',
				textKey: 'missions.requestOffice.dcarav.deliveryService.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'dcarav_syphon_break',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				nameKey: 'missions.requestOffice.dcarav.syphonBreak.name',
				descriptionKey: 'missions.requestOffice.dcarav.syphonBreak.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'dcarav_suspicious_noise',
					nameKey: 'missions.requestOffice.dcarav.suspiciousNoise.name',
					place: PlaceEnum.SYPHON_SIFFLEUR,
					monsterKeys: ['korgon', 'korgon', 'korgon', 'korgon', 'korgon', 'korgon'],
					allyKeys: [],
					background: 'st_syphon',
					beginText: 'missions.requestOffice.dcarav.suspiciousNoise.begin',
					winText: 'missions.requestOffice.dcarav.suspiciousNoise.win'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.AVANT_POSTE_ROCKY,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'soulef_moissa_dcarav_end',
				place: PlaceEnum.AVANT_POSTE_ROCKY,
				nameKey: 'missions.requestOffice.common.soulefMoissa.name',
				textKey: 'missions.requestOffice.dcarav.soulefMoissaEnd.text'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 100 },
			{ type: 'GOLD', value: 3000 }
		],
		labels: {},
		limit: 35
	},

	{
		key: 'scorp1',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.scorp1.name',
		beginKey: 'missions.requestOffice.scorp1.begin',
		endKey: 'missions.requestOffice.scorp1.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'TALK',
				npcKey: 'soulef_moissa_scorp1',
				place: PlaceEnum.AVANT_POSTE_ROCKY,
				nameKey: 'missions.requestOffice.common.soulefMoissa.name',
				textKey: 'missions.requestOffice.scorp1.soulefMoissa.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.DEVOREUSE_DE_L_EST,
				hidden: false
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'scorp1_search_scorpwink',
					nameKey: 'missions.requestOffice.scorp1.searchScorpwink.name',
					place: PlaceEnum.DEVOREUSE_DE_L_EST,
					monsterKeys: ['scorp'],
					allyKeys: [],
					background: 'st_devor',
					beginText: 'missions.requestOffice.scorp1.searchScorpwink.begin',
					winText: 'missions.requestOffice.scorp1.searchScorpwink.win'
				}
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'scorp1_search_further',
					nameKey: 'missions.requestOffice.scorp1.searchFurther.name',
					place: PlaceEnum.DEVOREUSE_DE_L_EST,
					monsterKeys: ['scorp', 'worm'],
					allyKeys: [],
					background: 'st_canyon',
					beginText: 'missions.requestOffice.scorp1.searchFurther.begin'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'scorp1_collect_stinger',
				place: PlaceEnum.DEVOREUSE_DE_L_EST,
				nameKey: 'missions.requestOffice.scorp1.collectStinger.name',
				descriptionKey: 'missions.requestOffice.scorp1.collectStinger.description'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 80 },
			{ type: 'GOLD', value: 2000 },
			{
				type: 'ITEM',
				itemKey: 'poisonite_shot',
				quantity: 2
			}
		],
		labels: {},
		limit: 35
	},

	{
		key: 'brig1',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.brig1.name',
		beginKey: 'missions.requestOffice.brig1.begin',
		endKey: 'missions.requestOffice.brig1.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.CITADELLE_DU_ROI,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'ali_labah_brig1',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.aliLabah.name',
				textKey: 'missions.requestOffice.brig1.aliLabah.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.CROISEE_DES_NOMADES,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['brig1', 'brig2', 'brig3'],
					count: 15,
					force: true,
					place: PlaceEnum.CROISEE_DES_NOMADES,
					displayNameKey: 'missions.requestOffice.brig1.banditsToEliminate'
				}
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 80 },
			{ type: 'GOLD', value: 3000 }
		],
		labels: {},
		limit: 35
	},

	{
		key: 'kitchn',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.kitchn.name',
		beginKey: 'missions.requestOffice.kitchn.begin',
		endKey: 'missions.requestOffice.kitchn.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.CITADELLE_DU_ROI,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'citadel_guard_kitchn',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.guard.name',
				textKey: 'missions.requestOffice.kitchn.guardStart.text'
			},
			{
				type: 'TALK',
				npcKey: 'malika_ramhel_kitchn_start',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.kitchn.malikaRamhel.name',
				textKey: 'missions.requestOffice.kitchn.malikaRamhel.startText'
			},
			{
				type: 'ACTION',
				actionKey: 'kitchn_enter_storeroom',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.kitchn.enterStoreroom.name',
				descriptionKey: 'missions.requestOffice.kitchn.enterStoreroom.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'kitchn_wait_in_shadows',
					nameKey: 'missions.requestOffice.kitchn.waitInShadows.name',
					place: PlaceEnum.CITADELLE_DU_ROI,
					monsterKeys: ['thief'],
					allyKeys: [],
					background: 'm_step_kitchen',
					beginText: 'missions.requestOffice.kitchn.waitInShadows.begin',
					winText: 'missions.requestOffice.kitchn.waitInShadows.win'
				}
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'kitchn_chase_scorpwink',
					nameKey: 'missions.requestOffice.kitchn.chaseScorpwink.name',
					place: PlaceEnum.CITADELLE_DU_ROI,
					monsterKeys: ['thief2', 'brig1', 'brig1', 'brig3', 'brig2', 'brig3'],
					allyKeys: [],
					background: 'm_step_wcavern',
					beginMonsterKey: 'brig2',
					beginText: 'missions.requestOffice.kitchn.chaseScorpwink.begin'
				}
			},
			{
				type: 'TALK',
				npcKey: 'malika_ramhel_kitchn_end',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.kitchn.malikaRamhel.name',
				textKey: 'missions.requestOffice.kitchn.malikaRamhel.endText'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 80 },
			{ type: 'GOLD', value: 2500 },
			{
				type: 'ITEM',
				itemKey: 'fight_ration',
				quantity: 3
			}
		],
		labels: {},
		limit: 35
	},

	{
		key: 'worms',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.worms.name',
		beginKey: 'missions.requestOffice.worms.begin',
		endKey: 'missions.requestOffice.worms.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'fadoua_worms_start',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.worms.fadoua.name',
				textKey: 'missions.requestOffice.worms.fadoua.startText'
			},
			{
				type: 'ACTION',
				actionKey: 'worms_take_helmet',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.worms.takeHelmet.name',
				descriptionKey: 'missions.requestOffice.worms.takeHelmet.description'
			},
			{
				type: 'TALK',
				npcKey: 'fadoua_worms_briefing',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.worms.fadoua.name',
				textKey: 'missions.requestOffice.worms.fadoua.briefingText'
			},
			{
				type: 'AT',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'caravoies_worker_worms_start',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				nameKey: 'missions.requestOffice.worms.worker.name',
				textKey: 'missions.requestOffice.worms.worker.startText'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['worm'],
					count: 5,
					force: true,
					place: PlaceEnum.PYLONES_DE_MAGNETITES,
					displayNameKey: 'missions.requestOffice.worms.longbriksToEliminate'
				}
			},
			{
				type: 'TALK',
				npcKey: 'caravoies_worker_worms_hole',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				nameKey: 'missions.requestOffice.worms.worker.name',
				textKey: 'missions.requestOffice.worms.worker.holeText'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'worms_jump_into_hole',
					nameKey: 'missions.requestOffice.worms.jumpIntoHole.name',
					place: PlaceEnum.PYLONES_DE_MAGNETITES,
					monsterKeys: ['wormom'],
					allyKeys: ['buildr'],
					background: 'm_step_hole',
					beginMonsterKey: 'buildr',
					beginText: 'missions.requestOffice.worms.jumpIntoHole.begin'
				}
			},
			{
				type: 'TALK',
				npcKey: 'caravoies_worker_worms_end',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				nameKey: 'missions.requestOffice.worms.worker.name',
				textKey: 'missions.requestOffice.worms.worker.endText'
			},
			{
				type: 'AT',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				hidden: false,
				titleKey: 'missions.requestOffice.worms.returnToFadoua'
			},
			{
				type: 'TALK',
				npcKey: 'fadoua_worms_end',
				place: PlaceEnum.FRONTIERE_CREPITANTE,
				nameKey: 'missions.requestOffice.worms.fadoua.name',
				textKey: 'missions.requestOffice.worms.fadoua.endText'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 100 },
			{ type: 'GOLD', value: 2500 },
			{
				type: 'ITEM',
				itemKey: 'monochromatic',
				quantity: 1
			}
		],
		labels: {},
		limit: 35
	},
	{
		key: 'brig2',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.brig2.name',
		beginKey: 'missions.requestOffice.brig2.begin',
		endKey: 'missions.requestOffice.brig2.end',
		condition: 'mission(dexplo)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				hidden: true,
				titleKey: 'missions.requestOffice.brig2.findSahalamiTrail'
			},
			{
				type: 'ACTION',
				actionKey: 'brig2_inspect_attacked_caravan',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				nameKey: 'missions.requestOffice.brig2.attackedCaravan.name',
				descriptionKey: 'missions.requestOffice.brig2.attackedCaravan.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.DEVOREUSE_DE_L_OUEST,
				hidden: true,
				titleKey: 'missions.requestOffice.brig2.findBandits'
			},
			{
				type: 'ACTION',
				actionKey: 'brig2_inspect_crates',
				place: PlaceEnum.DEVOREUSE_DE_L_OUEST,
				nameKey: 'missions.requestOffice.brig2.stackedCrates.name',
				descriptionKey: 'missions.requestOffice.brig2.stackedCrates.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'brig2_enter_hideout',
					nameKey: 'missions.requestOffice.brig2.enterHideout.name',
					place: PlaceEnum.DEVOREUSE_DE_L_OUEST,
					monsterKeys: ['brig2', 'brig1'],
					allyKeys: [],
					background: 'm_step_cave1',
					beginMonsterKey: 'brig2',
					beginText: 'missions.requestOffice.brig2.enterHideout.begin',
					winText: 'missions.requestOffice.brig2.enterHideout.win'
				}
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'brig2_explore_hideout',
					nameKey: 'missions.requestOffice.brig2.exploreHideout.name',
					place: PlaceEnum.DEVOREUSE_DE_L_OUEST,
					monsterKeys: ['brig1', 'brig1', 'salami'],
					allyKeys: [],
					background: 'm_step_cave2',
					beginMonsterKey: 'salami',
					beginText: 'missions.requestOffice.brig2.exploreHideout.begin',
					winText: 'missions.requestOffice.brig2.exploreHideout.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'brig2_take_strange_pendant',
				place: PlaceEnum.DEVOREUSE_DE_L_OUEST,
				nameKey: 'missions.requestOffice.brig2.strangePendant.name',
				descriptionKey: 'missions.requestOffice.brig2.strangePendant.description'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 80 },
			{ type: 'GOLD', value: 2500 },
			{
				type: 'ITEM',
				itemKey: 'hot_bread',
				quantity: 1
			}
		],
		labels: {},
		limit: 35
	},

	{
		key: 'penden',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.penden.name',
		beginKey: 'missions.requestOffice.penden.begin',
		endKey: 'missions.requestOffice.penden.end',
		condition: 'mission(brig2)',
		goals: [
			{
				type: 'TALK',
				npcKey: 'soulef_moissa_penden',
				place: PlaceEnum.AVANT_POSTE_ROCKY,
				nameKey: 'missions.requestOffice.common.soulefMoissa.name',
				textKey: 'missions.requestOffice.penden.soulefMoissa.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.CITADELLE_DU_ROI,
				hidden: true
			},
			{
				type: 'TALK',
				npcKey: 'ali_labah_penden',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.aliLabah.name',
				textKey: 'missions.requestOffice.penden.aliLabah.text'
			},
			{
				type: 'ACTION',
				actionKey: 'penden_take_bandit_list',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.penden.takeList.name',
				descriptionKey: 'missions.requestOffice.penden.takeList.description'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{
				type: 'XP',
				value: 90
			}
		],
		labels: {},
		limit: 35
	},

	{
		key: 'hunt1',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.hunt1.name',
		beginKey: 'missions.requestOffice.hunt1.begin',
		endKey: 'missions.requestOffice.hunt1.end',
		condition: 'mission(penden)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				hidden: true
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_wait_for_attack',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.waitForAttack.name',
				descriptionKey: 'missions.requestOffice.hunt1.waitForAttack.description'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_wait',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.wait.name',
				descriptionKey: 'missions.requestOffice.hunt1.wait.description'
			},
			{
				type: 'TALK',
				npcKey: 'hunt1_passing_merchant',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.passingMerchant.name',
				textKey: 'missions.requestOffice.hunt1.passingMerchant.text'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_wait_again',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.waitAgain.name',
				descriptionKey: 'missions.requestOffice.hunt1.waitAgain.description'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_keep_waiting',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.keepWaiting.name',
				descriptionKey: 'missions.requestOffice.hunt1.keepWaiting.description'
			},
			{
				type: 'TALK',
				npcKey: 'hunt1_passing_adventurer',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.passingAdventurer.name',
				textKey: 'missions.requestOffice.hunt1.passingAdventurer.text'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_walk_in_circles',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.walkInCircles.name',
				descriptionKey: 'missions.requestOffice.hunt1.walkInCircles.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt1_wait_longer',
					nameKey: 'missions.requestOffice.hunt1.waitLonger.name',
					place: PlaceEnum.DEVOREUSE_DU_NORD,
					monsterKeys: ['brig1', 'brig2', 'brig1', 'tripo2'],
					allyKeys: [],
					background: 'm_step_fog',
					beginMonsterKey: 'tripo2',
					beginText: 'missions.requestOffice.hunt1.waitLonger.begin',
					winText: 'missions.requestOffice.hunt1.waitLonger.win'
				}
			},
			{
				type: 'TALK',
				npcKey: 'hunt1_tripou_taunt',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.tripou.name',
				textKey: 'missions.requestOffice.hunt1.tripou.taunt'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt1_henchmen',
					nameKey: 'missions.requestOffice.hunt1.henchmen.name',
					place: PlaceEnum.DEVOREUSE_DU_NORD,
					monsterKeys: ['brig1', 'brig1', 'brig1', 'tripo2'],
					allyKeys: [],
					background: 'm_step_fog',
					beginMonsterKey: 'tripo2',
					beginText: 'missions.requestOffice.hunt1.henchmen.begin'
				}
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt1_charge_tripou',
					nameKey: 'missions.requestOffice.hunt1.chargeTripou.name',
					place: PlaceEnum.DEVOREUSE_DU_NORD,
					monsterKeys: ['brig1', 'brig1', 'brig1', 'tripou'],
					allyKeys: [],
					background: 'm_step_fog',
					beginMonsterKey: 'tripou',
					beginText: 'missions.requestOffice.hunt1.chargeTripou.begin',
					winText: 'missions.requestOffice.hunt1.chargeTripou.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'hunt1_take_cleaver_pendant',
				place: PlaceEnum.DEVOREUSE_DU_NORD,
				nameKey: 'missions.requestOffice.hunt1.cleaverPendant.name',
				descriptionKey: 'missions.requestOffice.hunt1.cleaverPendant.description'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 3000 },
			{ type: 'XP', value: 90 }
		],
		labels: {},
		limit: 35
	},

	{
		key: 'hunt2',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.hunt2.name',
		beginKey: 'missions.requestOffice.hunt2.begin',
		endKey: 'missions.requestOffice.hunt2.end',
		condition: 'mission(penden)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.CAMP_DES_EMMEMMA,
				hidden: false
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt2_find_boukane',
					nameKey: 'missions.requestOffice.hunt2.findBoukane.name',
					place: PlaceEnum.CAMP_DES_EMMEMMA,
					monsterKeys: ['coward'],
					allyKeys: [],
					background: 'm_step_cave2',
					beginMonsterKey: 'coward',
					beginText: 'missions.requestOffice.hunt2.findBoukane.begin',
					winText: 'missions.requestOffice.hunt2.findBoukane.win'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.CITADELLE_DU_ROI,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'hunt2_citadel_guard_start',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.guard.name',
				textKey: 'missions.requestOffice.hunt2.guard.startText'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt2_search_hall',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.hunt2.searchHall.name',
				descriptionKey: 'missions.requestOffice.hunt2.searchHall.description'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt2_search_roof',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.hunt2.searchRoof.name',
				descriptionKey: 'missions.requestOffice.hunt2.searchRoof.description'
			},
			{
				type: 'TALK',
				npcKey: 'hunt2_citadel_guard_cellar',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.guard.name',
				textKey: 'missions.requestOffice.hunt2.guard.cellarText'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt2_enter_cellar',
					nameKey: 'missions.requestOffice.hunt2.enterCellar.name',
					place: PlaceEnum.CITADELLE_DU_ROI,
					monsterKeys: ['boukan', 'brig2', 'brig2', 'brig1', 'brig1'],
					allyKeys: [],
					background: 'm_step_citadel3',
					beginMonsterKey: 'boukan',
					beginText: 'missions.requestOffice.hunt2.enterCellar.begin',
					winText: 'missions.requestOffice.hunt2.enterCellar.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'hunt2_take_cleaver_pendant',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.hunt2.cleaverPendant.name',
				descriptionKey: 'missions.requestOffice.hunt2.cleaverPendant.description'
			},
			{
				type: 'TALK',
				npcKey: 'hunt2_citadel_guard_end',
				place: PlaceEnum.CITADELLE_DU_ROI,
				nameKey: 'missions.requestOffice.common.guard.name',
				textKey: 'missions.requestOffice.hunt2.guard.endText'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 3500 },
			{ type: 'XP', value: 90 }
		],
		labels: {},
		limit: 35
	},

	{
		key: 'hunt3',
		group: REQUEST_OFFICE_GROUP,
		nameKey: 'missions.requestOffice.hunt3.name',
		beginKey: 'missions.requestOffice.hunt3.begin',
		endKey: 'missions.requestOffice.hunt3.end',
		condition: 'mission(penden)',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				hidden: true
			},
			{
				type: 'TALK',
				npcKey: 'hunt3_aboul_tonhor',
				place: PlaceEnum.PYLONES_DE_MAGNETITES,
				nameKey: 'missions.requestOffice.hunt3.aboulTonhor.name',
				textKey: 'missions.requestOffice.hunt3.aboulTonhor.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				hidden: true,
				titleKey: 'missions.requestOffice.hunt3.findAttackers'
			},
			{
				type: 'ACTION',
				actionKey: 'hunt3_investigate_rocks',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				nameKey: 'missions.requestOffice.hunt3.noiseBehindRocks.name',
				descriptionKey: 'missions.requestOffice.hunt3.noiseBehindRocks.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt3_attack_camp',
					nameKey: 'missions.requestOffice.hunt3.attackCamp.name',
					place: PlaceEnum.SYPHON_SIFFLEUR,
					monsterKeys: ['brig3', 'brig3', 'brig2', 'brig3', 'brig2'],
					allyKeys: [],
					background: 'm_step_lake',
					beginMonsterKey: 'brig3',
					beginText: 'missions.requestOffice.hunt3.attackCamp.begin',
					winText: 'missions.requestOffice.hunt3.attackCamp.win'
				}
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt3_circle_syphon',
					nameKey: 'missions.requestOffice.hunt3.circleSyphon.name',
					place: PlaceEnum.SYPHON_SIFFLEUR,
					monsterKeys: ['coward', 'brig1'],
					allyKeys: [],
					background: 'st_syphon',
					beginMonsterKey: 'coward',
					beginText: 'missions.requestOffice.hunt3.circleSyphon.begin',
					winText: 'missions.requestOffice.hunt3.circleSyphon.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'hunt3_search_fugitive',
				place: PlaceEnum.SYPHON_SIFFLEUR,
				nameKey: 'missions.requestOffice.hunt3.searchFugitive.name',
				descriptionKey: 'missions.requestOffice.hunt3.searchFugitive.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.SENTIER_DE_TOUTEMBA,
				hidden: true,
				titleKey: 'missions.requestOffice.hunt3.findFugitive'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'hunt3_climb',
					nameKey: 'missions.requestOffice.hunt3.climb.name',
					place: PlaceEnum.SENTIER_DE_TOUTEMBA,
					monsterKeys: ['cowar2', 'cervel', 'pikouz'],
					allyKeys: [],
					background: 'm_step_cliff',
					beginMonsterKey: 'cowar2',
					beginText: 'missions.requestOffice.hunt3.climb.begin',
					winText: 'missions.requestOffice.hunt3.climb.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'hunt3_take_cleaver_pendant',
				place: PlaceEnum.SENTIER_DE_TOUTEMBA,
				nameKey: 'missions.requestOffice.hunt3.cleaverPendant.name',
				descriptionKey: 'missions.requestOffice.hunt3.cleaverPendant.description'
			},
			requestOfficeValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 3500 },
			{ type: 'XP', value: 90 },
			{
				type: 'ITEM',
				itemKey: 'poisonite_shot',
				quantity: 2
			}
		],
		labels: {},
		limit: 35
	}
];
