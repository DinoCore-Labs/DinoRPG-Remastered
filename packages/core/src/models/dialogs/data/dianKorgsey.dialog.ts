import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const dianKorgseyDialog = defineDialog({
	id: 'dian_korgsey',
	place: PlaceEnum.CAMP_KORGON,
	name: 'npc.dian.name',
	pnj: {
		image: false,
		gfx: 'dian',
		frame: 'speak',
		background: '1'
	},
	cond: { type: 'true' },
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.dian.dialog.begin',
			next: ['korgons', 'nothing', 'missions']
		},
		korgons: {
			id: 'korgons',
			text: 'npc.dian.dialog.korgons',
			next: ['why', 'wood', 'tame', 'interest', 'missions']
		},
		why: {
			id: 'why',
			text: 'npc.dian.dialog.why',
			next: ['wood', 'tame', 'interest', 'missions'],
			effects: [{ type: 'effect', effect: 'qwhy' }]
		},
		wood: {
			id: 'wood',
			text: 'npc.dian.dialog.wood',
			next: ['why', 'tame', 'interest', 'missions'],
			effects: [{ type: 'effect', effect: 'qwood' }]
		},
		tame: {
			id: 'tame',
			text: 'npc.dian.dialog.tame',
			next: ['wood', 'why', 'interest', 'missions'],
			effects: [{ type: 'effect', effect: 'qtame' }]
		},
		interest: {
			id: 'interest',
			text: 'npc.dian.dialog.interest',
			next: ['service']
		},
		service: {
			id: 'service',
			text: 'npc.dian.dialog.service',
			next: ['missions'],
			effects: [{ type: 'effect', effect: 'dian' }]
		},
		nothing: {
			id: 'nothing',
			text: 'npc.dian.dialog.nothing'
		},
		missions: {
			id: 'missions',
			text: '',
			special: [
				{
					type: 'missions',
					group: 'dian'
				}
			]
		}
	},
	links: {
		korgons: {
			id: 'korgons',
			text: 'npc.dian.choice.korgons'
		},
		nothing: {
			id: 'nothing',
			text: 'npc.dian.choice.nothing'
		},
		why: {
			id: 'why',
			text: 'npc.dian.choice.why'
		},
		wood: {
			id: 'wood',
			text: 'npc.dian.choice.wood'
		},
		tame: {
			id: 'tame',
			text: 'npc.dian.choice.tame'
		},
		interest: {
			id: 'interest',
			text: 'npc.dian.choice.interest',
			cond: parseCondition('fx(qwhy)+fx(qwood)+fx(qtame)+!fx(dian)')
		},
		service: {
			id: 'service',
			text: 'npc.dian.choice.service'
		},
		missions: {
			id: 'missions',
			text: 'npc.dian.choice.missions',
			cond: parseCondition('fx(dian)')
		}
	}
});
