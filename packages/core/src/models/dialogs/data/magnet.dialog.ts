import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const condition = (value: string) => parseCondition(value);

/**
 * Garde affiché à la Citadelle avant la première
 * audience auprès du Roi des Rockys.
 *
 * Le dialogue reste disponible tant que la progression
 * Magnétite est égale à 0.
 */
export const sGardeMagnetFirstDialog = defineDialog({
	id: 'sGarde_magnet0',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.sGarde.name',
	pnj: {
		image: false,
		gfx: 'sgarde',
		frame: 'speak',
		background: '1'
	},
	cond: condition('scenario(magnet,0)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.sGarde.dialog.magnet0.begin'
		}
	},
	links: {}
});

/**
 * Première audience auprès du Roi des Rockys.
 *
 * Le dialogue est disponible à la progression 1.
 *
 * Refuser :
 * - termine simplement le dialogue ;
 * - conserve magnet = 1.
 *
 * Accepter :
 * - permet de terminer toute la conversation ;
 * - passe magnet de 1 à 2 dans la phase leave.
 */
export const rockyKingMagnetiteIntroDialog = defineDialog({
	id: 'rocky_king_magnet1',
	place: PlaceEnum.CITADELLE_DU_ROI,
	name: 'npc.rockyKing.name',
	cond: condition('scenario(magnet,1)'),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'rocking',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.rockyKing.dialog.magnet1.begin',
			next: ['enter'],
			fast: true
		},

		enter: {
			id: 'enter',
			text: 'npc.rockyKing.dialog.magnet1.enter',
			next: ['events']
		},

		events: {
			id: 'events',
			text: 'npc.rockyKing.dialog.magnet1.events',
			next: ['magnet']
		},

		magnet: {
			id: 'magnet',
			text: 'npc.rockyKing.dialog.magnet1.magnet',
			next: ['magnet2']
		},

		magnet2: {
			id: 'magnet2',
			text: 'npc.rockyKing.dialog.magnet1.magnet2',
			next: ['events2']
		},

		events2: {
			id: 'events2',
			text: 'npc.rockyKing.dialog.magnet1.events2',
			next: ['again', 'me']
		},

		me: {
			id: 'me',
			text: 'npc.rockyKing.dialog.magnet1.me',
			next: ['team']
		},

		team: {
			id: 'team',
			text: 'npc.rockyKing.dialog.magnet1.team',
			next: ['team2']
		},

		team2: {
			id: 'team2',
			text: 'npc.rockyKing.dialog.magnet1.team2',
			next: ['again2', 'accept', 'refuse']
		},

		refuse: {
			id: 'refuse',
			text: 'npc.rockyKing.dialog.magnet1.refuse'
		},

		accept: {
			id: 'accept',
			text: 'npc.rockyKing.dialog.magnet1.accept',
			next: ['leave']
		},

		leave: {
			id: 'leave',
			text: 'npc.rockyKing.dialog.magnet1.leave',
			fast: true,

			/**
			 * La progression ne change qu'après
			 * avoir accepté puis terminé l'audience.
			 */
			effects: [
				{
					type: 'scenario',
					scenario: 'magnet',
					phase: 2
				}
			]
		}
	},

	links: {
		enter: {
			id: 'enter',
			text: 'npc.rockyKing.choice.magnet1.enter'
		},

		events: {
			id: 'events',
			text: 'npc.rockyKing.choice.magnet1.events'
		},

		magnet: {
			id: 'magnet',
			text: 'npc.rockyKing.choice.magnet1.magnet'
		},

		magnet2: {
			id: 'magnet2',
			text: 'npc.rockyKing.choice.magnet1.magnet2'
		},

		events2: {
			id: 'events2',
			text: 'npc.rockyKing.choice.magnet1.events2'
		},

		/**
		 * Retour vers la phase events.
		 */
		again: {
			id: 'again',
			text: 'npc.rockyKing.choice.magnet1.again',
			target: 'events'
		},

		me: {
			id: 'me',
			text: 'npc.rockyKing.choice.magnet1.me'
		},

		team: {
			id: 'team',
			text: 'npc.rockyKing.choice.magnet1.team'
		},

		team2: {
			id: 'team2',
			text: 'npc.rockyKing.choice.magnet1.team2'
		},

		/**
		 * Recommence l'explication à partir
		 * du rapport avec le joueur.
		 */
		again2: {
			id: 'again2',
			text: 'npc.rockyKing.choice.magnet1.again2',
			target: 'me'
		},

		accept: {
			id: 'accept',
			text: 'npc.rockyKing.choice.magnet1.accept'
		},

		refuse: {
			id: 'refuse',
			text: 'npc.rockyKing.choice.magnet1.refuse'
		},

		leave: {
			id: 'leave',
			text: 'npc.rockyKing.choice.magnet1.leave'
		}
	}
});
