import { describe, expect, it } from 'vitest';

import type { ConditionsContext } from '../../src/models/conditions/conditionsContext.js';
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
});
