import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const archisageDialog: DialogDefinition = {
	id: 'archisage',
	name: 'npc.archisage.name',
	place: PlaceEnum.DOME_SOULAFLOTTE,
	first: 'begin',
	cond: parseCondition('!fx(gant)'),
	pnj: {
		image: false,
		gfx: 'archis',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.archisage.dialog.begin',
			fast: true,
			next: ['enigm']
		},
		enigm: {
			id: 'enigm',
			text: 'npc.archisage.dialog.enigm',
			fast: false,
			next: ['next']
		},
		next: {
			id: 'next',
			text: 'npc.archisage.dialog.next',
			fast: false,
			next: ['tresor']
		},
		tresor: {
			id: 'tresor',
			text: 'npc.archisage.dialog.tresor',
			fast: false,
			next: ['quoi']
		},
		quoi: {
			id: 'quoi',
			text: 'npc.archisage.dialog.quoi',
			fast: false,
			next: ['show']
		},
		show: {
			id: 'show',
			text: '',
			fast: false,
			next: [],
			special: [
				{
					type: 'startFight',
					fightId: [bossList.ELEMENTAIRE_TERRE]
				}
			]
		},
		show_win: {
			id: 'show_win',
			text: 'npc.archisage.dialog.show',
			fast: false,
			next: [],
			effects: [
				{
					type: 'noEffect',
					effect: 'marais'
				},
				{
					type: 'noEffect',
					effect: 'wpure'
				},
				{
					type: 'noEffect',
					effect: 'basalt'
				},
				{
					type: 'effect',
					effect: 'gant'
				}
			]
		}
	},
	links: {
		enigm: {
			id: 'enigm',
			text: 'npc.archisage.choice.enigm',
			target: 'enigm'
		},
		next: {
			id: 'next',
			text: 'npc.archisage.choice.next',
			target: 'next'
		},
		tresor: {
			id: 'tresor',
			text: 'npc.archisage.choice.tresor',
			target: 'tresor'
		},
		quoi: {
			id: 'quoi',
			text: 'npc.archisage.choice.quoi',
			target: 'quoi'
		},
		show: {
			id: 'show',
			text: 'npc.archisage.choice.show',
			target: 'show',
			cond: parseCondition('fx(marais)+fx(wpure)+fx(basalt)')
		}
	}
};
