import { prisma } from '../../prisma.js';

export async function addStatusToDinoz(dinozId: number, statusId: number) {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

export async function addMultipleStatusToDinoz(dinozId: number, statusIds: number[]) {
	await prisma.dinozStatus.createMany({
		data: statusIds.map(statusId => ({
			dinozId,
			statusId
		}))
	});
}

export async function removeStatusFromDinoz(dinozId: number, statusId: number) {
	await prisma.dinozStatus.delete({
		where: { statusId_dinozId: { dinozId, statusId } }
	});
}

export async function removeAllStatusFromDinoz(dinozId: number) {
	await prisma.dinozStatus.deleteMany({
		where: { dinozId: dinozId }
	});
}
