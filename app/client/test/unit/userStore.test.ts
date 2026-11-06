import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { userStore } from '../../src/store/userStore.js';

describe('userStore keepSeedReincarnation', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('initializes with default reincarnation quota values', () => {
		const store = userStore();
		expect(store.keepSeedReincarnationCount).toBe(0);
		expect(store.maxKeepSeedReincarnations).toBe(5);
		expect(store.remainingKeepSeedReincarnations).toBe(5);
		expect(store.hasReachedKeepSeedLimit).toBe(false);
	});

	it('computes remaining count and limit reached correctly when setting user data', () => {
		const store = userStore();
		store.setUser({
			id: 'user-1',
			name: 'TestUser',
			role: 'PLAYER',
			gold: 1000,
			treasureTicket: 0,
			dinoz: [],
			maxDinoz: 18,
			rewards: [],
			discoveredSkills: [],
			clanId: null,
			dojoId: null,
			gameRules: {
				currentVersion: 1,
				acceptedVersion: 1,
				acceptedAt: null,
				required: false
			},
			keepSeedReincarnationCount: 3,
			maxKeepSeedReincarnations: 5
		});

		expect(store.keepSeedReincarnationCount).toBe(3);
		expect(store.maxKeepSeedReincarnations).toBe(5);
		expect(store.remainingKeepSeedReincarnations).toBe(2);
		expect(store.hasReachedKeepSeedLimit).toBe(false);
	});

	it('identifies when keepSeed limit is reached', () => {
		const store = userStore();
		store.setUser({
			id: 'user-1',
			name: 'TestUser',
			role: 'PLAYER',
			gold: 1000,
			treasureTicket: 0,
			dinoz: [],
			maxDinoz: 18,
			rewards: [],
			discoveredSkills: [],
			clanId: null,
			dojoId: null,
			gameRules: {
				currentVersion: 1,
				acceptedVersion: 1,
				acceptedAt: null,
				required: false
			},
			keepSeedReincarnationCount: 5,
			maxKeepSeedReincarnations: 5
		});

		expect(store.remainingKeepSeedReincarnations).toBe(0);
		expect(store.hasReachedKeepSeedLimit).toBe(true);
	});

	it('increments the keepSeed count via incrementKeepSeedReincarnationCount', () => {
		const store = userStore();
		expect(store.keepSeedReincarnationCount).toBe(0);
		store.incrementKeepSeedReincarnationCount();
		expect(store.keepSeedReincarnationCount).toBe(1);
		expect(store.remainingKeepSeedReincarnations).toBe(4);
	});
});
