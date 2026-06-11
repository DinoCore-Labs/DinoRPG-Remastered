import { prisma } from '../../prisma.js';

export async function getClanScoreRanking(page: number) {
	const clansRanking = await prisma.clan.findMany({
		select: {
			id: true,
			name: true,
			leaderId: true,
			langs: true,
			members: {
				select: {
					user: {
						select: {
							ranking: {
								select: { points: true }
							}
						}
					}
				}
			}
		},
		take: 20,
		skip: (page - 1) * 20
	});

	const ranked = clansRanking
		.map(clan => ({
			clan: {
				id: clan.id,
				name: clan.name,
				languages: clan.langs
			},
			totalPoints: clan.members.reduce((acc, member) => acc + (member.user.ranking?.points ?? 0), 0)
		}))
		.sort((a, b) => b.totalPoints - a.totalPoints);
	return ranked;
}
