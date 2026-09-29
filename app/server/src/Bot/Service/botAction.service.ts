import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { moveDinozForUser } from '../../Dinoz/Service/moveDinoz.service.js';
import { restDinoz } from '../../Dinoz/Service/restDinoz.service.js';
import { restoreDinozAction } from '../../Dinoz/Service/useIrma.service.js';
import { processFightForUser } from '../../Fight/Service/fight.service.js';
import { resolveDinozLevelUp } from '../../Level/Service/learnSkill.service.js';
import { BotStrategy } from '../../../../prisma/index.js';
import type { BotDecision } from './botDecision.service.js';
import { chooseBotLevelUp } from './botLevelUp.service.js';

export async function executeBotDecision(userId: string, strategy: BotStrategy, decision: BotDecision) {
	if (decision.action === 'move') {
		if (decision.targetPlaceId === undefined) {
			throw new ExpectedError('missingBotMoveTarget');
		}
		await moveDinozForUser(userId, {
			dinozId: decision.dinozId,
			placeId: decision.targetPlaceId,
			autoReequip: false
		});
		return;
	}

	switch (decision.action) {
		case Action.LEVEL_UP: {
			const choice = await chooseBotLevelUp(decision.dinozId, strategy);
			await resolveDinozLevelUp({
				userId,
				dinozId: decision.dinozId,
				skillIdList: choice.skillIdList,
				tryNumber: choice.tryNumber
			});
			return;
		}

		case Action.REST:
			await restDinoz(userId, decision.dinozId);
			return;

		case Action.FIGHT:
			await processFightForUser(userId, decision.dinozId);
			return;

		case Action.ACTION:
		case Action.IRMA:
		case Action.IRMAS:
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
