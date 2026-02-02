import { prisma } from '../../prisma.js';

export async function canDinozRename(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			canRename: true,
			user: { select: { id: true } }
		}
	});

	return dinoz;
}
