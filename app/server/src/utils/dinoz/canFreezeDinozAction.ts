import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Dinoz, DinozState, DinozStatus } from '../../../../prisma/index.js';

export const UNFREEZE_DURATION_IN_MS = 24 * 60 * 60 * 1000;

type FreezeActionDinoz = Pick<Dinoz, 'placeId' | 'state' | 'life'> & {
	status: Pick<DinozStatus, 'statusId'>[];
};

export function canFreezeDinozAction(dinoz: FreezeActionDinoz): boolean {
	if (dinoz.life <= 0) {
		return false;
	}

	if (dinoz.state !== null) {
		return false;
	}

	if (dinoz.placeId !== PlaceEnum.GORGES_PROFONDES) {
		return false;
	}

	if (!dinoz.status.some(status => status.statusId === DinozStatusId.FSPELE)) {
		return false;
	}

	return true;
}

export function assertCanFreezeDinozAction(dinoz: FreezeActionDinoz) {
	if (dinoz.life <= 0) {
		throw new ExpectedError('Dead dinoz cannot be frozen');
	}

	if (dinoz.state !== null) {
		throw new ExpectedError('Dinoz cannot be frozen in its current state');
	}

	if (dinoz.placeId !== PlaceEnum.GORGES_PROFONDES) {
		throw new ExpectedError('Dinoz must be in Gorges Profondes');
	}

	if (!dinoz.status.some(status => status.statusId === DinozStatusId.FSPELE)) {
		throw new ExpectedError('Dinoz does not have the required freeze status');
	}
}

export function canStartUnfreezingDinozAction(state: DinozState | null, activeDinozCount: number, maxDinoz: number) {
	if (state !== DinozState.frozen) {
		return false;
	}

	return activeDinozCount < maxDinoz;
}

export function assertCanStartUnfreezingDinozAction(
	state: DinozState | null,
	activeDinozCount: number,
	maxDinoz: number
) {
	if (state !== DinozState.frozen) {
		throw new ExpectedError('Dinoz is not frozen');
	}

	if (activeDinozCount >= maxDinoz) {
		throw new ExpectedError('Dinoz limit reached');
	}
}

export function getUnfreezeAt(now = new Date()) {
	return new Date(now.getTime() + UNFREEZE_DURATION_IN_MS);
}
