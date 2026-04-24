import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';
import type { DialogPnj } from '../dialog.js';

const venerablePnj: DialogPnj = {
	image: false,
	gfx: 'vener',
	frame: 'speak',
	background: '1'
};

export const venerableDialog = defineDialog({
	id: 'venerable',
	place: PlaceEnum.REPAIRE_DU_VENERABLE,
	name: 'npc.venerable.name',
	pnj: venerablePnj,
	cond: parseCondition('!(scenario(nimbao,14+)+scenario(nimbao,41-))'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.venerable.dialog.begin',
			next: ['moi', 'moi2', 'bye']
		},

		bye: {
			id: 'bye',
			text: 'npc.venerable.dialog.bye',
			fast: true
		},

		moi: {
			id: 'moi',
			text: 'npc.venerable.dialog.moi',
			next: ['perdu', 'chasse', 'deal', 'korgon', 'auto']
		},

		korgon: {
			id: 'korgon',
			text: 'npc.venerable.dialog.korgon',
			next: ['next0', 'next1']
		},

		next1: {
			id: 'next1',
			text: 'npc.venerable.dialog.next1',
			next: ['next2'],
			effects: [{ type: 'effect', effect: 'vmem' }]
		},

		fight: {
			id: 'fight',
			text: '',
			special: [{ type: 'startFight', fightId: [bossList.VENERABLE] }]
		},

		fight_win: {
			id: 'fight_win',
			text: 'npc.venerable.dialog.fight',
			effects: [
				{ type: 'collection', collection: 'vener' },
				{ type: 'effect', effect: 'vmem' },
				{ type: 'effect', effect: 'vkill' }
			]
		},

		moi2: {
			id: 'moi2',
			text: 'npc.venerable.dialog.moi2',
			next: ['question']
		},

		question: {
			id: 'question',
			text: 'npc.venerable.dialog.question',
			next: ['force', 'fight', 'fight2']
		},

		force: {
			id: 'force',
			text: 'npc.venerable.dialog.force',
			effects: [{ type: 'effect', effect: 'fflag' }]
		},

		fight2: {
			id: 'fight2',
			text: 'npc.venerable.dialog.fight2'
		}
	},
	links: {
		moi: {
			id: 'moi',
			text: 'npc.venerable.choice.moi',
			cond: parseCondition('!fx(vmem)')
		},

		moi2: {
			id: 'moi2',
			text: 'npc.venerable.choice.moi2',
			cond: parseCondition('fx(vmem)')
		},

		bye: {
			id: 'bye',
			text: 'npc.venerable.choice.bye'
		},

		perdu: {
			id: 'perdu',
			text: 'npc.venerable.choice.perdu',
			target: 'fight'
		},

		chasse: {
			id: 'chasse',
			text: 'npc.venerable.choice.chasse',
			target: 'fight'
		},

		deal: {
			id: 'deal',
			text: 'npc.venerable.choice.deal',
			target: 'fight'
		},

		korgon: {
			id: 'korgon',
			text: 'npc.venerable.choice.korgon'
		},

		auto: {
			id: 'auto',
			text: 'npc.venerable.choice.auto',
			target: 'fight'
		},

		next0: {
			id: 'next0',
			text: 'npc.venerable.choice.next0',
			target: 'fight'
		},

		next1: {
			id: 'next1',
			text: 'npc.venerable.choice.next1'
		},

		next2: {
			id: 'next2',
			text: 'npc.venerable.choice.next2',
			target: 'question'
		},

		question: {
			id: 'question',
			text: 'npc.venerable.choice.question'
		},

		force: {
			id: 'force',
			text: 'npc.venerable.choice.force'
		},

		fight: {
			id: 'fight',
			text: 'npc.venerable.choice.fight',
			cond: parseCondition('!fx(vkill)')
		},

		fight2: {
			id: 'fight2',
			text: 'npc.venerable.choice.fight2',
			cond: parseCondition('fx(vkill)')
		}
	}
});

export const venerableHurtDialog = defineDialog({
	id: 'venerable_hurt',
	place: PlaceEnum.REPAIRE_DU_VENERABLE,
	name: 'npc.venerable.name',
	pnj: {
		...venerablePnj,
		frame: 'hurt'
	},
	cond: parseCondition('scenario(nimbao,14+)+scenario(nimbao,41-)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.venerableHurt.dialog.begin',
			next: ['ok', 'ko', 'ko2', 'force2']
		},

		ok: {
			id: 'ok',
			text: 'npc.venerableHurt.dialog.ok',
			fast: true
		},

		ko: {
			id: 'ko',
			text: 'npc.venerableHurt.dialog.ko',
			next: ['comb']
		},

		comb: {
			id: 'comb',
			text: '',
			special: [{ type: 'startFight', fightId: [bossList.VENERABLE] }]
		},

		comb_win: {
			id: 'comb_win',
			text: 'npc.venerableHurt.dialog.comb',
			effects: [
				{ type: 'collection', collection: 'vener' },
				{ type: 'effect', effect: 'vmem' },
				{ type: 'effect', effect: 'vkill' }
			]
		},

		force2: {
			id: 'force2',
			text: 'npc.venerableHurt.dialog.force2',
			effects: [{ type: 'effect', effect: 'fflag' }]
		},

		ko2: {
			id: 'ko2',
			text: 'npc.venerableHurt.dialog.ko2'
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'npc.venerableHurt.choice.ok'
		},

		ko: {
			id: 'ko',
			text: 'npc.venerableHurt.choice.ko',
			cond: parseCondition('!fx(vmem)')
		},

		ko2: {
			id: 'ko2',
			text: 'npc.venerableHurt.choice.ko2',
			cond: parseCondition('fx(vmem)')
		},

		force2: {
			id: 'force2',
			text: 'npc.venerableHurt.choice.force2'
		},

		comb: {
			id: 'comb',
			text: 'npc.venerableHurt.choice.comb',
			cond: parseCondition('!fx(vkill)')
		}
	}
});
