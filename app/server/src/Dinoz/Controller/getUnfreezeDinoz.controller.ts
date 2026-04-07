import { DinozState, Prisma } from '../../../../prisma/index.js';

export async function applyUnfreezeIfNeeded(tx: Prisma.TransactionClient, dinozId: number) {
	const dinoz = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			state: true,
			stateTimer: true
		}
	});

	if (!dinoz) {
		return null;
	}

	if (dinoz.state !== DinozState.unfreezing) {
		return dinoz;
	}

	if (!dinoz.stateTimer) {
		return dinoz;
	}

	if (dinoz.stateTimer.getTime() > Date.now()) {
		return dinoz;
	}

	return tx.dinoz.update({
		where: { id: dinoz.id },
		data: {
			state: null,
			stateTimer: null
		},
		select: {
			id: true,
			state: true,
			stateTimer: true
		}
	});
}
