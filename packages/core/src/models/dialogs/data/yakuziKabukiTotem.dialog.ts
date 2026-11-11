import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

// Original MT: DinoRPG/xml/{fr,en,es,de}/dialogs/yakuzi.xml (itotem, kabuki 21-23).
// Intentionally does NOT unlock the island or advance kabuki 19 -> 21.

export const yakuziTotemRewardDialog = defineDialog({
	id: 'yakuzi_totem_reward',
	place: PlaceEnum.ITOTEM,
	name: 'npc.yakuziTotem.name',
	pnj: { image: false, gfx: 'yakuziSerious', frame: 'speak', background: '2' },
	cond: parseCondition('scenario(kabuki,21)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.begin',
			next: ['know']
		},
		know: {
			id: 'know',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.know',
			next: ['start']
		},
		start: {
			id: 'start',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.start',
			next: ['herit']
		},
		herit: {
			id: 'herit',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.herit',
			next: ['parch']
		},
		parch: {
			id: 'parch',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.parch',
			next: ['totem']
		},
		totem: {
			id: 'totem',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.totem',
			next: ['why']
		},
		why: {
			id: 'why',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.why',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.ok',
			next: ['see']
		},
		see: {
			id: 'see',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.see',
			next: ['nice']
		},
		nice: {
			id: 'nice',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.nice',
			next: ['see2']
		},
		see2: {
			id: 'see2',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.see2',
			next: ['end']
		},
		end: {
			id: 'end',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.end',
			next: ['yes', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.no'
		},
		yes: {
			id: 'yes',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_reward.yes',
			effects: [
				{ type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
				{ type: 'scenario', scenario: 'kabuki', phase: 22 }
			]
		}
	},
	links: {
		know: {
			id: 'know',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.know'
		},
		start: {
			id: 'start',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.start'
		},
		herit: {
			id: 'herit',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.herit'
		},
		parch: {
			id: 'parch',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.parch'
		},
		totem: {
			id: 'totem',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.totem'
		},
		why: {
			id: 'why',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.why'
		},
		ok: {
			id: 'ok',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.ok'
		},
		see: {
			id: 'see',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.see'
		},
		nice: {
			id: 'nice',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.nice'
		},
		see2: {
			id: 'see2',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.see2'
		},
		end: {
			id: 'end',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.end'
		},
		yes: {
			id: 'yes',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.yes'
		},
		no: {
			id: 'no',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_reward.no'
		}
	}
});

export const yakuziTotemWaitDialog = defineDialog({
	id: 'yakuzi_totem_wait',
	place: PlaceEnum.ITOTEM,
	name: 'npc.yakuziTotem.name',
	pnj: { image: false, gfx: 'yakuzi', frame: 'speak', background: '2' },
	cond: parseCondition('scenario(kabuki,22)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_wait.begin',
			next: ['egg', 'noegg']
		},
		noegg: {
			id: 'noegg',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_wait.noegg',
			effects: [{ type: 'scenario', scenario: 'kabuki', phase: 23 }]
		},
		egg: {
			id: 'egg',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_wait.egg'
		}
	},
	links: {
		egg: {
			id: 'egg',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_wait.egg',
			cond: parseCondition('utime(100)')
		},
		noegg: {
			id: 'noegg',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_wait.noegg',
			cond: parseCondition('!utime(100)')
		}
	}
});

export const yakuziTotemEggsDialog = defineDialog({
	id: 'yakuzi_totem_eggs',
	place: PlaceEnum.ITOTEM,
	name: 'npc.yakuziTotem.name',
	pnj: { image: false, gfx: 'yakuzi', frame: 'speak', background: '2' },
	cond: parseCondition('scenario(kabuki,23)'),
	first: 'begin',
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.begin',
			next: ['egg', 'noegg', 'maxegg']
		},
		noegg: {
			id: 'noegg',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.noegg'
		},
		egg: {
			id: 'egg',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.egg',
			next: ['buy', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.no'
		},
		buy: {
			id: 'buy',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.buy',
			special: [{ type: 'useGold', amount: 50000 }],
			effects: [
				{ type: 'giveItem', itemId: Item.KABUKI_EGG, count: 1 },
				{ type: 'scenarioDelta', scenario: 'kabegg', delta: 1 },
				{ type: 'scenario', scenario: 'kabuki', phase: 22 }
			]
		},
		maxegg: {
			id: 'maxegg',
			text: 'npc.yakuziTotem.dialog.yakuzi_totem_eggs.maxegg'
		}
	},
	links: {
		egg: {
			id: 'egg',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_eggs.egg',
			cond: parseCondition('scenario(kabegg,1-)+utime(100)')
		},
		noegg: {
			id: 'noegg',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_eggs.noegg',
			cond: parseCondition('scenario(kabegg,1-)+!utime(100)')
		},
		maxegg: {
			id: 'maxegg',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_eggs.maxegg',
			cond: parseCondition('scenario(kabegg,2+)')
		},
		buy: {
			id: 'buy',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_eggs.buy'
		},
		no: {
			id: 'no',
			text: 'npc.yakuziTotem.choice.yakuzi_totem_eggs.no'
		}
	}
});
