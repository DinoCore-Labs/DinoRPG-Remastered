import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';

import { BotDinozRole } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

const GATHERER_SKILLS = new Set<number>([
	Skill.FOUILLE,
	Skill.EXPERT_EN_FOUILLE,
	Skill.APPRENTI_PECHEUR,
	Skill.PECHEUR_CONFIRME,
	Skill.MAITRE_PECHEUR,
	Skill.CUEILLETTE,
	Skill.GARDE_FORESTIER,
	Skill.ARCHEOLOGUE
]);

const EXPLORER_SKILLS = new Set<number>([
	Skill.SPRINT,
	Skill.SURVIE,
	Skill.MAITRE_NAGEUR,
	Skill.MAITRE_LEVITATEUR,
	Skill.DEPLACEMENT_INSTANTANE,
	Skill.ENDURANCE,
	Skill.VITALITE
]);

const GATHER_ACTIONS = new Set<Action>([
	Action.FISH,
	Action.CUEILLE,
	Action.ENERGY,
	Action.HUNT,
	Action.SEEK
]);

export type BotDinozRoleActivity = Action | 'mission' | 'move';

function getRoleCount(memories: { role: BotDinozRole | null }[], role: BotDinozRole): number {
	return memories.filter(memory => memory.role === role).length;
}

function getRoleAffinity(
	role: BotDinozRole,
	dinoz: {
		level: number;
		skills: { skillId: number }[];
	}
): number {
	switch (role) {
		case BotDinozRole.FIGHTER:
			return (
				dinoz.level * 2 +
				dinoz.skills.filter(knownSkill => {
					const skill = skillList[knownSkill.skillId as Skill];
					return Boolean(skill?.activatable || (skill?.effects && Object.keys(skill.effects).length > 0));
				}).length *
					6
			);
		case BotDinozRole.GATHERER:
			return dinoz.skills.filter(knownSkill => GATHERER_SKILLS.has(knownSkill.skillId)).length * 20;
		case BotDinozRole.EXPLORER:
			return dinoz.skills.filter(knownSkill => EXPLORER_SKILLS.has(knownSkill.skillId)).length * 20;
	}
}

export function getBotDinozRoleActivityBonus(
	role: BotDinozRole | null,
	activity: BotDinozRoleActivity
): number {
	if (!role) return 0;

	switch (role) {
		case BotDinozRole.FIGHTER:
			return activity === Action.FIGHT ? 55 : 0;
		case BotDinozRole.GATHERER:
			return GATHER_ACTIONS.has(activity as Action) ? 55 : 0;
		case BotDinozRole.EXPLORER:
			return activity === 'move' ? 45 : activity === 'mission' ? 30 : 0;
	}
}

export async function getOrAssignBotDinozRole(userId: string, dinozId: number): Promise<BotDinozRole | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId,
			user: {
				isBot: true
			}
		},
		select: {
			level: true,
			skills: {
				select: {
					skillId: true
				}
			},
			botMemory: {
				select: {
					role: true
				}
			}
		}
	});
	if (!dinoz) return null;
	if (dinoz.botMemory?.role) return dinoz.botMemory.role;

	const memories = await prisma.botDinozMemory.findMany({
		where: {
			dinoz: {
				userId
			},
			role: {
				not: null
			}
		},
		select: {
			role: true
		}
	});

	const roles = [BotDinozRole.FIGHTER, BotDinozRole.GATHERER, BotDinozRole.EXPLORER];
	let selectedRole = roles[0];
	let selectedScore = Number.NEGATIVE_INFINITY;

	for (const role of roles) {
		const balancePenalty = getRoleCount(memories, role) * 100;
		const score = getRoleAffinity(role, dinoz) - balancePenalty;
		if (score > selectedScore) {
			selectedScore = score;
			selectedRole = role;
		}
	}

	await prisma.botDinozMemory.upsert({
		where: {
			dinozId
		},
		create: {
			dinozId,
			role: selectedRole
		},
		update: {
			role: selectedRole
		}
	});

	return selectedRole;
}
