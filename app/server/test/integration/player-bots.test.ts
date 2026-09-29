import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';
import { createBotPlayer } from '../../src/Bot/Service/createBotPlayer.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';

beforeEach(async () => {
	await cleanDatabase();
});

afterEach(async () => {
	await cleanDatabase();
});

describe('player bot creation', () => {
	it('creates a real player account with a bot profile and starter Dinoz', async () => {
		const created = await createBotPlayer({
			name: 'BotFighter',
			strategy: BotStrategy.FIGHTER,
			minDelaySeconds: 90,
			maxDelaySeconds: 300
		});

		const user = await prisma.user.findUniqueOrThrow({
			where: { id: created.user.id },
			include: {
				botProfile: true,
				profile: true,
				ranking: true,
				scenarios: true,
				dinoz: true,
				items: true
			}
		});

		expect(user.role).toBe('PLAYER');
		expect(user.isBot).toBe(true);
		expect(user.profile).not.toBeNull();
		expect(user.ranking).not.toBeNull();
		expect(user.scenarios.some(scenario => scenario.scenarioKey === 'tutorial')).toBe(true);

		expect(user.botProfile).toMatchObject({
			enabled: true,
			strategy: BotStrategy.FIGHTER,
			minDelaySeconds: 90,
			maxDelaySeconds: 300
		});
		expect(user.botProfile?.nextActionAt).toBeInstanceOf(Date);

		expect(user.dinoz).toHaveLength(1);
		expect(user.dinoz[0].name).toBe(`Dinoz-${user.dinoz[0].id}`);
		expect(user.dinoz[0].canRename).toBe(false);
		expect(user.dinoz[0].fight).toBe(true);
		expect(user.dinoz[0].gather).toBe(true);

		expect(user.items.some(item => item.itemId === 1 && item.quantity > 0)).toBe(true);
	});
});
