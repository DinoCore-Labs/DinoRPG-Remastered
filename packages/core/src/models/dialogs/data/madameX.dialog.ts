import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';


export const madameXDialog = defineDialog({
	id: 'madameX',
	place: PlaceEnum.FORCEBRUT,
	name: 'npc.madameX.name',
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'mmex',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('mission(fish)+mission(dog)'),
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.madameX.dialog.begin',
			next: ['talk']
		},
		talk: {
			id: 'talk',
			text: 'npc.madameX.dialog.talk',
			next: ['talk2']
		},
		talk2: {
			id: 'talk2',
			text: 'npc.madameX.dialog.talk2',
			next: ['mission', 'question']
		},
		mission: {
			id: 'mission',
			text: '',
			next: [],
			special: [{ type: 'missions', group: 'mmex' }]
		},
		question: {
			id: 'question',
			text: 'npc.madameX.dialog.question',
			next: ['question2']
		},
		question2: {
			id: 'question2',
			text: 'npc.madameX.dialog.question2',
			next: ['double']
		},
		double: {
			id: 'double',
			text: 'npc.madameX.dialog.double',
			next: ['double2']
		},
		double2: {
			id: 'double2',
			text: 'npc.madameX.dialog.double2',
			next: ['double3']
		},
		double3: {
			id: 'double3',
			text: 'npc.madameX.dialog.double3',
			next: ['learn', 'already']
		},
		learn: {
			id: 'learn',
			text: 'npc.madameX.dialog.learn',
			next: ['learn1', 'learn2', 'learn3', 'learn4', 'learn5', 'no']
		},
		dolearn: {
			id: 'dolearn',
			text: 'npc.madameX.dialog.dolearn',
			next: []
		},
		no: {
			id: 'no',
			text: 'npc.madameX.dialog.no',
			next: []
		},
		already: {
			id: 'already',
			text: 'npc.madameX.dialog.already',
			next: []
		}
	},
	links: {
		talk: {
			id: 'talk',
			text: 'npc.madameX.choice.talk'
		},
		talk2: {
			id: 'talk2',
			text: 'npc.madameX.choice.talk2'
		},
		mission: {
			id: 'mission',
			text: 'npc.madameX.choice.mission'
		},
		question: {
			id: 'question',
			text: 'npc.madameX.choice.question'
		},
		question2: {
			id: 'question2',
			text: 'npc.madameX.choice.question2'
		},
		double: {
			id: 'double',
			text: 'npc.madameX.choice.double'
		},
		double2: {
			id: 'double2',
			text: 'npc.madameX.choice.double2'
		},
		double3: {
			id: 'double3',
			text: 'npc.madameX.choice.double3'
		},
		learn: {
			id: 'learn',
			text: 'npc.madameX.choice.learn'
		},
		learn1: {
			id: 'learn1',
			text: 'npc.madameX.choice.learn1',
			target: 'dolearn'
		},
		learn2: {
			id: 'learn2',
			text: 'npc.madameX.choice.learn2',
			target: 'dolearn'
		},
		learn3: {
			id: 'learn3',
			text: 'npc.madameX.choice.learn3',
			target: 'dolearn'
		},
		learn4: {
			id: 'learn4',
			text: 'npc.madameX.choice.learn4',
			target: 'dolearn'
		},
		learn5: {
			id: 'learn5',
			text: 'npc.madameX.choice.learn5',
			target: 'dolearn'
		},
		no: {
			id: 'no',
			text: 'npc.madameX.choice.no'
		},
		already: {
			id: 'already',
			text: 'npc.madameX.choice.already'
		}
	}
});
