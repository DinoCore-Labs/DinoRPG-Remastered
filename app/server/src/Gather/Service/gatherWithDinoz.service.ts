import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { gatherList } from '@dinorpg/core/models/gather/gatherList.js';
import { GRID_FINISHED_GOLD_REWARD } from '@dinorpg/core/models/gather/gatherRewards.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
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
import { checkCondition } from '../../utils/checkCondition.js';
import { getNumberOfGatheringTries } from '../../utils/dinoz/getNumberOfGatheringTries.js';
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

	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.body.type.toString().toLowerCase());

	const user = await getDinozGatherData(dinozId, authed.id);
	if (!user) {
		throw new ExpectedError('userNotFound', { params: { id: authed.id } });
	}

	const dinozData = user.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	const place = actualPlace(dinozData);

	const typeOfGridArray = Object.entries(GatherType).filter(g => {
		if (g[1] === place.gather || g[1] === place.specialGather) return true;
		return false;
	});

	const typeOfGrid = typeOfGridArray.find(
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.body.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}

	const idOfTypeOfGrid = Number(typeOfGrid[1]);

	const userGrid = await getCommonGatherInfo(authed.id);

	const gatherPlace = gatherPlaceArray.find(p => p.type === idOfTypeOfGrid);

	const myGrid = userGrid.find(grid => grid.place === place.placeId && grid.type === idOfTypeOfGrid);

	if (!gatherPlace) {
		throw new ExpectedError(`Dinoz cannot gather at this place`);
	}

	if (!dinozData.gather && !gatherPlace.special) {
		throw new ExpectedError(`Dinoz don't have action to gather`);
	}

	if (!myGrid) {
		throw new ExpectedError(`You don't have generated any grid.`);
	}

	if (!checkCondition(gatherPlace.condition, user, dinozId)) {
		throw new ExpectedError(`Dinoz don't have the skill to gather at this place`);
	}

	// Consume token if it's a special gather
	if (gatherPlace.special) {
		const userToken = user.items.find(item => item.itemId === gatherPlace.cost.itemId);
		if (!userToken) throw new ExpectedError(`You don't have the needed token to gather here.`);

		await removeItem(user.id, gatherPlace.cost.itemId, 1);
		await incrementUserStat(StatTracking.ITEM_USED, user.id, 1);
	}

	// Sanitize the box to open
	const boxToSanitize: number[][] = req.body.box;

	for (const element of boxToSanitize) {
		if (!Array.isArray(element) || element.length !== 2) {
			throw new ExpectedError(`This coordinate is not correct : ${JSON.stringify(element)}`);
		}
		if (!element.every(coord => typeof coord === 'number' && Number.isFinite(coord))) {
			throw new ExpectedError(`This coordinate is not correct : ${JSON.stringify(element)}`);
		}
		if (element.some(coord => coord > getGridSize(myGrid) || coord < 0)) {
			throw new ExpectedError(`This coordinate is out of the grid : ${JSON.stringify(element)}`);
		}
	}

	const boxToOpen = boxToSanitize as [number, number][];

	// Check if number of box to open is equal or lower than the number of maximum click
	if (boxToOpen.length > getNumberOfGatheringTries(dinozData, gatherPlace)) {
		throw new ExpectedError(`You have selected too many square`);
	}

	const returnGrid = discoverBox(myGrid, user, gatherPlace, ...boxToOpen);

	await updateGrid(user.id, dinozId, myGrid.id, saveGrid(myGrid, ...boxToOpen));

	for (const [index, i] of returnGrid.rewards.item.entries()) {
		const itemToReward = user.items.find(items => items.itemId === i.id);

		if (i.id === itemList[Item.BOX_HANDLER].itemId) {
			const completion = await getPlayerCompletion(user.id);
			if (completion?.ranking?.completion === undefined) {
				throw new ExpectedError(`Failed to find completion.`);
			}

			const box = selectBox(completion.ranking.completion);
			const boxToReward = user.items.find(items => items.itemId === box.itemId);

			if (boxToReward) {
				await addItemToInventory(user.id, boxToReward.itemId, 1);
			} else {
				user.items.push(await addItemToInventory(user.id, box.itemId, 1));
			}

			returnGrid.rewards.item[index] = {
				id: box.itemId,
				price: box.price,
				quantity: 1,
				maxQuantity: box.maxQuantity
			};
		} else {
			const goldItems = [
				itemList[Item.GOLD100].itemId,
				itemList[Item.GOLD500].itemId,
				itemList[Item.GOLD1000].itemId,
				itemList[Item.GOLD2000].itemId,
				itemList[Item.GOLD2500].itemId,
				itemList[Item.GOLD3000].itemId,
				itemList[Item.GOLD5000].itemId,
				itemList[Item.GOLD10000].itemId,
				itemList[Item.GOLD20000].itemId
			];

			if (itemToReward && itemToReward.quantity < i.maxQuantity && !goldItems.includes(i.id)) {
				await addItemToInventory(user.id, i.id, 1);
				itemToReward.quantity += 1;
			} else if (goldItems.includes(i.id)) {
				await addMoney(user.id, i.price);
			} else {
				user.items.push(await addItemToInventory(user.id, i.id, 1));
			}
		}
	}

	for (const i of returnGrid.rewards.ingredients) {
		const ingredientToReward = user.ingredients.find(ingre => ingre.ingredientId === i.ingredientId);

		let isMaxQuantity = false;
		let currentQuantity = ingredientToReward ? ingredientToReward.quantity : 0;

		if (ingredientToReward && ingredientToReward.quantity < i.maxQuantity) {
			if (!ingredientToReward.userId) {
				throw new ExpectedError(`Ingredient ${ingredientToReward.ingredientId} doesn't belong to any player.`);
			}

			await addIngredientToInventory(ingredientToReward.userId, ingredientToReward.ingredientId, 1);

			currentQuantity += 1;
			ingredientToReward.quantity = currentQuantity;

			isMaxQuantity = ingredientToReward.quantity >= i.maxQuantity;
		} else if (ingredientToReward && ingredientToReward.quantity >= i.maxQuantity) {
			currentQuantity = ingredientToReward.quantity;
			isMaxQuantity = true;
		} else {
			currentQuantity = 1;
			user.ingredients.push(await addIngredientToInventory(user.id, i.ingredientId, currentQuantity));
		}

		const existingEntry = returnGrid.ingredientsAtMaxQuantity.find(ingre => ingre.ingredientId === i.ingredientId);

		if (existingEntry) {
			existingEntry.quantity = currentQuantity;
			existingEntry.isMaxQuantity = isMaxQuantity;
		} else {
			returnGrid.ingredientsAtMaxQuantity.push({
				ingredientId: i.ingredientId,
				quantity: currentQuantity,
				isMaxQuantity
			});
		}
	}

	if (!gatherPlace.special) {
		await updateDinoz(dinozId, { gather: false });

		// Check if the grid was finished and award the player if it has not exhausted its daily grid rewards
		if (myGrid.grid.every(box => box === -1)) {
			returnGrid.isGridComplete = true;

			returnGrid.goldReward = GRID_FINISHED_GOLD_REWARD;
			await addMoney(user.id, returnGrid.goldReward);

			//await createLog(LogType.GridFinished, user.id, undefined, returnGrid.goldReward);
		}
	}

	switch (gatherPlace.type) {
		case GatherType.CUEILLE1:
		case GatherType.CUEILLE2:
		case GatherType.CUEILLE3:
		case GatherType.CUEILLE4:
			await incrementUserStat(StatTracking.CUEILLE, user.id, 1);
			break;

		case GatherType.ENERGY1:
		case GatherType.ENERGY2:
			await incrementUserStat(StatTracking.ENERGY, user.id, 1);
			break;

		case GatherType.FISH:
			await incrementUserStat(StatTracking.FISH, user.id, 1);
			break;

		case GatherType.SEEK:
			await incrementUserStat(StatTracking.SEEK, user.id, 1);
			break;

		case GatherType.HUNT:
			await incrementUserStat(StatTracking.CHASSE, user.id, 1);
			break;

		default:
			break;
	}

	return returnGrid;
}
