import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const GUIDE_MICHEL_GROUP = 'michel';

export const guideMichelMissions: MissionDefinition[] = [
	{
		key: 'move',
		group: GUIDE_MICHEL_GROUP,
		nameKey: 'missions.michel.move.name',
		beginKey: 'missions.michel.move.begin',
		endKey: 'missions.michel.move.end',
		goals: [
			{
				type: 'AT',
				place: PlaceEnum.UNIVERSITE,
				hidden: false
			},
			{
				type: 'TALK',
				display: 'dialog',
				dialogId: '__mission__',
				npcKey: 'guide_michel_university',
				npcNameKey: 'npc.guideMichel.name',
				gfx: 'michel',
				place: PlaceEnum.UNIVERSITE,
				nameKey: 'npc.guideMichel.name',
				textKey: 'missions.michel.move.guideMichel.text'
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
				nameKey: 'missions.michel.move.madameSeyche.name',
				textKey: 'missions.michel.move.madameSeyche.text'
			}
		],
		rewards: [
			{
				type: 'ITEM',
				itemKey: 'potion_irma',
				quantity: 1
			}
		],
		labels: {},
		limit: 10
	},
	{
		key: 'atk',
		group: GUIDE_MICHEL_GROUP,
		nameKey: 'missions.michel.atk.name',
		beginKey: 'missions.michel.atk.begin',
		endKey: 'missions.michel.atk.end',
		goals: [
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['goupi'],
					count: 2,
					force: true,
					place: PlaceEnum.DINOVILLE,
					displayNameKey: 'missions.michel.atk.kill'
				}
			}
		],
		rewards: [
			{
				type: 'ITEM',
				itemKey: 'meat_pie',
				quantity: 1
			},
			{
				type: 'GOLD',
				value: 2000
			}
		],
		labels: {},
		condition: 'mission(move)',
		limit: 20
	},
	{
		key: 'boutik',
		group: GUIDE_MICHEL_GROUP,
		nameKey: 'missions.michel.boutik.name',
		beginKey: 'missions.michel.boutik.begin',
		endKey: 'missions.michel.boutik.end',
		goals: [
			{
				type: 'USE_ITEM',
				place: PlaceEnum.DINOVILLE,
				itemKey: 'potion_angel',
				quantity: 1,
				nameKey: 'missions.michel.boutik.angel'
			}
		],
		rewards: [
			{
				type: 'GOLD',
				value: 1000
			},
			{
				type: 'ITEM',
				itemKey: 'potion_angel',
				quantity: 1
			}
		],
		labels: {},
		condition: 'mission(atk)',
		limit: 20
	}
];
