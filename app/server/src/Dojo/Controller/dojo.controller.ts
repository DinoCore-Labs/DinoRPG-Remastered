import { prisma } from '../../prisma.js';

export async function getDojo(userId: string) {
	const dojo = await prisma.dojo.findUnique({
		where: {
			userId: userId
		},
		select: {
			DojoChallengeHistory: {
				select: {
					victory: true,
					achieved: true
				}
			},
			id: true,
			userId: true,
			reputation: true,
			activeChallenge: true,
			TournamentTeam: true
		}
	});
	return dojo;
}
