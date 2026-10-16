import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	clearBotExplorationTarget,
	getOrAssignBotExplorationTarget
} from '../../src/Bot/Service/botExplorationMemory.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
	vi.restoreAllMocks();
});

describe('bot exploration memory', () => {
	it('keeps the same exploration target until the move is executed', async () => {
		const user = await createTestUser({
			name: 'StickyExplorerBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});

		vi.spyOn(Math, 'random').mockReturnValue(0);
		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20])).resolves.toBe(10);

		vi.spyOn(Math, 'random').mockReturnValue(0.99);
		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20])).resolves.toBe(10);

		const memory = await prisma.botDinozMemory.findUniqueOrThrow({
			where: { dinozId: dinoz.id }
		});
		expect(memory.targetPlaceId).toBe(10);
	});

	it('chooses a new target after the remembered movement is cleared', async () => {
		const user = await createTestUser({
			name: 'ExplorerRetargetBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});

		vi.spyOn(Math, 'random').mockReturnValue(0);
		await getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20]);
		await clearBotExplorationTarget(dinoz.id);

		vi.spyOn(Math, 'random').mockReturnValue(0.99);
		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20])).resolves.toBe(20);
	});

	it('clears an obsolete exploration target when no movement is available', async () => {
		const user = await createTestUser({
			name: 'BlockedExplorerBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz.id,
				targetPlaceId: 10
			}
		});

		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [])).resolves.toBeNull();

		const memory = await prisma.botDinozMemory.findUniqueOrThrow({
			where: { dinozId: dinoz.id }
		});
		expect(memory.targetPlaceId).toBeNull();
	});

	it('chooses an unvisited target before a repeatedly visited one', async () => {
		const user = await createTestUser({
			name: 'ExplorerNoveltyBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.botDinozPlaceMemory.create({
			data: {
				dinozId: dinoz.id,
				placeId: 10,
				visits: 5,
				lastVisitedAt: new Date()
			}
		});

		vi.spyOn(Math, 'random').mockReturnValue(0);

		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20])).resolves.toBe(20);
	});

	it('uses the least recently visited target when visit counts are equal', async () => {
		const user = await createTestUser({
			name: 'ExplorerOldestRouteBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.botDinozPlaceMemory.createMany({
			data: [
				{
					dinozId: dinoz.id,
					placeId: 10,
					visits: 2,
					lastVisitedAt: new Date('2026-01-01T00:00:00.000Z')
				},
				{
					dinozId: dinoz.id,
					placeId: 20,
					visits: 2,
					lastVisitedAt: new Date('2026-10-01T00:00:00.000Z')
				}
			]
		});

		vi.spyOn(Math, 'random').mockReturnValue(0.99);

		await expect(getOrAssignBotExplorationTarget(user.id, dinoz.id, [10, 20])).resolves.toBe(10);
	});

});
