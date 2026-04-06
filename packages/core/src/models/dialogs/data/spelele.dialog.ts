import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const speleleologueDialog: DialogDefinition = {
	id: 'speleleologue',
	name: 'npc.speleleologue.name',
	place: PlaceEnum.GORGES_PROFONDES,
	cond: parseCondition('!fx(fspele)'),
	pnj: {
		image: false,
		gfx: 'spelele',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.speleleologue.dialog.begin',
			fast: true,
			next: ['talk']
		},
		talk: {
			id: 'talk',
			text: 'npc.speleleologue.dialog.talk',
			fast: false,
			next: ['gla', 'bye']
		},
		gla: {
			id: 'gla',
			text: 'npc.speleleologue.dialog.gla',
			fast: false,
			next: ['ok', 'bye']
		},
		ok: {
			id: 'ok',
			text: 'npc.speleleologue.dialog.ok',
			fast: false,
			next: ['ok2', 'bye']
		},
		ok2: {
			id: 'ok2',
			text: 'npc.speleleologue.dialog.ok2',
			fast: false,
			next: ['ok3', 'bye']
		},
		ok3: {
			id: 'ok3',
			text: 'npc.speleleologue.dialog.ok3',
			fast: false,
			next: ['congel', 'bye']
		},
		congel: {
			id: 'congel',
			text: 'npc.speleleologue.dialog.congel',
			fast: false,
			next: ['congel2', 'bye']
		},
		congel2: {
			id: 'congel2',
			text: 'npc.speleleologue.dialog.congel2',
			fast: false,
			next: ['again', 'thanks']
		},
		thanks: {
			id: 'thanks',
			text: 'npc.speleleologue.dialog.thanks',
			fast: false,
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'fspele'
				}
			]
		},
		bye: {
			id: 'bye',
			text: 'npc.speleleologue.dialog.bye',
			fast: false,
			next: []
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.speleleologue.choice.talk',
			target: 'talk'
		},
		gla: {
			id: 'gla',
			text: 'npc.speleleologue.choice.gla',
			target: 'gla'
		},
		bye: {
			id: 'bye',
			text: 'npc.speleleologue.choice.bye',
			target: 'bye'
		},
		ok: {
			id: 'ok',
			text: 'npc.speleleologue.choice.ok',
			target: 'ok'
		},
		ok2: {
			id: 'ok2',
			text: 'npc.speleleologue.choice.ok2',
			target: 'ok2'
		},
		ok3: {
			id: 'ok3',
			text: 'npc.speleleologue.choice.ok3',
			target: 'ok3'
		},
		congel: {
			id: 'congel',
			text: 'npc.speleleologue.choice.congel',
			target: 'congel'
		},
		congel2: {
			id: 'congel2',
			text: 'npc.speleleologue.choice.congel2',
			target: 'congel2'
		},
		again: {
			id: 'again',
			text: 'npc.speleleologue.choice.again',
			target: 'congel'
		},
		thanks: {
			id: 'thanks',
			text: 'npc.speleleologue.choice.thanks',
			target: 'thanks'
		}
	}
};

export const speleleologueIceDialog: DialogDefinition = {
	id: 'speleleologue_ice',
	name: 'npc.speleleologue.name',
	place: PlaceEnum.GORGES_PROFONDES,
	cond: parseCondition('scenario(magnet,8)+fx(fspele)+!fx(ice)'),
	pnj: {
		image: false,
		gfx: 'spelele',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.speleleologueIce.dialog.begin',
			fast: false,
			next: ['talk']
		},
		talk: {
			id: 'talk',
			text: 'npc.speleleologueIce.dialog.talk',
			fast: false,
			next: ['next']
		},
		next: {
			id: 'next',
			text: 'npc.speleleologueIce.dialog.next',
			fast: false,
			next: ['prof']
		},
		prof: {
			id: 'prof',
			text: 'npc.speleleologueIce.dialog.prof',
			fast: false,
			next: ['theo']
		},
		theo: {
			id: 'theo',
			text: 'npc.speleleologueIce.dialog.theo',
			fast: false,
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.speleleologueIce.dialog.ok',
			fast: false,
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'ice'
				}
			]
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.speleleologueIce.choice.talk',
			target: 'talk'
		},
		next: {
			id: 'next',
			text: 'npc.speleleologueIce.choice.next',
			target: 'next'
		},
		prof: {
			id: 'prof',
			text: 'npc.speleleologueIce.choice.prof',
			target: 'prof'
		},
		theo: {
			id: 'theo',
			text: 'npc.speleleologueIce.choice.theo',
			target: 'theo'
		},
		ok: {
			id: 'ok',
			text: 'npc.speleleologueIce.choice.ok',
			target: 'ok'
		}
	}
};
