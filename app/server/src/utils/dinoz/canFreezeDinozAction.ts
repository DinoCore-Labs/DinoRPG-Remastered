import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Dinoz, DinozStatus } from '../../../../prisma/index.js';

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
