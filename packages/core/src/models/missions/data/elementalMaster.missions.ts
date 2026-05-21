import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import type { MissionDefinition } from '../mission.js';
import type { MissionValidateGoal } from '../missionGoal.js';

const ELEMENTAL_MASTER_GROUP = 'elmaster';

const elMasterValidateGoal = (): MissionValidateGoal => ({
	type: 'VALIDATE',
	npcKey: 'elMaster',
	place: PlaceEnum.FOSSELAVE,
	nameKey: 'npc.elMaster.name'
});

export const elementalMasterMissions: MissionDefinition[] = [
	{
		key: 'elma',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elma.name',
		beginKey: 'missions.elMaster.elma.begin',
		endKey: 'missions.elMaster.elma.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.FOUTAINE_DE_JOUVENCE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'draw_water',
				place: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				nameKey: 'missions.elMaster.elma.water.name',
				descriptionKey: 'missions.elMaster.elma.water.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'gather_embers',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.elMaster.elma.ember.name',
				descriptionKey: 'missions.elMaster.elma.ember.text'
			},
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'buy_fish',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.elMaster.elma.fish.name',
				descriptionKey: 'missions.elMaster.elma.fish.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'buy_bread',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.elMaster.elma.bread.name',
				descriptionKey: 'missions.elMaster.elma.bread.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goupi', 'goupi2', 'goupi3'],
					count: 6,
					force: true,
					place: PlaceEnum.DINOVILLE,
					displayNameKey: 'missions.elMaster.elma.kill'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'smashroom_pieces',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.elMaster.elma.smashroom.name',
				descriptionKey: 'missions.elMaster.elma.smashroom.text'
			},
			elMasterValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 20 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {}
	},
	{
		key: 'elmalightning',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elmalightning.name',
		beginKey: 'missions.elMaster.elmalightning.begin',
		endKey: 'missions.elMaster.elmalightning.end',
		condition: 'mission(elma)',
		goals: [
			{ type: 'AT', place: PlaceEnum.UNIVERSITE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'study',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.elMaster.elmalightning.study.name',
				descriptionKey: 'missions.elMaster.elmalightning.study.text'
			},
			{
				type: 'ACTION',
				actionKey: 'study2',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.elMaster.elmalightning.study.name',
				descriptionKey: 'missions.elMaster.elmalightning.study2.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'experiment',
					nameKey: 'missions.elMaster.elmalightning.experiment.name',
					place: PlaceEnum.FOSSELAVE,
					monsterKeys: ['elhelp'],
					allyKeys: [],
					winText: 'missions.elMaster.elmalightning.experiment.win'
				}
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmalightning.elmaTalk'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'study_eeloz',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.elMaster.elmalightning.eeloz.name',
				descriptionKey: 'missions.elMaster.elmalightning.eeloz.text'
			},
			elMasterValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 1000 }
		],
		labels: {}
	},
	{
		key: 'elmafire',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elmafire.name',
		beginKey: 'missions.elMaster.elmafire.begin',
		endKey: 'missions.elMaster.elmafire.end',
		condition: 'mission(elmalightning)',
		goals: [
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmafire.elmaTalk1'
			},
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'kill_venerable',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.elMaster.elmafire.venerable.name',
				descriptionKey: 'missions.elMaster.elmafire.venerable.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmafire.elmaTalk2'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['flam'],
					count: 20,
					force: true,
					displayNameKey: 'missions.elMaster.elmafire.killflam'
				}
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmafire.elmaTalk3'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmafire.elmaTalk4'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmafire.elmaTalk5'
			},
			{ type: 'AT', place: PlaceEnum.RUINES_ASHPOUK, hidden: false },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'pignfight',
					nameKey: 'missions.elMaster.elmafire.pignfight.name',
					place: PlaceEnum.RUINES_ASHPOUK,
					monsterKeys: ['pign1', 'pign2'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmafire.pignfight.begin',
					winText: 'missions.elMaster.elmafire.pignfight.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'search_cavern',
				place: PlaceEnum.RUINES_ASHPOUK,
				nameKey: 'missions.elMaster.elmafire.search.name',
				descriptionKey: 'missions.elMaster.elmafire.search.text'
			},
			elMasterValidateGoal()
		],
		rewards: [{ type: 'XP', value: 40 }],
		labels: {}
	},
	{
		key: 'elmawood',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elmawood.name',
		beginKey: 'missions.elMaster.elmawood.begin',
		endKey: 'missions.elMaster.elmawood.end',
		condition: 'mission(elmafire)+level(10)',
		goals: [
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawood.elmaTalk1'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawood.elmaTalk2'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawood.elmaTalk3'
			},
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'find_out',
				place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
				nameKey: 'missions.elMaster.elmawood.find.name',
				descriptionKey: 'missions.elMaster.elmawood.find.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawood.elmaTalk4'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: true },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight1',
					nameKey: 'missions.elMaster.elmawood.fight1.name',
					place: PlaceEnum.DINOVILLE,
					monsterKeys: ['korven', 'korven', 'korven'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmawood.fight1.begin',
					winText: 'missions.elMaster.elmawood.fight1.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: true },
			{
				type: 'ACTION',
				actionKey: 'korven',
				place: PlaceEnum.ILE_WAIKIKI,
				nameKey: 'missions.elMaster.elmawood.korven.name',
				descriptionKey: 'missions.elMaster.elmawood.korven.text'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: true },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight2',
					nameKey: 'missions.elMaster.elmawood.fight2.name',
					place: PlaceEnum.MARAIS_COLLANT,
					monsterKeys: ['korven', 'kvenbs'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmawood.fight2.begin',
					winText: 'missions.elMaster.elmawood.fight2.win'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'pick_up_wand',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.elMaster.elmawood.wand.name',
				descriptionKey: 'missions.elMaster.elmawood.wand.text'
			},
			elMasterValidateGoal()
		],
		rewards: [{ type: 'GOLD', value: 2000 }],
		labels: {}
	},
	{
		key: 'elmaair',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elmaair.name',
		beginKey: 'missions.elMaster.elmaair.begin',
		endKey: 'missions.elMaster.elmaair.end',
		condition: 'mission(elmawood)',
		goals: [
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk1'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk2'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false }, // A remplacer par Dinoplaza quand disponible
			{
				type: 'ACTION',
				actionKey: 'find_scrolls',
				place: PlaceEnum.DINOVILLE, // A remplacer par Dinoplaza quand disponible
				nameKey: 'missions.elMaster.elmaair.scrolls.name',
				descriptionKey: 'missions.elMaster.elmaair.scrolls.text'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight1',
					nameKey: 'missions.elMaster.elmaair.fight1.name',
					place: PlaceEnum.FOSSELAVE,
					monsterKeys: ['megoup'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmaair.fight1.begin',
					winText: 'missions.elMaster.elmaair.fight1.win'
				}
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk3'
			},
			{ type: 'AT', place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE, hidden: true },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight2',
					nameKey: 'missions.elMaster.elmaair.fight2.name',
					place: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE,
					monsterKeys: ['megoup'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmaair.fight2.begin',
					winText: 'missions.elMaster.elmaair.fight2.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.COLLINES_ESCARPEES, hidden: true },
			{
				type: 'FIGHT_ACTION',
				fightAction: {
					actionKey: 'fight3',
					nameKey: 'missions.elMaster.elmaair.fight3.name',
					place: PlaceEnum.COLLINES_ESCARPEES,
					monsterKeys: ['darkg2'],
					allyKeys: [],
					beginText: 'missions.elMaster.elmaair.fight3.begin',
					winText: 'missions.elMaster.elmaair.fight3.win'
				}
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk4'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk5'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk6'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk7'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk8'
			},
			{
				type: 'USE_INGREDIENT',
				place: PlaceEnum.FOSSELAVE,
				ingredientKey: 'energie_air',
				quantity: 2,
				nameKey: 'missions.elMaster.elmaair.giveAirEnergy1'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmaair.elmaTalk9'
			},
			{
				type: 'USE_INGREDIENT',
				place: PlaceEnum.FOSSELAVE,
				ingredientKey: 'energie_air',
				quantity: 3,
				nameKey: 'missions.elMaster.elmaair.giveAirEnergy2'
			},
			elMasterValidateGoal()
		],
		rewards: [{ type: 'GOLD', value: 10000 }],
		labels: {}
	},
	{
		key: 'elmawater',
		group: ELEMENTAL_MASTER_GROUP,
		nameKey: 'missions.elMaster.elmawater.name',
		beginKey: 'missions.elMaster.elmawater.begin',
		endKey: 'missions.elMaster.elmawater.end',
		condition: 'mission(elmaair)',
		goals: [
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawater.elmaTalk1'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawater.elmaTalk2'
			},
			{ type: 'AT', place: PlaceEnum.BAO_BOB, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk1'
			},
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pirao2']
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pirao2']
			},
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pirao2']
			},
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pirao2']
			},
			{ type: 'AT', place: PlaceEnum.BAO_BOB, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pirao2']
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk2'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk3'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk4'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk5'
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'baoBob',
				npcNameKey: 'npc.baoBob.name',
				gfx: 'bob',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'npc.baoBob.name',
				textKey: 'missions.elMaster.elmawater.baoTalk6'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'elMaster',
				npcNameKey: 'npc.elMaster.name',
				gfx: 'elmaster',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'npc.elMaster.name',
				textKey: 'missions.elMaster.elmawater.elmaTalk3'
			},
			elMasterValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 20 },
			{ type: 'EFFECT', effectKey: 'sphere' }
		],
		labels: {}
	}
];
