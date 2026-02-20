import { Prisma } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';

export async function setUser(userId: string, user: Prisma.UserUpdateInput) {
	const userData = await prisma.user.update({
		where: {
			id: userId
		},
		data: user
	});

	return userData;
}
