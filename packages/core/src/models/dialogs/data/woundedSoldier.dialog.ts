// packages/core/src/models/dialogs/data/woundedSoldier.dialog.ts

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const woundedSoldierDialog = defineDialog({
	id: 'wounded_soldier',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.woundedSoldier.name',
	pnj: {
		image: false,
		gfx: 'sgarde',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('fx(vmem)+!fx(ccard)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.woundedSoldier.dialog.begin',
			fast: true,
			next: ['talk']
		},

		talk: {
			id: 'talk',
			text: 'npc.woundedSoldier.dialog.talk',
			next: ['give', 'no']
		},

		no: {
			id: 'no',
			text: 'npc.woundedSoldier.dialog.no',
			fast: true
		},

		give: {
			id: 'give',
			text: 'npc.woundedSoldier.dialog.give',
			next: ['derien']
		},

		derien: {
			id: 'derien',
			text: 'npc.woundedSoldier.dialog.derien',
			special: [{ type: 'useItem', itemId: Item.HOT_BREAD, count: 1 }],
			effects: [{ type: 'effect', effect: 'ccard' }]
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.woundedSoldier.choice.talk'
		},

		give: {
			id: 'give',
			text: 'npc.woundedSoldier.choice.give',
			cond: parseCondition('hasobject(hotpan)')
		},

		no: {
			id: 'no',
			text: 'npc.woundedSoldier.choice.no'
		},

		derien: {
			id: 'derien',
			text: 'npc.woundedSoldier.choice.derien'
		}
	}
});
