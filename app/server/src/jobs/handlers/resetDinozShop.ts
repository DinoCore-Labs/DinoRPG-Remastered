import { prisma } from '../../prisma.js';

export async function resetDinozShopAtMidnight() {
	await prisma.userDinozShop.deleteMany();
}
