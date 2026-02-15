import { Prisma } from '../../../../prisma/index.js';
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

	//await createLog(LogType.Gather, userId, dinozId);

	return newGrid;
}
