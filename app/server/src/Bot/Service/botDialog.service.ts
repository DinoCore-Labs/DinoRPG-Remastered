import { getDinozMissionGroup } from '../../Mission/Controller/getDinozMission.controller.js';
import { startDinozMissionService } from '../../Mission/Controller/startDinozMission.controller.js';
import { prisma } from '../../prisma.js';
import { selectDialogLink, startDialog } from '../../Dialog/Service/dialog.service.js';

const MAX_DIALOG_STEPS = 12;

async function startAvailableMission(userId: string, dinozId: number, group: string) {
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
		const selected = available[Math.floor(Math.random() * available.length)];
		return startDinozMissionService(tx, {
			userId,
			dinozId,
			missionKey: selected.key
		});
	});
}

export async function executeBotDialog(userId: string, dinozId: number, dialogId: string) {
	let phase = await startDialog({
		userId,
		dinozId,
		dialogId
	});

	for (let step = 0; step < MAX_DIALOG_STEPS; step += 1) {
		if (phase.actions.missionsGroup) {
			await startAvailableMission(userId, dinozId, phase.actions.missionsGroup);
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
