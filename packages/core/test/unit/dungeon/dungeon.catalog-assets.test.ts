/** Non-skipped checks of the four authentic Motion Twin locale assets. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
	assertMtDungeonTranslationCompatible,
	groupMtDungeonDefinitions,
	MT_DUNGEON_DEFINITIONS_SHA,
	MT_DUNGEON_LANGUAGES,
	MT_DUNGEON_MAPS
} from '../../../src/models/dungeon/dungeon.catalog.js';
import { parseMtDungeonDefinitions } from '../../../src/models/dungeon/dungeon.definition.js';

const localeDir = fileURLToPath(new URL('../../../src/models/dungeon/definitions/', import.meta.url));
const readOriginal = (lang: (typeof MT_DUNGEON_LANGUAGES)[number]) => {
	const path = join(localeDir, lang, 'dungeons.xml');
	expect(existsSync(path), `${lang}: fournir le vrai dungeons.xml MT dans definitions/${lang}/`).toBe(true);
	const bytes = readFileSync(path);
	expect(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')).toBe(
		MT_DUNGEON_DEFINITIONS_SHA[lang]
	);
	return groupMtDungeonDefinitions(parseMtDungeonDefinitions(bytes.toString('utf8')));
};

describe('4 catalogues MT inchangés, séparés des 11 cartes', () => {
	it('le français contient 6 donjons et exactement 11 étapes', () => {
		const fr = readOriginal('fr');
		expect([...fr.keys()].sort()).toEqual(Object.keys(MT_DUNGEON_MAPS).sort());
	});
	for (const lang of MT_DUNGEON_LANGUAGES.filter(lang => lang !== 'fr')) {
		it(`${lang}: traduit les mêmes événements sans changer le gameplay`, () => {
			const fr = readOriginal('fr');
			const translated = readOriginal(lang);
			const expectedIds = Object.keys(MT_DUNGEON_MAPS)
				.filter(id => lang !== 'de' || id !== 'labo')
				.sort();
			expect([...translated.keys()].sort()).toEqual(expectedIds);
			for (const [id, localized] of translated) {
				assertMtDungeonTranslationCompatible(fr.get(id)!, localized);
			}
		});
	}
});
