import { beforeEach, describe, expect, it } from 'vitest';

import { BotDinozRole, BotRoleObjective } from '../../../prisma/index.js';
import { getOrAssignBotRoleObjective } from '../../src/Bot/Service/botRoleObjective.service.js';
import { clearBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

async function createBotDinozWithRole(name: string, role: BotDinozRole) {
	const user = await createTestUser({
		name,
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
			role
		}
	});
	return { user, dinoz };
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot role objectives', () => {
	it('keeps fighter power as the persistent fighter objective', async () => {
		const { user, dinoz } = await createBotDinozWithRole('FighterObjectiveBot', BotDinozRole.FIGHTER);

		await expect(getOrAssignBotRoleObjective(user.id, dinoz.id)).resolves.toBe(BotRoleObjective.FIGHTER_POWER);
		await expect(getOrAssignBotRoleObjective(user.id, dinoz.id)).resolves.toBe(BotRoleObjective.FIGHTER_POWER);
	});

	it('pursues Marchand before switching a gatherer to harvesting specialization', async () => {
		const { user, dinoz } = await createBotDinozWithRole('GathererObjectiveBot', BotDinozRole.GATHERER);

		await expect(getOrAssignBotRoleObjective(user.id, dinoz.id)).resolves.toBe(BotRoleObjective.GATHERER_MERCHANT);

		await prisma.user.update({
			where: { id: user.id },
			data: { merchant: true }
		});

		await expect(getOrAssignBotRoleObjective(user.id, dinoz.id)).resolves.toBe(BotRoleObjective.GATHERER_HARVEST);
	});

	it('keeps discovery as the explorer objective', async () => {
		const { user, dinoz } = await createBotDinozWithRole('ExplorerObjectiveBot', BotDinozRole.EXPLORER);

		await expect(getOrAssignBotRoleObjective(user.id, dinoz.id)).resolves.toBe(BotRoleObjective.EXPLORER_DISCOVERY);
	});

	it('preserves the strategic objective when a progression chapter is cleared', async () => {
		const { user, dinoz } = await createBotDinozWithRole('ObjectivePersistenceBot', BotDinozRole.GATHERER);

		await getOrAssignBotRoleObjective(user.id, dinoz.id);
		await clearBotProgressionGoal(dinoz.id);

		const memory = await prisma.botDinozMemory.findUniqueOrThrow({
			where: { dinozId: dinoz.id }
		});
		expect(memory.objective).toBe(BotRoleObjective.GATHERER_MERCHANT);
	});
});
