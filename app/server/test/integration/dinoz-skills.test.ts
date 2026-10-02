import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { SkillTreeType } from '@dinorpg/core/models/enums/SkillTreeType.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { getLevelXp } from '@dinorpg/core/utils/dinozUtils.js';
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

async function addStatus(dinozId: number, statusId: DinozStatusId): Promise<void> {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

async function equipDinozCube(dinozId: number): Promise<void> {
	await prisma.dinozItems.create({
		data: {
			dinozId,
			itemId: itemList[Item.DINOZ_CUBE].itemId
		}
	});
}

async function prepareLevelUpRanking(userId: string, level: number): Promise<void> {
	await prisma.ranking.update({
		where: {
			userId
		},
		data: {
			dinozCount: 1,
			points: level,
			average: level
		}
	});
}

async function getTrackingQuantity(userId: string, stat: StatTracking): Promise<number> {
	const tracking = await prisma.userTracking.findUnique({
		where: {
			stat_userId: {
				userId,
				stat
			}
		}
	});
	return tracking?.quantity ?? 0;
}

async function createLevelUpReadyDinoz(
	userId: string,
	options: {
		name?: string;
		level?: number;
		raceId?: RaceEnum;
		element?: ElementType;
		altElement?: ElementType;
	} = {}
) {
	const level = options.level ?? 1;
	return createTestDinoz({
		userId,
		name: options.name ?? 'LevelUpDinoz',
		canRename: false,
		level,
		experience: getLevelXp(level),
		raceId: options.raceId ?? RaceEnum.MOUEFFE,
		nextUpElementId: options.element ?? ElementType.FIRE,
		nextUpAltElementId: options.altElement ?? ElementType.WATER
	});
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

	describe('learnable skills', () => {
		it('returns the skills available for the first level-up roll', async () => {
			const user = await createTestUser({
				name: 'LearnableSkillsOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json();
			expect(body).toMatchObject({
				element: ElementType.FIRE,
				canRelaunch: false,
				level: 1
			});
			const learnableIds = body.learnableSkills.map((skill: { skillId: number }) => skill.skillId);
			/*
			 * Compétences Feu de base,
			 * sans prérequis.
			 */
			expect(learnableIds).toEqual(expect.arrayContaining([Skill.GRIFFES_ENFLAMMEES, Skill.COLERE, Skill.FORCE]));
			/*
			 * Les compétences sphériques ne
			 * sont jamais proposées ici.
			 */
			expect(learnableIds).not.toContain(Skill.BRASERO);
		});

		it('requires enough experience before offering level-up skills', async () => {
			const user = await createTestUser({
				name: 'LowXpSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'LowXpDinoz',
				canRename: false,
				level: 1,
				experience: getLevelXp(1) - 1,
				nextUpElementId: ElementType.FIRE
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozNotEnoughExperience'
			});
		});

		it('prevents another player from reading level-up choices', async () => {
			const owner = await createTestUser({
				name: 'LevelSkillRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'LevelSkillAttacker',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(owner.id);
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				}
			});
			expect(response.statusCode).toBe(403);
		});

		it('requires the Dinoz to be named before level-up', async () => {
			const user = await createTestUser({
				name: 'UnnamedLevelSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: true,
				level: 1,
				experience: getLevelXp(1),
				nextUpElementId: ElementType.FIRE
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
		});

		it('rejects the second roll without Career Plan or Dinoz Cube', async () => {
			const user = await createTestUser({
				name: 'NoRerollSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE,
				altElement: ElementType.WATER
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/2`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
		});

		it('allows the second roll with Career Plan', async () => {
			const user = await createTestUser({
				name: 'CareerPlanSkillOwner',
				withTutorial: false
			});
			/*
			 * Niveau > 10 volontaire :
			 * Plan de carrière n'a pas la
			 * limitation du Cube Dinoz.
			 */
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 15,
				element: ElementType.FIRE,
				altElement: ElementType.WATER
			});
			await addSkill(dinoz.id, Skill.PLAN_DE_CARRIERE);
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/2`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				element: ElementType.WATER,
				canRelaunch: true,
				level: 15
			});
		});

		it('allows the second roll with a Dinoz Cube through level 10', async () => {
			const user = await createTestUser({
				name: 'DinozCubeSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 10,
				element: ElementType.FIRE,
				altElement: ElementType.AIR
			});
			await equipDinozCube(dinoz.id);
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/2`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json()).toMatchObject({
				element: ElementType.AIR,
				canRelaunch: true
			});
		});

		it('does not allow the Dinoz Cube reroll above level 10', async () => {
			const user = await createTestUser({
				name: 'ExpiredCubeSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 11,
				altElement: ElementType.AIR
			});
			await equipDinozCube(dinoz.id);
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/2`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
		});

		it('switches from the Vanilla tree to the Ether tree with Ether Drop', async () => {
			const etherBaseSkill = Object.values(skillList).find(
				skill =>
					skill.tree === SkillTreeType.ETHER &&
					skill.unlockedFrom?.length === 0 &&
					!skill.isSphereSkill &&
					!skill.raceId
			);
			expect(etherBaseSkill).toBeDefined();
			if (!etherBaseSkill) {
				return;
			}
			const element = etherBaseSkill.element[0];
			expect(element).toBeDefined();
			if (!element) {
				return;
			}
			const user = await createTestUser({
				name: 'EtherTreeSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element
			});
			await addStatus(dinoz.id, DinozStatusId.ETHER_DROP);
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json();
			const learnableIds: Skill[] = (
				body.learnableSkills as Array<{
					skillId: Skill;
				}>
			).map(skill => skill.skillId);
			expect(learnableIds).toContain(etherBaseSkill.id);
			for (const skillId of learnableIds) {
				expect(skillList[skillId].tree).toBe(SkillTreeType.ETHER);
			}
		});

		it('only exposes a prerequisite skill after its prerequisite is known', async () => {
			const user = await createTestUser({
				name: 'PrerequisiteSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE
			});
			const getChoices = () =>
				server.inject({
					method: 'GET',
					url: `/api/level/learnableskills/${dinoz.id}/1`,
					headers: {
						cookie: createAuthCookie(server, user)
					}
				});
			const before = await getChoices();
			expect(before.statusCode).toBe(200);
			expect(before.json().learnableSkills.map((skill: { skillId: number }) => skill.skillId)).not.toContain(
				Skill.SOUFFLE_ARDENT
			);
			await addSkill(dinoz.id, Skill.GRIFFES_ENFLAMMEES);
			const after = await getChoices();
			expect(after.statusCode).toBe(200);
			expect(after.json().learnableSkills.map((skill: { skillId: number }) => skill.skillId)).toContain(
				Skill.SOUFFLE_ARDENT
			);
		});

		it('returns stored unlockable skills separately from normal learnable skills', async () => {
			const user = await createTestUser({
				name: 'UnlockableSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE
			});
			await prisma.dinozSkillsUnlockable.create({
				data: {
					dinozId: dinoz.id,
					skillId: Skill.SOUFFLE_ARDENT
				}
			});
			const response = await server.inject({
				method: 'GET',
				url: `/api/level/learnableskills/${dinoz.id}/1`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json();
			expect(body.unlockableSkills.map((skill: { skillId: number }) => skill.skillId)).toContain(Skill.SOUFFLE_ARDENT);
			/*
			 * Une compétence déjà placée
			 * dans unlockableSkills ne doit
			 * plus apparaître dans la liste
			 * d'apprentissage normale.
			 */
			expect(body.learnableSkills.map((skill: { skillId: number }) => skill.skillId)).not.toContain(
				Skill.SOUFFLE_ARDENT
			);
		});

		it('respects race restrictions on learnable skills', async () => {
			const user = await createTestUser({
				name: 'RaceRestrictedSkillOwner',
				withTutorial: false
			});
			const moueffe = await createLevelUpReadyDinoz(user.id, {
				name: 'MoueffeSkillRestriction',
				raceId: RaceEnum.MOUEFFE,
				element: ElementType.FIRE
			});
			const quetzu = await createLevelUpReadyDinoz(user.id, {
				name: 'QuetzuSkillRestriction',
				raceId: RaceEnum.QUETZU,
				element: ElementType.FIRE
			});
			/*
			 * Propulsion Divine nécessite Force
			 * et est réservée au Quetzu.
			 */
			await addSkill(moueffe.id, Skill.FORCE);
			await addSkill(quetzu.id, Skill.FORCE);
			const [moueffeResponse, quetzuResponse] = await Promise.all([
				server.inject({
					method: 'GET',
					url: `/api/level/learnableskills/${moueffe.id}/1`,
					headers: {
						cookie: createAuthCookie(server, user)
					}
				}),
				server.inject({
					method: 'GET',
					url: `/api/level/learnableskills/${quetzu.id}/1`,
					headers: {
						cookie: createAuthCookie(server, user)
					}
				})
			]);
			expect(moueffeResponse.statusCode).toBe(200);
			expect(quetzuResponse.statusCode).toBe(200);
			const moueffeSkills = moueffeResponse.json().learnableSkills.map((skill: { skillId: number }) => skill.skillId);
			const quetzuSkills = quetzuResponse.json().learnableSkills.map((skill: { skillId: number }) => skill.skillId);
			expect(moueffeSkills).not.toContain(Skill.PROPULSION_DIVINE);
			expect(quetzuSkills).toContain(Skill.PROPULSION_DIVINE);
		});

		it('blocks a level-limit threshold until its required status is obtained', async () => {
			const user = await createTestUser({
				name: 'LevelCapSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'LevelCapSkillDinoz',
				canRename: false,
				level: 50,
				experience: getLevelXp(50),
				nextUpElementId: ElementType.FIRE
			});
			const request = () =>
				server.inject({
					method: 'GET',
					url: `/api/level/learnableskills/${dinoz.id}/1`,
					headers: {
						cookie: createAuthCookie(server, user)
					}
				});
			const blocked = await request();
			expect(blocked.statusCode).toBe(400);
			expect(blocked.json()).toMatchObject({
				code: 'dinozLevelCapReached'
			});
			await addStatus(dinoz.id, DinozStatusId.BROKEN_LIMIT_1);
			const unlocked = await request();
			expect(unlocked.statusCode).toBe(200);
		});
	});

	describe('skill learning', () => {
		it('learns an allowed skill and completes the level-up lifecycle', async () => {
			const user = await createTestUser({
				name: 'SkillLearningOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 1,
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 1);
			const initialFire = dinoz.nbrUpFire;
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.GRIFFES_ENFLAMMEES],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json() as {
				newMaxExperience: number;
				discoveredSkill?: number;
			};
			expect(body.newMaxExperience).toBe(getLevelXp(2));
			expect(body.discoveredSkill).toBe(Skill.GRIFFES_ENFLAMMEES);
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			/*
			 * XP exact du niveau 1 :
			 * tout est consommé.
			 */
			expect(updated.level).toBe(2);
			expect(updated.experience).toBe(0);
			/*
			 * Le tirage était Feu :
			 * le level-up ajoute +1 Feu.
			 */
			expect(updated.nbrUpFire).toBe(initialFire + 1);
			const learnedSkill = await prisma.dinozSkills.findUnique({
				where: {
					skillId_dinozId: {
						dinozId: dinoz.id,
						skillId: Skill.GRIFFES_ENFLAMMEES
					}
				}
			});
			expect(learnedSkill).not.toBeNull();
			expect(learnedSkill?.state).toBe(true);
			/*
			 * Griffes Enflammées ouvre notamment :
			 *
			 * - Souffle Ardent
			 * - Chasseur de Goupignon
			 */
			const unlockables = await prisma.dinozSkillsUnlockable.findMany({
				where: {
					dinozId: dinoz.id
				}
			});
			const unlockableIds = unlockables.map(skill => skill.skillId);
			expect(unlockableIds).toEqual(expect.arrayContaining([Skill.SOUFFLE_ARDENT, Skill.CHASSEUR_DE_GOUPIGNON]));
			/*
			 * La compétence est également
			 * découverte au niveau du compte.
			 */
			const updatedUser = await prisma.user.findUniqueOrThrow({
				where: {
					id: user.id
				},
				select: {
					discoveredSkills: true
				}
			});
			expect(updatedUser.discoveredSkills).toContain(Skill.GRIFFES_ENFLAMMEES);
			const ranking = await prisma.ranking.findUniqueOrThrow({
				where: {
					userId: user.id
				}
			});
			expect(ranking.points).toBe(2);
			expect(ranking.average).toBe(2);
			expect(await getTrackingQuantity(user.id, StatTracking.LVL_UP)).toBe(1);
			expect(await getTrackingQuantity(user.id, StatTracking.UP_FIRE)).toBe(1);
		});

		it('applies persistent skill effects before resolving the level-up', async () => {
			const user = await createTestUser({
				name: 'PassiveEffectSkillOwner',
				withTutorial: false
			});
			const level = 5;
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'PassiveEffectDinoz',
				canRename: false,
				level,
				experience: getLevelXp(level),
				nextUpElementId: ElementType.FIRE,
				nextUpAltElementId: ElementType.WATER,

				/*
				 * Valeur volontairement facile
				 * à suivre dans le test.
				 */
				nbrUpFire: 10
			});
			await prepareLevelUpRanking(user.id, level);
			/*
			 * Aura Incandescente nécessite Furie.
			 */
			await addSkill(dinoz.id, Skill.FURIE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.AURA_INCANDESCENTE],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updated.level).toBe(6);
			expect(updated.experience).toBe(0);
			/*
			 * 10
			 * +2 Aura Incandescente
			 * +1 montée de niveau Feu
			 * = 13
			 */
			expect(updated.nbrUpFire).toBe(13);
			expect(
				await prisma.dinozSkills.findUnique({
					where: {
						skillId_dinozId: {
							dinozId: dinoz.id,
							skillId: Skill.AURA_INCANDESCENTE
						}
					}
				})
			).not.toBeNull();
		});

		it('rejects a forged skill that is not currently learnable without mutating the Dinoz', async () => {
			const user = await createTestUser({
				name: 'ForgedSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 1,
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 1);
			const initialExperience = dinoz.experience;
			const initialFire = dinoz.nbrUpFire;
			/*
			 * Souffle Ardent nécessite
			 * Griffes Enflammées.
			 *
			 * On tente volontairement de contourner
			 * le client en envoyant directement l'id.
			 */
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.SOUFFLE_ARDENT],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(400);
			const unchanged = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(unchanged.level).toBe(1);
			expect(unchanged.experience).toBe(initialExperience);
			expect(unchanged.nbrUpFire).toBe(initialFire);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.SOUFFLE_ARDENT
					}
				})
			).toBe(0);
			const ranking = await prisma.ranking.findUniqueOrThrow({
				where: {
					userId: user.id
				}
			});
			expect(ranking.points).toBe(1);
			expect(await getTrackingQuantity(user.id, StatTracking.LVL_UP)).toBe(0);
			expect(await getTrackingQuantity(user.id, StatTracking.UP_FIRE)).toBe(0);
		});

		it('prevents another player from learning a skill for the Dinoz', async () => {
			const owner = await createTestUser({
				name: 'SkillLearningRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'SkillLearningAttacker',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(owner.id, {
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(owner.id, 1);
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, attacker)
				},
				payload: {
					skillIdList: [Skill.GRIFFES_ENFLAMMEES],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(403);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: dinoz.id
						}
					})
				).level
			).toBe(1);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id
					}
				})
			).toBe(0);
		});

		it('unlocks all stored unlockable skills as one level-up choice', async () => {
			const user = await createTestUser({
				name: 'UnlockSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 1);
			await prisma.dinozSkillsUnlockable.createMany({
				data: [
					{
						dinozId: dinoz.id,
						skillId: Skill.SOUFFLE_ARDENT
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.CHASSEUR_DE_GOUPIGNON
					}
				]
			});
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.SOUFFLE_ARDENT, Skill.CHASSEUR_DE_GOUPIGNON],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			/*
			 * "Unlock" ne signifie pas apprendre
			 * immédiatement les deux compétences.
			 *
			 * On retire leur verrou pour qu'elles
			 * deviennent apprenables plus tard.
			 */
			expect(
				await prisma.dinozSkillsUnlockable.count({
					where: {
						dinozId: dinoz.id
					}
				})
			).toBe(0);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: {
							in: [Skill.SOUFFLE_ARDENT, Skill.CHASSEUR_DE_GOUPIGNON]
						}
					}
				})
			).toBe(0);
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updated.level).toBe(2);
			expect(updated.experience).toBe(0);
		});

		it('serializes concurrent skill learning so a level can only be gained once', async () => {
			const user = await createTestUser({
				name: 'ConcurrentSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 1);
			const cookie = createAuthCookie(server, user);
			const learn = () =>
				server.inject({
					method: 'POST',
					url: `/api/level/learnskill/${dinoz.id}`,
					headers: {
						cookie
					},
					payload: {
						skillIdList: [Skill.GRIFFES_ENFLAMMEES],
						tryNumber: 1
					}
				});
			const responses = await Promise.all([learn(), learn()]);
			expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
			expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			expect(updated.level).toBe(2);
			expect(updated.experience).toBe(0);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.GRIFFES_ENFLAMMEES
					}
				})
			).toBe(1);
			const ranking = await prisma.ranking.findUniqueOrThrow({
				where: {
					userId: user.id
				}
			});
			expect(ranking.points).toBe(2);
			expect(await getTrackingQuantity(user.id, StatTracking.LVL_UP)).toBe(1);
			expect(await getTrackingQuantity(user.id, StatTracking.UP_FIRE)).toBe(1);
		});
	});
});
