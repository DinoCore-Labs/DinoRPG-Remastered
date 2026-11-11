import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { bossList } from '../../monster/bossList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// Generated from original MT yakuzi.xml dialogue blocks #4 and #5.
// Fight progression is intentionally applied ONLY after a confirmed victory.
// MT dynamic Yakuzi escape / Kabuki reinforcement remains a distinct engine task.

export const yakuziForgesDialog = defineDialog({
	id: 'yakuzi_forges',
	place: PlaceEnum.FORGES_DU_GTC,
	name: 'npc.yakuzi.names.chase0',
	cond: parseCondition('scenario(kabuki,3)'),
	first: 'begin',
	pnj: { image: false, gfx: 'yakuziDisguise', frame: 'speak', background: '1' },
	phases: {
		begin: { id: 'begin', text: 'npc.yakuzi.dialog.chase0.begin', next: ['hello'], fast: true },
		hello: { id: 'hello', text: 'npc.yakuzi.dialog.chase0.hello', next: ['block', 'burn'] },
		block: { id: 'block', text: 'npc.yakuzi.dialog.chase0.block', next: ['ready'] },
		ready: {
			id: 'ready',
			text: 'npc.yakuzi.dialog.chase0.ready',
			next: [],
			fast: true,
			special: [{ type: 'startFight', fightId: [bossList.YAKUZI] }]
		},
		burn: { id: 'burn', text: 'npc.yakuzi.dialog.chase0.burn', next: [] },
		ready_win: {
			id: 'ready_win',
			text: 'npc.yakuzi.dialog.chase0.ready',
			next: [],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 4 }]
		}
	},
	links: {
		hello: { id: 'hello', text: 'npc.yakuzi.choice.chase0.hello', target: 'hello' },
		block: { id: 'block', text: 'npc.yakuzi.choice.chase0.block', target: 'block' },
		burn: { id: 'burn', text: 'npc.yakuzi.choice.chase0.burn', target: 'burn' },
		ready: { id: 'ready', text: 'npc.yakuzi.choice.chase0.ready', target: 'ready' }
	}
});

export const yakuziGorgesDialog = defineDialog({
	id: 'yakuzi_gorges',
	place: PlaceEnum.GORGES_PROFONDES,
	name: 'npc.yakuzi.names.chase1',
	cond: parseCondition('scenario(kabuki,4)'),
	first: 'begin',
	pnj: { image: false, gfx: 'yakuziFreeze', frame: 'speak', background: '1' },
	phases: {
		begin: { id: 'begin', text: 'npc.yakuzi.dialog.chase1.begin', next: ['hello'] },
		hello: { id: 'hello', text: 'npc.yakuzi.dialog.chase1.hello', next: ['block', 'help'] },
		block: { id: 'block', text: 'npc.yakuzi.dialog.chase1.block', next: ['fight'] },
		fight: { id: 'fight', text: 'npc.yakuzi.dialog.chase1.fight', next: ['combat'] },
		help: { id: 'help', text: 'npc.yakuzi.dialog.chase1.help', next: [] },
		combat: {
			id: 'combat',
			text: 'npc.yakuzi.dialog.chase1.combat',
			next: [],
			fast: true,
			special: [{ type: 'startFight', fightId: [bossList.YAKUZI] }]
		},
		combat_win: {
			id: 'combat_win',
			text: 'npc.yakuzi.dialog.chase1.combat',
			next: [],
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 5 }]
		}
	},
	links: {
		hello: { id: 'hello', text: 'npc.yakuzi.choice.chase1.hello', target: 'hello' },
		block: { id: 'block', text: 'npc.yakuzi.choice.chase1.block', target: 'block' },
		help: { id: 'help', text: 'npc.yakuzi.choice.chase1.help', target: 'help' },
		fight: { id: 'fight', text: 'npc.yakuzi.choice.chase1.fight', target: 'fight' },
		combat: { id: 'combat', text: 'npc.yakuzi.choice.chase1.combat', target: 'combat' }
	}
});
