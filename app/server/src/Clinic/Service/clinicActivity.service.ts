import type { ClinicActivityStatus } from '@dinorpg/core/models/clinic/clinicActivity.js';

import type { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

/** Only the clinic tables own deadlines. Dinoz.state only marks the Dinoz as unavailable. */
type ClinicActivityReader = Pick<Prisma.TransactionClient, 'clinicTreatment' | 'dinozSurgery'>;

/**
 * Read the pending clinic operations belonging to this user, for the requested Dinoz only.
 * Both Prisma calls run in sequence (compatible with an interactive transaction reader).
 * A finished operation is deliberately never exposed as a countdown.
 */
export async function getActiveClinicStatuses(
	userId: string,
	dinozIds: readonly number[],
	reader: ClinicActivityReader = prisma
): Promise<Map<number, ClinicActivityStatus>> {
	const statuses = new Map<number, ClinicActivityStatus>();
	if (dinozIds.length === 0) return statuses;

	const requestedIds = new Set(dinozIds);
	const treatment = await reader.clinicTreatment.findUnique({
		where: { userId },
		select: { dinozId: true, readyAt: true, finishedAt: true }
	});
	if (treatment && treatment.finishedAt === null && requestedIds.has(treatment.dinozId)) {
		statuses.set(treatment.dinozId, {
			kind: 'treatment',
			readyAt: treatment.readyAt.toISOString()
		});
	}

	const surgeries = await reader.dinozSurgery.findMany({
		where: { userId, dinozId: { in: [...requestedIds] }, finishedAt: null },
		select: { dinozId: true, readyAt: true }
	});
	for (const surgery of surgeries) {
		if (!statuses.has(surgery.dinozId)) {
			statuses.set(surgery.dinozId, { kind: 'surgery', readyAt: surgery.readyAt.toISOString() });
		}
	}
	return statuses;
}
