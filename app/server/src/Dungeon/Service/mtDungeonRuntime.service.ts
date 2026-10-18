/** Wiring against existing Remastered auth, conditions and locks. */
import { mtDungeonEntryCondition } from '@dinorpg/core/models/dungeon/dungeon.definition.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { withUserGameplayLock } from '../../utils/database/userGameplayLock.js';
import { canGoToThisPlace } from '../../utils/dinoz/dinozFiche.mapper.js';
import { prismaMtDungeonRunRepository } from '../Repository/prismaMtDungeonRun.repository.js';
import { MtDungeonArchive } from './mtDungeonArchive.service.js';
import type { MtDungeonSessionDependencies, MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonEntryError extends Error {
	constructor(public readonly reason: string) {
		super(`MT dungeon entry denied: ${reason}`);
	}
}

/** Check exact original entrance condition using Remastered's condition engine. */
export async function assertMtDungeonEntry(
	archive: MtDungeonArchive,
	identity: MtSessionIdentity,
	mapId: string
): Promise<void> {
	const [dungeonId, stageIndex] = mapId.split('_');
	// Players enter only through the first stage; later stages require trusted server transition.
	if (stageIndex !== '0') throw new MtDungeonEntryError('non-entry-stage');
	const def = archive.definition(dungeonId!);
	const place = Object.values(placeListv2).find(p => p.name === def.enter.place);
	if (!place) throw new MtDungeonEntryError('unknown-mt-entry-place');
	const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);
	if (!user) throw new MtDungeonEntryError('user-not-found');
	const leader = user.dinoz.find((d: (typeof user.dinoz)[number]) => d.id === identity.leaderDinozId);
	if (!leader || leader.leaderId !== null || leader.userId !== identity.userId)
		throw new MtDungeonEntryError('not-owned-leader');
	if (leader.canRename) throw new MtDungeonEntryError('unnamed-dinoz');
	if (user.dinoz.some((d: (typeof user.dinoz)[number]) => d.placeId !== place.placeId))
		throw new MtDungeonEntryError('group-not-at-entrance');
	if (
		user.dinoz.some(
			(d: (typeof user.dinoz)[number]) => d.life <= 0 || d.state !== null || d.concentration !== null || !d.fight
		)
	)
		throw new MtDungeonEntryError('group-unavailable');
	const condition = mtDungeonEntryCondition(def.condition);
	for (const member of user.dinoz) {
		if (!canGoToThisPlace({ ...user, dinoz: [member] }, condition, member.id))
			throw new MtDungeonEntryError('condition-not-met');
	}
}

let singleton: MtDungeonArchive | null = null;
export function getMtDungeonArchive(): MtDungeonArchive {
	return (singleton ??= new MtDungeonArchive());
}

export function mtDungeonDependencies(): MtDungeonSessionDependencies {
	const archive = getMtDungeonArchive();
	return {
		repository: prismaMtDungeonRunRepository,
		getConfiguration: mapId => archive.configuration(mapId),
		getStageCount: dungeonId => archive.definition(dungeonId).stages.length,
		withLock: withUserGameplayLock,
		beforeOpen: (identity, mapId) => assertMtDungeonEntry(archive, identity, mapId)
	};
}
