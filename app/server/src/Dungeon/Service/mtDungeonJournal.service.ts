/** Authenticated, read-only archive of already completed MT dungeon scenarios. */
import { normalizeMtDungeonLanguage } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { buildMtDungeonJournal } from '@dinorpg/core/models/dungeon/dungeon.journal.js';

import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function getMtDungeonJournal(identity: MtSessionIdentity, language: unknown) {
	// The owner-only repository query prevents reading another player's journal.
	const session = await mtDungeonDependencies().repository.load(identity);
	if (!session) throw new MtDungeonSessionError('not-found');
	const archive = getMtDungeonArchive();
	const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
	const canonical = archive.definition(dungeonId);
	const localized = archive.localizedDefinition(dungeonId, normalizeMtDungeonLanguage(language));
	return buildMtDungeonJournal({
		session,
		original: canonical,
		localized: localized.definition,
		languageUsed: localized.languageUsed,
		getConfiguration: mapId => archive.configuration(mapId)
	});
}
