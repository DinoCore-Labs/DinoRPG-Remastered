import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getBotLanternProgressionStep } from '../../src/Bot/Service/botProgressionPlanner.service.js';
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

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot lantern progression planner', () => {
	it('targets basalt digging once access prerequisites are satisfied', async () => {
		const user = await createTestUser({
			name: 'LanternPlannerBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 10,
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			canRename: false
		});

		for (const statusId of [
			DinozStatusId.BUOY,
			DinozStatusId.CLIMBING_GEAR,
			DinozStatusId.SHOVEL,
			DinozStatusId.RASCAPHANDRE_DECOY
		]) {
			await addStatus(dinoz.id, statusId);
		}

		const step = await getBotLanternProgressionStep(user.id, dinoz.id);

		expect(step).toEqual({
			type: 'dig',
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			treasureId: 'basalt'
		});
	});

	it('returns to the coral miner when the shovel breaks mid-progression', async () => {
		const user = await createTestUser({
			name: 'BrokenShovelBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 10,
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			canRename: false
		});

		for (const statusId of [
			DinozStatusId.BUOY,
			DinozStatusId.CLIMBING_GEAR,
			DinozStatusId.BROKEN_SHOVEL,
			DinozStatusId.RASCAPHANDRE_DECOY
		]) {
			await addStatus(dinoz.id, statusId);
		}

		const step = await getBotLanternProgressionStep(user.id, dinoz.id);

		expect(step).toEqual({
			type: 'move',
			placeId: PlaceEnum.MINES_DE_CORAIL
		});
	});

	it('resumes with the next missing treasure after the shovel is repaired', async () => {
		const user = await createTestUser({
			name: 'RepairedShovelBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 10,
			placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
			canRename: false
		});

		for (const statusId of [
			DinozStatusId.BUOY,
			DinozStatusId.CLIMBING_GEAR,
			DinozStatusId.SHOVEL,
			DinozStatusId.RASCAPHANDRE_DECOY,
			DinozStatusId.BASALT_SHARD
		]) {
			await addStatus(dinoz.id, statusId);
		}

		const step = await getBotLanternProgressionStep(user.id, dinoz.id);

		expect(step).toEqual({
			type: 'dig',
			placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
			treasureId: 'pure_water'
		});
	});
});
