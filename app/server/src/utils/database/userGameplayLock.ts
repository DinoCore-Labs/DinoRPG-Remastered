import { prisma } from '../../prisma.js';

export async function withUserGameplayLock<T>(userId: string, callback: () => Promise<T>): Promise<T> {
	const lockKey = `gameplay:${userId}`;
	return prisma.$transaction(
		async tx => {
			await tx.$executeRaw`
				SELECT pg_advisory_xact_lock(
					hashtextextended(
						${lockKey},
						0::bigint
					)
				)
			`;
			return callback();
		},
		{
			maxWait: 5_000,
			timeout: 30_000
		}
	);
}
