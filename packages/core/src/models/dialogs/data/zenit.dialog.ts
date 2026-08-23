import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';
import type { DialogPnj } from '../dialog.js';

const zenitPnj: DialogPnj = {
	image: false,
	gfx: 'zenit',
	frame: 'stop',
	background: '2'
};

export const maitrZenitDialog = defineDialog({
	id: 'maitrZenit',
	place: PlaceEnum.FORCEBRUT,
	name: 'npc.maitrZenit.name',
	pnj: zenitPnj,
	cond: parseCondition('active(dojo)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.maitrZenit.dialog.begin',
			fast: true,
			next: ['talk', 'talk2', 'aide']
		},
		talk: {
			id: 'talk',
			text: 'npc.maitrZenit.dialog.talk'
		},
		talk2: {
			id: 'talk2',
			text: 'npc.maitrZenit.dialog.talk2',
			next: ['ouep']
		},
		ouep: {
			id: 'ouep',
			text: 'npc.maitrZenit.dialog.ouep',
			next: ['hm', 'hm2', 'hm3']
		},
		insol: {
			id: 'insol',
			text: 'npc.maitrZenit.dialog.insol'
		},
		hm2: {
			id: 'hm2',
			text: 'npc.maitrZenit.dialog.hm2',
			next: ['dojo']
		},
		dojo: {
			id: 'dojo',
			text: 'npc.maitrZenit.dialog.dojo',
			next: ['va']
		},
		va: {
			id: 'va',
			text: 'npc.maitrZenit.dialog.va',
			next: ['bien']
		},
		bien: {
			id: 'bien',
			text: 'npc.maitrZenit.dialog.bien',
			fast: true,
			effects: [{ type: 'scenario', scenario: 'dojo', phase: 1 }]
		},
		aide: {
			id: 'aide',
			text: 'npc.maitrZenit.dialog.aide',
			pnj: { ...zenitPnj, frame: 'aide' },
			next: ['aideurl', 'noaide', 'maitre']
		},
		aideurl: {
			id: 'aideurl',
			text: 'npc.maitrZenit.dialog.aideurl',
			effects: [{ type: 'url', url: '/help' }]
		},
		maitre: {
			id: 'maitre',
			text: 'npc.maitrZenit.dialog.maitre',
			pnj: { ...zenitPnj, frame: 'aide' },
			next: ['dinoz']
		},
		dinoz: {
			id: 'dinoz',
			text: 'npc.maitrZenit.dialog.dinoz',
			pnj: { ...zenitPnj, frame: 'aide' },
			next: ['sustense']
		},
		sustense: {
			id: 'sustense',
			text: 'npc.maitrZenit.dialog.sustense',
			pnj: { ...zenitPnj, frame: 'aide' },
			fast: true
		},
		noaide: {
			id: 'noaide',
			text: 'npc.maitrZenit.dialog.noaide',
			fast: true
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.maitrZenit.choice.talk',
			cond: parseCondition('scenario(dojo,0)')
		},
		talk2: {
			id: 'talk2',
			text: 'npc.maitrZenit.choice.talk2',
			cond: parseCondition('scenario(dojo,0)')
		},
		ouep: {
			id: 'ouep',
			text: 'npc.maitrZenit.choice.ouep'
		},
		hm: {
			id: 'hm',
			text: 'npc.maitrZenit.choice.hm',
			target: 'insol'
		},
		hm2: {
			id: 'hm2',
			text: 'npc.maitrZenit.choice.hm2'
		},
		hm3: {
			id: 'hm3',
			text: 'npc.maitrZenit.choice.hm3',
			target: 'insol'
		},
		dojo: {
			id: 'dojo',
			text: 'npc.maitrZenit.choice.dojo'
		},
		va: {
			id: 'va',
			text: 'npc.maitrZenit.choice.va'
		},
		bien: {
			id: 'bien',
			text: 'npc.maitrZenit.choice.bien'
		},
		aide: {
			id: 'aide',
			text: 'npc.maitrZenit.choice.aide',
			cond: parseCondition('scenario(dojo,2)')
		},
		aideurl: {
			id: 'aideurl',
			text: 'npc.maitrZenit.choice.aideurl'
		},
		noaide: {
			id: 'noaide',
			text: 'npc.maitrZenit.choice.noaide'
		},
		maitre: {
			id: 'maitre',
			text: 'npc.maitrZenit.choice.maitre'
		},
		dinoz: {
			id: 'dinoz',
			text: 'npc.maitrZenit.choice.dinoz'
		},
		sustense: {
			id: 'sustense',
			text: 'npc.maitrZenit.choice.sustense'
		}
	}
});
