import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const c = (source: string) => parseCondition(source);

export const shamanMouDialog = defineDialog({
	id: 'shaman_mou',
	place: PlaceEnum.FOSSELAVE,
	name: 'npc.shamanMou.name',
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'shaman',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.shamanMou.dialog.begin',
			next: ['vener', 'souvenir', 'missions', 'charm']
		},
		charm: {
			id: 'charm',
			text: 'npc.shamanMou.dialog.charm',
			next: ['boost', 'nothing']
		},
		boost: {
			id: 'boost',
			text: 'npc.shamanMou.dialog.boost',
			next: [],
			effects: [{ type: 'effect', effect: 'fcharm' }]
		},
		nothing: {
			id: 'nothing',
			text: 'npc.shamanMou.dialog.nothing',
			next: []
		},
		vener: {
			id: 'vener',
			text: 'npc.shamanMou.dialog.vener',
			next: ['force', 'merci']
		},
		force: {
			id: 'force',
			text: 'npc.shamanMou.dialog.force',
			next: ['merci']
		},
		merci: {
			id: 'merci',
			text: 'npc.shamanMou.dialog.merci',
			next: []
		},
		souvenir: {
			id: 'souvenir',
			text: 'npc.shamanMou.dialog.souvenir',
			next: ['more', 'merci']
		},
		more: {
			id: 'more',
			text: 'npc.shamanMou.dialog.more',
			next: ['accept']
		},
		accept: {
			id: 'accept',
			text: 'npc.shamanMou.dialog.accept',
			next: ['missions'],
			effects: [{ type: 'effect', effect: 'shflag' }]
		},
		missions: {
			id: 'missions',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'shaman' }]
		}
	},
	links: {
		vener: {
			id: 'vener',
			text: 'npc.shamanMou.choice.vener'
		},
		souvenir: {
			id: 'souvenir',
			text: 'npc.shamanMou.choice.souvenir',
			cond: c('!fx(shflag)')
		},
		missions: {
			id: 'missions',
			text: 'npc.shamanMou.choice.missions',
			cond: c('fx(shflag)')
		},
		charm: {
			id: 'charm',
			text: 'npc.shamanMou.choice.charm',
			cond: c('fx(fflag)')
		},
		boost: {
			id: 'boost',
			text: 'npc.shamanMou.choice.acceptCharm',
			cond: c('!fx(fcharm)')
		},
		nothing: {
			id: 'nothing',
			text: 'npc.shamanMou.choice.acceptCharm',
			cond: c('fx(fcharm)')
		},
		force: {
			id: 'force',
			text: 'npc.shamanMou.choice.force'
		},
		merci: {
			id: 'merci',
			text: 'npc.shamanMou.choice.merci'
		},
		more: {
			id: 'more',
			text: 'npc.shamanMou.choice.more'
		},
		accept: {
			id: 'accept',
			text: 'npc.shamanMou.choice.accept'
		}
	},
	inject: []
});
