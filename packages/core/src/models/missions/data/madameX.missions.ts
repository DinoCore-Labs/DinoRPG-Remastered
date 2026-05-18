import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';
import type { MissionValidateGoal } from '../missionGoal.js';

const MADAMEX_GROUP = 'mmex';

const MamadeXValidateGoal = (): MissionValidateGoal => ({
	type: 'VALIDATE',
	npcKey: 'madameX',
	place: PlaceEnum.FORCEBRUT,
	nameKey: 'npc.madameX.name'
});

export const madameXMissions: MissionDefinition[] = [
	{
		key: 'mmex1',
		group: MADAMEX_GROUP,
		nameKey: 'missions.madameX.mmex1.name',
		beginKey: 'missions.madameX.mmex1.begin',
		endKey: 'missions.madameX.mmex1.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'take_black_briefcase',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.madameX.mmex1.take.name',
				descriptionKey: 'missions.madameX.mmex1.take.text'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'madameX',
				npcNameKey: 'npc.madameX.name',
				gfx: 'mmex',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.madameX.mmex1.madameX.name',
				textKey: 'missions.madameX.mmex1.madameX.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'trap',
					nameKey: 'missions.madameX.mmex1.trap.name',
					place: PlaceEnum.FORCEBRUT,
					monsterKeys: ['gluon'],
					allyKeys: [],
					beginText: 'missions.madameX.mmex1.trap.begin',
					winText: 'missions.madameX.mmex1.trap.win'
				}
			},
			MamadeXValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 10 },
			{ type: 'GOLD', value: 300 }
		],
		labels: {}
	},
	{
		key: 'mmex2',
		group: MADAMEX_GROUP,
		nameKey: 'missions.madameX.mmex2.name',
		beginKey: 'missions.madameX.mmex2.begin',
		endKey: 'missions.madameX.mmex2.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'search_merchant1',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.madameX.mmex2.search1.name',
				descriptionKey: 'missions.madameX.mmex2.search1.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'attack_merchant1',
					nameKey: 'missions.madameX.mmex2.attack1.name',
					place: PlaceEnum.DINOVILLE,
					monsterKeys: ['merch1'],
					allyKeys: [],
					beginText: 'missions.madameX.mmex2.attack1.begin',
					winText: 'missions.madameX.mmex2.attack1.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'search_merchant2',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.madameX.mmex2.search2.name',
				descriptionKey: 'missions.madameX.mmex2.search2.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'attack_merchant2',
					nameKey: 'missions.madameX.mmex2.attack2.name',
					place: PlaceEnum.DINOVILLE,
					monsterKeys: ['merch1'],
					allyKeys: [],
					beginText: 'missions.madameX.mmex2.attack2.begin',
					winText: 'missions.madameX.mmex2.attack2.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			MamadeXValidateGoal()
		],
		rewards: [{ type: 'ITEM', itemKey: 'fight_ration', quantity: 1 }],
		labels: {}
	},
	{
		key: 'mmex3',
		group: MADAMEX_GROUP,
		nameKey: 'missions.madameX.mmex3.name',
		beginKey: 'missions.madameX.mmex3.begin',
		endKey: 'missions.madameX.mmex3.end',
		condition: 'mission(mmex1) + mission(mmex2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'portrait',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.madameX.mmex3.portrait.name',
				descriptionKey: 'missions.madameX.mmex3.portrait.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'investigate',
					nameKey: 'missions.madameX.mmex3.investigate.name',
					place: PlaceEnum.DINOVILLE,
					monsterKeys: ['merch2', 'merch2', 'merch2'],
					allyKeys: [],
					beginText: 'missions.madameX.mmex3.investigate.begin',
					winText: 'missions.madameX.mmex3.investigate.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'madameX',
				npcNameKey: 'npc.madameX.name',
				gfx: 'mmex',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.madameX.mmex3.madameX.name',
				textKey: 'missions.madameX.mmex3.madameX.text'
			},
			{ type: 'AT', place: PlaceEnum.COLLINES_ESCARPEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'wait',
				place: PlaceEnum.COLLINES_ESCARPEES,
				nameKey: 'missions.madameX.mmex3.wait.name',
				descriptionKey: 'missions.madameX.mmex3.wait.text'
			},
			{
				type: 'WAIT',
				duration: 2700
			},
			{
				type: 'ACTION',
				actionKey: 'messagemx',
				place: PlaceEnum.COLLINES_ESCARPEES,
				nameKey: 'missions.madameX.mmex3.messagemx.name',
				descriptionKey: 'missions.madameX.mmex3.messagemx.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'merchant',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.madameX.mmex3.merchant.name',
				textKey: 'missions.madameX.mmex3.merchant.text'
			},
			MamadeXValidateGoal()
		],
		rewards: [{ type: 'GOLD', value: 50 }],
		labels: {}
	},
	{
		key: 'mmex4',
		group: MADAMEX_GROUP,
		nameKey: 'missions.madameX.mmex4.name',
		beginKey: 'missions.madameX.mmex4.begin',
		endKey: 'missions.madameX.mmex4.end',
		condition: 'mission(mmex3)',
		goals: [
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'investigate',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.madameX.mmex4.investigate.name',
				descriptionKey: 'missions.madameX.mmex4.investigate.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight',
					nameKey: 'missions.madameX.mmex4.fight.name',
					place: PlaceEnum.MARAIS_COLLANT,
					monsterKeys: ['borg'],
					allyKeys: ['gang1', 'gang2', 'gang3'],
					beginText: 'missions.madameX.mmex4.fight.begin',
					winText: 'missions.madameX.mmex4.fight.win'
				}
			},
			{
				type: 'TALK',
				npcKey: 'Jean-Hubert1',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.madameX.mmex4.jeanH1.name',
				textKey: 'missions.madameX.mmex4.jeanH1.text'
			},
			{
				type: 'TALK',
				npcKey: 'Charles-Edouard',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.madameX.mmex4.charlesE.name',
				textKey: 'missions.madameX.mmex4.charlesE.text'
			},
			{
				type: 'TALK',
				npcKey: 'Louis-Stanislas1',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.madameX.mmex4.louisS1.name',
				textKey: 'missions.madameX.mmex4.louisS1.text'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'madameX1',
				npcNameKey: 'npc.madameX.name',
				gfx: 'mmex',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.madameX.mmex4.madameX1.name',
				textKey: 'missions.madameX.mmex4.madameX1.text'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'madameX2',
				npcNameKey: 'npc.madameX.name',
				gfx: 'mmex',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.madameX.mmex4.madameX2.name',
				textKey: 'missions.madameX.mmex4.madameX2.text'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'TALK',
				npcKey: 'Louis-Stanislas2',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.madameX.mmex4.louisS2.name',
				textKey: 'missions.madameX.mmex4.louisS2.text'
			},
			{ type: 'AT', place: PlaceEnum.UNIVERSITE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'organize',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.madameX.mmex4.organize.name',
				descriptionKey: 'missions.madameX.mmex4.organize.text'
			},
			{
				type: 'WAIT',
				duration: 27000
			},
			{
				type: 'TALK',
				npcKey: 'Jean-Hubert2',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.madameX.mmex4.jeanH2.name',
				textKey: 'missions.madameX.mmex4.jeanH2.text'
			},
			MamadeXValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 1000 }
		],
		labels: {}
	},
	{
		key: 'mmex5',
		group: MADAMEX_GROUP,
		nameKey: 'missions.madameX.mmex5.name',
		beginKey: 'missions.madameX.mmex5.begin',
		endKey: 'missions.madameX.mmex5.end',
		condition: 'mission(mmex3)',
		goals: [
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'informer',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.madameX.mmex5.informer.name',
				textKey: 'missions.madameX.mmex5.informer.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'hide1',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.madameX.mmex5.hide1.name',
				descriptionKey: 'missions.madameX.mmex5.hide1.text'
			},
			{
				type: 'WAIT',
				duration: 9000
			},
			{
				type: 'ACTION',
				actionKey: 'suspects1',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.madameX.mmex5.suspects1.name',
				descriptionKey: 'missions.madameX.mmex5.suspects1.text'
			},
			{ type: 'AT', place: PlaceEnum.FORGES_DU_GTC, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'stalking1',
				place: PlaceEnum.FORGES_DU_GTC,
				nameKey: 'missions.madameX.mmex5.stalking1.name',
				descriptionKey: 'missions.madameX.mmex5.stalking1.text'
			},
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'stalking2',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.madameX.mmex5.stalking2.name',
				descriptionKey: 'missions.madameX.mmex5.stalking2.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'suspects2',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.madameX.mmex5.suspects2.name',
				descriptionKey: 'missions.madameX.mmex5.suspects2.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'challenge',
					nameKey: 'missions.madameX.mmex5.challenge.name',
					place: PlaceEnum.FOSSELAVE,
					monsterKeys: ['suspc1'],
					allyKeys: []
				}
			},
			{
				type: 'ACTION',
				actionKey: 'search',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.madameX.mmex5.search.name',
				descriptionKey: 'missions.madameX.mmex5.search.text'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'madameX',
				npcNameKey: 'npc.madameX.name',
				gfx: 'mmex',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.madameX.mmex5.madameX.name',
				textKey: 'missions.madameX.mmex5.madameX.text'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'hide2',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.madameX.mmex5.hide2.name',
				descriptionKey: 'missions.madameX.mmex5.hide2.text'
			},
			{
				type: 'WAIT',
				duration: 4500
			},
			{
				type: 'ACTION',
				actionKey: 'suspects3',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.madameX.mmex5.suspects3.name',
				descriptionKey: 'missions.madameX.mmex5.suspects3.text'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'merguez_seller_1',
				npcNameKey: 'npc.merguez.name',
				gfx: 'merguez',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.madameX.mmex5.merguezSeller.name',
				textKey: 'missions.madameX.mmex5.merguezSeller.text',
				avatar: 'merguez'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'suspects4',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.madameX.mmex5.suspects4.name',
				descriptionKey: 'missions.madameX.mmex5.suspects4.text'
			},
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'challenge2',
					nameKey: 'missions.madameX.mmex5.challenge2.name',
					place: PlaceEnum.FOSSELAVE,
					monsterKeys: ['suspc', 'suspc', 'suspc'],
					allyKeys: [],
					winText: 'missions.madameX.mmex5.challenge2.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			MamadeXValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 1000 }
		],
		labels: {}
	}
];
