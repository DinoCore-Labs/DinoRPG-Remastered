import { prisma } from '../../prisma.js';

export async function deleteDinozInShopRequest(userId: string) {
	await prisma.userDinozShop.deleteMany({
		where: {
			userId
		}
	});
}
