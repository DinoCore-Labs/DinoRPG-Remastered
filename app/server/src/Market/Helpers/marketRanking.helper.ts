import { Prisma } from '../../../../prisma/index.js';

async function refreshAverageTx(tx: Prisma.TransactionClient, userId: string) {
	const ranking = await tx.ranking.findUniqueOrThrow({
		where: { userId },
		select: {
			points: true,
			dinozCount: true
		}
	});

	await tx.ranking.update({
		where: { userId },
		data: {
			average: ranking.dinozCount > 0 ? Math.round(ranking.points / ranking.dinozCount) : 0
		}
	});
}

export async function transferDinozRankingTx(
	tx: Prisma.TransactionClient,
	input: {
		sellerId: string;
		winnerId: string;
		dinozLevel: number;
	}
) {
	await tx.ranking.update({
		where: { userId: input.sellerId },
		data: {
			dinozCount: { decrement: 1 },
			points: { decrement: input.dinozLevel }
		}
	});

	await tx.ranking.update({
		where: { userId: input.winnerId },
		data: {
			dinozCount: { increment: 1 },
			points: { increment: input.dinozLevel }
		}
	});

	await refreshAverageTx(tx, input.sellerId);
	await refreshAverageTx(tx, input.winnerId);
}
