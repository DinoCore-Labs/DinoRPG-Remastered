import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { monsterList } from '../../monster/monsterList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const weirdManDialog: DialogDefinition = {
	id: 'weird_man',
	name: 'npc.weirdMan.name',
	place: PlaceEnum.COLLINES_HANTEES,
	cond: parseCondition('!fx(lantrn)'),
	pnj: {
		image: false,
		gfx: 'fou',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.weirdMan.dialog.begin',
			fast: true,
			next: ['hi', 'approach', 'ignore']
		},
		hi: {
			id: 'hi',
			text: 'npc.weirdMan.dialog.hi',
			fast: true,
			next: ['approach', 'ignore', 'run']
		},
		approach: {
			id: 'approach',
			text: 'npc.weirdMan.dialog.approach',
			fast: true,
			next: ['hi', 'ignore', 'run']
		},
		run: {
			id: 'run',
			text: 'npc.weirdMan.dialog.run',
			fast: true,
			next: []
		},
		ignore: {
			id: 'ignore',
			text: 'npc.weirdMan.dialog.ignore',
			fast: true,
			next: ['intro', 'run']
		},
		intro: {
			id: 'intro',
			text: 'npc.weirdMan.dialog.intro',
			fast: false,
			next: ['seenWhat', 'leave']
		},
		leave: {
			id: 'leave',
			text: 'npc.weirdMan.dialog.leave',
			fast: true,
			next: []
		},
		seenWhat: {
			id: 'seenWhat',
			text: 'npc.weirdMan.dialog.seenWhat',
			fast: false,
			next: ['show', 'run']
		},
		show: {
			id: 'show',
			text: 'npc.weirdMan.dialog.show',
			fast: false,
			next: ['fight', 'run']
		},
		fight: {
			id: 'fight',
			name: 'npc.weirdMan.name',
			text: 'npc.weirdMan.dialog.fight',
			fast: true,
			next: [],
			special: [
				{
					type: 'startFight',
					fightId: [monsterList.KORGON]
				}
			]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.weirdMan.dialog.fight',
			fast: true,
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'lantrn'
				}
			]
		}
	},
	links: {
		hi: {
			id: 'hi',
			text: 'npc.weirdMan.link.hi',
			target: 'hi'
		},
		approach: {
			id: 'approach',
			text: 'npc.weirdMan.link.approach',
			target: 'approach'
		},
		ignore: {
			id: 'ignore',
			text: 'npc.weirdMan.link.ignore',
			target: 'ignore'
		},
		run: {
			id: 'run',
			text: 'npc.weirdMan.link.run',
			target: 'run'
		},
		intro: {
			id: 'intro',
			text: 'npc.weirdMan.link.intro',
			target: 'intro'
		},
		seenWhat: {
			id: 'seenWhat',
			text: 'npc.weirdMan.link.seenWhat',
			target: 'seenWhat'
		},
		leave: {
			id: 'leave',
			text: 'npc.weirdMan.link.leave',
			target: 'leave'
		},
		show: {
			id: 'show',
			text: 'npc.weirdMan.link.show',
			target: 'show'
		},
		fight: {
			id: 'fight',
			text: 'npc.weirdMan.link.fight',
			target: 'fight'
		}
	}
};
