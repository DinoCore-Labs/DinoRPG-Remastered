import { DinozState } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { prisma } from '../../prisma.js';

export async function getActiveDinoz(userId: string) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			userId,
			OR: [{ state: null }, { state: { not: { in: [DinozState.frozen, DinozState.sacrificed] } } }]
		},
		select: {
			state: true,
			user: {
				select: {
					id: true,
					leader: true,
					messie: true
				}
			}
		}
	});
	return dinozList;
}

export async function getActiveDinozCount(userId: string) {
	return prisma.dinoz.count({
		where: {
			userId,
			OR: [{ state: null }, { state: { not: { in: [DinozState.frozen, DinozState.sacrificed] } } }]
		}
	});
}

type DinozLimitUser = {
	leader?: boolean;
	messie?: boolean;
};

export function getUserMaxDinoz(user: DinozLimitUser) {
	let maxDinoz = gameConfig.dinoz.maxQuantity;
	if (user.leader) {
		maxDinoz += 3;
	}
	if (user.messie) {
		maxDinoz += 3;
	}
	return maxDinoz;
}
