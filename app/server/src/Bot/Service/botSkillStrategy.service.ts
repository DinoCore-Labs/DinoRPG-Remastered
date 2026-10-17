import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';

import { BotDinozRole, BotRoleObjective, BotStrategy } from '../../../../prisma/index.js';
import { setDinozSkillStateForUser } from '../../Dinoz/Service/setSkillState.service.js';
import { prisma } from '../../prisma.js';
import { getOrAssignBotDinozRole } from './botDinozRole.service.js';
import { getBotFightExperienceBonus, getBotPlaceExperienceMap } from './botPlaceExperience.service.js';
import { getOrAssignBotRoleObjective } from './botRoleObjective.service.js';

const BOT_SKILL_ENERGY_BUDGET: Record<BotStrategy, number> = {
	[BotStrategy.FIGHTER]: 80,
	[BotStrategy.BALANCED]: 50,
	[BotStrategy.GATHERER]: 30,
	[BotStrategy.EXPLORER]: 30
};

export function getBotCombatEnergyBudget(
	strategy: BotStrategy,
	role: BotDinozRole | null,
	objective: BotRoleObjective | null,
	fightExperienceBonus = 0
): number {
	let budget = BOT_SKILL_ENERGY_BUDGET[strategy];

	switch (role) {
		case BotDinozRole.FIGHTER:
			budget = 90;
			break;
		case BotDinozRole.GATHERER:
			budget = 30;
			break;
		case BotDinozRole.EXPLORER:
			budget = 45;
			break;
		case null:
			break;
	}

	if (objective === BotRoleObjective.FIGHTER_POWER) {
		budget += 10;
	}
	if (objective === BotRoleObjective.EXPLORER_DISCOVERY && fightExperienceBonus <= -30) {
		budget += 15;
	}

	return Math.max(20, Math.min(100, budget));
}

export type BotSkillStateChange = {
	skillId: number;
	state: boolean;
};

export async function getBotSkillStatePlan(
	userId: string,
	dinozId: number,
	strategy: BotStrategy
): Promise<BotSkillStateChange[]> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		select: {
			placeId: true,
			maxLife: true,
			status: {
				select: {
					statusId: true
				}
			},
			skills: {
				select: {
					skillId: true,
					state: true
				}
			}
		}
	});
	if (!dinoz) return [];

	const hasStrategyStatus = dinoz.status.some(status => status.statusId === DinozStatusId.STRATEGY_IN_130_LESSONS);
	if (!hasStrategyStatus) return [];

	const role = await getOrAssignBotDinozRole(userId, dinozId);
	const objective = await getOrAssignBotRoleObjective(userId, dinozId);
	const placeExperience = await getBotPlaceExperienceMap(dinozId);
	const fightExperienceBonus = getBotFightExperienceBonus(placeExperience, dinoz.placeId, dinoz.maxLife);
	const energyBudget = getBotCombatEnergyBudget(strategy, role, objective, fightExperienceBonus);
	const changes: BotSkillStateChange[] = [];

	for (const knownSkill of dinoz.skills) {
		const skill = skillList[knownSkill.skillId as keyof typeof skillList];
		if (!skill?.activatable) continue;

		const desiredState = Number(skill.energy) <= energyBudget;
		if (knownSkill.state === desiredState) continue;

		changes.push({
			skillId: knownSkill.skillId,
			state: desiredState
		});
	}

	return changes;
}

export async function prepareBotSkillsForCombat(
	userId: string,
	dinozId: number,
	strategy: BotStrategy
): Promise<number> {
	const changes = await getBotSkillStatePlan(userId, dinozId, strategy);

	for (const change of changes) {
		await setDinozSkillStateForUser(userId, dinozId, change.skillId, change.state);
	}

	return changes.length;
}
