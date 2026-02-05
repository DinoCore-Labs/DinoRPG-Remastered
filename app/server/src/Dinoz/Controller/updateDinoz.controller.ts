import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function updateDinoz(dinozId: number, dinoz: Prisma.DinozUpdateInput) {
	await prisma.dinoz.update({
		where: { id: dinozId },
		data: dinoz
	});
}
