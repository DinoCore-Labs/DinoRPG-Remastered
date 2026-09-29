import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { prisma } from '../../prisma.js';

export type BotShamanProgressionStep =
	| {
			type: 'move';
			placeId: PlaceEnum;
	  }
	| {
			type: 'dialog';
			dialogId: 'shaman_mou';
			preferredLinkIds: string[];
	  };

const SHAMAN_CORE_MISSIONS = new Set(['init1', 'init2']);

export async function getBotShamanProgressionStep(
	userId: string,
	dinozId: number
): Promise<BotShamanProgressionStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
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
	if (statusIds.has(DinozStatusId.STRATEGY_IN_130_LESSONS)) {
		return null;
	}

	const activeMission = dinoz.missions.find(mission => !mission.isCompleted);
	if (activeMission) {
		return SHAMAN_CORE_MISSIONS.has(activeMission.missionKey) ? null : null;
	}

	const hasInit1 = dinoz.missions.some(
		mission => mission.missionKey === 'init1' && mission.isCompleted
	);
	const hasInit2 = dinoz.missions.some(
		mission => mission.missionKey === 'init2' && mission.isCompleted
	);
	if (hasInit2) return null;

	if (dinoz.placeId !== PlaceEnum.FOSSELAVE) {
		return {
			type: 'move',
			placeId: PlaceEnum.FOSSELAVE
		};
	}

	if (!statusIds.has(DinozStatusId.SHFLAG)) {
		return {
			type: 'dialog',
			dialogId: 'shaman_mou',
			preferredLinkIds: ['souvenir', 'more', 'accept', 'missions']
		};
	}

	return {
		type: 'dialog',
		dialogId: 'shaman_mou',
		preferredLinkIds: hasInit1 ? ['missions'] : ['missions']
	};
}
