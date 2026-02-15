import { prisma } from '../../prisma.js';

export async function getPlayerCompletion(playerId: string) {
	return await prisma.user.findUnique({
		where: {
			id: playerId
		},
		select: {
			ranking: {
				select: {
					completion: true
				}
			}
		}
	});
}
