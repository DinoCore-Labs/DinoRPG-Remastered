/** A read-only, authenticated pending encounter. No fights or rewards here. */
import { normalizeMtDungeonLanguage } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { describeMtDungeonPendingEncounter } from '@dinorpg/core/models/dungeon/dungeon.encounter.js';

import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import { MtDungeonSessionError, type MtSessionIdentity } from './mtDungeonSession.service.js';

export async function getMtDungeonPendingEncounter(identity: MtSessionIdentity, language: unknown) {
	const repository = mtDungeonDependencies().repository;
	const session = await repository.load(identity);
	if (!session) throw new MtDungeonSessionError('not-found');
	const archive = getMtDungeonArchive();
	const config = archive.configuration(session.mapId);
	const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
	const original = archive.definition(dungeonId);
	const localized = archive.localizedDefinition(dungeonId, normalizeMtDungeonLanguage(language));
	return describeMtDungeonPendingEncounter({
		configuration: config,
		session,
		definition: original,
		localized: localized.definition,
		languageUsed: localized.languageUsed
	});
}
