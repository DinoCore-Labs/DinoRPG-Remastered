/** Read-only, ownership-scoped evidence from archived MT dungeon mechanics. */
import { mtDungeonOriginalPendingEvidence } from '@dinorpg/core/models/dungeon/dungeon.originalEvidence.js';

import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function getMtDungeonOriginalPendingEvidence(identity: MtSessionIdentity) {
	const session = await mtDungeonDependencies().repository.load(identity);
	if (!session) throw new MtDungeonSessionError('not-found');
	const archive = getMtDungeonArchive();
	const configuration = archive.configuration(session.mapId);
	const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
	return mtDungeonOriginalPendingEvidence({
		configuration,
		session,
		definition: archive.definition(dungeonId)
	});
}
