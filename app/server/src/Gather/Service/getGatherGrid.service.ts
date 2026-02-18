import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { gatherList } from '@dinorpg/core/models/gather/gatherList.js';
import { GatherPublicGrid } from '@dinorpg/core/models/gather/gatherPublicGrid.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { checkCondition } from '../../utils/checkCondition.js';
import { getNumberOfGatheringTries } from '../../utils/dinoz/getNumberOfGatheringTries.js';
import { getGridSize, hideGridIngredients, initializeGatherGrid } from '../../utils/gather/gather.mapper.js';
import { createGrid } from '../Controller/createGrid.controller.js';
import { getDinozGatherData } from '../Controller/getDinozGatherData.controller.js';
import { getCommonGatherInfo } from '../Controller/getGatherInfo.controller.js';
import { updateGrid } from '../Controller/updateGrid.controller.js';

type GetGatherGridParams = {
	id: string; // on parse en number
	type: string;
};

export async function getGatherGridHandler(
	req: FastifyRequest<{ Params: GetGatherGridParams }>,
	_reply: FastifyReply
): Promise<GatherPublicGrid> {
	const authed = req.user;
	const dinozId = Number(req.params.id);

	const gatherPlaceArray = Object.values(gatherList).filter(g => g.action === req.params.type.toString().toLowerCase());

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
		g => g[0].toLowerCase().replace(/[0-9]/g, '') === req.params.type.toString().toLowerCase()
	);

	if (!typeOfGrid) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}

	const idOfTypeOfGrid = Number(typeOfGrid[1]);

	const userGrid = await getCommonGatherInfo(authed.id);

	const gatherPlace = gatherPlaceArray.find(p => p.type === idOfTypeOfGrid);
	if (!gatherPlace) {
		throw new ExpectedError(`Dinoz cannot gather at this place`);
	}

	if (!checkCondition(gatherPlace.condition, user, dinozId)) {
		throw new ExpectedError(`Dinoz don't have the skill to gather at this place`);
	}

	let myGrid = userGrid.filter(grid => grid.place === place.placeId).find(grid => grid.type === idOfTypeOfGrid) ?? null;

	if (!myGrid) {
		myGrid = await createGrid(initializeGatherGrid(authed.id, place.placeId, gatherPlace));
	}

	// Generate a new one if all box are empty
	if (myGrid.grid.every(box => box === -1)) {
		myGrid = await updateGrid(
			authed.id,
			dinozId,
			myGrid.id,
			initializeGatherGrid(authed.id, place.placeId, gatherPlace)
		);
	}

	const hiddenGrid = hideGridIngredients(myGrid.grid);

	const size = getGridSize(myGrid);
	const unflattenedGrid: Array<Array<number>> = [];
	for (let i = 0; i < hiddenGrid.length; i += size) {
		unflattenedGrid.push(hiddenGrid.slice(i, i + size));
	}

	return {
		grid: unflattenedGrid,
		gatherTurn: getNumberOfGatheringTries(dinozData, gatherPlace),
		gatherType: gatherPlace.apparence.toLowerCase()
	};
}
