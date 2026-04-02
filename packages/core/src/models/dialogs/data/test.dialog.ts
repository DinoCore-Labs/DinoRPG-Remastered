import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { defineDialog } from '../defineDialog.js';
import { DialogDefinition } from '../dialog.js';

export const testDialog = defineDialog({
	id: 'tutorial_master',
	place: PlaceEnum.DINOVILLE,
	name: 'hulot',
	pnj: {
		image: false,
		gfx: 'hulot',
		frame: 'sick',
		background: '1'
	},
	cond: { type: 'true' },
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'Bienvenue jeune dresseur. Veux-tu commencer ton apprentissage ?',
			next: ['start_tutorial', 'leave']
		},
		tutorial_start: {
			id: 'tutorial_start',
			text: 'Très bien. Prends ceci pour commencer.',
			next: ['continue'],
			effects: [
				{ type: 'giveItem', itemId: Item.POTION_IRMA, count: 1 },
				{ type: 'scenario', scenario: 'tutorial', phase: 1 }
			]
		},
		exit: {
			id: 'exit',
			text: 'Reviens me voir quand tu seras prêt.',
			next: []
		}
	},
	links: {
		start_tutorial: {
			id: 'start_tutorial',
			text: 'Oui, je suis prêt.',
			target: 'tutorial_start',
			cond: { type: 'true' }
		},
		continue: {
			id: 'continue',
			text: 'Merci.',
			target: 'exit'
		},
		leave: {
			id: 'leave',
			text: 'Pas maintenant.',
			target: 'exit'
		}
	},
	inject: []
} satisfies DialogDefinition);
