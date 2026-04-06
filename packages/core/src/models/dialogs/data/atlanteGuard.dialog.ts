import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

const c = (source: string) => parseCondition(source);

export const atlanteGuardDialog: DialogDefinition = {
	id: 'atlante_guard',
	name: 'npc.atlanteGuard.name',
	place: PlaceEnum.CHUTES_MUTANTES,
	cond: parseCondition('admin()|fx(bouee)'),
	pnj: {
		image: false,
		gfx: 'garde_atlante',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.atlanteGuard.dialog.begin',
			next: ['rasca', 'thanks']
		},
		rasca: {
			id: 'rasca',
			text: 'npc.atlanteGuard.dialog.rasca',
			next: ['where', 'thanks']
		},
		where: {
			id: 'where',
			text: 'npc.atlanteGuard.dialog.where',
			next: ['call', 'thanks']
		},
		call: {
			id: 'call',
			text: 'npc.atlanteGuard.dialog.call',
			next: ['appeau', 'thanks'],
			effects: [],
			special: []
		},
		appeau: {
			id: 'appeau',
			name: 'npc.atlanteGuard.name',
			text: 'npc.atlanteGuard.dialog.appeau',
			next: ['old', 'thanks']
		},
		old: {
			id: 'old',
			text: 'npc.atlanteGuard.dialog.old',
			fast: false,
			next: ['thanks'],
			effects: [
				{
					type: 'effect',
					effect: 'jvbz'
				}
			]
		},
		thanks: {
			id: 'thanks',
			text: 'npc.atlanteGuard.dialog.thanks',
			fast: false,
			next: []
		}
	},
	links: {
		rasca: {
			id: 'rasca',
			text: 'npc.atlanteGuard.choice.rasca',
			target: 'rasca',
			cond: parseCondition('!fx(rasca)')
		},
		thanks: {
			id: 'thanks',
			text: 'npc.atlanteGuard.choice.thanks',
			target: 'thanks',
			cond: parseCondition('fx(rasca)')
		},
		where: {
			id: 'where',
			text: 'npc.atlanteGuard.choice.where',
			target: 'where'
		},
		call: {
			id: 'call',
			text: 'npc.atlanteGuard.choice.call',
			target: 'call'
		},
		appeau: {
			id: 'appeau',
			text: 'npc.atlanteGuard.choice.appeau',
			target: 'appeau'
		},
		old: {
			id: 'old',
			text: 'npc.atlanteGuard.choice.old',
			target: 'old'
		}
	}
};
