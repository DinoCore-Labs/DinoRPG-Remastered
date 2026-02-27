import { prisma } from '../../prisma.js';

export function getSpecificSecret(secret: string) {
	return prisma.secret.findFirst({
		where: {
			key: secret
		},
		select: { key: true, value: true }
	});
}
