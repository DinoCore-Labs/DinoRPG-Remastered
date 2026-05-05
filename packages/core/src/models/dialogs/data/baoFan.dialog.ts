// packages/core/src/models/dialogs/data/baoFan.dialog.ts

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

export const baoFanDialog = defineDialog({
	id: 'bao_fan',
	place: PlaceEnum.BAO_BOB,
	name: 'npc.baoFan.name',
	cond: { type: 'true' },
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'baofan',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.baoFan.dialog.begin',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.baoFan.dialog.ok',
			next: ['wah']
		},
		wah: {
			id: 'wah',
			text: 'npc.baoFan.dialog.wah',
			next: ['yes', 'nothing', 'no']
		},
		yes: {
			id: 'yes',
			text: 'npc.baoFan.dialog.yes',
			next: ['spirit'],
			effects: [{ type: 'effect', effect: 'wcharm' }]
		},
		spirit: {
			id: 'spirit',
			text: 'npc.baoFan.dialog.spirit',
			next: ['thanks']
		},
		thanks: {
			id: 'thanks',
			text: 'npc.baoFan.dialog.thanks',
			next: []
		},
		nothing: {
			id: 'nothing',
			text: 'npc.baoFan.dialog.nothing',
			next: []
		},
		no: {
			id: 'no',
			text: 'npc.baoFan.dialog.no',
			next: []
		}
	},
	links: {
		ok: {
			id: 'ok',
			text: 'npc.baoFan.choice.ok'
		},
		wah: {
			id: 'wah',
			text: 'npc.baoFan.choice.wah'
		},
		yes: {
			id: 'yes',
			text: 'npc.baoFan.choice.yes',
			cond: condition('!fx(wcharm)')
		},
		nothing: {
			id: 'nothing',
			text: 'npc.baoFan.choice.yes',
			cond: condition('fx(wcharm)')
		},
		no: {
			id: 'no',
			text: 'npc.baoFan.choice.no'
		},
		spirit: {
			id: 'spirit',
			text: 'npc.baoFan.choice.spirit'
		},
		thanks: {
			id: 'thanks',
			text: 'npc.baoFan.choice.thanks'
		}
	}
});
