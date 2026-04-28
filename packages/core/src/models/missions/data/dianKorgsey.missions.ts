// packages/core/src/models/missions/data/dianKorgsey.missions.ts

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const DIAN_KORGSEY_GROUP = 'dian';

const dianKorgseyValidateGoal = () =>
	({
		type: 'VALIDATE' as const,
		npcKey: 'dian_korgsey',
		place: PlaceEnum.CAMP_KORGON,
		nameKey: 'npc.dian.name'
	}) as const;

export const dianKorgseyMissions: MissionDefinition[] = [
	{
		key: 'kswim',
		group: DIAN_KORGSEY_GROUP,
		nameKey: 'missions.dian.kswim.name',
		beginKey: 'missions.dian.kswim.begin',
		endKey: 'missions.dian.kswim.end',
		goals: [
			{
				type: 'ACTION',
				actionKey: 'dian_kswim_supplies',
				place: PlaceEnum.CAMP_KORGON,
				nameKey: 'missions.dian.kswim.supplies.name',
				descriptionKey: 'missions.dian.kswim.supplies.description'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'dian_kswim_tools',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.dian.kswim.tools.name',
				descriptionKey: 'missions.dian.kswim.tools.description'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_kswim_wood',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.dian.kswim.wood.name',
				descriptionKey: 'missions.dian.kswim.wood.description'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_kswim_grigri',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.dian.kswim.grigri.name',
				descriptionKey: 'missions.dian.kswim.grigri.description'
			},
			dianKorgseyValidateGoal()
		],
		rewards: [
			{ type: 'EFFECT', effectKey: 'palmes' },
			{ type: 'XP', value: 20 }
		],
		labels: {},
		limit: 15
	},
	{
		key: 'rivals',
		group: DIAN_KORGSEY_GROUP,
		nameKey: 'missions.dian.rivals.name',
		beginKey: 'missions.dian.rivals.begin',
		endKey: 'missions.dian.rivals.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon'],
					count: 10,
					force: true,
					displayNameKey: 'missions.dian.rivals.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'dian_rivals_trophy',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.dian.rivals.trophy.name',
				descriptionKey: 'missions.dian.rivals.trophy.description'
			},
			dianKorgseyValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 2000 },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		condition: 'mission(kswim)',
		limit: 15
	},
	{
		key: 'kfood',
		group: DIAN_KORGSEY_GROUP,
		nameKey: 'missions.dian.kfood.name',
		beginKey: 'missions.dian.kfood.begin',
		endKey: 'missions.dian.kfood.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORTE_DE_SYLVENOIRE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_kfood_tree',
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				nameKey: 'missions.dian.kfood.tree.name',
				descriptionKey: 'missions.dian.kfood.tree.description'
			},
			{
				type: 'KILL',
				kill: {
					count: 6,
					force: true,
					displayNameKey: 'missions.dian.kfood.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'dian_kfood_branches',
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				nameKey: 'missions.dian.kfood.branches.name',
				descriptionKey: 'missions.dian.kfood.branches.description'
			},
			dianKorgseyValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 2000 },
			{ type: 'XP', value: 40 }
		],
		labels: {},
		condition: 'mission(kswim)',
		limit: 15
	},
	{
		key: 'poison',
		group: DIAN_KORGSEY_GROUP,
		nameKey: 'missions.dian.poison.name',
		beginKey: 'missions.dian.poison.begin',
		endKey: 'missions.dian.poison.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.COLLINES_HANTEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'dian_poison_sap',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.dian.poison.sap.name',
				descriptionKey: 'missions.dian.poison.sap.description'
			},
			{ type: 'AT', place: PlaceEnum.PORTE_DE_SYLVENOIRE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'dian_poison_trap',
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				nameKey: 'missions.dian.poison.trap.name',
				descriptionKey: 'missions.dian.poison.trap.description'
			},
			{ type: 'AT', place: PlaceEnum.JUNGLE_SAUVAGE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_poison_ambush',
				place: PlaceEnum.JUNGLE_SAUVAGE,
				nameKey: 'missions.dian.poison.ambush.name',
				descriptionKey: 'missions.dian.poison.ambush.description'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon'],
					count: 3,
					force: true,
					displayNameKey: 'missions.dian.poison.ambushKill'
				}
			},
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_poison_tracks_fleuve',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.dian.poison.track.name',
				descriptionKey: 'missions.dian.poison.track.description'
			},
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'dian_poison_tracks_chemin',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.dian.poison.track.name',
				descriptionKey: 'missions.dian.poison.track.description2'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 8,
					force: true,
					displayNameKey: 'missions.dian.poison.korgonsOrAlliesKill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'dian_poison_fikoia',
				place: PlaceEnum.CHEMIN_GLAUQUE,
				nameKey: 'missions.dian.poison.fikoia.name',
				descriptionKey: 'missions.dian.poison.fikoia.description'
			},
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'dian_korgsey',
				npcNameKey: 'npc.dian.name',
				gfx: 'dian',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.dian.poison.dian.name',
				textKey: 'missions.dian.poison.dian.text'
			},
			{
				type: 'ACTION',
				actionKey: 'dian_poison_hide_fikoia',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.dian.poison.hideFikoia.name',
				descriptionKey: 'missions.dian.poison.hideFikoia.description'
			},
			dianKorgseyValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 3500 },
			{ type: 'ITEM', itemKey: 'hot_bread', quantity: 1 },
			{ type: 'XP', value: 100 }
		],
		labels: {},
		condition: 'mission(kfood)+mission(rivals)',
		limit: 20
	}
];
