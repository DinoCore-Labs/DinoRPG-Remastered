import { PlaceEnum } from '../../enums/PlaceEnum.js';
import { Ingredient } from '../../ingredients/ingredientList.js';
import { Item } from '../../items/itemList.js';
import { JEROME_TRADER_SCENARIO_KEY, JEROME_TRADER_SCENARIO_STEPS } from '../../scenarios/data/jeromeTraderScenario.js';
import { parseCondition } from '../../utils/conditions/parseConditions.js';
import { defineDialog } from '../defineDialog.js';

const REQUIRED_DEVOURER_SEEDS = 100;
const TREASURE_TICKET_REWARD = 800;

/**
 * Premier dialogue de Jérôme K.
 *
 */
export const jeromeKSteppesDialog = defineDialog({
	id: 'jerome_k_steppes',
	place: PlaceEnum.CONFINS_DES_STEPPES,
	name: 'npc.jeromeK.name',
	cond: parseCondition(
		`scenario(${JEROME_TRADER_SCENARIO_KEY},${JEROME_TRADER_SCENARIO_STEPS.NOT_STARTED})+!hasobject(bamboo)`
	),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'trader',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.jeromeK.dialog.steppes.begin',
			next: ['ask']
		},
		ask: {
			id: 'ask',
			text: 'npc.jeromeK.dialog.steppes.ask',
			next: ['ask2']
		},
		ask2: {
			id: 'ask2',
			text: 'npc.jeromeK.dialog.steppes.ask2',
			next: ['ask3']
		},
		ask3: {
			id: 'ask3',
			text: 'npc.jeromeK.dialog.steppes.ask3',
			next: ['deriv']
		},
		deriv: {
			id: 'deriv',
			text: 'npc.jeromeK.dialog.steppes.deriv',
			next: ['deriv2']
		},
		deriv2: {
			id: 'deriv2',
			text: 'npc.jeromeK.dialog.steppes.deriv2',
			next: ['ask4']
		},
		ask4: {
			id: 'ask4',
			text: 'npc.jeromeK.dialog.steppes.ask4',
			next: ['ask5']
		},
		ask5: {
			id: 'ask5',
			text: 'npc.jeromeK.dialog.steppes.ask5',
			next: ['ask6']
		},
		ask6: {
			id: 'ask6',
			text: 'npc.jeromeK.dialog.steppes.ask6',
			next: ['ask7']
		},
		ask7: {
			id: 'ask7',
			text: 'npc.jeromeK.dialog.steppes.ask7',
			next: ['ask8']
		},
		ask8: {
			id: 'ask8',
			text: 'npc.jeromeK.dialog.steppes.ask8',
			next: ['ask9']
		},
		ask9: {
			id: 'ask9',
			text: 'npc.jeromeK.dialog.steppes.ask9',
			next: ['ask10']
		},
		ask10: {
			id: 'ask10',
			text: 'npc.jeromeK.dialog.steppes.ask10',
			next: ['ask11']
		},
		ask11: {
			id: 'ask11',
			text: 'npc.jeromeK.dialog.steppes.ask11',
			next: ['yes', 'no']
		},
		no: {
			id: 'no',
			text: 'npc.jeromeK.dialog.steppes.no',
			next: []
		},
		yes: {
			id: 'yes',
			text: 'npc.jeromeK.dialog.steppes.yes',
			next: ['ok']
		},
		ok: {
			id: 'ok',
			text: 'npc.jeromeK.dialog.steppes.ok',
			next: [],
			special: [
				{
					type: 'useIngredient',
					ingredientId: Ingredient.GRAINE_DE_DEVOREUSE,
					count: REQUIRED_DEVOURER_SEEDS
				}
			],
			effects: [
				{
					type: 'giveItem',
					itemId: Item.BAMBOO_FRIEND,
					count: 1
				},
				{
					type: 'scenario',
					scenario: JEROME_TRADER_SCENARIO_KEY,
					phase: JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED
				}
			]
		}
	},
	links: {
		ask: {
			id: 'ask',
			text: 'npc.jeromeK.choice.steppes.ask',
			target: 'ask'
		},
		ask2: {
			id: 'ask2',
			text: 'npc.jeromeK.choice.steppes.ask2',
			target: 'ask2'
		},
		ask3: {
			id: 'ask3',
			text: 'npc.jeromeK.choice.steppes.ask3',
			target: 'ask3'
		},
		deriv: {
			id: 'deriv',
			text: 'npc.jeromeK.choice.steppes.deriv',
			target: 'deriv'
		},
		deriv2: {
			id: 'deriv2',
			text: 'npc.jeromeK.choice.steppes.deriv2',
			target: 'deriv2'
		},
		ask4: {
			id: 'ask4',
			text: 'npc.jeromeK.choice.steppes.ask4',
			target: 'ask4'
		},
		ask5: {
			id: 'ask5',
			text: 'npc.jeromeK.choice.steppes.ask5',
			target: 'ask5'
		},
		ask6: {
			id: 'ask6',
			text: 'npc.jeromeK.choice.steppes.ask6',
			target: 'ask6'
		},
		ask7: {
			id: 'ask7',
			text: 'npc.jeromeK.choice.steppes.ask7',
			target: 'ask7'
		},
		ask8: {
			id: 'ask8',
			text: 'npc.jeromeK.choice.steppes.ask8',
			target: 'ask8'
		},
		ask9: {
			id: 'ask9',
			text: 'npc.jeromeK.choice.steppes.ask9',
			target: 'ask9'
		},
		ask10: {
			id: 'ask10',
			text: 'npc.jeromeK.choice.steppes.ask10',
			target: 'ask10'
		},
		ask11: {
			id: 'ask11',
			text: 'npc.jeromeK.choice.steppes.ask11',
			target: 'ask11'
		},
		yes: {
			id: 'yes',
			text: 'npc.jeromeK.choice.steppes.yes',
			target: 'yes'
		},
		no: {
			id: 'no',
			text: 'npc.jeromeK.choice.steppes.no',
			target: 'no'
		},
		ok: {
			id: 'ok',
			text: 'npc.jeromeK.choice.steppes.ok',
			target: 'ok',
			cond: parseCondition(`hasingr(${Ingredient.GRAINE_DE_DEVOREUSE},${REQUIRED_DEVOURER_SEEDS}+)`)
		}
	}
});

/**
 * Second dialogue de Jérôme K.
 */
export const jeromeKDinovilleDialog = defineDialog({
	id: 'jerome_k_dinoville',
	place: PlaceEnum.DINOVILLE,
	name: 'npc.jeromeK.name',
	/*
	 * Le PNJ apparaît uniquement après la remise
	 * des 100 Graines de la Dévoreuse.
	 */
	cond: parseCondition(`scenario(${JEROME_TRADER_SCENARIO_KEY},${JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED})`),
	first: 'begin',
	pnj: {
		image: false,
		gfx: 'trader',
		frame: 'speak',
		background: '1'
	},
	phases: {
		begin: {
			id: 'begin',
			text: 'npc.jeromeK.dialog.dinoville.begin',
			next: ['ask']
		},
		ask: {
			id: 'ask',
			text: 'npc.jeromeK.dialog.dinoville.ask',
			next: ['ask2']
		},
		ask2: {
			id: 'ask2',
			text: 'npc.jeromeK.dialog.dinoville.ask2',
			next: ['ask3']
		},
		ask3: {
			id: 'ask3',
			text: 'npc.jeromeK.dialog.dinoville.ask3',
			next: ['ask4']
		},
		ask4: {
			id: 'ask4',
			text: 'npc.jeromeK.dialog.dinoville.ask4',
			next: [],
			effects: [
				{
					type: 'giveMoney',
					moneyType: 'TREASURE_TICKET',
					amount: TREASURE_TICKET_REWARD
				},
				{
					type: 'scenario',
					scenario: JEROME_TRADER_SCENARIO_KEY,
					phase: JEROME_TRADER_SCENARIO_STEPS.COMPLETED
				}
			]
		}
	},
	links: {
		ask: {
			id: 'ask',
			text: 'npc.jeromeK.choice.dinoville.ask',
			target: 'ask'
		},
		ask2: {
			id: 'ask2',
			text: 'npc.jeromeK.choice.dinoville.ask2',
			target: 'ask2'
		},
		ask3: {
			id: 'ask3',
			text: 'npc.jeromeK.choice.dinoville.ask3',
			target: 'ask3'
		},
		ask4: {
			id: 'ask4',
			text: 'npc.jeromeK.choice.dinoville.ask4',
			target: 'ask4'
		}
	}
});
