import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { DialogDefinition } from '../dialog.js';

const c = (source: string) => parseCondition(source);

export const coralMinerDialog: DialogDefinition = {
	id: 'coral_miner',
	first: 'begin',
	cond: c('fx(bouee)'),
	place: PlaceEnum.MINES_DE_CORAIL,
	name: 'npc.coralMiner.name',
	pnj: {
		image: false,
		gfx: 'mineur',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.coralMiner.dialog.begin',
			next: ['yes', 'nothing', 'repair', 'nothing2', 'repair2', 'give', 'no']
		},
		yes: {
			id: 'yes',
			text: 'npc.coralMiner.dialog.yes',
			next: ['thanks'],
			effects: [{ type: 'effect', effect: 'pelle' }]
		},
		nothing: {
			id: 'nothing',
			text: 'npc.coralMiner.dialog.nothing',
			next: ['thanks']
		},
		repair: {
			id: 'repair',
			text: 'npc.coralMiner.dialog.repair',
			next: ['thanks'],
			effects: [
				{ type: 'noEffect', effect: 'brkpel' },
				{ type: 'effect', effect: 'pelle' }
			]
		},
		nothing2: {
			id: 'nothing2',
			text: 'npc.coralMiner.dialog.nothing2',
			next: ['thanks']
		},
		repair2: {
			id: 'repair2',
			text: 'npc.coralMiner.dialog.repair2',
			next: ['thanks'],
			effects: [
				{ type: 'effect', effect: 'pelle2' },
				{ type: 'noEffect', effect: 'brkpe2' }
			]
		},
		thanks: {
			id: 'thanks',
			text: 'npc.coralMiner.dialog.thanks',
			next: []
		},
		no: {
			id: 'no',
			text: 'npc.coralMiner.dialog.no',
			next: ['next']
		},
		next: {
			id: 'next',
			text: 'npc.coralMiner.dialog.next',
			next: ['next2']
		},
		next2: {
			id: 'next2',
			text: 'npc.coralMiner.dialog.next2',
			next: ['next3']
		},
		next3: {
			id: 'next3',
			text: 'npc.coralMiner.dialog.next3',
			next: ['qui']
		},
		qui: {
			id: 'qui',
			text: 'npc.coralMiner.dialog.qui',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.coralMiner.dialog.ok',
			next: []
		},
		give: {
			id: 'give',
			text: 'npc.coralMiner.dialog.give',
			special: [{ type: 'status', status: 'corail' }]
		}
	},
	links: {
		yes: {
			id: 'yes',
			text: 'npc.coralMiner.choice.yes',
			cond: c('!fx(pelle)+!fx(brkpel)+!fx(pelle2)+!fx(brkpe2)')
		},
		nothing: {
			id: 'nothing',
			text: 'npc.coralMiner.choice.nothing',
			cond: c('fx(pelle)')
		},
		repair: {
			id: 'repair',
			text: 'npc.coralMiner.choice.repair',
			cond: c('fx(brkpel)')
		},
		nothing2: {
			id: 'nothing2',
			text: 'npc.coralMiner.choice.nothing2',
			cond: c('fx(pelle2)')
		},
		repair2: {
			id: 'repair2',
			text: 'npc.coralMiner.choice.repair2',
			cond: c('fx(brkpe2)')
		},
		give: {
			id: 'give',
			text: 'npc.coralMiner.choice.give',
			cond: c('scenario(magnet,8)+!fx(corail)')
		},
		no: {
			id: 'no',
			text: 'npc.coralMiner.choice.no'
		},
		thanks: {
			id: 'thanks',
			text: 'npc.coralMiner.choice.thanks'
		},
		next: {
			id: 'next',
			text: 'npc.coralMiner.choice.next'
		},
		next2: {
			id: 'next2',
			text: 'npc.coralMiner.choice.next2'
		},
		next3: {
			id: 'next3',
			text: 'npc.coralMiner.choice.next3'
		},
		qui: {
			id: 'qui',
			text: 'npc.coralMiner.choice.qui'
		},
		ok: {
			id: 'ok',
			text: 'npc.coralMiner.choice.ok'
		}
	}
};
