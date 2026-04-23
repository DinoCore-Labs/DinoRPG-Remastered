import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

const RODEUR_GROUP = 'rodeur';

const rodeurValidateGoal = () => ({
	type: 'VALIDATE' as const,
	npcKey: 'rodeur',
	place: PlaceEnum.FORGES_DU_GTC,
	nameKey: 'npc.rodeur.name'
});

export const rodeurMissions: MissionDefinition[] = [
	{
		key: 'rodriz',
		group: RODEUR_GROUP,
		nameKey: 'missions.rodeur.rodriz.name',
		beginKey: 'missions.rodeur.rodriz.begin',
		endKey: 'missions.rodeur.rodriz.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.MARAIS_COLLANT, hidden: false },
			{
				type: 'ACTION',
				actionKey: 'search_amnesic_rice',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.rodeur.rodriz.search.name',
				descriptionKey: 'missions.rodeur.rodriz.search.text'
			},
			{
				type: 'KILL',
				kill: {
					monsterKeys: ['pira'],
					count: 30,
					force: true,
					displayNameKey: 'missions.rodeur.rodriz.kill.pira'
				}
			},
			{
				type: 'ACTION',
				actionKey: 'pick_amnesic_rice',
				place: PlaceEnum.MARAIS_COLLANT,
				nameKey: 'missions.rodeur.rodriz.pick.name',
				descriptionKey: 'missions.rodeur.rodriz.pick.text'
			},
			rodeurValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 5000 },
			{ type: 'ITEM', itemKey: 'amnesic_rice', quantity: 1 }
		],
		labels: {},
		limit: 15
	},
	{
		key: 'rodlif',
		group: RODEUR_GROUP,
		nameKey: 'missions.rodeur.rodlif.name',
		beginKey: 'missions.rodeur.rodlif.begin',
		endKey: 'missions.rodeur.rodlif.end',
		condition: 'mission(rodriz)',
		goals: [
			{ type: 'AT', place: PlaceEnum.CHUTES_MUTANTES, hidden: false },
			{
				type: 'FIGHT',
				monsterKeys: ['pteroz', 'hippoclamp', 'rocky']
			},
			rodeurValidateGoal()
		],
		rewards: [
			{ type: 'GOLD', value: 5000 },
			{ type: 'XP', value: 250 }
		],
		labels: {},
		limit: 15
	}
];
