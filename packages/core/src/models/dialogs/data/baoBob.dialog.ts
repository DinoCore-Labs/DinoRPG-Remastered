import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

export const baoBobDialog = defineDialog({
	id: 'bao_bob',
	place: PlaceEnum.BAO_BOB,
	name: 'npc.baoBob.name',
	cond: { type: 'true' },
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'bob',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.baoBob.dialog.begin',
			next: ['question', 'nothing']
		},
		question: {
			id: 'question',
			text: 'npc.baoBob.dialog.question',
			next: ['mission', 'quest2', 'quest3', 'quest4', 'no']
		},
		nothing: {
			id: 'nothing',
			text: 'npc.baoBob.dialog.nothing',
			next: []
		},
		mission: {
			id: 'mission',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'bob' }]
		},
		quest2: {
			id: 'quest2',
			text: 'npc.baoBob.dialog.quest2',
			next: ['bye']
		},
		quest3: {
			id: 'quest3',
			text: 'npc.baoBob.dialog.quest3',
			next: ['where', 'bye']
		},
		where: {
			id: 'where',
			text: 'npc.baoBob.dialog.where',
			next: ['where2', 'how', 'danger', 'bye']
		},
		where2: {
			id: 'where2',
			text: 'npc.baoBob.dialog.where2',
			next: ['how', 'danger', 'bye']
		},
		how: {
			id: 'how',
			text: 'npc.baoBob.dialog.how',
			next: ['where2', 'danger', 'concen', 'bye']
		},
		danger: {
			id: 'danger',
			text: 'npc.baoBob.dialog.danger',
			next: ['where2', 'how', 'bye']
		},
		concen: {
			id: 'concen',
			text: 'npc.baoBob.dialog.concen',
			next: ['ok', 'bye']
		},
		ok: {
			id: 'ok',
			text: '',
			next: [],
			actions: {
				url: '/dino/::did::/act/concentrate'
			}
		},
		quest4: {
			id: 'quest4',
			text: 'npc.baoBob.dialog.quest4',
			next: ['noingr', 'ingr', 'bye']
		},
		noingr: {
			id: 'noingr',
			text: 'npc.baoBob.dialog.noingr',
			next: ['bye']
		},
		ingr: {
			id: 'ingr',
			text: 'npc.baoBob.dialog.ingr',
			next: ['potion'],
			effects: [
				{ type: 'noEffect', effect: 'gshop' },
				{ type: 'noEffect', effect: 'ice' },
				{ type: 'noEffect', effect: 'corail' },
				{ type: 'effect', effect: 'potion' },
				{ type: 'scenario', scenario: 'magnet', phase: 9 }
			]
		},
		potion: {
			id: 'potion',
			text: 'npc.baoBob.dialog.potion',
			next: []
		}
	},
	links: {
		question: {
			id: 'question',
			text: 'npc.baoBob.choice.question'
		},
		nothing: {
			id: 'nothing',
			text: 'npc.baoBob.choice.nothing'
		},
		mission: {
			id: 'mission',
			text: 'npc.baoBob.choice.mission'
		},
		no: {
			id: 'no',
			text: 'npc.baoBob.choice.no',
			target: 'nothing'
		},
		quest2: {
			id: 'quest2',
			text: 'npc.baoBob.choice.questQuestion',
			cond: condition('!fx(palmes)')
		},
		quest3: {
			id: 'quest3',
			text: 'npc.baoBob.choice.questQuestion',
			cond: condition('fx(palmes)+!fx(sylkey)')
		},
		quest4: {
			id: 'quest4',
			text: 'npc.baoBob.choice.questQuestion',
			cond: condition('scenario(magnet,8)')
		},
		bye: {
			id: 'bye',
			text: 'npc.baoBob.choice.bye',
			target: 'nothing'
		},
		where: {
			id: 'where',
			text: 'npc.baoBob.choice.where'
		},
		where2: {
			id: 'where2',
			text: 'npc.baoBob.choice.where2'
		},
		how: {
			id: 'how',
			text: 'npc.baoBob.choice.how'
		},
		danger: {
			id: 'danger',
			text: 'npc.baoBob.choice.danger'
		},
		concen: {
			id: 'concen',
			text: 'npc.baoBob.choice.concen'
		},
		ok: {
			id: 'ok',
			text: 'npc.baoBob.choice.ok'
		},
		ingr: {
			id: 'ingr',
			text: 'npc.baoBob.choice.ingr',
			cond: condition('fx(gshop)+fx(ice)+fx(corail)')
		},
		noingr: {
			id: 'noingr',
			text: 'npc.baoBob.choice.ingr',
			cond: condition('!(fx(gshop)+fx(ice)+fx(corail))')
		},
		potion: {
			id: 'potion',
			text: 'npc.baoBob.choice.potion'
		}
	}
});
