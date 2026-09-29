import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { moveDinozForUser } from '../../Dinoz/Service/moveDinoz.service.js';
import { restDinoz } from '../../Dinoz/Service/restDinoz.service.js';
import { restoreDinozAction } from '../../Dinoz/Service/useIrma.service.js';
import { processFightForUser } from '../../Fight/Service/fight.service.js';
import { resolveDinozLevelUp } from '../../Level/Service/learnSkill.service.js';
import { BotStrategy } from '../../../../prisma/index.js';
import type { BotDecision } from './botDecision.service.js';
import { executeBotGather, isBotGatherAction } from './botGather.service.js';
import { chooseBotLevelUp } from './botLevelUp.service.js';
import { executeBotTutorialAction } from './botTutorial.service.js';
import { executeBotDialog } from './botDialog.service.js';
import { executeBotMissionInteraction, executeBotMissionWait } from './botMissionAction.service.js';
import { healBotDinoz } from './botHealing.service.js';
import { buyBotDinoz } from './botEconomy.service.js';
import { createBotGroup, ungroupBotDinoz } from './botGroup.service.js';
import { equipBotDinoz } from './botEquipment.service.js';
import { buyBotUsefulItem } from './botShop.service.js';
import { digWithDinoz } from '../../Dinoz/Service/dig.service.js';

export async function executeBotDecision(userId: string, strategy: BotStrategy, decision: BotDecision) {
	if (decision.action === 'shop') {
		if (decision.shopId === undefined) {
			throw new ExpectedError('missingBotShopId');
		}
		await buyBotUsefulItem(userId, decision.shopId);
		return;
	}

	if (decision.action === 'equip') {
		await equipBotDinoz(userId, decision.dinozId);
		return;
	}

	if (decision.action === 'ungroup') {
		await ungroupBotDinoz(userId);
		return;
	}

	if (decision.action === 'group') {
		await createBotGroup(userId);
		return;
	}

	if (decision.action === 'buy_dinoz') {
		await buyBotDinoz(userId);
		return;
	}

	if (decision.action === 'heal') {
		const healed = await healBotDinoz(userId, decision.dinozId);
		if (!healed) {
			await restDinoz(userId, decision.dinozId);
		}
		return;
	}

	if (decision.action === 'progression_dig') {
		await digWithDinoz(userId, decision.dinozId);
		return;
	}

	if (decision.action === 'progression_dialog') {
		if (!decision.dialogId) {
			throw new ExpectedError('missingBotDialogId');
		}
		await executeBotDialog(
			userId,
			decision.dinozId,
			decision.dialogId,
			strategy,
			decision.preferredLinkIds ?? []
		);
		return;
	}

	if (decision.action === 'dialog') {
		if (!decision.dialogId) {
			throw new ExpectedError('missingBotDialogId');
		}
		await executeBotDialog(userId, decision.dinozId, decision.dialogId, strategy);
		return;
	}

	if (decision.action === 'mission_dialog') {
		if (!decision.dialogId) {
			throw new ExpectedError('missingBotDialogId');
		}
		await executeBotDialog(userId, decision.dinozId, decision.dialogId, strategy);
		return;
	}

	if (decision.action === 'mission_interact') {
		await executeBotMissionInteraction(userId, decision.dinozId, strategy);
		return;
	}

	if (decision.action === 'mission_wait') {
		await executeBotMissionWait(decision.dinozId);
		return;
	}

	if (decision.action === 'tutorial_speak') {
		await executeBotTutorialAction(userId, decision.dinozId, decision.action);
		return;
	}

	if (isBotGatherAction(decision.action)) {
		await executeBotGather(userId, decision.dinozId, decision.action);
		return;
	}

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
