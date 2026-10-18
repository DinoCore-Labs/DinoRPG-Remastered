import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { decodeMtDungeon } from '@dinorpg/core/models/dungeon/dungeon.codec.js';
import {
	type MtDungeonDefinition,
	parseMtDungeonDefinitions
} from '@dinorpg/core/models/dungeon/dungeon.definition.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '@dinorpg/core/models/dungeon/dungeon.mapManifest.js';
import type { MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonIcon } from '@dinorpg/core/models/dungeon/dungeon.types.js';

const EXPECTED_STAGES: Readonly<Record<string, number>> = {
	stepp: 4,
	katak: 1,
	mbegin: 1,
	mquetz: 1,
	mcuzco: 3,
	labo: 1
};

export class MtDungeonArchiveError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MtDungeonArchiveError';
	}
}

/** A controlled directory, never assembled from a raw client URL. */
export function findMtDungeonArchiveDirectory(): string {
	const override = process.env.MT_DUNGEON_MAPS_DIR;
	if (override) {
		if (existsSync(join(override, 'dungeons.xml'))) return resolve(override);
		throw new MtDungeonArchiveError(`dungeons.xml introuvable dans MT_DUNGEON_MAPS_DIR=${override}`);
	}
	for (const parent of ['.', '..', '../..', '../../..']) {
		const candidate = resolve(process.cwd(), parent, 'packages/core/src/models/dungeon/maps');
		if (existsSync(join(candidate, 'dungeons.xml'))) return candidate;
	}
	throw new MtDungeonArchiveError(
		'Copier le fichier MT original xml/fr/dungeons.xml dans packages/core/src/models/dungeon/maps/dungeons.xml'
	);
}

export function mtGitBlobSha(content: Uint8Array): string {
	const header = Buffer.from(`blob ${content.byteLength}\0`);
	return createHash('sha1').update(header).update(content).digest('hex');
}

function iconsForStage(definition: MtDungeonDefinition, stageIndex: number): DungeonIcon[] {
	return definition.stages[stageIndex]!.scenarios.map(s => {
		if (s.kind.type === 'block') {
			// Dynamic unlock is not implemented until mission/guardian settlement.
			// Fail closed, matching the original DIBlock appearance before unlock.
			return { kind: 'DIBlock' };
		}
		if (s.kind.type === 'monsters') {
			if (!s.kind.keys.length) throw new MtDungeonArchiveError('Empty scenario monster set.');
			return { kind: 'DIMonster', monster: s.kind.keys[0]! };
		}
		if (s.icon) return { kind: 'DIIcon', icon: s.icon };
		return { kind: 'DINothing' };
	});
}

export class MtDungeonArchive {
	private definitionsCache: MtDungeonDefinition[] | null = null;
	private readonly mapCache = new Map<string, MtSessionConfiguration>();
	constructor(private readonly directory: string = findMtDungeonArchiveDirectory()) {}

	definitions(): readonly MtDungeonDefinition[] {
		if (!this.definitionsCache) {
			const bytes = readFileSync(join(this.directory, 'dungeons.xml'));
			if (mtGitBlobSha(bytes) !== '82f6f047231953c08f4bec923ca8d39f67d847e4')
				throw new MtDungeonArchiveError(
					'dungeons.xml n’est pas le fichier MT français original (empreinte Git différente).'
				);
			const definitions = parseMtDungeonDefinitions(bytes.toString('utf8'));
			const found = Object.fromEntries(definitions.map(d => [d.id, d.stages.length]));
			if (JSON.stringify(Object.entries(found).sort()) !== JSON.stringify(Object.entries(EXPECTED_STAGES).sort())) {
				throw new MtDungeonArchiveError('dungeons.xml ne correspond pas aux six donjons MT français originaux.');
			}
			this.definitionsCache = definitions;
		}
		return this.definitionsCache;
	}

	definition(id: string): MtDungeonDefinition {
		const def = this.definitions().find(d => d.id === id);
		if (!def) throw new MtDungeonArchiveError(`Donjon MT inconnu: ${id}`);
		return def;
	}

	configuration(mapId: string): MtSessionConfiguration {
		if (!/^[a-z][a-z\d]*_[0-9]+$/.test(mapId)) throw new MtDungeonArchiveError('Identifiant de carte MT invalide.');
		const cached = this.mapCache.get(mapId);
		if (cached) return cached;
		const idx = mapId.lastIndexOf('_');
		const id = mapId.slice(0, idx);
		const stageIndex = Number(mapId.slice(idx + 1));
		const def = this.definition(id);
		if (!Number.isSafeInteger(stageIndex) || stageIndex < 0 || stageIndex >= def.stages.length)
			throw new MtDungeonArchiveError(`Étape de donjon inconnue: ${mapId}`);
		const filename = `${mapId}.xml` as keyof typeof ORIGINAL_MT_DUNGEON_MAP_SHA;
		const expected = ORIGINAL_MT_DUNGEON_MAP_SHA[filename];
		if (!expected) throw new MtDungeonArchiveError(`Carte originale inconnue: ${filename}`);
		const bytes = readFileSync(join(this.directory, filename));
		const actual = mtGitBlobSha(bytes);
		if (actual !== expected)
			throw new MtDungeonArchiveError(
				`${filename}: empreinte Git invalide (${actual}); ne pas utiliser une carte modifiée.`
			);
		const map = decodeMtDungeon(bytes.toString('utf8')).structure;
		const scenarioIcons = iconsForStage(def, stageIndex);
		for (const level of map.levels) {
			for (const room of level.rooms) {
				if (room.item?.kind === 'IScenario' && !scenarioIcons[room.item.value])
					throw new MtDungeonArchiveError(`${filename}: IScenario #${room.item.value} hors des définitions MT.`);
			}
		}
		const cfg: MtSessionConfiguration = { map, mapId, tower: def.tower, scenarioIcons };
		this.mapCache.set(mapId, cfg);
		return cfg;
	}
}
