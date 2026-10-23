/** MT dungeon healing guard. Heal items work only on a still-active IHeal tile.
 * Resting and resurrection remain forbidden in an active dungeon. */
import { isActiveMtHealZone } from '@dinorpg/core/models/dungeon/dungeon.healZone.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../prisma/index.js';
import { prisma } from '../prisma.js';
import { getMtDungeonArchive } from './Service/mtDungeonRuntime.service.js';

export async function assertNoMtDungeonHealing(
	userId: string,
	dinozId: number,
	db: Pick<Prisma.TransactionClient, 'dinoz' | 'mtDungeonRun'> = prisma,
	allowHealingItemsOnActiveZone = false
): Promise<void> {
	const member = await db.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: { leaderId: true }
	});
	if (!member) return;
	const leaders = [dinozId, ...(member.leaderId === null ? [] : [member.leaderId])];
	const active = await db.mtDungeonRun.findFirst({
		where: { userId, leaderDinozId: { in: leaders } },
		select: { mapId: true, x: true, y: true, l: true, flags: true, locked: true, pending: true }
	});
	if (!active) return;
	if (allowHealingItemsOnActiveZone && !active.locked && active.pending === null) {
		// All coordinates and flags are server-owned. A forged profile request
		// cannot choose a healing tile or reactivate a used zone.
		try {
			const cfg = getMtDungeonArchive().configuration(active.mapId);
			if (isActiveMtHealZone(cfg.map, { x: active.x, y: active.y, l: active.l }, active.flags)) return;
		} catch {
			// Fail closed for malformed/unknown dungeon data.
		}
	}
	throw new ExpectedError('dungeonHealingBlocked', { statusCode: 403 });
}
