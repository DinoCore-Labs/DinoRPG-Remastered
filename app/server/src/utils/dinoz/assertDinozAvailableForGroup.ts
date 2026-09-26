import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

type GroupDinoz = {
	id: number;
	life: number;
	state: string | null;
};

export function assertDinozAvailableForGroup(dinoz: GroupDinoz): void {
	if (dinoz.life <= 0) {
		throw new ExpectedError('dinozGroupDead', {
			params: {
				dinozId: dinoz.id
			}
		});
	}
	if (dinoz.state !== null) {
		throw new ExpectedError('dinozGroupUnavailable', {
			params: {
				dinozId: dinoz.id,
				state: dinoz.state
			}
		});
	}
}
