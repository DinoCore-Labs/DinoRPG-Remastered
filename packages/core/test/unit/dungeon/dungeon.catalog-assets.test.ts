import { describe, expect, it } from 'vitest';

import {
	groupMtDungeonDefinitions,
	localizeMtDungeonDefinition,
	MT_DUNGEON_MAPS
} from '../../../src/models/dungeon/dungeon.catalog.js';
import { decodeMtDungeon } from '../../../src/models/dungeon/dungeon.codec.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';
import { MT_DUNGEON_DEFINITIONS, MT_DUNGEON_MAPS_ENCODED } from '../../../src/models/dungeon/dungeon.mtData.js';

describe('static Motion Twin dungeon archive', () => {
	it('provides every original map as a decodable static string', () => {
		expect(Object.keys(MT_DUNGEON_MAPS_ENCODED).sort()).toEqual(Object.keys(ORIGINAL_MT_DUNGEON_MAP_SHA).sort());
		const fr = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS.fr);
		for (const [file, encoded] of Object.entries(MT_DUNGEON_MAPS_ENCODED)) {
			const [dungeonId, stageString] = file.replace(/\.xml$/, '').split('_');
			const stage = fr.get(dungeonId as keyof typeof MT_DUNGEON_MAPS)?.stages[Number(stageString)];
			expect(stage, file).toBeDefined();
			const map = decodeMtDungeon(encoded).structure;
			expect(map.levels.length, file).toBeGreaterThan(0);
			for (const level of map.levels) {
				for (const room of level.rooms) {
					if (room.item?.kind === 'IScenario') {
						expect(stage?.scenarios[room.item.value], `${file} scenario ${room.item.value}`).toBeDefined();
					}
				}
			}
		}
	});
	it('preserves the original language inventory and identical mechanics', () => {
		const original = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS.fr);
		expect([...original.keys()].sort()).toEqual(Object.keys(MT_DUNGEON_MAPS).sort());
		for (const language of ['en', 'es', 'de'] as const) {
			const translated = groupMtDungeonDefinitions(MT_DUNGEON_DEFINITIONS[language]);
			for (const [id, definition] of translated) {
				expect(localizeMtDungeonDefinition(original.get(id)!, definition, language).languageUsed).toBe(language);
			}
		}
	});
});
