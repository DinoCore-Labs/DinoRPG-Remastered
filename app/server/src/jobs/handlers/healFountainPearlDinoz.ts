import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { prisma } from '../../prisma.js';

const BATCH_SIZE = 200;

export async function healFountainPearlDinozJob() {
	let cursorId: number | undefined;
	let healedCount = 0;

	while (true) {
		const dinozList = await prisma.dinoz.findMany({
			where: {
				placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
				life: {
					gt: 0
				},
				user: {
					rewards: {
						some: {
							rewardId: Reward.PERLE
						}
					}
				}
			},
			select: {
				id: true,
				life: true,
				maxLife: true
			},
			orderBy: {
				id: 'asc'
			},
			take: BATCH_SIZE,
			...(cursorId
				? {
						cursor: { id: cursorId },
						skip: 1
					}
				: {})
		});

		if (dinozList.length === 0) {
			break;
		}

		const updates = dinozList
			.map(dinoz => {
				const nextLife = Math.min(dinoz.maxLife, dinoz.life + 5);

				if (nextLife === dinoz.life) {
					return null;
				}

				return {
					id: dinoz.id,
					life: nextLife
				};
			})
			.filter((entry): entry is { id: number; life: number } => entry !== null);

		if (updates.length > 0) {
			await prisma.$transaction(
				updates.map(entry =>
					prisma.dinoz.update({
						where: { id: entry.id },
						data: {
							life: entry.life
						}
					})
				)
			);

			healedCount += updates.length;
		}

		cursorId = dinozList[dinozList.length - 1]?.id;
	}

	return {
		healedCount
	};
}
