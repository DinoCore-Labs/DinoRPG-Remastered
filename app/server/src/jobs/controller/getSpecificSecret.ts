import { prisma } from '../../prisma.js';

export function getSpecificSecret(secret: string) {
	return prisma.secret.findFirst({
		where: {
			key: secret
		},
		select: { key: true, value: true }
	});
}

export function getAllSecrets() {
	return prisma.secret.findMany({
		select: {
			key: true,
			value: true
		},
		orderBy: {
			key: 'asc'
		}
	});
}
