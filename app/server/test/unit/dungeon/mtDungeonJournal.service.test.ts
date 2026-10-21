import { buildMtDungeonJournal } from '@dinorpg/core/models/dungeon/dungeon.journal.js';
import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import { MtDungeonArchive } from '../../../src/Dungeon/Service/mtDungeonArchive.service.js';

/** Uses the actual embedded Motion Twin maps and all four archived locale definitions. */
describe('MT 20G — journal on unmodified stepp maps', () => {
	it('shows only the completed Mandragore scroll and not the unopened hot-bread chest', () => {
		const archive = new MtDungeonArchive();
		const cfg = archive.configuration('stepp_0');
		const scroll = cfg.map.levels.flatMap((level, l) =>
			level.rooms.flatMap(room =>
				room.item?.kind === 'IScenario' && room.item.value === 0 ? [{ ...room.item, l }] : []
			)
		)[0];
		expect(scroll).toBeDefined();
		const session = {
			...createMtDungeonSession(cfg),
			flags: [getMtFlagIndex(cfg.map, scroll!.l, scroll!.x, scroll!.y)]
		};
		const localized = archive.localizedDefinition('stepp', 'fr');
		const journal = buildMtDungeonJournal({
			session,
			original: archive.definition('stepp'),
			localized: localized.definition,
			languageUsed: localized.languageUsed,
			getConfiguration: mapId => archive.configuration(mapId)
		});
		expect(journal.entries).toHaveLength(1);
		expect(journal.entries[0]).toMatchObject({ mapId: 'stepp_0', scenarioIndex: 0, icon: 'scroll' });
		expect(journal.entries[0]!.text).toContain('Journal de Mandragore');
		expect(journal.entries.some(entry => entry.scenarioIndex === 1)).toBe(false);
	});
});
