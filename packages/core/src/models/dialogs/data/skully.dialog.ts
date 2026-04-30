import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const c = (source: string) => parseCondition(source);

const skullyPnj = {
	image: false,
	gfx: 'skully',
	frame: 'speak',
	background: '1'
};

const mouldeurPnj = {
	image: false,
	gfx: 'moulder',
	frame: 'speak',
	background: '1'
};

export const skullyIntroDialog = defineDialog({
	id: 'skully_intro',
	place: PlaceEnum.CIMETIERE,
	name: 'npc.skully.name',
	cond: c('life(10-)+!fx(skull)'),
	first: 'begin',
	pnj: skullyPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.skully.dialog.begin',
			next: ['arg', 'bye', 'shortcut']
		},
		arg: {
			id: 'arg',
			text: 'npc.skully.dialog.arg',
			next: ['bye', 'arg2']
		},
		arg2: {
			id: 'arg2',
			text: 'npc.skully.dialog.arg2',
			next: ['diff', 'bye']
		},
		diff: {
			id: 'diff',
			text: 'npc.skully.dialog.diff',
			next: ['free', 'bye']
		},
		free: {
			id: 'free',
			text: 'npc.skully.dialog.free',
			next: ['haunt', 'bye']
		},
		haunt: {
			id: 'haunt',
			text: 'npc.skully.dialog.haunt',
			next: ['do', 'bye']
		},
		do: {
			id: 'do',
			text: 'npc.skully.dialog.do',
			next: ['uhm', 'bye']
		},
		uhm: {
			id: 'uhm',
			text: 'npc.skully.dialog.uhm',
			next: ['bonne', 'bye']
		},
		bonne: {
			id: 'bonne',
			text: 'npc.skully.dialog.bonne',
			next: ['reset', 'next', 'bye']
		},
		next: {
			id: 'next',
			text: 'npc.skully.dialog.next',
			next: ['help', 'nohelp', 'bye']
		},
		nohelp: {
			id: 'nohelp',
			text: 'npc.skully.dialog.nohelp',
			next: ['forgot']
		},
		forgot: {
			id: 'forgot',
			text: 'npc.skully.dialog.forgot',
			fast: true
		},
		help: {
			id: 'help',
			text: 'npc.skully.dialog.help',
			next: ['question', 'accept', 'maybe']
		},
		accept: {
			id: 'accept',
			text: 'npc.skully.dialog.accept',
			next: ['missions'],
			effects: [{ type: 'effect', effect: 'skull' }]
		},
		missions: {
			id: 'missions',
			text: '',
			special: [{ type: 'missions', group: 'skull' }]
		},
		bye: {
			id: 'bye',
			text: 'npc.skully.dialog.bye',
			fast: true
		}
	},
	links: {
		arg: { id: 'arg', text: 'npc.skully.choice.arg' },
		bye: { id: 'bye', text: 'npc.skully.choice.bye' },
		shortcut: {
			id: 'shortcut',
			text: 'npc.skully.choice.shortcut',
			target: 'missions',
			cond: c('admin()')
		},
		arg2: { id: 'arg2', text: 'npc.skully.choice.arg2' },
		diff: { id: 'diff', text: 'npc.skully.choice.diff' },
		free: { id: 'free', text: 'npc.skully.choice.free' },
		haunt: { id: 'haunt', text: 'npc.skully.choice.haunt' },
		do: { id: 'do', text: 'npc.skully.choice.do' },
		uhm: { id: 'uhm', text: 'npc.skully.choice.uhm' },
		bonne: { id: 'bonne', text: 'npc.skully.choice.bonne' },
		reset: {
			id: 'reset',
			text: 'npc.skully.choice.reset',
			target: 'forgot'
		},
		next: { id: 'next', text: 'npc.skully.choice.next' },
		nohelp: { id: 'nohelp', text: 'npc.skully.choice.nohelp' },
		help: { id: 'help', text: 'npc.skully.choice.help' },
		forgot: { id: 'forgot', text: 'npc.skully.choice.forgot' },
		question: {
			id: 'question',
			text: 'npc.skully.choice.question',
			target: 'forgot'
		},
		accept: { id: 'accept', text: 'npc.skully.choice.accept' },
		maybe: {
			id: 'maybe',
			text: 'npc.skully.choice.maybe',
			target: 'forgot'
		},
		missions: { id: 'missions', text: 'npc.skully.choice.missions' }
	}
});

export const skullyMissionsDialog = defineDialog({
	id: 'skully_missions',
	place: PlaceEnum.CIMETIERE,
	name: 'npc.skully.name',
	cond: c('fx(skull)+!mission(skuend)'),
	first: 'begin',
	pnj: skullyPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.skully.dialog.unlocked',
			next: ['missions']
		},
		missions: {
			id: 'missions',
			text: '',
			special: [{ type: 'missions', group: 'skull' }]
		}
	},
	links: {
		missions: { id: 'missions', text: 'npc.skully.choice.missions' }
	}
});

export const skullyEndDialog = defineDialog({
	id: 'skully_end',
	place: PlaceEnum.CIMETIERE,
	name: 'npc.skully.name',
	cond: c('mission(skuend)'),
	first: 'begin',
	pnj: skullyPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.skully.dialog.endBegin',
			next: ['pda', 'dinoz']
		},
		dinoz: {
			id: 'dinoz',
			text: 'npc.skully.dialog.dinoz'
		},
		pda: {
			id: 'pda',
			text: 'npc.skully.dialog.pda',
			effects: [{ type: 'collection', collection: 'pda' }]
		}
	},
	links: {
		dinoz: {
			id: 'dinoz',
			text: 'npc.skully.choice.nothing',
			cond: c('!collec(pda)+!dinoz(15)')
		},
		pda: {
			id: 'pda',
			text: 'npc.skully.choice.nothing',
			cond: c('!collec(pda)+dinoz(15)')
		}
	}
});

export const mouldeurDialog = defineDialog({
	id: 'mouldeur',
	place: PlaceEnum.RUINES_ASHPOUK,
	name: 'npc.mouldeur.name',
	cond: c('curmission(skuend,2)'),
	first: 'begin',
	pnj: mouldeurPnj,
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.mouldeur.dialog.begin',
			next: ['you']
		},
		you: {
			id: 'you',
			text: 'npc.mouldeur.dialog.you',
			next: ['explain']
		},
		explain: {
			id: 'explain',
			text: 'npc.mouldeur.dialog.explain',
			next: ['other']
		},
		other: {
			id: 'other',
			text: 'npc.mouldeur.dialog.other',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.mouldeur.dialog.ok',
			next: ['ok2']
		},
		ok2: {
			id: 'ok2',
			text: 'npc.mouldeur.dialog.ok2',
			next: ['skully']
		},
		skully: {
			id: 'skully',
			text: 'npc.mouldeur.dialog.skully',
			next: ['exp']
		},
		exp: {
			id: 'exp',
			text: 'npc.mouldeur.dialog.exp',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.mouldeur.dialog.end'
		}
	},
	links: {
		you: { id: 'you', text: 'npc.mouldeur.choice.you' },
		explain: { id: 'explain', text: 'npc.mouldeur.choice.explain' },
		other: { id: 'other', text: 'npc.mouldeur.choice.other' },
		ok: { id: 'ok', text: 'npc.mouldeur.choice.ok' },
		ok2: { id: 'ok2', text: 'npc.mouldeur.choice.ok2' },
		skully: { id: 'skully', text: 'npc.mouldeur.choice.skully' },
		exp: { id: 'exp', text: 'npc.mouldeur.choice.exp' },
		end: { id: 'end', text: 'npc.mouldeur.choice.end' }
	}
});
