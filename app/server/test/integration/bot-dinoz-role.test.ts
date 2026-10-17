import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotDinozRole, BotProgressionGoal, BotStrategy } from '../../../prisma/index.js';
import {
	getBotDinozRoleActivityBonus,
	getBotRoleStrategyBonus,
	getOrAssignBotDinozRole
} from '../../src/Bot/Service/botDinozRole.service.js';
import { clearBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot Dinoz strategic roles', () => {
	it('distributes the first three Dinoz across stable complementary roles', async () => {
		const user = await createTestUser({
			name: 'RoleDistributionBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});

		const dinoz = [];
		for (let index = 0; index < 3; index += 1) {
			dinoz.push(
				await createTestDinoz({
					userId: user.id,
					canRename: false
				})
			);
		}

		await expect(getOrAssignBotDinozRole(user.id, dinoz[0].id)).resolves.toBe(BotDinozRole.FIGHTER);
		await expect(getOrAssignBotDinozRole(user.id, dinoz[1].id)).resolves.toBe(BotDinozRole.GATHERER);
		await expect(getOrAssignBotDinozRole(user.id, dinoz[2].id)).resolves.toBe(BotDinozRole.EXPLORER);

		await expect(getOrAssignBotDinozRole(user.id, dinoz[0].id)).resolves.toBe(BotDinozRole.FIGHTER);
	});

	it('preserves a Dinoz role when its progression goal is cleared', async () => {
		const user = await createTestUser({
			name: 'RoleMemoryBot',
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

		await expect(getOrAssignBotDinozRole(user.id, dinoz.id)).resolves.toBe(BotDinozRole.FIGHTER);

		await prisma.botDinozMemory.update({
			where: { dinozId: dinoz.id },
			data: { goal: BotProgressionGoal.SHAMAN_STRATEGY }
		});
		await clearBotProgressionGoal(dinoz.id);

		const memory = await prisma.botDinozMemory.findUniqueOrThrow({
			where: { dinozId: dinoz.id }
		});
		expect(memory.goal).toBeNull();
		expect(memory.role).toBe(BotDinozRole.FIGHTER);
	});

	it('biases activities toward the assigned role', () => {
		expect(getBotDinozRoleActivityBonus(BotDinozRole.FIGHTER, Action.FIGHT)).toBeGreaterThan(0);
		expect(getBotDinozRoleActivityBonus(BotDinozRole.GATHERER, Action.SEEK)).toBeGreaterThan(0);
		expect(getBotDinozRoleActivityBonus(BotDinozRole.EXPLORER, 'move')).toBeGreaterThan(0);

		expect(getBotDinozRoleActivityBonus(BotDinozRole.FIGHTER, Action.SEEK)).toBe(0);
		expect(getBotDinozRoleActivityBonus(BotDinozRole.GATHERER, Action.FIGHT)).toBe(0);
	});

	it('biases roster composition toward the account strategy without removing role diversity', async () => {
		const user = await createTestUser({
			name: 'FighterRosterBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		await prisma.botProfile.create({
			data: {
				userId: user.id,
				strategy: BotStrategy.FIGHTER
			}
		});

		const dinoz = [];
		for (let index = 0; index < 7; index += 1) {
			dinoz.push(
				await createTestDinoz({
					userId: user.id,
					canRename: false
				})
			);
		}

		const roles = [];
		for (const member of dinoz) {
			roles.push(await getOrAssignBotDinozRole(user.id, member.id));
		}

		expect(roles.filter(role => role === BotDinozRole.FIGHTER)).toHaveLength(3);
		expect(roles.filter(role => role === BotDinozRole.GATHERER)).toHaveLength(2);
		expect(roles.filter(role => role === BotDinozRole.EXPLORER)).toHaveLength(2);
	});

	it('maps each global strategy to its matching preferred Dinoz role', () => {
		expect(getBotRoleStrategyBonus(BotStrategy.FIGHTER, BotDinozRole.FIGHTER)).toBeGreaterThan(0);
		expect(getBotRoleStrategyBonus(BotStrategy.GATHERER, BotDinozRole.GATHERER)).toBeGreaterThan(0);
		expect(getBotRoleStrategyBonus(BotStrategy.EXPLORER, BotDinozRole.EXPLORER)).toBeGreaterThan(0);
		expect(getBotRoleStrategyBonus(BotStrategy.BALANCED, BotDinozRole.FIGHTER)).toBe(0);
	});

});
