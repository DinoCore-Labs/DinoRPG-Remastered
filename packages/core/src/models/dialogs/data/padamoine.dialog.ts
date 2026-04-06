import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const padamoineDialog: DialogDefinition = {
	id: 'padamoine',
	name: 'npc.padamoine.name',
	place: PlaceEnum.PORT_DE_PRECHE,
	cond: parseCondition('fx(zenbro)'),
	pnj: {
		image: false,
		gfx: 'padamoine',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.padamoine.dialog.begin',
			fast: false,
			next: ['help']
		},
		help: {
			id: 'help',
			text: 'npc.padamoine.dialog.help',
			fast: false,
			next: ['get']
		},
		get: {
			id: 'get',
			text: 'npc.padamoine.dialog.get',
			fast: false,
			next: [],
			effects: [
				{
					type: 'noEffect',
					effect: 'zenbro'
				},
				{
					type: 'effect',
					effect: 'nenuph'
				}
			]
		}
	},
	links: {
		help: {
			id: 'help',
			text: 'npc.padamoine.choice.help',
			target: 'help'
		},
		get: {
			id: 'get',
			text: 'npc.padamoine.choice.get',
			target: 'get'
		}
	}
};
