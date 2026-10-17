import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotDinozRole, BotRoleObjective, BotStrategy } from '../../../prisma/index.js';
import {
	getBotCombatEnergyBudget,
	getBotSkillStatePlan,
	prepareBotSkillsForCombat
} from '../../src/Bot/Service/botSkillStrategy.service.js';
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

async function addSkill(dinozId: number, skillId: Skill, state: boolean) {
	await prisma.dinozSkills.create({
		data: {
			dinozId,
			skillId,
			state
		}
	});
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot skill strategy', () => {
	it('does not change skill states without Strategy in 130 Lessons', async () => {
		const user = await createTestUser({
			name: 'NoAmulstBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await addSkill(dinoz.id, Skill.METEORES, false);

		await expect(getBotSkillStatePlan(user.id, dinoz.id, BotStrategy.FIGHTER)).resolves.toEqual([]);
	});

	it('enables expensive activatable skills for fighter bots', async () => {
		const user = await createTestUser({
			name: 'FighterAmulstBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.STRATEGY_IN_130_LESSONS);
		await addSkill(dinoz.id, Skill.METEORES, false);

		await expect(getBotSkillStatePlan(user.id, dinoz.id, BotStrategy.FIGHTER)).resolves.toEqual([
			{
				skillId: Skill.METEORES,
				state: true
			}
		]);

		await expect(prepareBotSkillsForCombat(user.id, dinoz.id, BotStrategy.FIGHTER)).resolves.toBe(1);

		const updated = await prisma.dinozSkills.findUniqueOrThrow({
			where: {
				skillId_dinozId: {
					dinozId: dinoz.id,
					skillId: Skill.METEORES
				}
			}
		});
		expect(updated.state).toBe(true);
	});

	it('keeps cheap skills but disables expensive ones for gatherer bots', async () => {
		const user = await createTestUser({
			name: 'GathererAmulstBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.STRATEGY_IN_130_LESSONS);
		await addSkill(dinoz.id, Skill.METEORES, true);
		await addSkill(dinoz.id, Skill.BENEDICTION, false);

		const plan = await getBotSkillStatePlan(user.id, dinoz.id, BotStrategy.GATHERER);

		expect(plan).toEqual(
			expect.arrayContaining([
				{
					skillId: Skill.METEORES,
					state: false
				},
				{
					skillId: Skill.BENEDICTION,
					state: true
				}
			])
		);

		await expect(prepareBotSkillsForCombat(user.id, dinoz.id, BotStrategy.GATHERER)).resolves.toBe(2);

		const skills = await prisma.dinozSkills.findMany({
			where: { dinozId: dinoz.id },
			orderBy: { skillId: 'asc' }
		});
		const stateBySkill = new Map(skills.map(skill => [skill.skillId, skill.state]));
		expect(stateBySkill.get(Skill.METEORES)).toBe(false);
		expect(stateBySkill.get(Skill.BENEDICTION)).toBe(true);
	});

	it('uses the Dinoz role over the account strategy when preparing combat skills', async () => {
		const user = await createTestUser({
			name: 'RoleSkillBudgetBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const fighter = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.botDinozMemory.create({
			data: {
				dinozId: fighter.id,
				role: BotDinozRole.FIGHTER
			}
		});
		await addStatus(fighter.id, DinozStatusId.STRATEGY_IN_130_LESSONS);
		await addSkill(fighter.id, Skill.METEORES, false);

		await expect(getBotSkillStatePlan(user.id, fighter.id, BotStrategy.GATHERER)).resolves.toContainEqual({
			skillId: Skill.METEORES,
			state: true
		});
	});

	it('keeps gatherer combat energy conservative even on a fighter account strategy', async () => {
		const user = await createTestUser({
			name: 'GathererSkillBudgetBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const gatherer = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.botDinozMemory.create({
			data: {
				dinozId: gatherer.id,
				role: BotDinozRole.GATHERER
			}
		});
		await addStatus(gatherer.id, DinozStatusId.STRATEGY_IN_130_LESSONS);
		await addSkill(gatherer.id, Skill.METEORES, true);

		await expect(getBotSkillStatePlan(user.id, gatherer.id, BotStrategy.FIGHTER)).resolves.toContainEqual({
			skillId: Skill.METEORES,
			state: false
		});
	});

	it('raises explorer preparation in a place remembered as dangerous', () => {
		expect(
			getBotCombatEnergyBudget(
				BotStrategy.BALANCED,
				BotDinozRole.EXPLORER,
				BotRoleObjective.EXPLORER_DISCOVERY,
				-60
			)
		).toBeGreaterThan(
			getBotCombatEnergyBudget(
				BotStrategy.BALANCED,
				BotDinozRole.EXPLORER,
				BotRoleObjective.EXPLORER_DISCOVERY,
				20
			)
		);
	});

});
