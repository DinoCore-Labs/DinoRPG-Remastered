import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const c = (source: string) => parseCondition(source);

export const nicolasHulotDialog = defineDialog({
	id: 'nicolas_hulot',
	place: PlaceEnum.AUREE_DE_LA_FORET,
	name: 'npc.nicolasHulot.name',
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'hulot',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.nicolasHulot.dialog.begin',
			fast: true,
			next: ['welcome', 'sick', 'sickstatus']
		},

		welcome: {
			id: 'welcome',
			text: 'npc.nicolasHulot.dialog.welcome',
			next: ['who', 'better', 'missions']
		},

		who: {
			id: 'who',
			text: 'npc.nicolasHulot.dialog.who',
			next: ['role']
		},

		role: {
			id: 'role',
			text: 'npc.nicolasHulot.dialog.role',
			next: ['flora', 'fauna', 'myst', 'missions']
		},

		myst: {
			id: 'myst',
			text: 'npc.nicolasHulot.dialog.myst',
			next: ['fear', 'flora', 'fauna', 'missions']
		},

		flora: {
			id: 'flora',
			text: 'npc.nicolasHulot.dialog.flora',
			next: ['whynot', 'fauna', 'myst', 'missions']
		},

		whynot: {
			id: 'whynot',
			text: 'npc.nicolasHulot.dialog.whynot',
			next: ['fear', 'other', 'missions']
		},

		fauna: {
			id: 'fauna',
			text: 'npc.nicolasHulot.dialog.fauna',
			next: ['flora', 'myst', 'missions']
		},

		fear: {
			id: 'fear',
			text: 'npc.nicolasHulot.dialog.fear',
			next: ['explore', 'other']
		},

		explore: {
			id: 'explore',
			text: 'npc.nicolasHulot.dialog.explore',
			next: ['missions'],
			effects: [{ type: 'effect', effect: 'humiss' }]
		},

		other: {
			id: 'other',
			text: 'npc.nicolasHulot.dialog.other',
			next: ['flora', 'fauna', 'myst', 'missions']
		},

		sick: {
			id: 'sick',
			text: 'npc.nicolasHulot.dialog.sick',
			fast: true,
			next: ['problem']
		},

		problem: {
			id: 'problem',
			text: 'npc.nicolasHulot.dialog.problem',
			next: ['curesearch']
		},

		curesearch: {
			id: 'curesearch',
			text: '',
			special: [{ type: 'missions', group: 'hulot' }]
		},

		sickstatus: {
			id: 'sickstatus',
			text: 'npc.nicolasHulot.dialog.sickstatus',
			next: ['curesearch']
		},

		better: {
			id: 'better',
			text: 'npc.nicolasHulot.dialog.better',
			next: ['flora', 'fauna', 'myst', 'missions']
		},

		missions: {
			id: 'missions',
			text: '',
			special: [{ type: 'missions', group: 'hulot' }]
		}
	},
	links: {
		welcome: {
			id: 'welcome',
			text: 'npc.nicolasHulot.choice.talk',
			cond: c('!mission(toxic)|mission(hucure)')
		},
		sick: {
			id: 'sick',
			text: 'npc.nicolasHulot.choice.talk',
			cond: c('!curmission(hucure)+mission(toxic)+!mission(hucure)')
		},
		sickstatus: {
			id: 'sickstatus',
			text: 'npc.nicolasHulot.choice.talk',
			cond: c('curmission(hucure)')
		},
		who: {
			id: 'who',
			text: 'npc.nicolasHulot.choice.who',
			cond: c('!mission(hucure)')
		},
		better: {
			id: 'better',
			text: 'npc.nicolasHulot.choice.better',
			cond: c('mission(hucure)')
		},
		missions: {
			id: 'missions',
			text: 'npc.nicolasHulot.choice.missions',
			cond: c('fx(humiss)+(!mission(toxic)|mission(hucure))')
		},
		role: {
			id: 'role',
			text: 'npc.nicolasHulot.choice.role'
		},
		myst: {
			id: 'myst',
			text: 'npc.nicolasHulot.choice.myst'
		},
		fauna: {
			id: 'fauna',
			text: 'npc.nicolasHulot.choice.fauna'
		},
		flora: {
			id: 'flora',
			text: 'npc.nicolasHulot.choice.flora'
		},
		fear: {
			id: 'fear',
			text: 'npc.nicolasHulot.choice.fear',
			cond: c('!fx(humiss)')
		},
		whynot: {
			id: 'whynot',
			text: 'npc.nicolasHulot.choice.whynot'
		},
		explore: {
			id: 'explore',
			text: 'npc.nicolasHulot.choice.explore'
		},
		other: {
			id: 'other',
			text: 'npc.nicolasHulot.choice.other'
		},
		problem: {
			id: 'problem',
			text: 'npc.nicolasHulot.choice.problem'
		},
		curesearch: {
			id: 'curesearch',
			text: 'npc.nicolasHulot.choice.curesearch'
		}
	}
});
