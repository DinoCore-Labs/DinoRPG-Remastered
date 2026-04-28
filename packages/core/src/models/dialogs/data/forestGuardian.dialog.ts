import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

export const forestGuardianDialog = defineDialog({
	id: 'forest_guardian',
	place: PlaceEnum.PORTE_DE_SYLVENOIRE,
	name: 'npc.forestGuardian.name',
	cond: { type: 'true' },
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'arbre',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.forestGuardian.dialog.begin',
			fast: true,
			next: ['missions', 'shake']
		},
		shake: {
			id: 'shake',
			text: 'npc.forestGuardian.dialog.shake',
			fast: true,
			next: ['item']
		},
		item: {
			id: 'item',
			text: 'npc.forestGuardian.dialog.item',
			fast: true,
			next: ['missions'],
			effects: [{ type: 'effect', effect: 'grdmis' }]
		},
		missions: {
			id: 'missions',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'arbre' }]
		}
	},
	links: {
		missions: {
			id: 'missions',
			text: 'npc.forestGuardian.choice.missions',
			cond: condition('fx(grdmis)')
		},
		shake: {
			id: 'shake',
			text: 'npc.forestGuardian.choice.shake',
			cond: condition('!fx(grdmis)')
		},
		item: {
			id: 'item',
			text: 'npc.forestGuardian.choice.item'
		}
	}
});
