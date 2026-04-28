// packages/core/src/models/missions/data/forestGuardian.missions.ts

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const FOREST_GUARDIAN_GROUP = 'arbre';

const guardianValidateGoal = () =>
	({
		type: 'VALIDATE' as const,
		npcKey: 'forest_guardian',
		place: PlaceEnum.PORTE_DE_SYLVENOIRE,
		nameKey: 'npc.forestGuardian.name'
	}) as const;

export const forestGuardianMissions: MissionDefinition[] = [
	{
		key: 'unmute',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.unmute.name',
		beginKey: 'missions.forestGuardian.unmute.begin',
		endKey: 'missions.forestGuardian.unmute.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'forest_unmute_jumin_water',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.forestGuardian.unmute.juminWater.name',
				descriptionKey: 'missions.forestGuardian.unmute.juminWater.description'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'forest_unmute_swamp_water',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.forestGuardian.unmute.swampWater.name',
				descriptionKey: 'missions.forestGuardian.unmute.swampWater.description'
			},
			{ type: 'AT', place: PlaceEnum.FOUTAINE_DE_JOUVENCE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'forest_unmute_pure_water',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				nameKey: 'missions.forestGuardian.unmute.pureWater.name',
				descriptionKey: 'missions.forestGuardian.unmute.pureWater.description'
			},
			{ type: 'AT', place: PlaceEnum.GORGES_PROFONDES, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'forest_unmute_boiling_water',
				place: PlaceEnum.GORGES_PROFONDES,
				nameKey: 'missions.forestGuardian.unmute.boilingWater.name',
				descriptionKey: 'missions.forestGuardian.unmute.boilingWater.description'
			},
			{ type: 'AT', place: PlaceEnum.PORTE_DE_SYLVENOIRE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_unmute_pour_gourd',
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				nameKey: 'missions.forestGuardian.unmute.pourGourd.name',
				descriptionKey: 'missions.forestGuardian.unmute.pourGourd.description'
			}
		],
		rewards: [
			{ type: 'XP', value: 110 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 3 }
		],
		labels: {},
		limit: 35
	},
	{
		key: 'orchid',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.orchid.name',
		beginKey: 'missions.forestGuardian.orchid.begin',
		endKey: 'missions.forestGuardian.orchid.end',
		condition: 'mission(unmute)',
		goals: [
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_orchid_take_water',
				place: PlaceEnum.FLEUVE_JUMIN,
				nameKey: 'missions.forestGuardian.orchid.takeWater.name',
				descriptionKey: 'missions.forestGuardian.orchid.takeWater.description'
			},
			{ type: 'AT', place: PlaceEnum.AUREE_DE_LA_FORET, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_orchid_water_orchid',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.forestGuardian.orchid.waterOrchid.name',
				descriptionKey: 'missions.forestGuardian.orchid.waterOrchid.description'
			},
			{
				type: 'TALK',
				npcKey: 'talking_orchid',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.forestGuardian.orchid.talkingOrchid.name',
				textKey: 'missions.forestGuardian.orchid.talkingOrchid.text'
			},
			guardianValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 1 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'licens',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.licens.name',
		beginKey: 'missions.forestGuardian.licens.begin',
		endKey: 'missions.forestGuardian.licens.end',
		condition: 'mission(unmute)',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 8,
					force: true,
					displayNameKey: 'missions.forestGuardian.licens.kill'
				}
			},
			guardianValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 40 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 3 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'king',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.king.name',
		beginKey: 'missions.forestGuardian.king.begin',
		endKey: 'missions.forestGuardian.king.end',
		condition: 'mission(unmute)+mission(orchid)',
		goals: [
			{ type: 'AT', place: PlaceEnum.COLLINES_HANTEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_king_cry',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.forestGuardian.king.cry.name',
				descriptionKey: 'missions.forestGuardian.king.cry.description'
			},
			{ type: 'AT', place: PlaceEnum.AUREE_DE_LA_FORET, hidden: true },
			{
				type: 'TALK',
				npcKey: 'talking_orchid',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.forestGuardian.king.talkingOrchid.name',
				textKey: 'missions.forestGuardian.king.talkingOrchid.text'
			},
			{
				type: 'ACTION',
				actionKey: 'forest_king_pick_orchid',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.forestGuardian.king.pickOrchid.name',
				descriptionKey: 'missions.forestGuardian.king.pickOrchid.description'
			},
			{ type: 'AT', place: PlaceEnum.COLLINES_HANTEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_king_plant_orchid',
				place: PlaceEnum.COLLINES_HANTEES,
				nameKey: 'missions.forestGuardian.king.plantOrchid.name',
				descriptionKey: 'missions.forestGuardian.king.plantOrchid.description'
			}
		],
		rewards: [
			{ type: 'GOLD', value: 2500 },
			{ type: 'XP', value: 35 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 1 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'wishes',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.wishes.name',
		beginKey: 'missions.forestGuardian.wishes.begin',
		endKey: 'missions.forestGuardian.wishes.end',
		condition: 'mission(unmute)',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'forest_wishes_throw_coin',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.forestGuardian.wishes.throwCoin.name',
				descriptionKey: 'missions.forestGuardian.wishes.throwCoin.description'
			},
			{ type: 'AT', place: PlaceEnum.AUREE_DE_LA_FORET, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 2,
					force: true,
					displayNameKey: 'missions.forestGuardian.wishes.kill'
				}
			},
			{ type: 'AT', place: PlaceEnum.CHEMIN_GLAUQUE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 3,
					force: true,
					displayNameKey: 'missions.forestGuardian.wishes.kill'
				}
			},
			{ type: 'AT', place: PlaceEnum.FLEUVE_JUMIN, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 3,
					force: true,
					displayNameKey: 'missions.forestGuardian.wishes.kill'
				}
			},
			{ type: 'AT', place: PlaceEnum.JUNGLE_SAUVAGE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['korgon', 'ronciv'],
					count: 6,
					force: true,
					displayNameKey: 'missions.forestGuardian.wishes.kill'
				}
			},
			guardianValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 60 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 4 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'newplt',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.newplt.name',
		beginKey: 'missions.forestGuardian.newplt.begin',
		endKey: 'missions.forestGuardian.newplt.end',
		condition: 'mission(unmute)',
		goals: [
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'TALK',
				npcKey: 'greenpeace_volunteer',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.forestGuardian.newplt.volunteer.name',
				textKey: 'missions.forestGuardian.newplt.volunteer.text'
			},
			{
				type: 'KILL',
				kill: {
					count: 3,
					force: true,
					displayNameKey: 'missions.forestGuardian.newplt.killAny'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'forest_newplt_lift_rocks_first',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.forestGuardian.newplt.liftRocks.name',
				descriptionKey: 'missions.forestGuardian.newplt.liftRocks.description'
			},
			{
				type: 'KILL',
				kill: {
					count: 6,
					force: true,
					displayNameKey: 'missions.forestGuardian.newplt.killAny'
				}
			},
			{
				type: 'TALK',
				npcKey: 'greenpeace_volunteer',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.forestGuardian.newplt.volunteer.name',
				textKey: 'missions.forestGuardian.newplt.volunteer.text2'
			},
			{
				type: 'ACTION',
				actionKey: 'forest_newplt_lift_rocks_second',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.forestGuardian.newplt.liftRocks.name',
				descriptionKey: 'missions.forestGuardian.newplt.liftRocks.description2'
			},
			{
				type: 'TALK',
				npcKey: 'greenpeace_volunteer',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.forestGuardian.newplt.volunteer.name',
				textKey: 'missions.forestGuardian.newplt.volunteer.text3'
			},
			guardianValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 75 },
			{ type: 'ITEM', itemKey: 'pampleboum', quantity: 2 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'gshop',
		group: FOREST_GUARDIAN_GROUP,
		nameKey: 'missions.forestGuardian.gshop.name',
		beginKey: 'missions.forestGuardian.gshop.begin',
		endKey: 'missions.forestGuardian.gshop.end',
		condition: 'mission(unmute)+mission(orchid)+mission(licens)+mission(king)+mission(wishes)+mission(newplt)',
		goals: [
			{
				type: 'ACTION',
				actionKey: 'forest_gshop_examine_bucket',
				place: PlaceEnum.PORTE_DE_SYLVENOIRE,
				nameKey: 'missions.forestGuardian.gshop.examineBucket.name',
				descriptionKey: 'missions.forestGuardian.gshop.examineBucket.description'
			}
		],
		rewards: [
			{ type: 'EFFECT', effectKey: 'gshop' },
			{ type: 'XP', value: 5 }
		],
		labels: {},
		limit: 20
	}
];
