import type { Condition } from '@dinorpg/core/models/conditions/conditions.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Ingredient, ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import { describe, expect, it } from 'vitest';

import { Role } from '../../../prisma/index.js';
import type { DialogContext } from '../../src/Dialog/Controller/dialog.context.js';
import { checkDialogCondition } from '../../src/utils/conditions/checkDialogCondition.js';

const BURGER_ID = itemList[Item.CLOUD_BURGER].itemId;

const MEROU_ID = ingredientList[Ingredient.MEROU_LUJIDANE].ingredientId;

const DINOVILLE_KEY = placeListv2[PlaceEnum.DINOVILLE].name;

function createContext(): DialogContext {
	return {
		user: {
			id: 'user-1',
			role: Role.PLAYER,
			lang: 'fr',
			gold: 1000,
			shopKeeper: false,
			scenarios: new Map([
				[
					'star',
					{
						progression: 6,
						tracking: 2
					}
				]
			]),
			items: new Map([[BURGER_ID, 2]]),
			allDinozEquippedItemIds: new Set([BURGER_ID]),
			allDinozStatusIds: new Set([DinozStatusId.ZORS_GLOVE]),
			ingredients: new Map([[MEROU_ID, 5]]),
			effects: new Set(['custom_effect']),
			tags: new Set(['ready']),
			collections: new Set(['plume']),
			userVars: new Map([['dialog_step', 3]]),
			dinozCount: 2,
			stats: new Map([[StatTracking.P_DAYS, 30]])
		},
		dinoz: {
			id: 1,
			userId: 'user-1',
			placeId: PlaceEnum.DINOVILLE,
			level: 12,
			life: 80,
			maxLife: 100,
			statusIds: new Set([DinozStatusId.BUOY]),
			skillIds: new Set([11308]),
			itemIds: new Set([BURGER_ID]),
			currentMissionKey: 'fish',
			currentMissionProgression: 2,
			completedMissionKeys: new Set(['dog'])
		},
		dialog: {
			id: 'test-dialog',
			place: PlaceEnum.DINOVILLE
		},
		world: {
			activeFeatures: new Set(['starquest'])
		},
		now: new Date(2026, 8, 22, 6, 30)
	};
}

function check(context: DialogContext, condition: Condition) {
	return checkDialogCondition(condition, context);
}

describe('checkDialogCondition', () => {
	it('accepts missing conditions', () => {
		const context = createContext();
		expect(checkDialogCondition(null, context)).toBe(true);
		expect(checkDialogCondition(undefined, context)).toBe(true);
	});

	it('evaluates true and false conditions', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'true'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'false'
			})
		).toBe(false);
	});

	it('evaluates AND, OR and NOT conditions', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'and',
				left: {
					type: 'level',
					value: 10
				},
				right: {
					type: 'not',
					condition: {
						type: 'admin'
					}
				}
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'or',
				left: {
					type: 'admin'
				},
				right: {
					type: 'level',
					value: 12
				}
			})
		).toBe(true);
	});

	it('checks scenario progression with all comparison modes', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'scenario',
				key: 'star',
				progression: 6,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'scenario',
				key: 'star',
				progression: 5,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'scenario',
				key: 'star',
				progression: 7,
				compare: 'lte'
			})
		).toBe(true);
	});

	it('uses progression zero for a missing scenario', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'scenario',
				key: 'unknown',
				progression: 0,
				compare: 'eq'
			})
		).toBe(true);
	});

	it('checks user variables', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'uvar',
				key: 'dialog_step',
				value: 3,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'uvar',
				key: 'missing',
				value: 0,
				compare: 'eq'
			})
		).toBe(true);
	});

	it('checks Dinoz life and level', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'life',
				value: 80,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'life',
				value: 50,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'level',
				value: 12
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'level',
				value: 13
			})
		).toBe(false);
	});

	it('checks the number of owned Dinoz', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'dinoz',
				value: 2
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'dinoz',
				value: 3
			})
		).toBe(false);
	});

	it('checks status and effect conditions', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'status',
				value: DinozStatusId.BUOY
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'effect',
				key: 'bouee'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'effect',
				key: 'custom_effect'
			})
		).toBe(true);
	});

	it('checks userEffect across all player Dinoz', () => {
		const context = createContext();
		/*
		 * ZORS_GLOVE n'est volontairement
		 * pas présent sur le Dinoz actif.
		 */
		expect(context.dinoz.statusIds.has(DinozStatusId.ZORS_GLOVE)).toBe(false);
		expect(
			check(context, {
				type: 'userEffect',
				key: 'gant'
			})
		).toBe(true);
	});

	it('checks collections and tags', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'collection',
				key: 'plume'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'tag',
				key: 'ready'
			})
		).toBe(true);
	});

	it('resolves ingredient keys and checks quantities', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'hasingredient',
				key: 'merou_lujidane',
				qty: 5,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'hasingredient',
				key: 'merou_lujidane',
				qty: 6,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('rejects an unknown ingredient key', () => {
		const context = createContext();
		expect(() =>
			check(context, {
				type: 'hasingredient',
				key: 'unknown_ingredient',
				qty: 1,
				compare: 'gte'
			})
		).toThrow('Unknown ingredient key "unknown_ingredient"');
	});

	it('checks Dinoz position', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'position',
				key: DINOVILLE_KEY
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'position',
				key: 'unknown_place'
			})
		).toBe(false);
	});

	it('resolves equipped item aliases', () => {
		const context = createContext();
		/*
		 * "burger" est le display historique
		 * de CLOUD_BURGER.
		 */
		expect(
			check(context, {
				type: 'equip',
				key: 'burger'
			})
		).toBe(true);
	});

	it('throws for an unknown equipped item key', () => {
		const context = createContext();
		expect(() =>
			check(context, {
				type: 'equip',
				key: 'unknown_item'
			})
		).toThrow('Unknown item key "unknown_item"');
	});

	it('checks numeric skill keys used by dialogs', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'skill',
				key: '11308'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'skill',
				key: '99999'
			})
		).toBe(false);
	});

	it('checks owned objects in inventory', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'hasobject',
				key: 'cloud_burger'
			})
		).toBe(true);
	});

	it('checks objects equipped on another player Dinoz', () => {
		const context = createContext();
		context.user.items.clear();
		expect(
			check(context, {
				type: 'hasobject',
				key: 'burger'
			})
		).toBe(true);
	});

	it('throws for an unknown object key', () => {
		const context = createContext();
		expect(() =>
			check(context, {
				type: 'hasobject',
				key: 'unknown_item'
			})
		).toThrow('Unknown item key "unknown_item"');
	});

	it('checks completed missions', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'mission',
				key: 'dog',
				status: {
					type: 'done'
				}
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'mission',
				key: 'fish',
				status: {
					type: 'done'
				}
			})
		).toBe(false);
	});

	it('checks the current mission and its progression', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'mission',
				key: 'fish',
				status: {
					type: 'current'
				}
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'mission',
				key: 'fish',
				status: {
					type: 'current',
					step: 2
				}
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'mission',
				key: 'fish',
				status: {
					type: 'current',
					step: 3
				}
			})
		).toBe(false);
	});

	it('checks admin roles', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'admin'
			})
		).toBe(false);
		context.user.role = Role.ADMIN;
		expect(
			check(context, {
				type: 'admin'
			})
		).toBe(true);
		context.user.role = Role.SUPER_ADMIN;
		expect(
			check(context, {
				type: 'admin'
			})
		).toBe(true);
	});

	it('checks player age through the time condition', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'time',
				value: 30,
				user: true
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'time',
				value: 31,
				user: true
			})
		).toBe(false);
	});

	it('checks active game features', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'active',
				key: 'starquest'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'active',
				key: 'unknown'
			})
		).toBe(false);
	});

	it('checks exact dialog hour', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'hour',
				value: 6,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'hour',
				value: 7,
				compare: 'eq'
			})
		).toBe(false);
	});

	it('respects gte and lte hour comparisons', () => {
		const context = createContext();
		expect(
			check(context, {
				type: 'hour',
				value: 5,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'hour',
				value: 6,
				compare: 'lte'
			})
		).toBe(true);
		expect(
			check(context, {
				type: 'hour',
				value: 7,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('throws explicitly for unsupported dialog conditions', () => {
		const context = createContext();
		expect(() =>
			check(context, {
				type: 'race',
				key: 'moueffe'
			})
		).toThrow('Dialog condition "race" is not implemented yet');
	});
});
