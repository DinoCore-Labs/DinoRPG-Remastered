import { prisma } from '../../prisma.js';

export async function getBoxHandlerInformations(playerId: string) {
	const player = await prisma.user.findUnique({
		where: {
			id: playerId
		},
		select: {
			id: true,
			_count: {
				select: {
					dinoz: {
						/*where: {
							OR: [
								{ unavailableReason: null },
								{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
							]
						}*/
					}
				}
			},
			dinoz: {
				select: {
					level: true,
					_count: {
						select: {
							//missions: { where: { isFinished: true } }
						}
					}
				}
				/*where: {
					OR: [
						{ unavailableReason: null },
						{ unavailableReason: { not: { in: [UnavailableReason.frozen, UnavailableReason.sacrificed] } } }
					]
				}*/
			},
			rewards: true //,
			//cooker: true,
			//engineer: true,
			//leader: true,
			//matelasseur: true,
			//merchant: true,
			//messie: true,
			//teacher: true,
			//priest: true,
			//shopKeeper: true
		}
	});

	return player;
}
