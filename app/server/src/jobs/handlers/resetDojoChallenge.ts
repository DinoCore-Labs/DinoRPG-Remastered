import { DOJO_MAX_SERIES, DOJO_OPPONENT_IN_SERIE } from '@dinorpg/core/models/dojo/constants.js';
import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { TournamentManager } from '../../utils/tournamentManager.js';

export async function resetDojoChallenge() {
	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	const isQualification = tournament?.phase === TournamentPhase.QUALIFICATION;

	await prisma.$transaction(async tx => {
		const dojosWithOpponents = await tx.dojo.findMany({
			where: {
				DojoOpponents: {
					some: { fighted: true }
				}
			},
			select: {
				id: true,
				dailyReset: true,
				DojoOpponents: {
					select: { achieved: true }
				}
			}
		});

		for (const dojo of dojosWithOpponents) {
			const allAchieved =
				dojo.DojoOpponents.length === DOJO_OPPONENT_IN_SERIE && dojo.DojoOpponents.every(o => o.achieved);

			if (!allAchieved && dojo.dailyReset > 0) {
				await tx.dojo.update({
					where: { id: dojo.id },
					data: { dailyReset: dojo.dailyReset - 1 }
				});
			}
		}

		await tx.dojoOpponents.deleteMany();
		await tx.dojoTeam.deleteMany();

		if (isQualification) {
			await tx.dojo.updateMany({
				data: {
					dailyReset: { increment: DOJO_MAX_SERIES },
					activeChallenge: Prisma.DbNull
				}
			});
		} else {
			await tx.dojo.updateMany({
				data: {
					activeChallenge: Prisma.DbNull
				}
			});
		}
	});
}
