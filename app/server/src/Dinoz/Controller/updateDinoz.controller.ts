import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function updateDinoz(dinozId: number, dinoz: Prisma.DinozUpdateInput) {
	await prisma.dinoz.update({
		where: { id: dinozId },
		data: dinoz
	});
}

export async function updateMultipleDinoz(dinozIds: number[], dinoz: Prisma.DinozUpdateInput) {
	await prisma.dinoz.updateMany({
		where: { id: { in: dinozIds } },
		data: dinoz
	});
}
