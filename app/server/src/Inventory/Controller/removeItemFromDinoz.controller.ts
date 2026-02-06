import { prisma } from '../../prisma.js';

export async function removeItemFromDinoz(dinozId: number, itemId: number) {
	const item = await prisma.dinozItems.findFirst({
		where: {
			itemId,
			dinozId
		},
		select: {
			id: true
		}
	});

	if (!item) {
		return;
	}

	await prisma.dinozItems.delete({
		where: { id: item.id }
	});
}
