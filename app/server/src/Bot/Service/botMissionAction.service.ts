import { BotStrategy } from '../../../../prisma/index.js';
import { completeMissionInteraction, startMissionInteraction } from '../../Mission/Controller/missionInteract.controller.js';
import { advanceDinozMissionOnWait } from '../../Mission/Controller/mission.progress.js';
import { prisma } from '../../prisma.js';
import { executeBotDialog } from './botDialog.service.js';

export async function executeBotMissionInteraction(userId: string, dinozId: number, strategy: BotStrategy) {
	const result = await startMissionInteraction(userId, dinozId, false);

	if (result.mode === 'dialog') {
		return executeBotDialog(userId, dinozId, result.dialogId, strategy);
	}

	if (result.mode === 'modal') {
		return completeMissionInteraction({
			userId,
			dinozId,
			trigger: 'manual'
		});
	}

	return result;
}

export async function executeBotMissionWait(dinozId: number) {
	return prisma.$transaction(tx => advanceDinozMissionOnWait(tx, dinozId));
}
