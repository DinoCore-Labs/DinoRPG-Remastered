import { prisma } from '../../prisma.js';

export async function isMember(userId: string, clanId: number): Promise<boolean> {
	const count = await prisma.clanMember.count({
		where: {
			userId: userId,
			clanId: clanId
		}
	});
	return count > 0;
}
