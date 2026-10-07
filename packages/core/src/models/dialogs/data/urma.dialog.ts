import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { GameEvent } from '../../game/gameEvents.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const urmaDialog = defineDialog({
	id: 'urma',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.urma.name',
	cond: parseCondition(`event(${GameEvent.EASTER})`),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'irma',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.urma.dialog.begin',
			next: []
		}
	},
	links: {}
});
