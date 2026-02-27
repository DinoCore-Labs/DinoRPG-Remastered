import { prisma } from '../../prisma.js';

export function setSpecificSecret(secret: string, value: string) {
	return prisma.secret.update({
		where: {
			key: secret
		},
		data: { value: value }
	});
}
