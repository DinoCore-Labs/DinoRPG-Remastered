import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { GatherPublicGrid } from '@dinorpg/core/models/gather/gatherPublicGrid.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';
import { getNumberOfGatheringTries } from '../../utils/dinoz/getNumberOfGatheringTries.js';
import { getCompiledGather } from '../../utils/gather/gather.compiler.js';
import { getGridSize, hideGridIngredients, initializeGatherGrid } from '../../utils/gather/gather.mapper.js';
import { createGrid } from '../Controller/createGrid.controller.js';
import { getDinozGatherData } from '../Controller/getDinozGatherData.controller.js';
import { getCommonGatherInfo } from '../Controller/getGatherInfo.controller.js';
import { updateGrid } from '../Controller/updateGrid.controller.js';

type GetGatherGridParams = {
	id: string;
	type: string;
};

export async function getGatherGrid(
	userId: string,
	dinozId: number,
	requestedType: string
): Promise<GatherPublicGrid> {

	const user = await getDinozGatherData(dinozId, userId);
	if (!user) {
		throw new ExpectedError('userNotFound', { params: { userId: userId } });
	}

	const dinozData = user.dinoz.find(d => d.id === dinozId);
	if (!dinozData) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	const place = actualPlace(dinozData);
	const availableGatherTypes = place.gathers ?? [];
	const requestedGatherAction = requestedType.toString().toLowerCase();

	const gather = availableGatherTypes
		.map(type => getCompiledGather(type))
		.find(entry => {
			return String(entry.action).toLowerCase() === requestedGatherAction;
		});

	if (!gather) {
		throw new ExpectedError(`This type of grid doesn't exist`);
	}

	const conditionContext = buildConditionContext(user, dinozId, defaultConditionKeyMaps);

	if (!checkCondition(gather.condition, conditionContext)) {
		throw new ExpectedError(`Dinoz don't have the required conditions to gather at this place`);
	}

	const userGrid = await getCommonGatherInfo(userId);

	let myGrid = userGrid.find(grid => grid.place === place.placeId && grid.type === gather.type) ?? null;

	if (!myGrid) {
		myGrid = await createGrid(initializeGatherGrid(userId, place.placeId, gather, conditionContext));
	}

	if (myGrid.grid.every(box => box === -1)) {
		myGrid = await updateGrid(
			userId,
			dinozId,
			myGrid.id,
			initializeGatherGrid(userId, place.placeId, gather, conditionContext)
		);
	}

	const hiddenGrid = hideGridIngredients(myGrid.grid);

	const size = getGridSize(myGrid);
	const unflattenedGrid: number[][] = [];
	for (let index = 0; index < hiddenGrid.length; index += size) {
		unflattenedGrid.push(hiddenGrid.slice(index, index + size));
	}

	return {
		grid: unflattenedGrid,
		gatherTurn: getNumberOfGatheringTries(dinozData, gather),
		gatherType: gather.apparence.toLowerCase()
	};
}

export async function getGatherGridHandler(
	req: FastifyRequest<{ Params: GetGatherGridParams }>,
	_reply: FastifyReply
): Promise<GatherPublicGrid> {
	return getGatherGrid(req.user.id, Number(req.params.id), req.params.type);
}
