import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { defineDialog } from '../defineDialog.js';
import { DialogDefinition } from '../dialog.js';

export const testDialog = defineDialog({
	id: 'test_dialog',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.hulot.name',
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
			text: 'npc.hulot.dialog.begin',
			next: ['start_tutorial', 'leave']
		},
		tutorial_start: {
			id: 'tutorial_start',
			text: 'npc.hulot.dialog.tutorial_start',
			next: ['continue'],
			effects: [
				{ type: 'giveItem', itemId: Item.POTION_IRMA, count: 1 },
				{ type: 'scenario', scenario: 'tutorial', phase: 1 }
			]
		},
		exit: {
			id: 'exit',
			text: 'npc.dialog.exit',
			next: []
		}
	},
	links: {
		start_tutorial: {
			id: 'start_tutorial',
			text: 'npc.hulot.choice.start_tutorial',
			target: 'tutorial_start',
			cond: { type: 'true' }
		},
		continue: {
			id: 'continue',
			text: 'npc.hulot.choice.continue',
			target: 'exit'
		},
		leave: {
			id: 'leave',
			text: 'npc.dialog.leave',
			target: 'exit'
		}
	},
	inject: []
} satisfies DialogDefinition);
