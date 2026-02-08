import { prisma } from '../../prisma.js';

export async function ownsDinoz(userId: string, ...dinozIds: number[]) {
	const player = await prisma.user.count({
		where: {
			id: userId,
			AND: dinozIds.map(dinozId => ({
				dinoz: {
					some: {
						id: dinozId
					}
				}
			}))
		}
	});

	return player > 0;
}
