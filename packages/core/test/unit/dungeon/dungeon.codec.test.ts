import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { decodeMtDungeon, DungeonCodecError } from '../../../src/models/dungeon/dungeon.codec.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';
import { MT_DUNGEON_MAPS_ENCODED } from '../../../src/models/dungeon/dungeon.mtData.js';

// Échantillons littéralement repris des archives MT ; aucun plan généré.
const stepp3 =
	'[[30x30x1 14R 10M 2S 2K]]hH4bj1PUyrsOsuur5LvNyTGGRm5OOjguttay5qYuIIHq1v3jUqWuJuDg4n30NqmJGoLhrHjktiQuzzlrdG1OCWc12zO0ndq0AqdYNvvsDBbCZcqKP2rrjbLqahdJqPoyffiyOAHWQziBQK3ya2kpqIKIKuuqu4ackYybBnJNKuYQQOhjGaRaaSWHd';
const mcuzco2 =
	'[[30x30x2 21R 11M 3S 1K]]hH4ck-s0mCKJQQIYS2AQBHLgPrzfNodYMcsEdfsJSivgSdKangHHiPfcIwyobgAdOHeEHgadDHMlKofXthmxlnujlz78ejcgk1cnCXfteZmLioyRbfCnBOBMLBOyQuugL8eytigDzzraDbQNOoZS88gDZajfvqP8GbSAqJLoPjQsAVjanwzMBHXpb1Qqa8jQwPLKtH4mdyobtaQHDvTMyAMWEbMa5yDhqDb0cZeW7bqpfdeK2jjOsssYsssYwAeK2jXacGO4M6MXQbnyaOicyqHJ';

function gitBlobSha(bytes: Uint8Array): string {
	return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

describe('MT DungeonCodec — validation sur les fichiers d’origine', () => {
	it('conserve des échantillons strictement identiques aux blobs MT', () => {
		expect(gitBlobSha(Buffer.from(stepp3, 'utf8'))).toBe(ORIGINAL_MT_DUNGEON_MAP_SHA['stepp_3.xml']);
		expect(gitBlobSha(Buffer.from(mcuzco2, 'utf8'))).toBe(ORIGINAL_MT_DUNGEON_MAP_SHA['mcuzco_2.xml']);
	});

	it('décode le dernier étage des Cavernes Magnétiques', () => {
		const result = decodeMtDungeon(stepp3);
		expect(result.structure.width).toBe(30);
		expect(result.structure.height).toBe(30);
		expect(result.structure.levels).toHaveLength(1);
		expect(result.structure.levels[0]?.rooms).toHaveLength(14);
		expect(result.structure.start).toEqual({ x: 28, y: 19, l: 0 });
		expect(result.structure.exit).toEqual({ x: 2, y: 22, l: 0 });
		expect(result.structure.levels.flatMap(l => l.rooms).filter(r => r.item?.kind === 'IKey')).toHaveLength(2);
		expect(result.checksum).toBe('SWHd');
		expect(result.checksumVerified).toBe(false);
	});

	it('décode deux étages et des IDs de salle continus pour Cuzcous', () => {
		const result = decodeMtDungeon(mcuzco2);
		expect(result.structure.levels.map(l => l.rooms.length)).toEqual([15, 6]);
		expect(result.structure.levels.flatMap(l => l.rooms).map(r => r.id)).toEqual(
			Array.from({ length: 21 }, (_, i) => i)
		);
		expect(result.structure.start).toEqual({ x: 19, y: 11, l: 0 });
		expect(result.structure.exit).toEqual({ x: 10, y: 1, l: 1 });
		expect(result.paddingBits).toBe(1);
	});

	it('rejette les données altérées, tronquées ou incompatibles avec la signature', () => {
		expect(() => decodeMtDungeon(stepp3.replace('14R', '13R'))).toThrow(DungeonCodecError);
		expect(() => decodeMtDungeon(stepp3.slice(0, -20))).toThrow(DungeonCodecError);
		expect(() => decodeMtDungeon(stepp3.replace('hH4', 'h!4'))).toThrow(DungeonCodecError);
	});
});

/**
 * Les cartes ont été ajoutées au dépôt par le développeur : elles font
 * désormais partie des fixtures obligatoires de cette suite. Aucune variable
 * d'environnement, aucun réseau, aucun skip conditionnel.
 *
 * Résolution depuis CE fichier, indépendante du répertoire de lancement
 * de pnpm/Vitest, sur Windows et sur Linux.
 */
describe('11 cartes originales MT versionnées dans le module TS', () => {
	it('contient exactement les 11 cartes historiques', () => {
		expect(Object.keys(MT_DUNGEON_MAPS_ENCODED).sort()).toEqual(Object.keys(ORIGINAL_MT_DUNGEON_MAP_SHA).sort());
	});
	for (const [filename, expectedSha] of Object.entries(ORIGINAL_MT_DUNGEON_MAP_SHA)) {
		it(`vérifie et décode ${filename}`, () => {
			const source = MT_DUNGEON_MAPS_ENCODED[filename as keyof typeof MT_DUNGEON_MAPS_ENCODED];
			expect(gitBlobSha(Buffer.from(source, 'utf8'))).toBe(expectedSha);
			const result = decodeMtDungeon(source);
			expect(result.structure.levels.length).toBeGreaterThan(0);
			expect(result.structure.levels.every(level => level.rooms.length > 0)).toBe(true);
			for (const p of [result.structure.start, result.structure.exit]) {
				expect(p.x).toBeGreaterThanOrEqual(0);
				expect(p.y).toBeGreaterThanOrEqual(0);
				expect(p.l).toBeGreaterThanOrEqual(0);
				expect(p.x).toBeLessThan(result.structure.width);
				expect(p.y).toBeLessThan(result.structure.height);
				expect(p.l).toBeLessThan(result.structure.levels.length);
			}
		});
	}
});
