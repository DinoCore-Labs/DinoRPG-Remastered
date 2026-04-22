import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const PAPY_JOE_GROUP = 'papy_joe';

const papyJoeValidateGoal = () => ({
	type: 'VALIDATE' as const,
	npcKey: 'papy_joe',
	place: PlaceEnum.PAPY_JOE,
	nameKey: 'npc.papyJoe.name'
});

export const papyJoeMissions: MissionDefinition[] = [
	{
		key: 'fish',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.fish.name',
		beginKey: 'missions.papy.fish.begin',
		endKey: 'missions.papy.fish.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.PORT_DE_PRECHE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'fish_merchant',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.papy.fish.fishMerchant.name',
				textKey: 'missions.papy.fish.fishMerchant.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'madame_seyche',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.papy.fish.madameSeyche.name',
				textKey: 'missions.papy.fish.madameSeyche.text'
			},
			papyJoeValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		limit: 10
	},
	{
		key: 'dog',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.dog.name',
		beginKey: 'missions.papy.dog.begin',
		endKey: 'missions.papy.dog.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.COLLINES_ESCARPEES,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'jacqueline_ducraft',
				place: PlaceEnum.COLLINES_ESCARPEES,
				nameKey: 'missions.papy.dog.jacquelineDucraft.name',
				textKey: 'missions.papy.dog.jacquelineDucraft.text'
			},
			{
				type: 'AT',
				place: PlaceEnum.PORT_DE_PRECHE,
				hidden: true
			},
			{
				type: 'ACTION',
				actionKey: 'find_nioufniouf',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.papy.dog.findNioufniouf.name',
				descriptionKey: 'missions.papy.dog.findNioufniouf.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.COLLINES_ESCARPEES,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'jacqueline_ducraft',
				place: PlaceEnum.COLLINES_ESCARPEES,
				nameKey: 'missions.papy.dog.jacquelineDucraft.name',
				textKey: 'missions.papy.dog.jacquelineDucraft.text2'
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 15 },
			{ type: 'ITEM', itemKey: 'potion_angel', quantity: 1 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'kilgou',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kilgou.name',
		beginKey: 'missions.papy.kilgou.begin',
		endKey: 'missions.papy.kilgou.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.COLLINES_ESCARPEES,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goupi', 'goupi2', 'goupi3', 'wolf'],
					count: 6,
					force: true,
					displayNameKey: 'missions.papy.kilgou.kill'
				}
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {},
		condition: 'mission(fish)',
		limit: 20
	},
	{
		key: 'kilwlf',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kilwlf.name',
		beginKey: 'missions.papy.kilwlf.begin',
		endKey: 'missions.papy.kilwlf.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.FORCEBRUT,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['wolf'],
					count: 2,
					force: true,
					displayNameKey: 'missions.papy.kilwlf.kill'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['wolf'],
					count: 2,
					force: true,
					displayNameKey: 'missions.papy.kilwlf.kill'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['wolf'],
					count: 2,
					force: true,
					displayNameKey: 'missions.papy.kilwlf.kill'
				}
			},
			{
				type: 'AT',
				place: PlaceEnum.UNIVERSITE,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['wolf'],
					count: 2,
					force: true,
					displayNameKey: 'missions.papy.kilwlf.kill'
				}
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 2000 }
		],
		labels: {},
		condition: 'mission(kilgou)',
		limit: 15
	},
	{
		key: 'fflow',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.fflow.name',
		beginKey: 'missions.papy.fflow.begin',
		endKey: 'missions.papy.fflow.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'find_pure_water',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				nameKey: 'missions.papy.fflow.pureWater.name',
				descriptionKey: 'missions.papy.fflow.pureWater.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'madame_seyche',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.papy.fflow.madameSeyche.name',
				textKey: 'missions.papy.fflow.madameSeyche.text'
			},
			papyJoeValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		condition: 'mission(fish)',
		limit: 15
	},
	{
		key: 'kbook',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kbook.name',
		beginKey: 'missions.papy.kbook.begin',
		endKey: 'missions.papy.kbook.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.UNIVERSITE,
				hidden: false
			},
			{
				type: 'ACTION',
				actionKey: 'find_recipe_book',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.papy.kbook.recipeBook.name',
				descriptionKey: 'missions.papy.kbook.recipeBook.description'
			},
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'madame_seyche',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.papy.kbook.madameSeyche.name',
				textKey: 'missions.papy.kbook.madameSeyche.text'
			},
			papyJoeValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		condition: 'mission(fflow)',
		limit: 15
	},
	{
		key: 'msg',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.msg.name',
		beginKey: 'missions.papy.msg.begin',
		endKey: 'missions.papy.msg.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				hidden: false
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goupi', 'goupi2', 'goupi3'],
					count: 15,
					force: true,
					displayNameKey: 'missions.papy.msg.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'find_stamps',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				nameKey: 'missions.papy.msg.collectStamps.name',
				descriptionKey: 'missions.papy.msg.collectStamps.description'
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'COLLECTION', collectionKey: 'msg' },
			{ type: 'XP', value: 20 }
		],
		labels: {},
		condition: 'mission(kbook)',
		limit: 30
	},
	{
		key: 'lettre',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.lettre.name',
		beginKey: 'missions.papy.lettre.begin',
		endKey: 'missions.papy.lettre.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.DINOVILLE,
				hidden: false
			},
			{
				type: 'TALK',
				npcKey: 'madame_seyche',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.papy.lettre.madameSeyche.name',
				textKey: 'missions.papy.lettre.madameSeyche.text'
			},
			papyJoeValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		condition: 'mission(msg)',
		limit: 2
	},
	{
		key: 'kilglu',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kilglu.name',
		beginKey: 'missions.papy.kilglu.begin',
		endKey: 'missions.papy.kilglu.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['gluon'],
					count: 1,
					force: true,
					displayNameKey: 'missions.papy.kilglu.kill'
				}
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {},
		condition: 'mission(kilwlf)+canfight(gluon)',
		limit: 10
	},
	{
		key: 'kilgnt',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kilgnt.name',
		beginKey: 'missions.papy.kilgnt.begin',
		endKey: 'missions.papy.kilgnt.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['gvert'],
					count: 12,
					force: true,
					displayNameKey: 'missions.papy.kilgnt.kill'
				}
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 100 },
			{ type: 'GOLD', value: 5000 }
		],
		labels: {},
		condition: 'mission(kilglu)+canfight(gvert)',
		limit: 10
	},
	{
		key: 'kilcoq',
		group: PAPY_JOE_GROUP,
		nameKey: 'missions.papy.kilcoq.name',
		beginKey: 'missions.papy.kilcoq.begin',
		endKey: 'missions.papy.kilcoq.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['coq'],
					count: 20,
					force: true,
					displayNameKey: 'missions.papy.kilcoq.kill'
				}
			},
			papyJoeValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 200 },
			{ type: 'GOLD', value: 8000 }
		],
		labels: {},
		condition: 'mission(kilgnt)+canfight(coq)',
		limit: 20
	}
];
