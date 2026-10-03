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

import { addItemToInventory } from '../../src/Inventory/Controller/addItem.controller.js';
import { computeUSkillsForUser } from '../../src/Level/Controller/applySkillEffect.controller.js';
import { unlockDoubleSkills } from '../../src/Level/Controller/unlockDoubleSkills.controller.js';
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

type USkillField =
	'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur';

const U_SKILL_CASES: Array<{
	skillId: Skill;
	field: USkillField;
}> = [
	{
		skillId: Skill.LEADER,
		field: 'leader'
	},
	{
		skillId: Skill.INGENIEUR,
		field: 'engineer'
	},
	{
		skillId: Skill.MAGASINIER,
		field: 'shopKeeper'
	},
	{
		skillId: Skill.CUISINIER,
		field: 'cooker'
	},
	{
		skillId: Skill.MARCHAND,
		field: 'merchant'
	},
	{
		skillId: Skill.PRETRE,
		field: 'priest'
	},
	{
		skillId: Skill.PROFESSEUR,
		field: 'teacher'
	},
	{
		skillId: Skill.MESSIE,
		field: 'messie'
	},
	{
		skillId: Skill.MATELASSEUR,
		field: 'matelasseur'
	}
];

const U_SKILL_FIELDS: USkillField[] = U_SKILL_CASES.map(entry => entry.field);

const SPHERE_CHAINS = [
	{
		name: 'fire',
		element: ElementType.FIRE,
		item: Item.FIRE_SPHERE,
		skills: [Skill.BRASERO, Skill.DETONATION, Skill.COEUR_DU_PHOENIX]
	},
	{
		name: 'wood',
		element: ElementType.WOOD,
		item: Item.WOOD_SPHERE,
		skills: [Skill.LANCEUR_DE_GLAND, Skill.GRATTEUR, Skill.GROSSE_BEIGNE]
	},
	{
		name: 'water',
		element: ElementType.WATER,
		item: Item.WATER_SPHERE,
		skills: [Skill.VITALITE, Skill.MOIGNONS_LIQUIDES, Skill.DELUGE]
	},
	{
		name: 'lightning',
		element: ElementType.LIGHTNING,
		item: Item.LIGHTNING_SPHERE,
		skills: [Skill.REFLEX, Skill.ECLAIR_SINUEUX, Skill.SURVIE]
	},
	{
		name: 'air',
		element: ElementType.AIR,
		item: Item.AIR_SPHERE,
		skills: [Skill.AIGUILLON, Skill.AURA_PUANTE, Skill.HYPNOSE]
	},
	{
		name: 'void',
		element: ElementType.VOID,
		item: Item.VOID_SPHERE,
		skills: [Skill.GROS_DORMEUR, Skill.VEILLEUSE, Skill.MATELASSEUR]
	}
] as const;

async function getUserUSkills(userId: string) {
	return prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			leader: true,
			engineer: true,
			shopKeeper: true,
			cooker: true,
			merchant: true,
			priest: true,
			teacher: true,
			messie: true,
			matelasseur: true
		}
	});
}

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

async function equipFearFactor(dinozId: number): Promise<void> {
	await prisma.dinozItems.create({
		data: {
			dinozId,
			itemId: Item.FEAR_FACTOR
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

async function getItemQuantity(userId: string, itemId: number): Promise<number> {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId
			}
		}
	});
	return item?.quantity ?? 0;
}

async function useItem(user: Parameters<typeof createAuthCookie>[1], dinozId: number, itemId: number) {
	return server.inject({
		method: 'GET',
		url: `/api/inventory/${dinozId}/${itemId}`,
		headers: {
			cookie: createAuthCookie(server, user)
		}
	});
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

	describe('user skills', () => {
		it('activates the Leader account flag when Leader is learned through level-up', async () => {
			const user = await createTestUser({
				name: 'LeaderSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 5,
				element: ElementType.WOOD
			});
			await prepareLevelUpRanking(user.id, 5);
			/*
			 * Leader nécessite Charisme.
			 *
			 * On seed directement le prérequis
			 * afin de tester ici le comportement
			 * de la U-skill elle-même.
			 */
			await addSkill(dinoz.id, Skill.CHARISME);
			expect((await getUserUSkills(user.id)).leader).toBe(false);
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.LEADER],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			const learnedSkill = await prisma.dinozSkills.findUnique({
				where: {
					skillId_dinozId: {
						dinozId: dinoz.id,
						skillId: Skill.LEADER
					}
				}
			});
			expect(learnedSkill).not.toBeNull();
			const updatedUser = await getUserUSkills(user.id);
			expect(updatedUser.leader).toBe(true);
			/*
			 * Apprendre Leader ne doit pas
			 * activer les autres U-skills.
			 */
			for (const field of U_SKILL_FIELDS) {
				if (field === 'leader') {
					continue;
				}
				expect(updatedUser[field]).toBe(false);
			}
		});

		it.each(U_SKILL_CASES)('recomputes $field from skill $skillId', async ({ skillId, field }) => {
			const user = await createTestUser({
				name: `USkillOwner-${skillId}`,
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: `USkillDinoz-${skillId}`,
				canRename: false
			});
			await addSkill(dinoz.id, skillId);
			/*
			 * On force volontairement tous
			 * les flags à false avant la
			 * recomputation.
			 */
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					leader: false,
					engineer: false,
					shopKeeper: false,
					cooker: false,
					merchant: false,
					priest: false,
					teacher: false,
					messie: false,
					matelasseur: false
				}
			});
			await computeUSkillsForUser(user.id);
			const updatedUser = await getUserUSkills(user.id);
			for (const candidateField of U_SKILL_FIELDS) {
				expect(updatedUser[candidateField]).toBe(candidateField === field);
			}
		});

		it('keeps a U-skill active while another owned Dinoz still has it', async () => {
			const user = await createTestUser({
				name: 'SharedLeaderSkillOwner',
				withTutorial: false
			});
			const first = await createTestDinoz({
				userId: user.id,
				name: 'FirstLeaderDinoz',
				canRename: false
			});
			const second = await createTestDinoz({
				userId: user.id,
				name: 'SecondLeaderDinoz',
				canRename: false
			});
			await addSkill(first.id, Skill.LEADER);
			await addSkill(second.id, Skill.LEADER);
			await computeUSkillsForUser(user.id);
			expect((await getUserUSkills(user.id)).leader).toBe(true);
			/*
			 * Un premier Dinoz perd Leader.
			 */
			await prisma.dinozSkills.delete({
				where: {
					skillId_dinozId: {
						dinozId: first.id,
						skillId: Skill.LEADER
					}
				}
			});
			await computeUSkillsForUser(user.id);
			/*
			 * Le second l'a toujours :
			 * le compte reste Leader.
			 */
			expect((await getUserUSkills(user.id)).leader).toBe(true);
			await prisma.dinozSkills.delete({
				where: {
					skillId_dinozId: {
						dinozId: second.id,
						skillId: Skill.LEADER
					}
				}
			});
			await computeUSkillsForUser(user.id);
			/*
			 * Aucun Dinoz ne possède Leader :
			 * le flag doit maintenant disparaître.
			 */
			expect((await getUserUSkills(user.id)).leader).toBe(false);
		});

		it('clears stale account U-skill flags when no owned Dinoz provides them anymore', async () => {
			const user = await createTestUser({
				name: 'StaleUSkillsOwner',
				withTutorial: false
			});
			await createTestDinoz({
				userId: user.id,
				name: 'NoUSkillDinoz',
				canRename: false
			});
			/*
			 * Simulation d'un ancien état
			 * incohérent du compte.
			 */
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					leader: true,
					engineer: true,
					shopKeeper: true,
					cooker: true,
					merchant: true,
					priest: true,
					teacher: true,
					messie: true,
					matelasseur: true
				}
			});
			await computeUSkillsForUser(user.id);
			const updatedUser = await getUserUSkills(user.id);
			for (const field of U_SKILL_FIELDS) {
				expect(updatedUser[field]).toBe(false);
			}
		});
	});

	describe('special skills', () => {
		it('detaches the whole group when a leader learns Brave', async () => {
			const user = await createTestUser({
				name: 'BraveLearningOwner',
				withTutorial: false
			});
			const leader = await createLevelUpReadyDinoz(user.id, {
				level: 10,
				raceId: RaceEnum.MOUEFFE,
				element: ElementType.FIRE
			});
			const firstFollower = await createTestDinoz({
				userId: user.id,
				name: 'BraveFollowerOne',
				canRename: false,
				raceId: RaceEnum.PIGMOU
			});
			const secondFollower = await createTestDinoz({
				userId: user.id,
				name: 'BraveFollowerTwo',
				canRename: false,
				raceId: RaceEnum.PIGMOU
			});
			await prisma.dinoz.updateMany({
				where: {
					id: {
						in: [firstFollower.id, secondFollower.id]
					}
				},
				data: {
					leaderId: leader.id
				}
			});
			await addSkill(leader.id, Skill.SELF_CONTROL);
			await prepareLevelUpRanking(user.id, 10);
			const initialMaxLife = leader.maxLife;
			const initialFire = leader.nbrUpFire;
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.BRAVE],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			const updatedLeader = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: leader.id
				}
			});
			expect(updatedLeader.level).toBe(11);
			/*
			 * BRAVE :
			 * +50 PV max
			 */
			expect(updatedLeader.maxLife).toBe(initialMaxLife + 50);
			/*
			 * BRAVE :
			 * +6 Feu
			 *
			 * level-up Feu :
			 * +1
			 */
			expect(updatedLeader.nbrUpFire).toBe(initialFire + 7);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: leader.id,
						skillId: Skill.BRAVE
					}
				})
			).toBe(1);
			const followers = await prisma.dinoz.findMany({
				where: {
					id: {
						in: [firstFollower.id, secondFollower.id]
					}
				},
				select: {
					id: true,
					leaderId: true
				}
			});
			/*
			 * Apprendre Brave casse
			 * immédiatement le groupe.
			 */
			expect(followers.every(follower => follower.leaderId === null)).toBe(true);
		});

		it('detaches a follower from its leader when the follower learns Brave', async () => {
			const user = await createTestUser({
				name: 'BraveFollowerLearningOwner',
				withTutorial: false
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'ExistingLeader',
				canRename: false,
				raceId: RaceEnum.PIGMOU
			});
			const follower = await createLevelUpReadyDinoz(user.id, {
				name: 'LearningBraveFollower',
				level: 10,
				raceId: RaceEnum.MOUEFFE,
				element: ElementType.FIRE
			});
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			await addSkill(follower.id, Skill.SELF_CONTROL);
			await prepareLevelUpRanking(user.id, 11);
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${follower.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.BRAVE],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('prevents a Brave Dinoz without Fear Factor from following another Dinoz', async () => {
			const user = await createTestUser({
				name: 'BraveNoFearOwner',
				withTutorial: false
			});
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'BraveNoFearFollower',
				canRename: false,
				raceId: RaceEnum.MOUEFFE
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'BraveNoFearLeader',
				canRename: false,
				raceId: RaceEnum.PIGMOU
			});
			await addSkill(follower.id, Skill.BRAVE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozCannotFollowBrave'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('allows a Brave Dinoz with Fear Factor to follow a Dinoz with elemental affinity', async () => {
			const user = await createTestUser({
				name: 'BraveFearFactorOwner',
				withTutorial: false
			});
			/*
			 * Moueffe et Pigmou ont tous
			 * les deux du Feu natif.
			 */
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'BraveFearFollower',
				canRename: false,
				raceId: RaceEnum.MOUEFFE
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'BraveFearLeader',
				canRename: false,
				raceId: RaceEnum.PIGMOU
			});
			await addSkill(follower.id, Skill.BRAVE);
			await equipFearFactor(follower.id);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(200);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBe(leader.id);
		});

		it('still requires elemental affinity when Brave is neutralized by Fear Factor', async () => {
			const user = await createTestUser({
				name: 'BraveAffinityOwner',
				withTutorial: false
			});
			/*
			 * Moueffe :
			 * Feu
			 *
			 * Gorilloz :
			 * Bois
			 *
			 * => aucune affinité native.
			 */
			const follower = await createTestDinoz({
				userId: user.id,
				name: 'BraveAffinityFollower',
				canRename: false,
				raceId: RaceEnum.MOUEFFE
			});
			const leader = await createTestDinoz({
				userId: user.id,
				name: 'BraveAffinityLeader',
				canRename: false,
				raceId: RaceEnum.GORILLOZ
			});
			await addSkill(follower.id, Skill.BRAVE);
			await equipFearFactor(follower.id);
			const response = await server.inject({
				method: 'POST',
				url: `/api/dinoz/${follower.id}/follow/${leader.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				}
			});
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'dinozCannotFollowSharedElement'
			});
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: follower.id
						}
					})
				).leaderId
			).toBeNull();
		});

		it('unlocks an eligible double skill when Competence Double is obtained', async () => {
			const user = await createTestUser({
				name: 'DoubleSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'DoubleSkillDinoz',
				canRename: false
			});
			/*
			 * SPRINT demande :
			 *
			 * - Kamikaze
			 * - Voie de Kaos
			 * - Compétence Double
			 */
			await prisma.dinozSkills.createMany({
				data: [
					{
						dinozId: dinoz.id,
						skillId: Skill.KAMIKAZE
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.VOIE_DE_KAOS
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.COMPETENCE_DOUBLE
					}
				]
			});

			await unlockDoubleSkills(dinoz.id);
			const unlockables = await prisma.dinozSkillsUnlockable.findMany({
				where: {
					dinozId: dinoz.id
				}
			});
			const unlockableIds = unlockables.map(skill => skill.skillId);
			expect(unlockableIds).toContain(Skill.SPRINT);
			/*
			 * Armure de Basalte est également
			 * une double skill, mais demande :
			 *
			 * - Waikikido
			 * - Cocon
			 * - Compétence Double
			 *
			 * Ces prérequis ne sont pas présents.
			 */
			expect(unlockableIds).not.toContain(Skill.ARMURE_DE_BASALTE);
		});

		it('does not unlock a double skill when another prerequisite is missing', async () => {
			const user = await createTestUser({
				name: 'IncompleteDoubleSkillOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'IncompleteDoubleSkillDinoz',
				canRename: false
			});
			/*
			 * VOIE_DE_KAOS manque volontairement.
			 */
			await prisma.dinozSkills.createMany({
				data: [
					{
						dinozId: dinoz.id,
						skillId: Skill.KAMIKAZE
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.COMPETENCE_DOUBLE
					}
				]
			});
			await unlockDoubleSkills(dinoz.id);
			expect(
				await prisma.dinozSkillsUnlockable.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.SPRINT
					}
				})
			).toBe(0);
		});

		it('prevents learning a race-restricted skill through a forged request', async () => {
			const user = await createTestUser({
				name: 'ForgedRaceSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 10,
				raceId: RaceEnum.MOUEFFE,
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 10);
			await addSkill(dinoz.id, Skill.FORCE);
			/*
			 * PROPULSION_DIVINE nécessite
			 * Force, mais reste réservée
			 * au Quetzu.
			 */
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.PROPULSION_DIVINE],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(400);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: dinoz.id
						}
					})
				).level
			).toBe(10);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.PROPULSION_DIVINE
					}
				})
			).toBe(0);
		});

		it('allows the matching race to learn a race-restricted skill', async () => {
			const user = await createTestUser({
				name: 'ValidRaceSkillOwner',
				withTutorial: false
			});
			const dinoz = await createLevelUpReadyDinoz(user.id, {
				level: 10,
				raceId: RaceEnum.QUETZU,
				element: ElementType.FIRE
			});
			await prepareLevelUpRanking(user.id, 10);
			await addSkill(dinoz.id, Skill.FORCE);
			const response = await server.inject({
				method: 'POST',
				url: `/api/level/learnskill/${dinoz.id}`,
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					skillIdList: [Skill.PROPULSION_DIVINE],
					tryNumber: 1
				}
			});
			expect(response.statusCode).toBe(200);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.PROPULSION_DIVINE
					}
				})
			).toBe(1);
			expect(
				(
					await prisma.dinoz.findUniqueOrThrow({
						where: {
							id: dinoz.id
						}
					})
				).level
			).toBe(11);
		});
	});

	describe('sphere skills', () => {
		it.each(SPHERE_CHAINS)('learns the $name sphere skill chain in order', async ({ item, skills }) => {
			const user = await createTestUser({
				name: `SphereOwner-${item}`,
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: `SphereDinoz-${item}`,
				canRename: false
			});
			const itemId = itemList[item].itemId;
			await addItemToInventory(user.id, itemId, skills.length);
			for (const [index, expectedSkill] of skills.entries()) {
				const response = await useItem(user, dinoz.id, itemId);
				expect(response.statusCode).toBe(200);
				const body = response.json() as {
					effects: Array<{
						value?: string;
					}>;
				};
				expect(body.effects).toEqual(
					expect.arrayContaining([
						expect.objectContaining({
							value: skillList[expectedSkill].name
						})
					])
				);
				expect(
					await prisma.dinozSkills.count({
						where: {
							dinozId: dinoz.id,
							skillId: expectedSkill
						}
					})
				).toBe(1);
				/*
				 * La chaîne doit avancer
				 * exactement d'une étape.
				 */
				const learnedSkills = await prisma.dinozSkills.findMany({
					where: {
						dinozId: dinoz.id,
						skillId: {
							in: [...skills]
						}
					}
				});
				expect(learnedSkills).toHaveLength(index + 1);
				expect(await getItemQuantity(user.id, itemId)).toBe(skills.length - index - 1);
			}
			expect(await getTrackingQuantity(user.id, StatTracking.ITEM_USED)).toBe(skills.length);
		});

		it('applies the persistent effect of Vitality when learned from a Water Sphere', async () => {
			const user = await createTestUser({
				name: 'VitalitySphereOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'VitalitySphereDinoz',
				canRename: false,
				maxLife: 100,
				life: 100
			});
			const itemId = itemList[Item.WATER_SPHERE].itemId;
			await addItemToInventory(user.id, itemId, 1);
			const response = await useItem(user, dinoz.id, itemId);
			expect(response.statusCode).toBe(200);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.VITALITE
					}
				})
			).toBe(1);
			const updated = await prisma.dinoz.findUniqueOrThrow({
				where: {
					id: dinoz.id
				}
			});
			/*
			 * Vitalité :
			 * MAX_HP +10
			 */
			expect(updated.maxLife).toBe(110);
			expect(await getItemQuantity(user.id, itemId)).toBe(0);
		});

		it('activates Matelasseur after completing the Void Sphere chain', async () => {
			const user = await createTestUser({
				name: 'MatelasseurSphereOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'MatelasseurSphereDinoz',
				canRename: false
			});
			const itemId = itemList[Item.VOID_SPHERE].itemId;
			await addItemToInventory(user.id, itemId, 3);
			expect((await getUserUSkills(user.id)).matelasseur).toBe(false);
			for (const expectedSkill of [Skill.GROS_DORMEUR, Skill.VEILLEUSE, Skill.MATELASSEUR]) {
				const response = await useItem(user, dinoz.id, itemId);
				expect(response.statusCode).toBe(200);
				expect(
					await prisma.dinozSkills.count({
						where: {
							dinozId: dinoz.id,
							skillId: expectedSkill
						}
					})
				).toBe(1);
			}
			expect((await getUserUSkills(user.id)).matelasseur).toBe(true);
			expect(await getItemQuantity(user.id, itemId)).toBe(0);
		});

		it('does not consume a Sphere when the whole elemental chain is already known', async () => {
			const user = await createTestUser({
				name: 'KnownSphereOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'KnownSphereDinoz',
				canRename: false
			});
			await prisma.dinozSkills.createMany({
				data: [
					{
						dinozId: dinoz.id,
						skillId: Skill.BRASERO
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.DETONATION
					},
					{
						dinozId: dinoz.id,
						skillId: Skill.COEUR_DU_PHOENIX
					}
				]
			});
			const itemId = itemList[Item.FIRE_SPHERE].itemId;
			await addItemToInventory(user.id, itemId, 1);
			const response = await useItem(user, dinoz.id, itemId);
			expect(response.statusCode).toBe(400);
			expect(response.json()).toMatchObject({
				code: 'knownSphereSkill'
			});
			/*
			 * L'échec arrive avant la
			 * consommation de l'objet.
			 */
			expect(await getItemQuantity(user.id, itemId)).toBe(1);
			expect(await getTrackingQuantity(user.id, StatTracking.ITEM_USED)).toBe(0);
		});

		it('prevents using a Sphere on another player Dinoz', async () => {
			const owner = await createTestUser({
				name: 'SphereRealOwner',
				withTutorial: false
			});
			const attacker = await createTestUser({
				name: 'SphereAttacker',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: owner.id,
				name: 'ProtectedSphereDinoz',
				canRename: false
			});
			const itemId = itemList[Item.FIRE_SPHERE].itemId;
			await addItemToInventory(owner.id, itemId, 1);
			const response = await useItem(attacker, dinoz.id, itemId);
			expect(response.statusCode).toBe(403);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.BRASERO
					}
				})
			).toBe(0);
			expect(await getItemQuantity(owner.id, itemId)).toBe(1);
		});

		it('serializes concurrent Sphere usage when only one Sphere remains', async () => {
			const user = await createTestUser({
				name: 'ConcurrentSphereOwner',
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'ConcurrentSphereDinoz',
				canRename: false
			});
			const itemId = itemList[Item.FIRE_SPHERE].itemId;
			await addItemToInventory(user.id, itemId, 1);
			const cookie = createAuthCookie(server, user);
			const useSphere = () =>
				server.inject({
					method: 'GET',
					url: `/api/inventory/${dinoz.id}/${itemId}`,
					headers: {
						cookie
					}
				});
			const responses = await Promise.all([useSphere(), useSphere()]);
			expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
			expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
			const rejected = responses.find(response => response.statusCode === 400);
			expect(rejected?.json()).toMatchObject({
				code: 'notEnoughItems'
			});
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.BRASERO
					}
				})
			).toBe(1);
			expect(
				await prisma.dinozSkills.count({
					where: {
						dinozId: dinoz.id,
						skillId: Skill.DETONATION
					}
				})
			).toBe(0);
			expect(await getItemQuantity(user.id, itemId)).toBe(0);
			expect(await getTrackingQuantity(user.id, StatTracking.ITEM_USED)).toBe(1);
		});
	});
});
