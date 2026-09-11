import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { TUTORIAL_COMPLETED_PROGRESSION } from '../../tutorial/tutorial.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

const c = (condition: string) => parseCondition(condition);

export const guideMichelDialog: DialogDefinition = {
	id: 'guide',
	name: 'npc.guideMichel.name',
	place: PlaceEnum.DINOVILLE,
	pnj: {
		gfx: 'michel',
		image: false,
		frame: 'speak',
		background: '1'
	},
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.guideMichel.dialog.begin',
			fast: true,
			next: ['missions', 'pub', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13']
		},
		missions: {
			id: 'missions',
			text: '',
			next: [],
			special: [
				{
					type: 'missions',
					group: 'michel'
				}
			]
		},
		/*
		 * Introduction / tutoriel
		 */
		pub: {
			id: 'pub',
			text: 'npc.guideMichel.dialog.pub',
			next: [],
			effects: [
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 1
				},
				{
					type: 'tutorialEvent',
					event: 'GUIDE_MICHEL_SPOKEN'
				}
			]
		},
		p1: {
			id: 'p1',
			text: 'npc.guideMichel.dialog.p1',
			next: ['p1b']
		},
		p1b: {
			id: 'p1b',
			text: 'npc.guideMichel.dialog.p1b',
			next: []
		},
		p2: {
			id: 'p2',
			text: 'npc.guideMichel.dialog.p2',
			next: ['p2b']
		},
		p2b: {
			id: 'p2b',
			text: 'npc.guideMichel.dialog.p2b',
			next: []
		},
		p3: {
			id: 'p3',
			text: 'npc.guideMichel.dialog.p3',
			next: ['p3b']
		},
		p3b: {
			id: 'p3b',
			text: 'npc.guideMichel.dialog.p3b',
			next: []
		},
		p4: {
			id: 'p4',
			text: 'npc.guideMichel.dialog.p4',
			next: ['p4b']
		},
		p4b: {
			id: 'p4b',
			text: 'npc.guideMichel.dialog.p4b',
			next: []
		},
		p5: {
			id: 'p5',
			text: 'npc.guideMichel.dialog.p5',
			next: ['p5n', 'p5y']
		},
		p5n: {
			id: 'p5n',
			text: 'npc.guideMichel.dialog.p5n',
			next: []
		},
		p5y: {
			id: 'p5y',
			text: 'npc.guideMichel.dialog.p5y',
			next: ['secret']
		},
		secret: {
			id: 'secret',
			text: 'npc.guideMichel.dialog.secret',
			next: ['secret2']
		},
		secret2: {
			id: 'secret2',
			text: 'npc.guideMichel.dialog.secret2',
			next: [],
			effects: [
				{
					type: 'effect',
					effect: 'plaza'
				}
			]
		},
		p6: {
			id: 'p6',
			text: 'npc.guideMichel.dialog.p6',
			next: []
		},
		p7: {
			id: 'p7',
			text: 'npc.guideMichel.dialog.p7',
			next: []
		},
		p8: {
			id: 'p8',
			text: 'npc.guideMichel.dialog.p8',
			next: []
		},
		p9: {
			id: 'p9',
			text: 'npc.guideMichel.dialog.p9',
			next: []
		},
		p10: {
			id: 'p10',
			text: 'npc.guideMichel.dialog.p10',
			next: []
		},
		p11: {
			id: 'p11',
			text: 'npc.guideMichel.dialog.p11',
			next: []
		},
		p12: {
			id: 'p12',
			text: 'npc.guideMichel.dialog.p12',
			next: []
		},
		p13: {
			id: 'p13',
			text: 'npc.guideMichel.dialog.p13',
			next: []
		}
	},
	links: {
		missions: {
			id: 'missions',
			text: 'npc.guideMichel.choice.missions',
			target: 'missions',
			cond: c(`scenario(tutorial,${TUTORIAL_COMPLETED_PROGRESSION}+)`)
		},
		pub: {
			id: 'pub',
			text: 'npc.guideMichel.choice.pub',
			target: 'pub',
			cond: c('scenario(intro,0)+(admin()|active(intro))')
		},
		p1: {
			id: 'p1',
			text: 'npc.guideMichel.choice.talk',
			target: 'p1',
			cond: c('!level(5)+!scenario(intro,0)')
		},
		p2: {
			id: 'p2',
			text: 'npc.guideMichel.choice.talk',
			target: 'p2',
			cond: c('level(5)+!(fx(bouee)|fx(matesc))')
		},
		p3: {
			id: 'p3',
			text: 'npc.guideMichel.choice.talk',
			target: 'p3',
			cond: c('fx(bouee)+!fx(matesc)')
		},
		p4: {
			id: 'p4',
			text: 'npc.guideMichel.choice.talk',
			target: 'p4',
			cond: c('fx(matesc)+!fx(bouee)')
		},
		p5: {
			id: 'p5',
			text: 'npc.guideMichel.choice.talk',
			target: 'p5',
			cond: c('fx(matesc)+fx(bouee)+!fx(plaza)')
		},
		p6: {
			id: 'p6',
			text: 'npc.guideMichel.choice.talk',
			target: 'p6',
			cond: c('fx(plaza)+!fx(rasca)')
		},
		p7: {
			id: 'p7',
			text: 'npc.guideMichel.choice.talk',
			target: 'p7',
			cond: c('fx(plaza)+fx(rasca)+!fx(gant)')
		},
		p8: {
			id: 'p8',
			text: 'npc.guideMichel.choice.talk',
			target: 'p8',
			cond: c('fx(plaza)+fx(gant)+!fx(chutes)')
		},
		p9: {
			id: 'p9',
			text: 'npc.guideMichel.choice.talk',
			target: 'p9',
			cond: c('fx(plaza)+fx(chutes)+!fx(palmes)')
		},
		p10: {
			id: 'p10',
			text: 'npc.guideMichel.choice.talk',
			target: 'p10',
			cond: c('fx(plaza)+fx(palmes)+!fx(sylkey)')
		},
		p11: {
			id: 'p11',
			text: 'npc.guideMichel.choice.talk',
			target: 'p11',
			cond: c('fx(plaza)+fx(sylkey)+!collec(magnet)')
		},
		p12: {
			id: 'p12',
			text: 'npc.guideMichel.choice.talk',
			target: 'p12',
			cond: c('fx(plaza)+fx(sylkey)+collec(magnet)')
		},
		p13: {
			id: 'p13',
			text: 'npc.guideMichel.choice.lost',
			target: 'p13',
			cond: c('!scenario(intro,0)')
		},
		p1b: {
			id: 'p1b',
			text: 'npc.guideMichel.choice.continue',
			target: 'p1b'
		},
		p2b: {
			id: 'p2b',
			text: 'npc.guideMichel.choice.continue',
			target: 'p2b'
		},
		p3b: {
			id: 'p3b',
			text: 'npc.guideMichel.choice.continue',
			target: 'p3b'
		},
		p4b: {
			id: 'p4b',
			text: 'npc.guideMichel.choice.continue',
			target: 'p4b'
		},
		p5n: {
			id: 'p5n',
			text: 'npc.guideMichel.choice.p5n',
			target: 'p5n'
		},
		p5y: {
			id: 'p5y',
			text: 'npc.guideMichel.choice.p5y',
			target: 'p5y'
		},
		secret: {
			id: 'secret',
			text: 'npc.guideMichel.choice.secret',
			target: 'secret'
		},
		secret2: {
			id: 'secret2',
			text: 'npc.guideMichel.choice.secret2',
			target: 'secret2'
		}
	}
};
