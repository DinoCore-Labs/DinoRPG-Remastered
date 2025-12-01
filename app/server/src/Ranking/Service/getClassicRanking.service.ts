import { prisma } from '../../prisma.js';

// ---- CLASSIC RANKING (points) ----
export async function getClassicRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			average: true,
			dinozCount: true,
			user: {
				select: {
					id: true,
					name: true
				}
			}
		},
		orderBy: [{ points: 'desc' }, { user: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}
