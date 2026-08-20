import { prisma } from '../../prisma.js';

export async function resetDojoChallenge() {
	await prisma.$transaction(async tx => {
		await tx.dojoOpponents.deleteMany();
		await tx.dojoTeam.deleteMany();
		await tx.dojo.updateMany({
			data: {
				dailyReset: 0
			}
		});
	});
}
