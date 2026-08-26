import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

export const guideMichelDialog: DialogDefinition = {
	id: 'guide',
	name: 'npc.guideMichel.name',
	place: PlaceEnum.DINOVILLE,

	cond: parseCondition('scenario(intro,0)+(admin()|active(intro))'),
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
			next: ['pub']
		},

		pub: {
			id: 'pub',
			text: 'npc.guideMichel.dialog.pub',
			next: [],
			effects: [
				/*
				 * C'est INTRO qui démarre ici.
				 */
				{
					type: 'scenario',
					scenario: 'intro',
					phase: 1
				},
				/*
				 * Le tutoriel observe ensuite le dialogue.
				 *
				 * Si l'objectif courant est "speak" :
				 * - +100 or
				 * - speak -> move
				 */
				{
					type: 'tutorialEvent',
					event: 'GUIDE_MICHEL_SPOKEN'
				}
			]
		}
	},
	links: {
		pub: {
			id: 'pub',
			text: 'npc.guideMichel.choice.pub',
			target: 'pub'
		}
	}
};
