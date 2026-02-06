import { prisma } from '../../prisma.js';

export function addItemToDinoz(dinozId: number, itemId: number) {
	return prisma.dinozItems.create({
		data: {
			dinozId,
			itemId
		}
	});
}
