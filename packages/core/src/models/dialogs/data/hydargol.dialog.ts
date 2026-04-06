import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const hydargolDialog: DialogDefinition = {
	id: 'master_hydargol',
	name: 'npc.hydargol.name',
	place: PlaceEnum.CHUTES_MUTANTES,
	cond: parseCondition('admin()|fx(bouee)'),
	pnj: {
		image: false,
		gfx: 'hydargol',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.hydargol.dialog.begin',
			fast: true,
			next: ['talk']
		},
		talk: {
			id: 'talk',
			text: 'npc.hydargol.dialog.talk',
			fast: false,
			next: ['hello', 'help', 'give', 'act']
		},
		help: {
			id: 'help',
			text: 'npc.hydargol.dialog.help',
			fast: false,
			next: ['get']
		},
		get: {
			id: 'get',
			name: 'npc.hydargol.name',
			text: 'npc.hydargol.dialog.get',
			fast: false,
			next: ['where']
		},
		where: {
			id: 'where',
			text: 'npc.hydargol.dialog.where',
			fast: false,
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'zenbro'
				}
			]
		},
		give: {
			id: 'give',
			text: 'npc.hydargol.dialog.give',
			fast: false,
			next: [],
			effects: [
				{
					type: 'noEffect',
					effect: 'nenuph'
				},
				{
					type: 'collection',
					collection: 'perle'
				}
			]
		},
		act: {
			id: 'act',
			text: 'npc.hydargol.dialog.act',
			fast: false,
			next: ['gant']
		},
		gant: {
			id: 'gant',
			text: 'npc.hydargol.dialog.gant',
			fast: false,
			next: ['why']
		},
		why: {
			id: 'why',
			text: 'npc.hydargol.dialog.why',
			fast: false,
			next: ['super']
		},
		super: {
			id: 'super',
			text: 'npc.hydargol.dialog.super',
			fast: false,
			next: ['ok', 'no']
		},
		ok: {
			id: 'ok',
			text: 'npc.hydargol.dialog.ok',
			fast: false,
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'nenuph'
				},
				{
					type: 'effect',
					effect: 'chutes'
				}
			]
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.hydargol.choice.talk',
			target: 'talk'
		},
		hello: {
			id: 'hello',
			text: 'npc.hydargol.choice.hello',
			target: 'talk'
		},
		help: {
			id: 'help',
			text: 'npc.hydargol.choice.help',
			target: 'help',
			cond: parseCondition('!fx(nenuph)+!collec(perle)')
		},
		give: {
			id: 'give',
			text: 'npc.hydargol.choice.give',
			target: 'give',
			cond: parseCondition('fx(nenuph)+!fx(chutes)')
		},
		act: {
			id: 'act',
			text: 'npc.hydargol.choice.act',
			target: 'act',
			cond: parseCondition('collec(perle)')
		},
		get: {
			id: 'get',
			text: 'npc.hydargol.choice.get',
			target: 'get'
		},
		where: {
			id: 'where',
			text: 'npc.hydargol.choice.where',
			target: 'where'
		},
		gant: {
			id: 'gant',
			text: 'npc.hydargol.choice.gant',
			target: 'gant',
			cond: parseCondition('fx(gant)+!fx(chutes)')
		},
		why: {
			id: 'why',
			text: 'npc.hydargol.choice.why',
			target: 'why'
		},
		super: {
			id: 'super',
			text: 'npc.hydargol.choice.super',
			target: 'super'
		},
		ok: {
			id: 'ok',
			text: 'npc.hydargol.choice.ok',
			target: 'ok'
		},
		no: {
			id: 'no',
			text: 'npc.hydargol.choice.no',
			target: 'why'
		}
	}
};
