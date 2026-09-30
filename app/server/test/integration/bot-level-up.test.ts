import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { getMaxXp } from '@dinorpg/core/utils/dinozUtils.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';
import { chooseBotLevelUp } from '../../src/Bot/Service/botLevelUp.service.js';
import { resolveDinozLevelUp } from '../../src/Level/Service/learnSkill.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
	vi.restoreAllMocks();
});

describe('bot level up', () => {
	it('chooses a valid skill and resolves the level up through the player rules', async () => {
		const user = await createTestUser({ name: 'LevelBot' });
		const experience = getMaxXp({
			level: 1,
			status: []
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 1,
			experience,
			canRename: false,
			nextUpElementId: ElementType.FIRE,
			nextUpAltElementId: ElementType.WOOD
		});
		await prisma.ranking.update({
			where: { userId: user.id },
			data: {
				dinozCount: 1,
				average: 0
			}
		});

		vi.spyOn(Math, 'random').mockReturnValue(0);

		const choice = await chooseBotLevelUp(dinoz.id, BotStrategy.FIGHTER);

		expect(choice.tryNumber).toBe(1);
		expect(choice.skillIdList).toHaveLength(1);

		await resolveDinozLevelUp({
			userId: user.id,
			dinozId: dinoz.id,
			skillIdList: choice.skillIdList,
			tryNumber: choice.tryNumber
		});

		const updated = await prisma.dinoz.findUniqueOrThrow({
			where: { id: dinoz.id },
			include: { skills: true }
		});

		expect(updated.level).toBe(2);
		expect(updated.skills.some(skill => skill.skillId === choice.skillIdList[0])).toBe(true);
	});
});
