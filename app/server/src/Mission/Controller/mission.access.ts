import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/client.js';

type MissionTransaction = Prisma.TransactionClient;

export async function assertOwnedDinoz(tx: MissionTransaction, userId: string, dinozId: number) {
	const dinoz = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			userId: true,
			level: true,
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError(`Unknown dinoz "${dinozId}"`);
	}
	if (dinoz.userId !== userId) {
		throw new ExpectedError(`You are not allowed to access dinoz "${dinozId}"`);
	}
	return dinoz;
}
