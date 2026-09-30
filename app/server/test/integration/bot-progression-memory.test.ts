import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotProgressionGoal } from '../../../prisma/index.js';
import { getOrAssignBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

async function addStatus(dinozId: number, statusId: DinozStatusId) {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

async function createBotWithDinoz(name: string) {
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
	return { user, dinoz };
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot progression memory', () => {
	it('keeps Shaman Mou as the medium-term goal until amulst is obtained', async () => {
		const { user, dinoz } = await createBotWithDinoz('MemoryShamanBot');

		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBe(
			BotProgressionGoal.SHAMAN_STRATEGY
		);
		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBe(
			BotProgressionGoal.SHAMAN_STRATEGY
		);

		const memory = await prisma.botDinozMemory.findUniqueOrThrow({
			where: { dinozId: dinoz.id }
		});
		expect(memory.goal).toBe(BotProgressionGoal.SHAMAN_STRATEGY);
	});

	it('advances from Shaman to Forcebrut and then Lantern as goals complete', async () => {
		const { user, dinoz } = await createBotWithDinoz('MemoryProgressionBot');

		await getOrAssignBotProgressionGoal(user.id, dinoz.id);
		await addStatus(dinoz.id, DinozStatusId.STRATEGY_IN_130_LESSONS);

		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBe(
			BotProgressionGoal.FORCEBRUT_TRAINING
		);

		await addStatus(dinoz.id, DinozStatusId.TOURNA);

		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBe(
			BotProgressionGoal.LANTERN
		);
	});

	it('clears progression memory once the current chapters are complete', async () => {
		const { user, dinoz } = await createBotWithDinoz('MemoryCompleteBot');

		for (const statusId of [
			DinozStatusId.STRATEGY_IN_130_LESSONS,
			DinozStatusId.TOURNA,
			DinozStatusId.LANTERN
		]) {
			await addStatus(dinoz.id, statusId);
		}

		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz.id,
				goal: BotProgressionGoal.LANTERN
			}
		});

		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBeNull();
		expect(
			await prisma.botDinozMemory.count({
				where: { dinozId: dinoz.id }
			})
		).toBe(0);
	});
});
