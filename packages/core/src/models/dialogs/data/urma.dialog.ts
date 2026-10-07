import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { GameEvent } from '../../game/gameEvents.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const urmaDialog = defineDialog({
	id: 'urma',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.urma.name',
	cond: parseCondition(`event(${GameEvent.EASTER})`),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'irma',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.urma.dialog.begin',
			next: ['buy_one', 'buy_ten', 'sold_out', 'leave']
		},
		buy_one: {
			id: 'buy_one',
			text: 'npc.urma.dialog.buyOne',
			next: ['back'],
			special: [
				{
					type: 'buyUrmaEggs',
					count: 1
				}
			]
		},
		buy_ten: {
			id: 'buy_ten',
			text: 'npc.urma.dialog.buyTen',
			next: ['back'],
			special: [
				{
					type: 'buyUrmaEggs',
					count: 10
				}
			]
		},
		sold_out: {
			id: 'sold_out',
			text: 'npc.urma.dialog.soldOut',
			next: []
		},
		leave: {
			id: 'leave',
			text: 'npc.urma.dialog.leave',
			next: []
		}
	},
	links: {
		buy_one: {
			id: 'buy_one',
			text: 'npc.urma.choice.buyOne',
			target: 'buy_one',
			cond: parseCondition('uvar(paques,299-)'),
			confirm: true
		},
		buy_ten: {
			id: 'buy_ten',
			text: 'npc.urma.choice.buyTen',
			target: 'buy_ten',
			cond: parseCondition('uvar(paques,290-)'),
			confirm: true
		},
		sold_out: {
			id: 'sold_out',
			text: 'npc.urma.choice.soldOut',
			target: 'sold_out',
			cond: parseCondition('uvar(paques,300+)')
		},
		back: {
			id: 'back',
			text: 'npc.urma.choice.back',
			target: 'begin'
		},
		leave: {
			id: 'leave',
			text: 'npc.urma.choice.leave',
			target: 'leave'
		}
	}
});
