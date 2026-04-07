import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const strangePterozDialog = defineDialog({
	id: 'strange_pteroz',
	place: PlaceEnum.PENTES_DE_BASALTE,
	name: 'npc.strangePteroz.name',
	pnj: {
		image: false,
		gfx: 'pteroz',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('!collec(pteroz)+level(8)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangePteroz.dialog.begin',
			next: ['fight', 'leave']
		},
		fight: {
			id: 'fight',
			text: '',
			next: [],
			special: [{ type: 'startFight', fightId: [bossList.PTEROZ] }]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.strangePteroz.dialog.fight',
			next: [],
			effects: [{ type: 'collection', collection: 'pteroz' }]
		},
		leave: {
			id: 'leave',
			text: 'npc.strangePteroz.dialog.leave',
			next: []
		}
	},
	links: {
		fight: {
			id: 'fight',
			text: 'npc.strangePteroz.choice.fight',
			target: 'fight'
		},
		leave: {
			id: 'leave',
			text: 'npc.strangePteroz.choice.leave',
			target: 'leave'
		}
	},
	inject: []
});

/*export const strangeHippoDialog = defineDialog({
	id: 'strange_hippo',
	place: PlaceEnum.ILE_WAIKIKI,
	name: 'npc.strangeHippo.name',
	pnj: {
		image: false,
		gfx: 'hippo',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('!collec(hippo)+level(8)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeHippo.dialog.begin',
			next: ['fight', 'leave']
		},
		fight: {
			id: 'fight',
			text: '',
			next: [],
			special: [
				{ type: 'startFight', fightId: [bossList.HIPPOCLAMP] },
				{ type: 'collection', collection: 'hippo' }
			]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.strangeHippo.dialog.fight',
			next: []
		},
		leave: {
			id: 'leave',
			text: 'npc.strangeHippo.dialog.leave',
			next: []
		}
	},
	links: {
		leave: {
			id: 'leave',
			text: 'npc.strangeHippo.choice.leave',
			target: 'leave'
		},
		fight: {
			id: 'fight',
			text: 'npc.strangeHippo.choice.fight',
			target: 'fight'
		}
	},
	inject: []
});

export const strangeRockyDialog = defineDialog({
	id: 'strange_rocky',
	place: PlaceEnum.FORCEBRUT,
	name: 'npc.strangeRocky.name',
	pnj: {
		image: false,
		gfx: 'rocky',
		frame: 'speak',
		background: '1'
	},
	cond: parseCondition('!collec(rocky)+level(13)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.strangeRocky.dialog.begin',
			next: ['touch', 'fight', 'grave', 'leave']
		},
		touch: {
			id: 'touch',
			text: 'npc.strangeRocky.dialog.touch',
			next: []
		},
		fight: {
			id: 'fight',
			text: '',
			next: [],
			special: [
				{ type: 'startFight', fightId: [bossList.ROCKY] },
				{ type: 'collec', collection: 'rocky' }
			]
		},
		fight_win: {
			id: 'fight_win',
			text: 'npc.strangeRocky.dialog.fight',
			next: []
		},
		leave: {
			id: 'leave',
			text: 'npc.strangeRocky.dialog.leave',
			next: []
		}
	},
	links: {
		touch: {
			id: 'touch',
			text: 'npc.strangeRocky.choice.touch',
			target: 'touch'
		},
		fight: {
			id: 'fight',
			text: 'npc.strangeRocky.choice.fight',
			target: 'fight'
		},
		grave: {
			id: 'grave',
			text: 'npc.strangeRocky.choice.grave',
			target: 'fight'
		},
		leave: {
			id: 'leave',
			text: 'npc.strangeRocky.choice.leave',
			target: 'leave'
		}
	},
	inject: []
});*/
