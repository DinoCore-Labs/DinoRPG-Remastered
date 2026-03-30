import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { GRID_FINISHED_GOLD_REWARD } from '@dinorpg/core/models/gather/gatherRewards.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { addIngredientToInventory } from '../../Inventory/Controller/addIngredient.controller.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { removeItem } from '../../Inventory/Controller/removeItem.controller.js';
import { getPlayerCompletion } from '../../Ranking/Controller/getPlayerCompletion.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addMoney } from '../../User/Controller/money.controller.js';
import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';
import { getNumberOfGatheringTries } from '../../utils/dinoz/getNumberOfGatheringTries.js';
import { getCompiledGather } from '../../utils/gather/gather.compiler.js';
import { discoverBox, getGridSize, saveGrid } from '../../utils/gather/gather.mapper.js';
import { selectBox } from '../../utils/gather/selectBox.js';
import { getDinozGatherData } from '../Controller/getDinozGatherData.controller.js';
import { getCommonGatherInfo } from '../Controller/getGatherInfo.controller.js';
import { updateGrid } from '../Controller/updateGrid.controller.js';

type GatherWithDinozParams = {
	id: string;
};

type GatherWithDinozBody = {
	type: string;
	box: number[][];
};

export async function gatherWithDinozHandler(
	req: FastifyRequest<{ Params: GatherWithDinozParams; Body: GatherWithDinozBody }>,
	_reply: FastifyReply
) {
	const authed = req.user;
	const dinozId = Number(req.params.id);

	const user = await getDinozGatherData(dinozId, authed.id);
	if (!user) {
		throw new ExpectedError('userNotFound', { params: { id: authed.id } });
	}

	const dinozData = user.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	const place = actualPlace(dinozData);
	const availableGatherTypes = place.gathers ?? [];
	const requestedGatherAction = req.body.type.toString().toLowerCase();

	const gather = availableGatherTypes
		.map(type => getCompiledGather(type))
		.find(entry => {
			return String(entry.action).toLowerCase() === requestedGatherAction;
		});

	if (!gather) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}

	const userGrid = await getCommonGatherInfo(authed.id);
	const myGrid = userGrid.find(grid => grid.place === place.placeId && grid.type === gather.type);

	if (!myGrid) {
		throw new ExpectedError(`You don't have generated any grid.`);
	}

	if (!dinozData.gather && !gather.cost) {
		throw new ExpectedError(`Dinoz don't have action to gather`);
	}

	const conditionContext = buildConditionContext(user, dinozId, defaultConditionKeyMaps);

	if (!checkCondition(gather.condition, conditionContext)) {
		throw new ExpectedError(`Dinoz don't have the required conditions to gather at this place`);
	}

	const gatherCost = gather.cost;

	if (gatherCost) {
		const userToken = user.items.find(item => item.itemId === gatherCost.itemId);

		if (!userToken || userToken.quantity < 1) {
			throw new ExpectedError(`You don't have the needed token to gather here.`);
		}

		await removeItem(user.id, gatherCost.itemId, 1);
		await incrementUserStat(StatTracking.ITEM_USED, user.id, 1);
	}

	const boxToSanitize: number[][] = req.body.box;
	const size = getGridSize(myGrid);

	for (const element of boxToSanitize) {
		if (!Array.isArray(element) || element.length !== 2) {
			throw new ExpectedError(`This coordinate is not correct : ${JSON.stringify(element)}`);
		}

		if (!element.every(coord => typeof coord === 'number' && Number.isFinite(coord))) {
			throw new ExpectedError(`This coordinate is not correct : ${JSON.stringify(element)}`);
		}

		if (element.some(coord => coord >= size || coord < 0)) {
			throw new ExpectedError(`This coordinate is out of the grid : ${JSON.stringify(element)}`);
		}
	}

	const boxToOpen = boxToSanitize as [number, number][];

	if (boxToOpen.length > getNumberOfGatheringTries(dinozData, gather)) {
		throw new ExpectedError(`You have selected too many square`);
	}

	const returnGrid = discoverBox(myGrid, gather, ...boxToOpen);
	const nextGridState = saveGrid(myGrid, ...boxToOpen);

	await updateGrid(user.id, dinozId, myGrid.id, nextGridState);

	for (const [index, rewardedItem] of returnGrid.rewards.item.entries()) {
		const existingItem = user.items.find(item => item.itemId === rewardedItem.id);

		if (rewardedItem.id === Item.BOX_HANDLER) {
			const completion = await getPlayerCompletion(user.id);
			if (completion?.ranking?.completion === undefined) {
				throw new ExpectedError(`Failed to find completion.`);
			}

			const box = selectBox(completion.ranking.completion);
			const rewardedBox = user.items.find(item => item.itemId === box.itemId);

			if (rewardedBox) {
				await addItemToInventory(user.id, rewardedBox.itemId, 1);
				rewardedBox.quantity += 1;
			} else {
				user.items.push(await addItemToInventory(user.id, box.itemId, 1));
			}

			returnGrid.rewards.item[index] = {
				id: box.itemId,
				price: box.price,
				quantity: 1,
				maxQuantity: box.maxQuantity
			};

			continue;
		}

		if (existingItem && existingItem.quantity < rewardedItem.maxQuantity) {
			await addItemToInventory(user.id, rewardedItem.id, rewardedItem.quantity);
			existingItem.quantity += rewardedItem.quantity;
		} else if (!existingItem) {
			user.items.push(await addItemToInventory(user.id, rewardedItem.id, rewardedItem.quantity));
		}
	}

	if (returnGrid.rewards.gold > 0) {
		await addMoney(user.id, returnGrid.rewards.gold);
	}

	for (const ingredient of returnGrid.rewards.ingredients) {
		const ingredientToReward = user.ingredients.find(entry => entry.ingredientId === ingredient.ingredientId);

		let isMaxQuantity = false;
		let currentQuantity = ingredientToReward ? ingredientToReward.quantity : 0;

		if (ingredientToReward && ingredientToReward.quantity < ingredient.maxQuantity) {
			if (!ingredientToReward.userId) {
				throw new ExpectedError(`Ingredient ${ingredientToReward.ingredientId} doesn't belong to any player.`);
			}

			await addIngredientToInventory(ingredientToReward.userId, ingredientToReward.ingredientId, 1);

			currentQuantity += 1;
			ingredientToReward.quantity = currentQuantity;

			isMaxQuantity = ingredientToReward.quantity >= ingredient.maxQuantity;
		} else if (ingredientToReward && ingredientToReward.quantity >= ingredient.maxQuantity) {
			currentQuantity = ingredientToReward.quantity;
			isMaxQuantity = true;
		} else {
			currentQuantity = 1;
			user.ingredients.push(await addIngredientToInventory(user.id, ingredient.ingredientId, currentQuantity));
		}

		const existingEntry = returnGrid.ingredientsAtMaxQuantity.find(
			entry => entry.ingredientId === ingredient.ingredientId
		);

		if (existingEntry) {
			existingEntry.quantity = currentQuantity;
			existingEntry.isMaxQuantity = isMaxQuantity;
		} else {
			returnGrid.ingredientsAtMaxQuantity.push({
				ingredientId: ingredient.ingredientId,
				quantity: currentQuantity,
				isMaxQuantity
			});
		}
	}

	if (!gather.cost) {
		await updateDinoz(dinozId, { gather: false });

		if (nextGridState.grid.every(box => box === -1)) {
			returnGrid.isGridComplete = true;
			returnGrid.gridCompletionGoldReward = GRID_FINISHED_GOLD_REWARD;
			await addMoney(user.id, GRID_FINISHED_GOLD_REWARD);
		}
	}

	switch (gather.type) {
		case 0:
		default:
			break;
	}

	switch (gather.type) {
		case gather.type:
			break;
	}

	// Stats
	switch (gather.type) {
		case 0:
			break;
	}

	// Explicit stats mapping
	if (String(gather.action).toLowerCase() === String(req.body.type).toLowerCase()) {
		switch (String(gather.action).toLowerCase()) {
			case 'cueille':
				await incrementUserStat(StatTracking.CUEILLE, user.id, 1);
				break;
			case 'energy':
				await incrementUserStat(StatTracking.ENERGY, user.id, 1);
				break;
			case 'fish':
			case 'peche':
				await incrementUserStat(StatTracking.FISH, user.id, 1);
				break;
			case 'seek':
			case 'fouiller':
				await incrementUserStat(StatTracking.SEEK, user.id, 1);
				break;
			case 'hunt':
			case 'chasse':
				await incrementUserStat(StatTracking.CHASSE, user.id, 1);
				break;
			default:
				break;
		}
	}

	return returnGrid;
}
