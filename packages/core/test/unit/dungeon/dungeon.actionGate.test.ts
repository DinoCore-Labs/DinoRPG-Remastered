import { describe, expect, it } from 'vitest';

import { evaluateMtDungeonActionGate } from '../../../src/models/dungeon/dungeon.actionGate.js';

const team = [
	{ id: 1, leaderId: null, life: 10, fight: true },
	{ id: 2, leaderId: 1, life: 10, fight: true }
];
describe('MT dungeon: action lock after combat', () => {
	it('allows movement when the whole party still has fight actions', () => {
		expect(evaluateMtDungeonActionGate(team, 1)).toBe('ready');
	});
	it('blocks movement after a fight even if only one follower is exhausted', () => {
		expect(evaluateMtDungeonActionGate([{ ...team[0]!, fight: false }, team[1]!], 1)).toBe('actions-exhausted');
		expect(evaluateMtDungeonActionGate([team[0]!, { ...team[1]!, fight: false }], 1)).toBe('actions-exhausted');
	});
	it('unlocks after Irma has restored all action flags', () => {
		const spent = team.map(m => ({ ...m, fight: false }));
		expect(evaluateMtDungeonActionGate(spent, 1)).toBe('actions-exhausted');
		expect(
			evaluateMtDungeonActionGate(
				spent.map(m => ({ ...m, fight: true })),
				1
			)
		).toBe('ready');
	});
	it('does not unlock an absent or dead party', () => {
		expect(evaluateMtDungeonActionGate([], 1)).toBe('missing-party');
		expect(evaluateMtDungeonActionGate([{ ...team[0]!, life: 0 }, team[1]!], 1)).toBe('ready');
		expect(
			evaluateMtDungeonActionGate(
				team.map(m => ({ ...m, life: 0 })),
				1
			)
		).toBe('party-defeated');
		expect(evaluateMtDungeonActionGate([{ ...team[0]!, leaderId: 2 }, team[1]!], 1)).toBe('missing-party');
	});
});
