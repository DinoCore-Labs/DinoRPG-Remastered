import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { prisma } from '../../prisma.js';

export type BotForcebrutUnlockStep =
	| { type: 'move'; placeId: PlaceEnum }
	| { type: 'dialog'; dialogId: string; preferredLinkIds: string[] };

export async function getBotForcebrutUnlockStep(
	userId: string,
	dinozId: number
): Promise<BotForcebrutUnlockStep | null> {
	const dinoz = await prisma.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: {
			placeId: true,
			status: { select: { statusId: true } }
		}
	});
	if (!dinoz) return null;

	const statusIds = new Set(dinoz.status.map(status => status.statusId));
	if (statusIds.has(DinozStatusId.TOURNA)) {
		return null;
	}

	if (statusIds.has(DinozStatusId.OLD_STONE) && !statusIds.has(DinozStatusId.ASHPOUK_TOTEM)) {
		if (dinoz.placeId !== PlaceEnum.UNIVERSITE) {
			return { type: 'move', placeId: PlaceEnum.UNIVERSITE };
		}
		return {
			type: 'dialog',
			dialogId: 'professor_eugene',
			preferredLinkIds: ['talk', 'question', 'stone', 'stone_yes']
		};
	}

	if (statusIds.has(DinozStatusId.ASHPOUK_TOTEM)) {
		if (dinoz.placeId !== PlaceEnum.FORCEBRUT) {
			return { type: 'move', placeId: PlaceEnum.FORCEBRUT };
		}
		return {
			type: 'dialog',
			dialogId: 'forcebrut_organizer',
			preferredLinkIds: ['ok']
		};
	}

	return null;
}
