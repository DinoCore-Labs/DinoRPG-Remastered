import { prisma } from '../../prisma.js';

export async function getCommonGatherInfo(userId: string) {
	const gathers = await prisma.userGather.findMany({
		where: {
			userId: userId
		},
		select: {
			id: true,
			grid: true,
			place: true,
			type: true,
			user: { select: { id: true } }
		}
	});

	return gathers;
}
