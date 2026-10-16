import { prisma } from '../../prisma.js';
import { getBotPlaceExperienceMap, resolveBotArrivalPlaceId } from './botPlaceExperience.service.js';

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

	const experience = await getBotPlaceExperienceMap(dinozId);
	const rankedTargets = availableTargets.map(targetPlaceId => {
		const arrivalPlaceId = resolveBotArrivalPlaceId(targetPlaceId);
		const memory = experience.get(arrivalPlaceId);
		return {
			targetPlaceId,
			visits: memory?.visits ?? 0,
			lastVisitedAt: memory?.lastVisitedAt?.getTime() ?? 0
		};
	});
	const minimumVisits = Math.min(...rankedTargets.map(target => target.visits));
	const leastVisited = rankedTargets.filter(target => target.visits === minimumVisits);
	const oldestVisit = Math.min(...leastVisited.map(target => target.lastVisitedAt));
	const bestTargets = leastVisited.filter(target => target.lastVisitedAt === oldestVisit);
	const targetPlaceId =
		bestTargets[Math.floor(Math.random() * bestTargets.length)]?.targetPlaceId ?? null;
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
