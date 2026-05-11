import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Item } from '../../items/itemList.js';
import {
	MERGUEZ_CARD_GIFT_COUNT,
	MERGUEZ_CARD_REWARD_KEY,
	MERGUEZ_DEFAULT_GIFT_COUNT,
	MERGUEZ_SCENARIO_KEY,
	MERGUEZ_SCENARIO_STEPS
} from '../../scenarios/data/merguezScenario.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

export const merguezSellerDialog = defineDialog({
	id: 'merguez_seller',
	place: PlaceEnum.RUINES_ASHPOUK,
	name: 'npc.merguez.name',
	cond: { type: 'true' },
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'merguez',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.merguez.dialog.begin',
			next: ['ah', 'merguez_step_1', 'merguez_step_2', 'merguez_step_3', 'merguez_step_4']
		},

		ah: {
			id: 'ah',
			text: 'npc.merguez.dialog.ah',
			next: ['ok', 'ok_card']
		},

		ok: {
			id: 'ok',
			text: 'npc.merguez.dialog.ok',
			next: ['thanks'],
			needCheck: false,
			effects: [
				{
					type: 'giveItem',
					itemId: Item.GOBLIN_MERGUEZ,
					count: MERGUEZ_DEFAULT_GIFT_COUNT
				}
			]
		},

		ok_card: {
			id: 'ok_card',
			text: 'npc.merguez.dialog.ok_card',
			next: ['thanks_card'],
			needCheck: false,
			effects: [
				{
					type: 'giveItem',
					itemId: Item.GOBLIN_MERGUEZ,
					count: MERGUEZ_CARD_GIFT_COUNT
				}
			]
		},

		thanks: {
			id: 'thanks',
			text: 'npc.merguez.dialog.thanks',
			next: ['begin_merguez']
		},

		thanks_card: {
			id: 'thanks_card',
			text: 'npc.merguez.dialog.thanks_card',
			next: []
		},

		begin_merguez: {
			id: 'begin_merguez',
			text: 'npc.merguez.dialog.begin_merguez',
			next: [],
			effects: [
				{
					type: 'scenario',
					scenario: MERGUEZ_SCENARIO_KEY,
					phase: MERGUEZ_SCENARIO_STEPS.STARTED
				}
			]
		},

		merguez_step_1: {
			id: 'merguez_step_1',
			text: 'npc.merguez.dialog.merguez_step_1',
			next: []
		},

		merguez_step_2: {
			id: 'merguez_step_2',
			text: 'npc.merguez.dialog.merguez_step_2',
			next: [],
			effects: [
				{
					type: 'scenarioDelta',
					scenario: MERGUEZ_SCENARIO_KEY,
					delta: 1
				}
			]
		},

		merguez_step_3: {
			id: 'merguez_step_3',
			text: 'npc.merguez.dialog.merguez_step_3',
			next: []
		},

		merguez_step_4: {
			id: 'merguez_step_4',
			text: 'npc.merguez.dialog.merguez_step_4',
			next: [],
			effects: [
				{
					type: 'scenarioDelta',
					scenario: MERGUEZ_SCENARIO_KEY,
					delta: 1
				},
				{
					type: 'collection',
					collection: MERGUEZ_CARD_REWARD_KEY
				}
			]
		}
	},
	links: {
		ah: {
			id: 'ah',
			text: 'npc.merguez.choice.ah',
			target: 'ah'
		},

		ok: {
			id: 'ok',
			text: 'npc.merguez.choice.ok',
			target: 'ok',
			cond: parseCondition(`!scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.COMPLETED})`)
		},

		ok_card: {
			id: 'ok_card',
			text: 'npc.merguez.choice.ok',
			target: 'ok_card',
			cond: parseCondition(
				`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.COMPLETED})+collec(${MERGUEZ_CARD_REWARD_KEY})`
			)
		},

		thanks: {
			id: 'thanks',
			text: 'npc.merguez.choice.thanks',
			target: 'thanks'
		},

		thanks_card: {
			id: 'thanks_card',
			text: 'npc.merguez.choice.thanks_card',
			target: 'thanks_card'
		},

		begin_merguez: {
			id: 'begin_merguez',
			text: 'npc.merguez.choice.begin_merguez',
			target: 'begin_merguez',
			cond: parseCondition(`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.NOT_STARTED})`)
		},

		merguez_step_1: {
			id: 'merguez_step_1',
			text: 'npc.merguez.choice.merguez_step_1',
			target: 'merguez_step_1',
			cond: parseCondition(`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.STARTED})`)
		},

		merguez_step_2: {
			id: 'merguez_step_2',
			text: 'npc.merguez.choice.merguez_step_2',
			target: 'merguez_step_2',
			cond: parseCondition(`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.FIRST_REPORT})`)
		},

		merguez_step_3: {
			id: 'merguez_step_3',
			text: 'npc.merguez.choice.merguez_step_3',
			target: 'merguez_step_3',
			cond: parseCondition(`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.FIRST_REPORT_DONE})`)
		},

		merguez_step_4: {
			id: 'merguez_step_4',
			text: 'npc.merguez.choice.merguez_step_4',
			target: 'merguez_step_4',
			cond: parseCondition(`scenario(${MERGUEZ_SCENARIO_KEY},${MERGUEZ_SCENARIO_STEPS.FINAL_REPORT})`)
		}
	}
});
