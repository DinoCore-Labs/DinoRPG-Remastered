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
