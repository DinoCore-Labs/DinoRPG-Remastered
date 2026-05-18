import { GameLogType, Prisma } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';

export async function updateGrid(
	userId: string,
	dinozId: number,
	gridId: number,
	grid: Omit<Prisma.UserGatherUpdateInput, 'id'>
) {
	const newGrid = prisma.userGather.update({
		where: {
			id: gridId
		},
		data: grid,
		include: {
			user: { select: { id: true } }
		}
	});
	safeCreateGameLog({
		type: GameLogType.Gather,
		userId,
		dinozId,
		values: [],
		metadata: {
			gridId
		}
	});

	return newGrid;
}
