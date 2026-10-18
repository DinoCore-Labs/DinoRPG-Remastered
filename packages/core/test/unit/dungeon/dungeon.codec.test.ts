import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { decodeMtDungeon, DungeonCodecError } from '../../../src/models/dungeon/dungeon.codec.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '../../../src/models/dungeon/dungeon.mapManifest.js';

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
 * Validation de tous les fichiers de l'archive locale (optionnelle, SANS réseau).
 * Usage : MT_DUNGEON_MAPS_DIR=/.../DinoRPG/xml/fr/dungeons pnpm ... test:unit
 * Chaque fichier est comparé d'abord à son blob Git MT exact, puis décodé.
 */
const originalMapsDir = process.env.MT_DUNGEON_MAPS_DIR;
describe.skipIf(!originalMapsDir)('Archive MT locale complète', () => {
	for (const [filename, expectedSha] of Object.entries(ORIGINAL_MT_DUNGEON_MAP_SHA)) {
		it(`vérifie et décode ${filename}`, () => {
			const file = readFileSync(join(originalMapsDir!, filename));
			expect(gitBlobSha(file)).toBe(expectedSha);
			const result = decodeMtDungeon(file.toString('utf8'));
			expect(result.structure.levels.length).toBeGreaterThan(0);
			expect(result.structure.levels.every(l => l.rooms.length > 0)).toBe(true);
		});
	}
});
