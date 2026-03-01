import { Monster } from '@dinorpg/core/models/monster/monsterList.js';

import { prisma } from '../../prisma.js';

export function createCatch(dinozId: number, monsterId: Monster, hp: number) {
	return prisma.dinozCatch.create({
		data: {
			dinozId,
			monsterId,
			hp
		}
	});
}

export async function updateCatch(id: number, hp: number) {
	await prisma.dinozCatch.update({
		where: { id },
		data: { hp }
	});
}

export async function removeCatch(id: number) {
	await prisma.dinozCatch.delete({
		where: { id }
	});
}
