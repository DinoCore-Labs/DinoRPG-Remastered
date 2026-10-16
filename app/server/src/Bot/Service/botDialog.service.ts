import { BotDinozRole, BotStrategy } from '../../../../prisma/index.js';
import { resumeDialogPhase, selectDialogLink, startDialog } from '../../Dialog/Service/dialog.service.js';
import { processDialogFightForUser } from '../../Fight/Service/processDialogFight.service.js';
import { getDinozMissionGroup } from '../../Mission/Controller/getDinozMission.controller.js';
import { getMissionDefinitionByKey } from '../../Mission/Controller/mission.registry.js';
import { startDinozMissionService } from '../../Mission/Controller/startDinozMission.controller.js';
import { prisma } from '../../prisma.js';
import { getOrAssignBotDinozRole } from './botDinozRole.service.js';
import { prepareBotSkillsForCombat } from './botSkillStrategy.service.js';

const MAX_DIALOG_STEPS = 12;

function getStrategyGoalBonus(goalType: string, strategy: BotStrategy): number {
	switch (strategy) {
		case BotStrategy.FIGHTER:
			return goalType === 'KILL' || goalType === 'FIGHT' || goalType === 'FIGHT_ACTION' ? 18 : 0;
		case BotStrategy.GATHERER:
			return goalType === 'USE_ITEM' || goalType === 'USE_INGREDIENT' || goalType === 'ACTION' || goalType === 'DIG'
				? 12
				: 0;
		case BotStrategy.EXPLORER:
			return goalType === 'AT' || goalType === 'TALK' || goalType === 'VALIDATE' ? 10 : 0;
		case BotStrategy.BALANCED:
		default:
			return 2;
	}
}

function getRoleGoalBonus(goalType: string, role: BotDinozRole | null): number {
	switch (role) {
		case BotDinozRole.FIGHTER:
			return goalType === 'KILL' || goalType === 'FIGHT' || goalType === 'FIGHT_ACTION' ? 30 : 0;
		case BotDinozRole.GATHERER:
			return goalType === 'USE_ITEM' ||
				goalType === 'USE_INGREDIENT' ||
				goalType === 'ACTION' ||
				goalType === 'DIG'
				? 26
				: 0;
		case BotDinozRole.EXPLORER:
			return goalType === 'AT' || goalType === 'TALK' || goalType === 'VALIDATE' || goalType === 'WAIT' ? 22 : 0;
		case null:
		default:
			return 0;
	}
}

export function getBotMissionWeight(
	missionKey: string,
	strategy: BotStrategy,
	role: BotDinozRole | null = null
): number {
	const definition = getMissionDefinitionByKey(missionKey);
	let weight = 10;

	for (const goal of definition.goals) {
		weight += getStrategyGoalBonus(goal.type, strategy);
		weight += getRoleGoalBonus(goal.type, role);
	}

	return weight;
}

function weightedMissionPick<T extends { key: string }>(
	missions: T[],
	strategy: BotStrategy,
	role: BotDinozRole | null
): T {
	const weighted = missions.map(mission => ({
		mission,
		weight: getBotMissionWeight(mission.key, strategy, role)
	}));
	const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
	let cursor = Math.random() * total;
	for (const entry of weighted) {
		cursor -= entry.weight;
		if (cursor <= 0) return entry.mission;
	}
	return weighted[weighted.length - 1].mission;
}

async function startAvailableMission(userId: string, dinozId: number, group: string, strategy: BotStrategy) {
	const role = await getOrAssignBotDinozRole(userId, dinozId);

	return prisma.$transaction(async tx => {
		const missionGroup = await getDinozMissionGroup(tx, {
			userId,
			dinozId,
			group
		});
		const available = missionGroup.missions.filter(mission => mission.canStart);
		if (available.length === 0) {
			return null;
		}
		const selected = weightedMissionPick(available, strategy, role);
		return startDinozMissionService(tx, {
			userId,
			dinozId,
			missionKey: selected.key
		});
	});
}

export async function executeBotDialog(
	userId: string,
	dinozId: number,
	dialogId: string,
	strategy: BotStrategy = BotStrategy.BALANCED,
	preferredLinkIds: string[] = []
) {
	let phase = await startDialog({
		userId,
		dinozId,
		dialogId
	});

	for (let step = 0; step < MAX_DIALOG_STEPS; step += 1) {
		if (phase.actions.missionsGroup) {
			await startAvailableMission(userId, dinozId, phase.actions.missionsGroup, strategy);
			return phase;
		}

		if (phase.actions.startFight) {
			await prepareBotSkillsForCombat(userId, dinozId, strategy);
			const fight = await processDialogFightForUser({
				userId,
				dinozId,
				dialogId,
				phaseId: phase.phaseId,
				autoReequip: false
			});
			if (fight.dialogReturn) {
				phase = await resumeDialogPhase({
					userId,
					dinozId,
					dialogId: fight.dialogReturn.dialogId,
					phaseId: fight.dialogReturn.phaseId
				});
				continue;
			}
			return phase;
		}

		if (phase.links.length === 0) {
			return phase;
		}

		const preferredLink = preferredLinkIds
			.map(linkId => phase.links.find(link => link.id === linkId))
			.find((link): link is NonNullable<typeof link> => Boolean(link));
		const link = preferredLink ?? phase.links[Math.floor(Math.random() * phase.links.length)];
		phase = await selectDialogLink({
			userId,
			dinozId,
			dialogId,
			phaseId: phase.phaseId,
			linkId: link.id
		});
	}

	return phase;
}
