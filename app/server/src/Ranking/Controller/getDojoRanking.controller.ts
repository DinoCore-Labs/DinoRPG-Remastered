import { prisma } from '../../prisma.js';

export async function getDojoRanking(page: number) {
	const pageSize = 20;

	const rank = await prisma.ranking.findMany({
		select: {
			dojo: true,
			user: {
				select: {
					id: true,
					name: true,
					dojo: {
						select: {
							DojoChallengeHistory: true
						}
					}
				}
			}
		},
		orderBy: [{ dojo: 'desc' }, { user: { name: 'asc' } }],
		take: pageSize,
		skip: (page - 1) * pageSize
	});

	return rank.map(p => {
		const history = p.user?.dojo?.DojoChallengeHistory ?? [];
		const victory = history.filter(h => h.victory).length;
		const totalMatch = history.length;

		const worthRatio = totalMatch > 0 ? victory / totalMatch : 0;

		return {
			dojo: p.dojo,
			user: {
				id: p.user?.id,
				name: p.user?.name,
				worth: Math.trunc(worthRatio * 10000) / 100
			}
		};
	});
}
