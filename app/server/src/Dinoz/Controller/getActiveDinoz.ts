import { prisma } from '../../prisma.js';

export async function getActiveDinoz(userId: string) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			userId
			/*OR: [
				{ unavailableReason: null },
				{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
			]*/
		},
		select: {
			//unavailableReason: true,
			user: {
				select: {
					id: true
					//leader: true,
					//messie: true
				}
			}
		}
	});

	return dinozList;
}
