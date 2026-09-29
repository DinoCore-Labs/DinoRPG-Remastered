import { BotStrategy } from '../../../../prisma/index.js';
import { getDinozMissionGroup } from '../../Mission/Controller/getDinozMission.controller.js';
import { getMissionDefinitionByKey } from '../../Mission/Controller/mission.registry.js';
import { startDinozMissionService } from '../../Mission/Controller/startDinozMission.controller.js';
import { prisma } from '../../prisma.js';
import { selectDialogLink, startDialog } from '../../Dialog/Service/dialog.service.js';

const MAX_DIALOG_STEPS = 12;

function missionWeight(missionKey: string, strategy: BotStrategy): number {
	const definition = getMissionDefinitionByKey(missionKey);
	let weight = 10;

	for (const goal of definition.goals) {
		switch (strategy) {
			case BotStrategy.FIGHTER:
				if (goal.type === 'KILL' || goal.type === 'FIGHT' || goal.type === 'FIGHT_ACTION') weight += 18;
				break;
			case BotStrategy.GATHERER:
				if (goal.type === 'USE_ITEM' || goal.type === 'USE_INGREDIENT' || goal.type === 'ACTION') weight += 12;
				break;
			case BotStrategy.EXPLORER:
				if (goal.type === 'AT' || goal.type === 'TALK' || goal.type === 'VALIDATE') weight += 10;
				break;
			case BotStrategy.BALANCED:
			default:
				weight += 2;
				break;
		}
	}

	return weight;
}

function weightedMissionPick<T extends { key: string }>(missions: T[], strategy: BotStrategy): T {
	const weighted = missions.map(mission => ({
		mission,
		weight: missionWeight(mission.key, strategy)
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
		const selected = weightedMissionPick(available, strategy);
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
	strategy: BotStrategy = BotStrategy.BALANCED
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
			return phase;
		}

		if (phase.links.length === 0) {
			return phase;
		}

		const link = phase.links[Math.floor(Math.random() * phase.links.length)];
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
