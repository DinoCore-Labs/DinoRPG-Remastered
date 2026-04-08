import { PlaceEnum } from '../../enums/PlaceEnum.js';
import type { MissionDefinition } from '../mission.js';

export const papyJoeMissions: MissionDefinition[] = [
	{
		key: 'fish',
		group: 'papy_joe',
		nameKey: 'missions.papyJoe.fish.name',
		beginKey: 'missions.papyJoe.fish.begin',
		endKey: 'missions.papyJoe.fish.end',
		goals: [
			{ type: 'AT', place: PlaceEnum.PORT_DE_PRECHE, hidden: false },
			{
				type: 'TALK',
				nameKey: 'missions.papyJoe.common.fishMerchant.name',
				textKey: 'missions.papyJoe.fish.goals.fishMerchant.text'
			},
			{ type: 'AT', place: PlaceEnum.DINOVILLE, hidden: false },
			{
				type: 'TALK',
				nameKey: 'missions.papyJoe.common.madameSeyche.name',
				textKey: 'missions.papyJoe.fish.goals.madameSeyche.text'
			}
		],
		rewards: [{ type: 'XP', value: 20 }],
		labels: {},
		condition: null,
		limit: 10
	}
];
