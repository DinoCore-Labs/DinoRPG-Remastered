import { prisma } from '../../prisma.js';

// ---- AVERAGE ----
export async function getAverageRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			average: true,
			dinozCount: true,
			user: { select: { id: true, name: true } }
		},
		orderBy: [{ average: 'desc' }, { user: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}
