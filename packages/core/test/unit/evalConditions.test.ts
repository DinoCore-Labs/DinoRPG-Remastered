import { describe, expect, it } from 'vitest';

import type { ConditionsContext } from '../../src/models/conditions/conditionsContext.js';
import { dinozStatusIdByKey } from '../../src/models/dinoz/statusKeyMap.js';
import { evalCondition } from '../../src/models/utils/conditions/evalConditions.js';

function createContext(): ConditionsContext {
	return {
		now: new Date('2026-09-12T12:00:00Z'),
		session: {
			dialogSeed: 12345,
			tags: new Set(),
			currentTab: 'main'
		},
		dinoz: {
			id: 1,
			userId: 'user-1',
			level: 5,
			life: 80,
			placeKey: 'dinoland',
			statusIds: new Set(),
			effectKeys: new Set(),
			skillKeys: new Set(),
			equipKeys: new Set(),
			raceKey: 'moueffe',
			friendKey: null
		},
		user: {
			id: 'user-1',
			isAdmin: false,
			objectKeys: new Set(),
			ingredientQuantities: {},
			collectionKeys: new Set(),
			scenarios: {},
			uvars: {},
			gvars: {},
			dinozCount: 1,
			points: 0
		},
		missions: {
			finishedMissionKeys: new Set()
		},
		world: {
			activeFeatures: new Set(),
			activeConfigs: new Set(),
			completedDungeonKeys: new Set(),
			completedClanActionKeys: new Set(),
			canFightMonsterKeys: new Set()
		}
	};
}

describe('evalCondition', () => {
	it('returns true for a true condition', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'true'
			})
		).toBe(true);
	});

	it('returns false for a false condition', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'false'
			})
		).toBe(false);
	});

	it('checks the Dinoz level', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'level',
				value: 5
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'level',
				value: 6
			})
		).toBe(false);
	});

	it('checks Dinoz life', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'life',
				value: 50,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'life',
				value: 100,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('checks admin status', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'admin'
			})
		).toBe(false);
		context.user.isAdmin = true;
		expect(
			evalCondition(context, {
				type: 'admin'
			})
		).toBe(true);
	});

	it('evaluates AND conditions', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'and',
				left: {
					type: 'level',
					value: 5
				},
				right: {
					type: 'life',
					value: 50,
					compare: 'gte'
				}
			})
		).toBe(true);
	});

	it('evaluates NOT conditions', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'not',
				condition: {
					type: 'admin'
				}
			})
		).toBe(true);
	});

	it('checks scenario progression', () => {
		const context = createContext();
		context.user.scenarios.tutorial = {
			progression: 3
		};
		expect(
			evalCondition(context, {
				type: 'scenario',
				key: 'tutorial',
				progression: 3,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'scenario',
				key: 'tutorial',
				progression: 4,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('uses zero when a scenario does not exist', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'scenario',
				key: 'unknown',
				progression: 0,
				compare: 'eq'
			})
		).toBe(true);
	});

	it('evaluates OR conditions', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'or',
				left: {
					type: 'admin'
				},
				right: {
					type: 'level',
					value: 5
				}
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'or',
				left: {
					type: 'admin'
				},
				right: {
					type: 'level',
					value: 10
				}
			})
		).toBe(false);
	});

	it('checks completed missions', () => {
		const context = createContext();
		context.missions.finishedMissionKeys.add('guide_michel');
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'guide_michel',
				status: {
					type: 'done'
				}
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'unknown_mission',
				status: {
					type: 'done'
				}
			})
		).toBe(false);
	});

	it('checks the current mission', () => {
		const context = createContext();
		context.missions.currentMissionKey = 'guide_michel';
		context.missions.currentMissionStep = 2;
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'guide_michel',
				status: {
					type: 'current'
				}
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'other_mission',
				status: {
					type: 'current'
				}
			})
		).toBe(false);
	});

	it('checks the current mission step', () => {
		const context = createContext();
		context.missions.currentMissionKey = 'guide_michel';
		context.missions.currentMissionStep = 3;
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'guide_michel',
				status: {
					type: 'current',
					step: 3
				}
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'mission',
				key: 'guide_michel',
				status: {
					type: 'current',
					step: 2
				}
			})
		).toBe(false);
	});

	it('checks owned objects', () => {
		const context = createContext();
		context.user.objectKeys.add('potion_irma');
		expect(
			evalCondition(context, {
				type: 'hasobject',
				key: 'potion_irma'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'hasobject',
				key: 'missing_item'
			})
		).toBe(false);
	});

	it('checks ingredient quantities', () => {
		const context = createContext();
		context.user.ingredientQuantities['merou_lujidane'] = 5;
		expect(
			evalCondition(context, {
				type: 'hasingredient',
				key: 'merou_lujidane',
				qty: 5,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'hasingredient',
				key: 'merou_lujidane',
				qty: 3,
				compare: 'gte'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'hasingredient',
				key: 'merou_lujidane',
				qty: 10,
				compare: 'lte'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'hasingredient',
				key: 'unknown',
				qty: 1,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('checks Dinoz skills', () => {
		const context = createContext();
		context.dinoz.skillKeys.add('charge');
		expect(
			evalCondition(context, {
				type: 'skill',
				key: 'charge'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'skill',
				key: 'missing_skill'
			})
		).toBe(false);
	});

	it('checks Dinoz position case-insensitively', () => {
		const context = createContext();
		context.dinoz.placeKey = 'Dinoville';
		expect(
			evalCondition(context, {
				type: 'position',
				key: 'dinoville'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'position',
				key: 'dinoplage'
			})
		).toBe(false);
	});

	it('checks Dinoz effects', () => {
		const context = createContext();
		const buoyStatusId = dinozStatusIdByKey.bouee;
		expect(buoyStatusId).toBeDefined();
		if (buoyStatusId === undefined) {
			throw new Error('Expected bouee status to exist');
		}
		context.dinoz.statusIds.add(buoyStatusId);
		expect(
			evalCondition(context, {
				type: 'effect',
				key: 'bouee'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'effect',
				key: 'unknown_effect'
			})
		).toBe(false);
	});

	it('checks user-wide Dinoz effects', () => {
		const context = createContext();
		const buoyStatusId = dinozStatusIdByKey.bouee;
		expect(buoyStatusId).toBeDefined();
		if (buoyStatusId === undefined) {
			throw new Error('Expected bouee status to exist');
		}
		context.user.allDinozStatusIds = new Set([buoyStatusId]);
		expect(
			evalCondition(context, {
				type: 'userEffect',
				key: 'bouee'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'userEffect',
				key: 'unknown_effect'
			})
		).toBe(false);
	});

	it('checks collection rewards', () => {
		const context = createContext();
		context.user.collectionKeys.add('rocky');
		expect(
			evalCondition(context, {
				type: 'collection',
				key: 'rocky'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'collection',
				key: 'quetzu'
			})
		).toBe(false);
	});

	it('checks user variables', () => {
		const context = createContext();
		context.user.uvars.tutorial_step = 4;
		expect(
			evalCondition(context, {
				type: 'uvar',
				key: 'tutorial_step',
				value: 4,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'uvar',
				key: 'tutorial_step',
				value: 3,
				compare: 'gte'
			})
		).toBe(true);
	});

	it('checks global variables', () => {
		const context = createContext();
		context.user.gvars.event_progress = 10;
		expect(
			evalCondition(context, {
				type: 'gvar',
				key: 'event_progress',
				value: 10,
				compare: 'eq'
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'gvar',
				key: 'event_progress',
				value: 11,
				compare: 'gte'
			})
		).toBe(false);
	});

	it('checks the player Dinoz count', () => {
		const context = createContext();
		context.user.dinozCount = 3;
		expect(
			evalCondition(context, {
				type: 'dinoz',
				value: 3
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'dinoz',
				value: 4
			})
		).toBe(false);
	});

	it('checks scenario waiting time', () => {
		const context = createContext();
		context.now = new Date('2026-09-20T12:00:00Z');
		context.user.scenarios.tutorial = {
			progression: 3,
			updatedAt: new Date('2026-09-20T09:00:00Z')
		};
		expect(
			evalCondition(context, {
				type: 'swait',
				key: 'tutorial',
				hours: 2
			})
		).toBe(true);
		expect(
			evalCondition(context, {
				type: 'swait',
				key: 'tutorial',
				hours: 4
			})
		).toBe(false);
	});

	it('returns false for scenario waiting when the scenario does not exist', () => {
		const context = createContext();
		expect(
			evalCondition(context, {
				type: 'swait',
				key: 'unknown',
				hours: 1
			})
		).toBe(false);
	});
});
