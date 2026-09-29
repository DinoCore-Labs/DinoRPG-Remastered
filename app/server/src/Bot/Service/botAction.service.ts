import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { restDinoz } from '../../Dinoz/Service/restDinoz.service.js';
import { restoreDinozAction } from '../../Dinoz/Service/useIrma.service.js';
import { processFightForUser } from '../../Fight/Service/fight.service.js';
import type { BotDecision } from './botDecision.service.js';

export async function executeBotDecision(userId: string, decision: BotDecision) {
	switch (decision.action) {
		case Action.REST:
			await restDinoz(userId, decision.dinozId);
			return;

		case Action.FIGHT:
			await processFightForUser(userId, decision.dinozId);
			return;

		case Action.ACTION:
			await restoreDinozAction(userId, decision.dinozId);
			return;

		default:
			throw new ExpectedError('unsupportedBotAction', {
				params: {
					action: decision.action
				}
			});
	}
}
