import { prisma } from '../../prisma.js';

export async function getOrAssignBotExplorationTarget(
	userId: string,
	dinozId: number,
	availableTargets: number[]
): Promise<number | null> {
	if (availableTargets.length === 0) {
		await clearBotExplorationTarget(dinozId);
		return null;
	}

	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId,
			user: {
				isBot: true
			}
		},
		select: {
			botMemory: {
				select: {
					targetPlaceId: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const rememberedTarget = dinoz.botMemory?.targetPlaceId ?? null;
	if (rememberedTarget !== null && availableTargets.includes(rememberedTarget)) {
		return rememberedTarget;
	}

	const targetPlaceId = availableTargets[Math.floor(Math.random() * availableTargets.length)] ?? null;
	if (targetPlaceId === null) return null;

	await prisma.botDinozMemory.upsert({
		where: {
			dinozId
		},
		create: {
			dinozId,
			targetPlaceId
		},
		update: {
			targetPlaceId
		}
	});

	return targetPlaceId;
}

export async function clearBotExplorationTarget(dinozId: number): Promise<void> {
	await prisma.botDinozMemory.updateMany({
		where: {
			dinozId
		},
		data: {
			targetPlaceId: null
		}
	});
}
