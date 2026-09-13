import { beforeEach, describe, expect, it } from 'vitest';

import { cleanDatabase } from '../helpers/database.js';
import { createTestUser, TEST_USER_PASSWORD } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('integration factories', () => {
	it('creates a complete test user', async () => {
		const user = await createTestUser({
			name: 'FactoryPlayer'
		});
		expect(user.name).toBe('FactoryPlayer');
		expect(user.profile).not.toBeNull();
		expect(user.ranking).not.toBeNull();
		expect(user.wallets).toHaveLength(2);
		expect(user.wallets).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					type: 'GOLD'
				}),
				expect.objectContaining({
					type: 'TREASURE_TICKET'
				})
			])
		);
		expect(user.scenarios).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					scenarioKey: 'tutorial',
					progression: 0
				})
			])
		);
	});
	it('creates unique users by default', async () => {
		const firstUser = await createTestUser();
		const secondUser = await createTestUser();
		expect(firstUser.id).not.toBe(secondUser.id);
		expect(firstUser.name).not.toBe(secondUser.name);
	});
	it('allows optional relations to be disabled', async () => {
		const user = await createTestUser({
			withProfile: false,
			withRanking: false,
			withWallets: false,
			withTutorial: false
		});
		expect(user.profile).toBeNull();
		expect(user.ranking).toBeNull();
		expect(user.wallets).toEqual([]);
		expect(user.scenarios).toEqual([]);
	});
	it('exports a valid default test password', () => {
		expect(TEST_USER_PASSWORD.length).toBeGreaterThanOrEqual(6);
	});
});
