import { DinozState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function getActiveDinoz(userId: string) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			userId,
			OR: [{ state: null }, { state: { not: { in: [DinozState.frozen, DinozState.sacrificed] } } }]
		},
		select: {
			state: true,
			user: {
				select: {
					id: true,
					leader: true,
					messie: true
				}
			}
		}
	});

	return dinozList;
}
