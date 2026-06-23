import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';

import { prisma } from '../../prisma.js';

export async function isLeader(userId: string, clanId: number): Promise<boolean> {
	const clan = await prisma.clan.findUnique({
		where: {
			id: clanId
		},
		select: {
			leaderId: true
		}
	});
	if (!clan) return false;

	if (clan.leaderId === userId) {
		return true;
	}
	return false;
}
