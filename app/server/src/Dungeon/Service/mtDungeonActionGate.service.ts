/** Runtime, server-authoritative movement lock: one spent action blocks the entire group. */
import { evaluateMtDungeonActionGate } from '@dinorpg/core/models/dungeon/dungeon.actionGate.js';

import { prisma } from '../../prisma.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function assertMtDungeonPartyActions(identity: MtSessionIdentity): Promise<void> {
	const members = await prisma.dinoz.findMany({
		where: {
			userId: identity.userId,
			OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
		},
		select: { id: true, leaderId: true, life: true, fight: true }
	});
	const state = evaluateMtDungeonActionGate(members, identity.leaderDinozId);
	if (state === 'ready') return;
	if (state === 'actions-exhausted') throw new MtDungeonSessionError('actions-exhausted');
	if (state === 'party-defeated') throw new MtDungeonSessionError('party-defeated');
	throw new MtDungeonSessionError('invalid-run');
}
