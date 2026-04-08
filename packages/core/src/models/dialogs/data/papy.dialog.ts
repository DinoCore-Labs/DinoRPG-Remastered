import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { DialogDefinition } from '../dialog.js';

export const papyJoeDialog: DialogDefinition = {
	id: 'papy_joe',
	place: PlaceEnum.PAPY_JOE,
	name: 'npc.papyJoe.name',
	pnj: {
		image: false,
		gfx: 'papy',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.papyJoe.dialog.begin',
			next: ['missions']
		},
		missions: {
			id: 'missions',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'papy_joe' }]
		}
	},
	links: {
		missions: {
			id: 'missions',
			text: 'npc.papyJoe.choice.missions'
		}
	}
};
