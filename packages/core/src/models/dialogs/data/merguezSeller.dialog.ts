import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { defineDialog } from '../defineDialog.js';

export const merguezSellerDialog = defineDialog({
	id: 'merguez_seller',
	place: PlaceEnum.RUINES_ASHPOUK,
	name: 'npc.merguezSeller.name',
	cond: { type: 'true' },
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'merguez',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.merguezSeller.dialog.begin',
			next: ['ah']
		},
		ah: {
			id: 'ah',
			text: 'npc.merguezSeller.dialog.ah',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.merguezSeller.dialog.ok',
			next: ['thanks'],
			needCheck: false,
			effects: [{ type: 'giveItem', itemId: Item.GOBLIN_MERGUEZ, count: 5 }]
		},
		thanks: {
			id: 'thanks',
			text: 'npc.merguezSeller.dialog.thanks',
			next: []
		}
	},
	links: {
		ah: {
			id: 'ah',
			text: 'npc.merguezSeller.choice.ah'
		},
		ok: {
			id: 'ok',
			text: 'npc.merguezSeller.choice.ok'
		},
		thanks: {
			id: 'thanks',
			text: 'npc.merguezSeller.choice.thanks'
		}
	}
});
