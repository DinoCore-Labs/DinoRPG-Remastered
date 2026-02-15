import { prisma } from '../../prisma.js';

// ---- COMPLETION ----
export async function getCompletionRanking(page: number) {
	return prisma.ranking.findMany({
		select: {
			points: true,
			completion: true,
			dinozCount: true,
			user: { select: { id: true, name: true } }
		},
		orderBy: [{ completion: 'desc' }, { user: { name: 'asc' } }],
		take: 20,
		skip: (page - 1) * 20
	});
}
