import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function createGrid(grid: Prisma.UserGatherCreateInput) {
	return prisma.userGather.create({
		data: grid,
		include: {
			user: { select: { id: true } }
		}
	});
}
