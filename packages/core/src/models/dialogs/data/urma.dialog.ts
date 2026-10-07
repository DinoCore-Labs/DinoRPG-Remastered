import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { GameEvent } from '../../game/gameEvents.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const urmaDialog = defineDialog({
	id: 'urma',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.urma.name',
	cond: parseCondition(`event(${GameEvent.EASTER})`),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'irma',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.urma.dialog.begin',
			next: ['suivant', 'irma', 'oui2', 'oui3', 'non', 'sold_out']
		},
		suivant: {
			id: 'suivant',
			text: 'npc.urma.dialog.suivant',
			next: ['oeuf']
		},
		irma: {
			id: 'irma',
			text: 'npc.urma.dialog.irma',
			next: ['popo']
		},
		popo: {
			id: 'popo',
			text: 'npc.urma.dialog.popo',
			next: ['bof', 'oeuf']
		},
		oeuf: {
			id: 'oeuf',
			text: 'npc.urma.dialog.oeuf',
			next: ['oui', 'bof']
		},
		oui: {
			id: 'oui',
			text: 'npc.urma.dialog.oui',
			next: ['bye'],
			special: [
				{
					type: 'buyUrmaEggs',
					count: 1
				}
			]
		},
		oui2: {
			id: 'oui2',
			text: 'npc.urma.dialog.oui',
			next: ['bye'],
			special: [
				{
					type: 'buyUrmaEggs',
					count: 1
				}
			]
		},
		oui3: {
			id: 'oui3',
			text: 'npc.urma.dialog.oui3',
			next: ['bye'],
			special: [
				{
					type: 'buyUrmaEggs',
					count: 10
				}
			]
		},
		bye: {
			id: 'bye',
			text: 'npc.urma.dialog.bye',
			next: [],
			fast: true,
			pnj: {
				frame: 'stop'
			}
		},
		bof: {
			id: 'bof',
			text: 'npc.urma.dialog.bof',
			next: [],
			fast: true,
			pnj: {
				frame: 'stop'
			}
		},
		sold_out: {
			id: 'sold_out',
			text: 'npc.urma.dialog.soldOut',
			next: []
		}
	},
	links: {
		suivant: {
			id: 'suivant',
			text: 'npc.urma.choice.suivant',
			target: 'suivant',
			cond: parseCondition('uvar(paques,0)')
		},
		irma: {
			id: 'irma',
			text: 'npc.urma.choice.irma',
			target: 'irma',
			cond: parseCondition('uvar(paques,0)')
		},
		non: {
			id: 'non',
			text: 'npc.urma.choice.non',
			target: 'bof'
		},
		popo: {
			id: 'popo',
			text: 'npc.urma.choice.popo',
			target: 'popo'
		},
		bof: {
			id: 'bof',
			text: 'npc.urma.choice.bof',
			target: 'bof'
		},
		oeuf: {
			id: 'oeuf',
			text: 'npc.urma.choice.oeuf',
			target: 'oeuf'
		},
		oui: {
			id: 'oui',
			text: 'npc.urma.choice.oui',
			target: 'oui',
			confirm: true,
			cond: parseCondition('uvar(paques,0)')
		},
		oui2: {
			id: 'oui2',
			text: 'npc.urma.choice.oui2',
			target: 'oui2',
			confirm: true,
			cond: parseCondition('uvar(paques,1+)+uvar(paques,299-)')
		},
		oui3: {
			id: 'oui3',
			text: 'npc.urma.choice.oui3',
			target: 'oui3',
			confirm: true,
			cond: parseCondition('uvar(paques,1+)+uvar(paques,290-)')
		},
		bye: {
			id: 'bye',
			text: 'npc.urma.choice.bye',
			target: 'bye'
		},
		sold_out: {
			id: 'sold_out',
			text: 'npc.urma.choice.soldOut',
			target: 'sold_out',
			cond: parseCondition('uvar(paques,300+)')
		}
	}
});
