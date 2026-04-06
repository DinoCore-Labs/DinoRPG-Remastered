import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const jovebozeDialog: DialogDefinition = {
	id: 'joveboze',
	name: 'npc.joveboze.name',
	place: PlaceEnum.PORT_DE_PRECHE,
	first: 'begin',
	cond: parseCondition('fx(jvbz)'),
	pnj: {
		image: false,
		gfx: 'joveboze',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.joveboze.dialog.begin',
			fast: false,
			next: ['trad', 'sry']
		},
		trad: {
			id: 'trad',
			text: 'npc.joveboze.dialog.trad',
			fast: true,
			next: []
		},
		sry: {
			id: 'sry',
			text: 'npc.joveboze.dialog.sry',
			fast: false,
			next: ['go', 'trad']
		},
		go: {
			id: 'go',
			text: 'npc.joveboze.dialog.go',
			fast: true,
			next: ['attack', 'back']
		},
		attack: {
			id: 'attack',
			name: 'npc.joveboze.name',
			text: '',
			fast: true,
			next: [],
			special: [
				{
					type: 'startFight',
					fightId: [bossList.RASCAPHANDRE]
				}
			],
			pnj: {
				image: false,
				gfx: 'joveboze',
				frame: 'speak',
				background: 'rasca'
			}
		},
		attack_win: {
			id: 'attack_win',
			text: 'npc.joveboze.dialog.attack',
			effects: [
				{
					type: 'noEffect',
					effect: 'jvbz'
				},
				{
					type: 'effect',
					effect: 'rasca'
				}
			],
			next: []
		}
	},
	links: {
		sry: {
			id: 'sry',
			text: 'npc.joveboze.choice.sry',
			target: 'sry'
		},
		trad: {
			id: 'trad',
			text: 'npc.joveboze.choice.trad',
			target: 'trad'
		},
		go: {
			id: 'go',
			text: 'npc.joveboze.choice.go',
			target: 'go'
		},
		attack: {
			id: 'attack',
			text: 'npc.joveboze.choice.attack',
			target: 'attack'
		},
		back: {
			id: 'back',
			text: 'npc.joveboze.choice.back',
			target: 'attack'
		}
	}
};
