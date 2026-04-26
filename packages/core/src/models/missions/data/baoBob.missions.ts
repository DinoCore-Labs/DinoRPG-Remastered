import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const BAO_BOB_GROUP = 'bob';

const baoBobValidateGoal = () =>
	({
		type: 'VALIDATE' as const,
		npcKey: 'bao_bob',
		place: PlaceEnum.BAO_BOB,
		nameKey: 'npc.baoBob.name'
	}) as const;

export const baoBobMissions: MissionDefinition[] = [
	{
		key: 'kilpir',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.kilpir.name',
		beginKey: 'missions.baoBob.kilpir.begin',
		endKey: 'missions.baoBob.kilpir.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['pira'],
					count: 6,
					force: true,
					displayNameKey: 'missions.baoBob.kilpir.kill'
				}
			},
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: false },
			{
				type: 'TALK',
				npcKey: 'petite_sophie',
				place: PlaceEnum.ILE_WAIKIKI,
				nameKey: 'missions.baoBob.kilpir.sophie.name',
				textKey: 'missions.baoBob.kilpir.sophie.text'
			},
			baoBobValidateGoal()
		],
		rewards: [{ type: 'XP', value: 30 }],
		labels: {},
		limit: 15
	},
	{
		key: 'troc',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.troc.name',
		beginKey: 'missions.baoBob.troc.begin',
		endKey: 'missions.baoBob.troc.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: true },
			{
				type: 'TALK',
				npcKey: 'marchand_corail',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.baoBob.troc.merchant.name',
				textKey: 'missions.baoBob.troc.merchant.text'
			},
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: true },
			{
				type: 'TALK',
				npcKey: 'amoureux',
				place: PlaceEnum.ILE_WAIKIKI,
				nameKey: 'missions.baoBob.troc.lover.name',
				textKey: 'missions.baoBob.troc.lover.text'
			},
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: true },
			{
				type: 'TALK',
				npcKey: 'bijoutier',
				place: PlaceEnum.CHUTES_MUTANTES,
				nameKey: 'missions.baoBob.troc.jeweler.name',
				textKey: 'missions.baoBob.troc.jeweler.text'
			},
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: true },
			{
				type: 'TALK',
				npcKey: 'touriste_enlise',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.baoBob.troc.tourist.name',
				textKey: 'missions.baoBob.troc.tourist.text'
			},
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: true },
			{
				type: 'TALK',
				npcKey: 'artiste_enthousiaste',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.baoBob.troc.artist.name',
				textKey: 'missions.baoBob.troc.artist.text'
			},
			{ type: 'AT', place: PlaceEnum.BAO_BOB, hidden: true },
			{
				type: 'TALK',
				npcKey: 'vieille_dame',
				place: PlaceEnum.BAO_BOB,
				nameKey: 'missions.baoBob.troc.oldLady.name',
				textKey: 'missions.baoBob.troc.oldLady.text'
			},
			baoBobValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 100 },
			{ type: 'GOLD', value: 2000 }
		],
		labels: {},
		limit: 30
	},
	{
		key: 'kilksk',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.kilksk.name',
		beginKey: 'missions.baoBob.kilksk.begin',
		endKey: 'missions.baoBob.kilksk.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.DOME_SOULAFLOTTE, hidden: false },
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['kazka'],
					count: 6,
					force: true,
					displayNameKey: 'missions.baoBob.kilksk.kill'
				}
			},
			baoBobValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 2000 }
		],
		labels: {},
		condition: 'mission(kilpir)+canfight(kazka)',
		limit: 10
	},
	{
		key: 'kilang',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.kilang.name',
		beginKey: 'missions.baoBob.kilang.begin',
		endKey: 'missions.baoBob.kilang.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['anguil'],
					count: 10,
					force: true,
					displayNameKey: 'missions.baoBob.kilang.kill'
				}
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: true },
			{
				type: 'TALK',
				npcKey: 'marchand_de_vins',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.baoBob.kilang.wineMerchant.name',
				textKey: 'missions.baoBob.kilang.wineMerchant.text'
			},
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'pecheur',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.baoBob.kilang.fisher.name',
				textKey: 'missions.baoBob.kilang.fisher.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'madame_seyche',
				place: PlaceEnum.DINOVILLE,
				nameKey: 'missions.baoBob.kilang.madameSeyche.name',
				textKey: 'missions.baoBob.kilang.madameSeyche.text'
			},
			{ type: 'AT', place: PlaceEnum.PAPY_JOE, hidden: false },
			{
				type: 'TALK',
				npcKey: 'adam_nature',
				place: PlaceEnum.PAPY_JOE,
				nameKey: 'missions.baoBob.kilang.adamNature.name',
				textKey: 'missions.baoBob.kilang.adamNature.text'
			},
			baoBobValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 50 },
			{ type: 'GOLD', value: 5000 }
		],
		labels: {},
		condition: 'mission(kilksk)+canfight(anguil)',
		limit: 12
	},
	{
		key: 'bigpch',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.bigpch.name',
		beginKey: 'missions.baoBob.bigpch.begin',
		endKey: 'missions.baoBob.bigpch.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					count: 30,
					force: true,
					displayNameKey: 'missions.baoBob.bigpch.kill'
				}
			},
			baoBobValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 150 },
			{ type: 'GOLD', value: 1500 }
		],
		labels: {},
		condition: 'mission(kilksk)',
		limit: 10
	},
	{
		key: 'rally1',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.rally1.name',
		beginKey: 'missions.baoBob.rally1.begin',
		endKey: 'missions.baoBob.rally1.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally1_step',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.baoBob.rally1.step.name',
				descriptionKey: 'missions.baoBob.rally1.step.description'
			},
			baoBobValidateGoal()
		],
		rewards: [{ type: 'XP', value: 10 }],
		labels: {},
		limit: 10
	},
	{
		key: 'rally2',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.rally2.name',
		beginKey: 'missions.baoBob.rally2.begin',
		endKey: 'missions.baoBob.rally2.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally2_step1',
				place: PlaceEnum.PORT_DE_PRECHE,
				nameKey: 'missions.baoBob.rally2.step.name',
				descriptionKey: 'missions.baoBob.rally2.step.description'
			},
			{ type: 'AT', place: PlaceEnum.UNIVERSITE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally2_step2',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'missions.baoBob.rally2.step.name',
				descriptionKey: 'missions.baoBob.rally2.step.description2'
			},
			baoBobValidateGoal()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		condition: 'mission(rally1)',
		limit: 10
	},
	{
		key: 'rally3',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.rally3.name',
		beginKey: 'missions.baoBob.rally3.begin',
		endKey: 'missions.baoBob.rally3.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.MINES_DE_CORAIL, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally3_step1',
				place: PlaceEnum.MINES_DE_CORAIL,
				nameKey: 'missions.baoBob.rally3.step.name',
				descriptionKey: 'missions.baoBob.rally3.step.description'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally3_step2',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.baoBob.rally3.step.name',
				descriptionKey: 'missions.baoBob.rally3.step.description2'
			},
			{ type: 'AT', place: PlaceEnum.PENTES_DE_BASALTE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally3_step3',
				place: PlaceEnum.PENTES_DE_BASALTE,
				nameKey: 'missions.baoBob.rally3.step.name',
				descriptionKey: 'missions.baoBob.rally3.step.description3'
			},
			baoBobValidateGoal()
		],
		rewards: [{ type: 'XP', value: 30 }],
		labels: {},
		condition: 'mission(rally2)+fx(matesc)',
		limit: 10
	},
	{
		key: 'rally4',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.rally4.name',
		beginKey: 'missions.baoBob.rally4.begin',
		endKey: 'missions.baoBob.rally4.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_rally4_step',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.baoBob.rally4.step.name',
				descriptionKey: 'missions.baoBob.rally4.step.description'
			},
			baoBobValidateGoal()
		],
		rewards: [{ type: 'XP', value: 40 }],
		labels: {},
		condition: 'mission(rally3)+fx(matesc)',
		limit: 10
	},
	{
		key: 'tour',
		group: BAO_BOB_GROUP,
		nameKey: 'missions.baoBob.tour.name',
		beginKey: 'missions.baoBob.tour.begin',
		endKey: 'missions.baoBob.tour.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.ILE_WAIKIKI, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step1',
				place: PlaceEnum.ILE_WAIKIKI,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description'
			},
			{ type: 'AT', place: PlaceEnum.FORCEBRUT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step2',
				place: PlaceEnum.FORCEBRUT,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description2'
			},
			{ type: 'AT', place: PlaceEnum.COLLINES_ESCARPEES, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step3',
				place: PlaceEnum.COLLINES_ESCARPEES,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description3'
			},
			{ type: 'AT', place: PlaceEnum.FOSSELAVE, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step4',
				place: PlaceEnum.FOSSELAVE,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description4'
			},
			{ type: 'AT', place: PlaceEnum.CAMP_KORGON, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step5',
				place: PlaceEnum.CAMP_KORGON,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description5'
			},
			{ type: 'AT', place: PlaceEnum.AUREE_DE_LA_FORET, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'bao_bob_tour_step6',
				place: PlaceEnum.AUREE_DE_LA_FORET,
				nameKey: 'missions.baoBob.tour.step.name',
				descriptionKey: 'missions.baoBob.tour.step.description6'
			},
			baoBobValidateGoal()
		],
		rewards: [
			{ type: 'XP', value: 100 },
			{ type: 'COLLECTION', collectionKey: 'tour' }
		],
		labels: {},
		condition: 'mission(rally4)+fx(palmes)',
		limit: 10
	}
];
