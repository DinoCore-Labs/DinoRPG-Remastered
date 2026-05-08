import { prisma } from '../../prisma.js';

export async function getDinozEquipItemRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			placeId: true,
			user: {
				select: {
					id: true,
					engineer: true,
					shopKeeper: true,
					items: {
						select: { id: true, itemId: true, quantity: true }
					},
					rewards: true,
					scenarios: {
						select: {
							scenarioKey: true,
							progression: true
						}
					}
				}
			},
			items: { select: { id: true, itemId: true } },
			status: { select: { statusId: true } },
			skills: { select: { skillId: true } },
			state: true
		}
	});

	return dinoz;
}
