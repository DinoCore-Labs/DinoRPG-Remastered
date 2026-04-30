import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';
import type { MissionValidateGoal } from '../missionGoal.js';

const SKULLY_GROUP = 'skull';

const skullyValidateGoal = (): MissionValidateGoal => ({
	type: 'VALIDATE',
	npcKey: 'skully',
	place: PlaceEnum.CIMETIERE,
	nameKey: 'npc.skully.name'
});

export const skullyMissions: MissionDefinition[] = [
	{
		key: 'skul1',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skul1.name',
		beginKey: 'missions.skully.skul1.begin',
		endKey: 'missions.skully.skul1.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PAPY_JOE, hidden: true },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'skully_papy_joe_1',
				npcNameKey: 'npc.papyJoe.name',
				gfx: 'papy',
				place: PlaceEnum.PAPY_JOE,
				nameKey: 'missions.skully.skul1.papyJoe.name',
				textKey: 'missions.skully.skul1.papyJoe.text'
			},
			{
				type: 'USE_ITEM',
				itemKey: 'goblin_merguez',
				quantity: 3,
				nameKey: 'missions.skully.skul1.giveMerguez'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'skully_papy_joe_2',
				npcNameKey: 'npc.papyJoe.name',
				gfx: 'papy',
				place: PlaceEnum.PAPY_JOE,
				nameKey: 'missions.skully.skul1.papyJoe.name',
				textKey: 'missions.skully.skul1.papyJoe.text2'
			},
			{ type: 'AT', place: PlaceEnum.FOUTAINE_DE_JOUVENCE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'read_mouldeur_message',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				nameKey: 'missions.skully.skul1.message.name',
				descriptionKey: 'missions.skully.skul1.message.description'
			},
			skullyValidateGoal()
		],
		rewards: [{ type: 'XP', value: 10 }],
		labels: {},
		limit: 10
	},
	{
		key: 'skul2',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skul2.name',
		beginKey: 'missions.skully.skul2.begin',
		endKey: 'missions.skully.skul2.end',
		condition: 'mission(skul1)',
		goals: [
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: true },
			{
				type: 'TALK',
				npcKey: 'stuck_tourist',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.skully.skul2.stuckTourist.name',
				textKey: 'missions.skully.skul2.stuckTourist.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'aaa_meeting',
					nameKey: 'missions.skully.skul2.aaa.name',
					place: PlaceEnum.MARAIS_COLLANT,
					monsterKeys: ['anguil', 'anguil'],
					allyKeys: [],
					beginText: 'missions.skully.skul2.aaa.begin',
					winText: 'missions.skully.skul2.aaa.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: true },
			{
				type: 'TALK',
				npcKey: 'skully_fisherman_1',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.skully.skul2.fisherman.name',
				textKey: 'missions.skully.skul2.fisherman.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'piranhoz_bay',
					nameKey: 'missions.skully.skul2.piranhozBay.name',
					place: PlaceEnum.CHUTES_MUTANTES,
					monsterKeys: ['pira', 'pira', 'pira', 'pira', 'pira', 'pira'],
					allyKeys: [],
					beginText: 'missions.skully.skul2.piranhozBay.begin',
					winText: 'missions.skully.skul2.piranhozBay.win'
				}
			},
			{
				type: 'TALK',
				npcKey: 'skully_fisherman_2',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.skully.skul2.fisherman.name',
				textKey: 'missions.skully.skul2.fisherman.text2'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'read_swamp_sign',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.skully.skul2.swampSign.name',
				descriptionKey: 'missions.skully.skul2.swampSign.description'
			},
			skullyValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 20 },
			{ type: 'GOLD', value: 1000 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'skul3',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skul3.name',
		beginKey: 'missions.skully.skul3.begin',
		endKey: 'missions.skully.skul3.end',
		condition: 'mission(skul2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.BAO_BOB, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'bao_bob_skully',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'missions.skully.skul3.baoBob.name',
				textKey: 'missions.skully.skul3.baoBob.text'
			},
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'bao_babe_1',
				npcNameKey: 'npc.baoBabe.name',
				gfx: 'baobabe',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.skully.skul3.baoBabe.name',
				textKey: 'missions.skully.skul3.baoBabe.text'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'bao_babe_2',
				npcNameKey: 'npc.baoBabe.name',
				gfx: 'baobabe',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.skully.skul3.baoBabe2.name',
				textKey: 'missions.skully.skul3.baoBabe2.text',
				avatar: 'baobabe'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goblin'],
					count: 10,
					force: true,
					displayNameKey: 'missions.skully.skul3.goblinKill'
				}
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'bao_babe_3',
				npcNameKey: 'npc.baoBabe.name',
				gfx: 'baobabe',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.skully.skul3.baoBabe2.name',
				textKey: 'missions.skully.skul3.baoBabe2.text2',
				avatar: 'baobabe'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'bao_babe_4',
				npcNameKey: 'npc.baoBabe.name',
				gfx: 'baobabe',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.skully.skul3.baoBabe2.name',
				textKey: 'missions.skully.skul3.baoBabe2.text3',
				avatar: 'baobabe'
			},
			skullyValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 10 },
			{ type: 'GOLD', value: 500 },
			{ type: 'EFFECT', effectKey: 'skull' }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'skul4',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skul4.name',
		beginKey: 'missions.skully.skul4.begin',
		endKey: 'missions.skully.skul4.end',
		condition: 'mission(skul3)',
		goals: [
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: true },
			{
				type: 'TALK',
				npcKey: 'merguez_seller_1',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.skully.skul4.merguezSeller.name',
				textKey: 'missions.skully.skul4.merguezSeller.text',
				avatar: 'merguez'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'visit_ruins',
					nameKey: 'missions.skully.skul4.visitRuins.name',
					place: PlaceEnum.RUINES_ASHPOUK,
					monsterKeys: ['baraba', 'bamboo'],
					allyKeys: [],
					beginMonsterKey: 'baraba',
					beginText: 'missions.skully.skul4.visitRuins.begin',
					winText: 'missions.skully.skul4.visitRuins.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'find_suspicious_boat',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.skully.skul4.suspiciousBoat.name',
				descriptionKey: 'missions.skully.skul4.suspiciousBoat.description'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'enter_suspicious_boat',
					nameKey: 'missions.skully.skul4.enterBoat.name',
					place: PlaceEnum.PORT_DE_PRECHE,
					monsterKeys: ['baratr', 'bamboo'],
					allyKeys: [],
					background: 's_dome',
					beginMonsterKey: 'baratr',
					beginText: 'missions.skully.skul4.enterBoat.begin',
					winText: 'missions.skully.skul4.enterBoat.win'
				}
			},
			{
				type: 'TALK',
				npcKey: 'freed_man',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.skully.skul4.freedMan.name',
				textKey: 'missions.skully.skul4.freedMan.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: true },
			{
				type: 'TALK',
				npcKey: 'merguez_seller_2',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.skully.skul4.merguezSeller.name',
				textKey: 'missions.skully.skul4.merguezSeller.text2',
				avatar: 'merguez'
			},
			skullyValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 40 },
			{ type: 'GOLD', value: 2000 }
		],
		labels: {},
		limit: 20
	},
	{
		key: 'skul5',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skul5.name',
		beginKey: 'missions.skully.skul5.begin',
		endKey: 'missions.skully.skul5.end',
		condition: 'mission(skul4)',
		goals: [
			{
				type: 'TALK',
				npcKey: 'skully_shrimps_1',
				place: PlaceEnum.CIMETIERE,
				nameKey: 'npc.skully.name',
				textKey: 'missions.skully.skul5.skully.text',
				avatar: 'skully'
			},
			{ type: 'AT', place: PlaceEnum.DOME_SOULAFLOTTE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'shrimp_merchant_1',
				place: PlaceEnum.DOME_SOULAFLOTTE,
				nameKey: 'missions.skully.skul5.shrimpMerchant.name',
				textKey: 'missions.skully.skul5.shrimpMerchant.text'
			},
			{
				type: 'USE_MONEY',
				moneyType: 'TREASURE_TICKET',
				quantity: 3,
				nameKey: 'missions.skully.skul5.giveTreasureTickets'
			},
			{
				type: 'TALK',
				npcKey: 'shrimp_merchant_2',
				place: PlaceEnum.DOME_SOULAFLOTTE,
				nameKey: 'missions.skully.skul5.shrimpMerchant.name',
				textKey: 'missions.skully.skul5.shrimpMerchant.text2'
			},
			{ type: 'AT', place: PlaceEnum.CIMETIERE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'skully_shrimps_2',
				place: PlaceEnum.CIMETIERE,
				nameKey: 'npc.skully.name',
				textKey: 'missions.skully.skul5.skully.text2',
				avatar: 'skully'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'shaman_mou_napalm',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.shamanMou.name',
				textKey: 'missions.skully.skul5.shamanMou.text',
				avatar: 'shaman'
			},
			{
				type: 'USE_ITEM',
				itemKey: 'sos_flame',
				quantity: 5,
				nameKey: 'missions.skully.skul5.giveFlames'
			},
			{
				type: 'TALK',
				npcKey: 'shaman_mou_napalm_2',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.shamanMou.name',
				textKey: 'missions.skully.skul5.shamanMou.text2',
				avatar: 'shaman'
			},
			{ type: 'AT', place: PlaceEnum.CIMETIERE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'skully_shrimps_3',
				place: PlaceEnum.CIMETIERE,
				nameKey: 'npc.skully.name',
				textKey: 'missions.skully.skul5.skully.text3',
				avatar: 'skully'
			},
			{
				type: 'AT',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				hidden: false,
				titleKey: 'missions.skully.skul5.korgonSearch.title'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'search_korgon',
					nameKey: 'missions.skully.skul5.korgonSearch.name',
					place: PlaceEnum.REPAIRE_DU_VENERABLE,
					monsterKeys: ['korgon'],
					allyKeys: [],
					beginMonsterKey: 'korgon',
					beginText: 'missions.skully.skul5.korgonSearch.begin',
					winText: 'missions.skully.skul5.korgonSearch.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.CIMETIERE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'skully_shrimps_4',
				place: PlaceEnum.CIMETIERE,
				nameKey: 'npc.skully.name',
				textKey: 'missions.skully.skul5.skully.text4',
				avatar: 'skully'
			},
			skullyValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 5000 }
		],
		labels: {},
		limit: 30
	},
	{
		key: 'skuend',
		group: SKULLY_GROUP,
		nameKey: 'missions.skully.skuend.name',
		beginKey: 'missions.skully.skuend.begin',
		endKey: 'missions.skully.skuend.end',
		condition: 'mission(skul5)',
		goals: [
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'TALK',
				npcKey: 'merguez_seller_skuend',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.skully.skul4.merguezSeller.name',
				textKey: 'missions.skully.skuend.merguezSeller.text',
				avatar: 'merguez'
			},
			{ type: 'LOCK' },
			skullyValidateGoal()
		],
		rewards: [{ type: 'XP', value: 10 }],
		labels: {},
		limit: 10
	}
];
