import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

beforeAll(async () => {
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await server.close();
});

async function addSkill(dinozId: number, skillId: Skill, state = true): Promise<void> {
	await prisma.dinozSkills.create({
		data: {
			dinozId,
			skillId,
			state
		}
	});
}

async function addStrategyStatus(dinozId: number): Promise<void> {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId: DinozStatusId.STRATEGY_IN_130_LESSONS
		}
	});
}

async function getSkillState(dinozId: number, skillId: Skill): Promise<boolean | null> {
	const skill = await prisma.dinozSkills.findUnique({
		where: {
			skillId_dinozId: {
				dinozId,
				skillId
			}
		}
	});
	return skill?.state ?? null;
}

describe('Dinoz skills', () => {
	describe('skill list', () => {
		it('returns owned skills with their details and persisted state', async () => {
			const user = await createTestUser({
				name: 'SkillListOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'SkillListDinoz',
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE, false);
			await addSkill(dinoz.id, Skill.FORCE, true);
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/skills/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json();
			expect(body).toHaveLength(2);
			expect(body).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: Skill.COLERE,
						name: 'Colere',
						activatable: true,
						state: false
					}),
					expect.objectContaining({
						id: Skill.FORCE,
						name: 'Force',
						activatable: false,
						state: true
					})
				])
			);
		});

		it('returns dinozNotFound for an unknown Dinoz', async () => {
			const user = await createTestUser({
				name: 'UnknownSkillDinozOwner',
				withTutorial: false
			});
			const response = await server.inject({
				method: 'GET',
				url: '/api/dinoz/skills/999999',
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozNotFound'
			});
		});

		it('prevents reading another player Dinoz skills', async () => {
			const owner = await createTestUser({
				name: 'SkillRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'SkillReaderAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE);
			const response = await server.inject({
				method: 'GET',
				url: `/api/dinoz/skills/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
		});
	});

	describe('skill state', () => {
		it('allows an activatable known skill to be disabled with the Strategy status', async () => {
			const user = await createTestUser({
				name: 'DisableSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE, true);
			await addStrategyStatus(dinoz.id);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillId: Skill.COLERE,
					skillState: false
				}
			});
			expect(response.statusCode).toBe(200);
			expect(await getSkillState(dinoz.id, Skill.COLERE)).toBe(false);
		});

		it('allows a disabled activatable skill to be enabled again', async () => {
			const user = await createTestUser({
				name: 'EnableSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE, false);
			await addStrategyStatus(dinoz.id);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillId: Skill.COLERE,
					skillState: true
				}
			});
			expect(response.statusCode).toBe(200);
			expect(await getSkillState(dinoz.id, Skill.COLERE)).toBe(true);
		});

		it('requires the Strategy in 130 Lessons status to change a skill state', async () => {
			const user = await createTestUser({
				name: 'NoStrategyStatusOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE, true);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillId: Skill.COLERE,
					skillState: false
				}
			});
			expect(response.statusCode).toBe(400);
			expect(await getSkillState(dinoz.id, Skill.COLERE)).toBe(true);
		});

		it('prevents changing the state of a non-activatable skill', async () => {
			const user = await createTestUser({
				name: 'PassiveSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.FORCE, true);
			await addStrategyStatus(dinoz.id);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillId: Skill.FORCE,
					skillState: false
				}
			});
			expect(response.statusCode).toBe(400);
			expect(await getSkillState(dinoz.id, Skill.FORCE)).toBe(true);
		});

		it('prevents changing the state of a skill the Dinoz does not know', async () => {
			const user = await createTestUser({
				name: 'UnknownKnownSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await addStrategyStatus(dinoz.id);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillId: Skill.COLERE,
					skillState: false
				}
			});
			expect(response.statusCode).toBe(400);
			expect(await getSkillState(dinoz.id, Skill.COLERE)).toBeNull();
		});

		it('prevents another player from changing a Dinoz skill state', async () => {
			const owner = await createTestUser({
				name: 'SkillStateRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'SkillStateAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				canRename: false
			});
			await addSkill(dinoz.id, Skill.COLERE, true);
			await addStrategyStatus(dinoz.id);
			const response = await server.inject({
				method: 'PATCH',
				url: `/api/dinoz/setskillstate/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				},
				payload: {
					skillId: Skill.COLERE,
					skillState: false
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozDoesNotBelongToUser'
			});
			expect(await getSkillState(dinoz.id, Skill.COLERE)).toBe(true);
		});
	});
});
