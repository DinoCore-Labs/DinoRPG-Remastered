import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';

import { BotStrategy } from '../../../../prisma/index.js';
import { setDinozSkillStateForUser } from '../../Dinoz/Service/setSkillState.service.js';
import { prisma } from '../../prisma.js';

const BOT_SKILL_ENERGY_BUDGET: Record<BotStrategy, number> = {
	[BotStrategy.FIGHTER]: 80,
	[BotStrategy.BALANCED]: 50,
	[BotStrategy.GATHERER]: 30,
	[BotStrategy.EXPLORER]: 30
};

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

	const hasStrategyStatus = dinoz.status.some(
		status => status.statusId === DinozStatusId.STRATEGY_IN_130_LESSONS
	);
	if (!hasStrategyStatus) return [];

	const energyBudget = BOT_SKILL_ENERGY_BUDGET[strategy];
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
