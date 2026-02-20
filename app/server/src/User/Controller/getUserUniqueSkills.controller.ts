import { prisma } from '../../prisma.js';

export async function getUserUniqueSkills(userId: string) {
	const user = await prisma.user.findFirst({
		where: {
			id: userId
		},
		select: {
			id: true,
			leader: true,
			engineer: true,
			cooker: true,
			shopKeeper: true,
			merchant: true,
			priest: true,
			teacher: true,
			messie: true,
			matelasseur: true
		}
	});

	return user;
}
