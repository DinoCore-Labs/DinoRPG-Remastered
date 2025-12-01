import { prisma } from '../../prisma.js';

export async function searchUsersByName(name: string) {
	return prisma.user.findMany({
		where: {
			name: {
				contains: name,
				mode: 'insensitive'
			}
		},
		select: {
			id: true,
			name: true
		}
	});
}
