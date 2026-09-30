import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { prisma } from '../../prisma.js';

export type BotForestGuardianProgressionStep =
	| { type: 'move'; placeId: PlaceEnum }
	| {
			type: 'dialog';
			dialogId: 'forest_guardian';
			preferredLinkIds: string[];
	  };

const FOREST_GUARDIAN_MISSIONS = new Set([
	'unmute',
	'orchid',
	'licens',
	'king',
	'wishes',
	'newplt',
	'gshop'
]);

export async function getBotForestGuardianProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotForestGuardianProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: {
			placeId: true,
			status: {
				select: { statusId: true }
			},
			missions: {
				select: {
					missionKey: true,
					isCompleted: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	if (!statusIds.has(DinozStatusId.FLIPPERS)) return null;
	if (statusIds.has(DinozStatusId.FLOWERING_BRANCH)) return null;

	const activeMission = dinoz.missions.find(mission => !mission.isCompleted);
	if (activeMission) {
		return FOREST_GUARDIAN_MISSIONS.has(activeMission.missionKey) ? null : null;
	}

	if (dinoz.placeId !== PlaceEnum.PORTE_DE_SYLVENOIRE) {
		return {
			type: 'move',
			placeId: PlaceEnum.PORTE_DE_SYLVENOIRE
		};
	}

	if (!statusIds.has(DinozStatusId.GRDMIS)) {
		return {
			type: 'dialog',
			dialogId: 'forest_guardian',
			preferredLinkIds: ['shake', 'item', 'missions']
		};
	}

	return {
		type: 'dialog',
		dialogId: 'forest_guardian',
		preferredLinkIds: ['missions']
	};
}
