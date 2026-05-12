// packages/core/src/models/dialogs/data/forcebrutOrganizer.dialog.ts

import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

export const forcebrutOrganizerDialog = defineDialog({
	id: 'forcebrut_organizer',
	place: PlaceEnum.FORCEBRUT,
	name: 'npc.forcebrutOrganizer.name',
	cond: condition('!fx(tourna)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'torga',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.forcebrutOrganizer.dialog.begin',
			next: ['yes', 'ok', 'no']
		},
		yes: {
			id: 'yes',
			text: 'npc.forcebrutOrganizer.dialog.yes',
			next: []
		},
		ok: {
			id: 'ok',
			text: 'npc.forcebrutOrganizer.dialog.ok',
			next: [],
			effects: [{ type: 'effect', effect: 'tourna' }]
		},
		no: {
			id: 'no',
			text: 'npc.forcebrutOrganizer.dialog.no',
			next: []
		}
	},
	links: {
		yes: {
			id: 'yes',
			text: 'npc.forcebrutOrganizer.choice.yes',
			cond: condition('!fx(totem)')
		},
		ok: {
			id: 'ok',
			text: 'npc.forcebrutOrganizer.choice.ok',
			cond: condition('fx(totem)')
		},
		no: {
			id: 'no',
			text: 'npc.forcebrutOrganizer.choice.no'
		}
	}
});
