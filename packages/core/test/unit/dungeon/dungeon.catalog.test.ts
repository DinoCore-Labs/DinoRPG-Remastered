import { describe, expect, it } from 'vitest';

import {
	assertMtDungeonTranslationCompatible,
	groupMtDungeonDefinitions,
	localizeMtDungeonDefinition,
	MT_DUNGEON_DEFINITIONS_SHA,
	MT_DUNGEON_LANGUAGES,
	MT_DUNGEON_MAPS,
	normalizeMtDungeonLanguage
} from '../../../src/models/dungeon/dungeon.catalog.js';
import { parseMtDungeonDefinitions } from '../../../src/models/dungeon/dungeon.definition.js';

const fixture = (id = 'stepp', name = 'Cavernes', text = 'Entrée', item = 'hotpan') => `
<dungeons><d id="${id}" name="${name}" gold="100" monsters="worm" cond="active(cavmagnet)">
  <enter place="spylon">${text}</enter>
  <stage skin="desert"><scenario obj="${item}" count="6">${text}</scenario></stage>
  <exit place="spylon">${text}</exit>
</d></dungeons>`;
const original = parseMtDungeonDefinitions(fixture())[0]!;
const english = parseMtDungeonDefinitions(fixture('stepp', 'Magnetic Caverns', 'Entrance'))[0]!;

describe('Catalogue des donjons MT et traductions originales', () => {
	it('sépare explicitement les 6 donjons en 11 cartes', () => {
		expect(Object.keys(MT_DUNGEON_MAPS)).toHaveLength(6);
		expect(Object.values(MT_DUNGEON_MAPS).flat()).toHaveLength(11);
		expect(
			Object.values(MT_DUNGEON_MAPS)
				.flat()
				.every(f => /^\w+_\d+\.xml$/.test(f))
		).toBe(true);
	});
	it('répertorie les 4 langues originales et leur identité Git', () => {
		expect(MT_DUNGEON_LANGUAGES).toEqual(['fr', 'en', 'es', 'de']);
		expect(Object.values(MT_DUNGEON_DEFINITIONS_SHA).every(s => /^[a-f\d]{40}$/.test(s))).toBe(true);
	});
	it('accepte les langues de Remastered en majuscules et les variantes territoriales', () => {
		expect(normalizeMtDungeonLanguage('EN')).toBe('en');
		expect(normalizeMtDungeonLanguage('de-DE')).toBe('de');
		expect(normalizeMtDungeonLanguage('es_ES')).toBe('es');
		expect(normalizeMtDungeonLanguage('it')).toBe('fr');
	});
	it('ne traduit que le texte, sans altérer les règles historiques', () => {
		const result = localizeMtDungeonDefinition(original, english, 'en');
		expect(result.languageUsed).toBe('en');
		expect(result.definition.name).toBe('Magnetic Caverns');
		expect(result.definition.enter.text).toBe('Entrance');
		expect(result.definition.stages[0]!.scenarios[0]!.text).toBe('Entrance');
		expect(result.definition.stages[0]!.scenarios[0]!.kind).toEqual(original.stages[0]!.scenarios[0]!.kind);
		expect(original.name).toBe('Cavernes');
	});
	it('replie uniquement le donjon absent (labo DE) sur le texte FR', () => {
		const result = localizeMtDungeonDefinition(original, undefined, 'de');
		expect(result.languageUsed).toBe('fr');
		expect(result.definition).toBe(original);
	});
	it('refuse un scénario dont la mécanique est différente dans une traduction', () => {
		const tampered = parseMtDungeonDefinitions(fixture('stepp', 'Caverns', 'Entrance', 'irma'))[0]!;
		expect(() => assertMtDungeonTranslationCompatible(original, tampered)).toThrow('scenario');
	});
	it('refuse une traduction avec un nombre de niveaux différent', () => {
		const modified = { ...english, stages: [...english.stages, ...english.stages] };
		expect(() => assertMtDungeonTranslationCompatible(original, modified)).toThrow('metadata');
	});
	it('indexe les donjons indépendamment de leur ordre dans le fichier source', () => {
		const katak = { ...original, id: 'katak' };
		const indexed = groupMtDungeonDefinitions([katak]);
		expect(indexed.get('katak')).toBe(katak);
		expect(() => groupMtDungeonDefinitions([katak, katak])).toThrow('Duplicate');
		expect(() => groupMtDungeonDefinitions([{ ...original, id: 'unknown' }])).toThrow('Unknown');
	});
});
