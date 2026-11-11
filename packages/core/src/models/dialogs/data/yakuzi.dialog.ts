import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// Faithful MT port dialogues: DinoRPG/xml/fr/dialogs/yakuzi.xml (first three <d>).
// Do not alter original progression, choices, wait or wager rules.

export const yakuziPortIntroDialog = defineDialog({
	id: 'yakuzi_port_intro',
	place: PlaceEnum.PORT_DE_PRECHE,
	name: 'npc.yakuzi.names.port0',
	cond: parseCondition('scenario(kabuki,0)+(admin()|utime(6))+active(kabuki)'),
	first: 'begin',
	pnj: { image: false, gfx: 'yakuzi', frame: 'speak', background: '1' },
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuzi.dialog.port0.begin',
			next: ['welcome', 'quit']
		},
		welcome: {
			id: 'welcome',
			text: 'npc.yakuzi.dialog.port0.welcome',
			next: ['hear', 'ref', 'leave']
		},
		hear: {
			id: 'hear',
			text: 'npc.yakuzi.dialog.port0.hear',
			next: ['mission']
		},
		ref: {
			id: 'ref',
			text: 'npc.yakuzi.dialog.port0.ref',
			next: ['mission']
		},
		mission: {
			id: 'mission',
			text: 'npc.yakuzi.dialog.port0.mission',
			next: ['ok', 'no']
		},
		ok: {
			id: 'ok',
			text: 'npc.yakuzi.dialog.port0.ok',
			next: ['compris', 'not']
		},
		no: {
			id: 'no',
			text: 'npc.yakuzi.dialog.port0.no',
			next: []
		},
		compris: {
			id: 'compris',
			text: 'npc.yakuzi.dialog.port0.compris',
			next: ['pile', 'face']
		},
		not: {
			id: 'not',
			text: 'npc.yakuzi.dialog.port0.not',
			next: [],
			fast: true
		},
		pile: {
			id: 'pile',
			text: 'npc.yakuzi.dialog.port0.pile',
			next: ['suite']
		},
		suite: {
			id: 'suite',
			text: 'npc.yakuzi.dialog.port0.suite',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.yakuzi.dialog.port0.end',
			next: [],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 1 }]
		},
		face: {
			id: 'face',
			text: 'npc.yakuzi.dialog.port0.face',
			next: ['suite']
		},
		quit: {
			id: 'quit',
			text: 'npc.yakuzi.dialog.port0.quit',
			next: [],
			fast: true
		}
	},
	links: {
		welcome: { id: 'welcome', text: 'npc.yakuzi.choice.port0.welcome', target: 'welcome' },
		quit: { id: 'quit', text: 'npc.yakuzi.choice.port0.quit', target: 'quit' },
		hear: { id: 'hear', text: 'npc.yakuzi.choice.port0.hear', target: 'hear' },
		ref: { id: 'ref', text: 'npc.yakuzi.choice.port0.ref', target: 'ref' },
		leave: { id: 'leave', text: 'npc.yakuzi.choice.port0.leave', target: 'quit' },
		mission: { id: 'mission', text: 'npc.yakuzi.choice.port0.mission', target: 'mission' },
		ok: { id: 'ok', text: 'npc.yakuzi.choice.port0.ok', target: 'ok' },
		no: { id: 'no', text: 'npc.yakuzi.choice.port0.no', target: 'no' },
		compris: { id: 'compris', text: 'npc.yakuzi.choice.port0.compris', target: 'compris' },
		not: { id: 'not', text: 'npc.yakuzi.choice.port0.not', target: 'not' },
		pile: { id: 'pile', text: 'npc.yakuzi.choice.port0.pile', target: 'pile' },
		face: { id: 'face', text: 'npc.yakuzi.choice.port0.face', target: 'face' },
		suite: { id: 'suite', text: 'npc.yakuzi.choice.port0.suite', target: 'suite' },
		end: { id: 'end', text: 'npc.yakuzi.choice.port0.end', target: 'end' }
	}
});

export const yakuziPortDebtDialog = defineDialog({
	id: 'yakuzi_port_debt',
	place: PlaceEnum.PORT_DE_PRECHE,
	name: 'npc.yakuzi.names.port1',
	cond: parseCondition('scenario(kabuki,1)'),
	first: 'begin',
	pnj: { image: false, gfx: 'yakuzi', frame: 'speak', background: '1' },
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuzi.dialog.port1.begin',
			next: ['welcome', 'quit']
		},
		welcome: {
			id: 'welcome',
			text: 'npc.yakuzi.dialog.port1.welcome',
			next: ['yes', 'leave']
		},
		yes: {
			id: 'yes',
			text: 'npc.yakuzi.dialog.port1.yes',
			next: [],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 2 }],
			special: [{ type: 'useGold', amount: 10000 }]
		},
		quit: {
			id: 'quit',
			text: 'npc.yakuzi.dialog.port1.quit',
			next: []
		}
	},
	links: {
		welcome: { id: 'welcome', text: 'npc.yakuzi.choice.port1.welcome', target: 'welcome' },
		quit: { id: 'quit', text: 'npc.yakuzi.choice.port1.quit', target: 'quit' },
		yes: { id: 'yes', text: 'npc.yakuzi.choice.port1.yes', target: 'yes' },
		leave: { id: 'leave', text: 'npc.yakuzi.choice.port1.leave', target: 'quit' }
	}
});

export const yakuziPortSecondBetDialog = defineDialog({
	id: 'yakuzi_port_second_bet',
	place: PlaceEnum.PORT_DE_PRECHE,
	name: 'npc.yakuzi.names.port2',
	cond: parseCondition('scenario(kabuki,2)+(admin()|swait(kabuki,48))'),
	first: 'begin',
	pnj: { image: false, gfx: 'yakuzi', frame: 'speak', background: '1' },
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuzi.dialog.port2.begin',
			next: ['welcome', 'quit']
		},
		welcome: {
			id: 'welcome',
			text: 'npc.yakuzi.dialog.port2.welcome',
			next: ['give', 'nop', 'lock']
		},
		give: {
			id: 'give',
			text: 'npc.yakuzi.dialog.port2.give',
			next: ['pile', 'face']
		},
		start: {
			id: 'start',
			text: 'npc.yakuzi.dialog.port2.start',
			next: ['end'],
			fast: true
		},
		nop: {
			id: 'nop',
			text: 'npc.yakuzi.dialog.port2.nop',
			next: ['lance']
		},
		lance: {
			id: 'lance',
			text: 'npc.yakuzi.dialog.port2.lance',
			next: ['end'],
			fast: true
		},
		end: {
			id: 'end',
			text: 'npc.yakuzi.dialog.port2.end',
			next: ['reend']
		},
		reend: {
			id: 'reend',
			text: 'npc.yakuzi.dialog.port2.reend',
			next: [],
			fast: true,
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 3 }]
		},
		quit: {
			id: 'quit',
			text: 'npc.yakuzi.dialog.port2.quit',
			next: []
		},
		lock: {
			id: 'lock',
			text: 'npc.yakuzi.dialog.port2.lock',
			next: []
		}
	},
	links: {
		welcome: { id: 'welcome', text: 'npc.yakuzi.choice.port2.welcome', target: 'welcome' },
		quit: { id: 'quit', text: 'npc.yakuzi.choice.port2.quit', target: 'quit' },
		give: { id: 'give', text: 'npc.yakuzi.choice.port2.give', target: 'give' },
		nop: { id: 'nop', text: 'npc.yakuzi.choice.port2.nop', target: 'nop' },
		lock: { id: 'lock', text: 'npc.yakuzi.choice.port2.lock', target: 'lock' },
		pile: { id: 'pile', text: 'npc.yakuzi.choice.port2.pile', target: 'start' },
		face: { id: 'face', text: 'npc.yakuzi.choice.port2.face', target: 'start' },
		lance: { id: 'lance', text: 'npc.yakuzi.choice.port2.lance', target: 'lance' },
		end: { id: 'end', text: 'npc.yakuzi.choice.port2.end', target: 'end' },
		reend: { id: 'reend', text: 'npc.yakuzi.choice.port2.reend', target: 'reend' }
	}
});
