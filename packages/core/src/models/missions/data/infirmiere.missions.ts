import { MapZone } from '../../enums/MapZone.js';
import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';
import type { MissionValidateGoal } from '../missionGoal.js';

/** Motion Twin, xml/fr/missions/infirmiere.xml — sept missions, clés MT inchangées. */
export const INFIRMIERE_MISSION_GROUP = 'infirmiere';

const validateWithAnna = (): MissionValidateGoal => ({
	type: 'VALIDATE',
	npcKey: 'clinic_anna_services',
	place: PlaceEnum.CLINIQUE,
	nameKey: 'npc.clinic.name'
});

export const infirmiereMissions: MissionDefinition[] = [
	{
		key: 'ingr1',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.ingr1.name',
		beginKey: 'missions.clinic.ingr1.begin',
		endKey: 'missions.clinic.ingr1.end',
		goals: [
			// La mission commence chez Anna, à la clinique : pas d'objectif AT initial
			// qui obligerait le joueur à partir et revenir pour débloquer le dépôt.
			{
				type: 'USE_INGREDIENT',
				place: PlaceEnum.CLINIQUE,
				ingredientKey: 'feuilles_de_pelinae',
				quantity: 10,
				nameKey: 'missions.clinic.ingr1.deliver'
			},
			validateWithAnna()
		],
		rewards: [{ type: 'XP', value: 10 }],
		labels: {}
	},
	{
		key: 'ingr2',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.ingr2.name',
		beginKey: 'missions.clinic.ingr2.begin',
		endKey: 'missions.clinic.ingr2.end',
		goals: [
			{
				type: 'USE_INGREDIENT',
				place: PlaceEnum.CLINIQUE,
				ingredientKey: 'bolet_phalisk_blanc',
				quantity: 5,
				nameKey: 'missions.clinic.ingr2.deliver'
			},
			validateWithAnna()
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {}
	},
	{
		key: 'ingr3',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.ingr3.name',
		beginKey: 'missions.clinic.ingr3.begin',
		endKey: 'missions.clinic.ingr3.end',
		goals: [
			{
				type: 'USE_INGREDIENT',
				place: PlaceEnum.CLINIQUE,
				ingredientKey: 'orchidee_fantasque',
				quantity: 1,
				nameKey: 'missions.clinic.ingr3.deliver'
			},
			validateWithAnna()
		],
		rewards: [
			{ type: 'XP', value: 30 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {}
	},
	{
		key: 'kill1',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.kill1.name',
		beginKey: 'missions.clinic.kill1.begin',
		endKey: 'missions.clinic.kill1.end',
		condition: 'mission(ingr1)+mission(ingr2)+mission(ingr3)+canfight(gropi)',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['gropi'],
					count: 10,
					force: true,
					zone: MapZone.DINOWEST,
					displayNameKey: 'missions.clinic.kill1.target'
				}
			},
			validateWithAnna()
		],
		rewards: [
			{ type: 'XP', value: 10 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {}
	},
	{
		key: 'kill2',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.kill2.name',
		beginKey: 'missions.clinic.kill2.begin',
		endKey: 'missions.clinic.kill2.end',
		condition: 'mission(kill1)+canfight(coq)',
		goals: [
			// L'archive MT impose la zone 6 (Dinowest), même si Coqdur
			// n'apparaît habituellement que dans la zone 0 (Dinoland).
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['coq'],
					count: 10,
					force: true,
					zone: MapZone.DINOWEST,
					displayNameKey: 'missions.clinic.kill2.target'
				}
			},
			validateWithAnna()
		],
		rewards: [
			{ type: 'XP', value: 10 },
			{ type: 'GOLD', value: 600 }
		],
		labels: {}
	},
	{
		key: 'bless1',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.bless1.name',
		beginKey: 'missions.clinic.bless1.begin',
		endKey: 'missions.clinic.bless1.end',
		condition: 'mission(kill2)',
		goals: [
			{ type: 'AT', place: PlaceEnum.DOME_SOULAFLOTTE, hidden: true },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'clinic_participant',
				place: PlaceEnum.DOME_SOULAFLOTTE,
				nameKey: 'missions.clinic.bless1.participant.name',
				npcNameKey: 'missions.clinic.bless1.participant.name',
				textKey: 'missions.clinic.bless1.participant.text'
			},
			{ type: 'AT', place: PlaceEnum.CLINIQUE, hidden: false },
			validateWithAnna()
		],
		rewards: [
			{ type: 'XP', value: 20 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {}
	},
	{
		key: 'bless2',
		group: INFIRMIERE_MISSION_GROUP,
		nameKey: 'missions.clinic.bless2.name',
		beginKey: 'missions.clinic.bless2.begin',
		endKey: 'missions.clinic.bless2.end',
		condition: 'mission(bless1)',
		goals: [
			{ type: 'AT', place: PlaceEnum.REPAIRE_DU_VENERABLE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'clinic_grilled_tourist_vener',
				place: PlaceEnum.REPAIRE_DU_VENERABLE,
				nameKey: 'missions.clinic.bless2.tourist.name',
				npcNameKey: 'missions.clinic.bless2.tourist.name',
				textKey: 'missions.clinic.bless2.tourist.vener',
				gfx: 'tourist_grill',
				background: '1'
			},
			{ type: 'AT', place: PlaceEnum.CLINIQUE, hidden: false },
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'clinic_grilled_tourist_clinik',
				place: PlaceEnum.CLINIQUE,
				nameKey: 'missions.clinic.bless2.tourist.name',
				npcNameKey: 'missions.clinic.bless2.tourist.name',
				textKey: 'missions.clinic.bless2.tourist.clinik',
				gfx: 'tourist_grill',
				background: '2'
			},
			validateWithAnna()
		],
		rewards: [
			{ type: 'XP', value: 20 },
			{ type: 'GOLD', value: 500 }
		],
		labels: {}
	}
];
