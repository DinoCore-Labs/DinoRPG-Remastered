import { prisma } from '../../prisma.js';

export async function getClanTreasureRanking(page: number) {
	const clans = await prisma.clan.findMany({
		select: {
			id: true,
			name: true,
			treasureValue: true,
			langs: true
		},
		orderBy: [{ treasureValue: 'desc' }],
		take: 20,
		skip: (page - 1) * 20
	});

	return clans.map(clan => ({
		clan: {
			id: clan.id,
			name: clan.name,
			treasureValue: clan.treasureValue,
			languages: clan.langs
		}
	}));
}
