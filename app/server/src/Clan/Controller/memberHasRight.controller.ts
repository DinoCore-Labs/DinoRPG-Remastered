import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';

import { prisma } from '../../prisma.js';

export async function memberHasRight(userId: string, clanId: number, right: ClanMemberRight): Promise<boolean> {
	const member = await prisma.clanMember.findUnique({
		where: {
			userId: userId
		},
		select: {
			clanId: true,
			rights: true,
			clan: {
				select: {
					leaderId: true
				}
			}
		}
	});
	if (!member || member.clanId !== clanId) return false;

	if (
		member.clan.leaderId === userId ||
		(member.rights as string[]).includes('all') ||
		(member.rights as string[]).includes(right)
	) {
		return true;
	}
	return false;
}
