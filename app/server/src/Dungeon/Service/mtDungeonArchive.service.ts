/**
 * Reads the user's locally archived, unmodified Motion Twin XML files.
 * No runtime download, regenerated map, or invented dungeon metadata.
 * MT sources: xml/{fr,en,es,de}/dungeons.xml; xml/dungeons/<id>_<stage>.xml;
 *              src/data/Dungeon.hx and gfx/dungeon/View.hx.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
	groupMtDungeonDefinitions,
	localizeMtDungeonDefinition,
	MT_DUNGEON_DEFINITIONS_SHA,
	MT_DUNGEON_LANGUAGES,
	MT_DUNGEON_MAPS,
	type MtDungeonLanguage,
	normalizeMtDungeonLanguage
} from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { decodeMtDungeon } from '@dinorpg/core/models/dungeon/dungeon.codec.js';
import {
	type MtDungeonDefinition,
	parseMtDungeonDefinitions
} from '@dinorpg/core/models/dungeon/dungeon.definition.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '@dinorpg/core/models/dungeon/dungeon.mapManifest.js';
import type { MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonIcon } from '@dinorpg/core/models/dungeon/dungeon.types.js';

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
		if (existsSync(join(override, 'stepp_0.xml'))) return resolve(override);
		throw new MtDungeonArchiveError(`Cartes introuvables dans MT_DUNGEON_MAPS_DIR=${override}`);
	}
	for (const parent of ['.', '..', '../..', '../../..']) {
		const candidate = resolve(process.cwd(), parent, 'packages/core/src/models/dungeon/maps');
		if (existsSync(join(candidate, 'stepp_0.xml'))) return candidate;
	}
	throw new MtDungeonArchiveError('Cartes MT manquantes dans packages/core/src/models/dungeon/maps/');
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

/** Original metadata is deliberately outside `maps/`, which contains exactly 11 layouts. */
export function findMtDungeonDefinitionsDirectory(mapDirectory: string): string {
	return resolve(process.env.MT_DUNGEON_DEFINITIONS_DIR ?? join(mapDirectory, '..', 'definitions'));
}

export class MtDungeonArchive {
	private readonly definitionsCache = new Map<MtDungeonLanguage, readonly MtDungeonDefinition[]>();
	private readonly mapCache = new Map<string, MtSessionConfiguration>();
	constructor(
		private readonly directory: string = findMtDungeonArchiveDirectory(),
		private readonly definitionsDirectory: string = findMtDungeonDefinitionsDirectory(directory)
	) {}

	/** Loads an entire *original* locale file, checks byte integrity and mechanics. */
	definitions(language: MtDungeonLanguage = 'fr'): readonly MtDungeonDefinition[] {
		const cached = this.definitionsCache.get(language);
		if (cached) return cached;
		if (!MT_DUNGEON_LANGUAGES.includes(language)) throw new MtDungeonArchiveError(`Langue MT inconnue: ${language}`);
		const path = join(this.definitionsDirectory, language, 'dungeons.xml');
		if (!existsSync(path)) throw new MtDungeonArchiveError(`Métadonnées MT manquantes: ${path}`);
		const bytes = readFileSync(path);
		if (mtGitBlobSha(bytes) !== MT_DUNGEON_DEFINITIONS_SHA[language])
			throw new MtDungeonArchiveError(`${language}/dungeons.xml: empreinte Git MT invalide.`);
		const definitions = parseMtDungeonDefinitions(bytes.toString('utf8'));
		const indexed = groupMtDungeonDefinitions(definitions);
		const expectedIds = Object.keys(MT_DUNGEON_MAPS)
			.filter(id => language !== 'de' || id !== 'labo')
			.sort();
		if (JSON.stringify([...indexed.keys()].sort()) !== JSON.stringify(expectedIds))
			throw new MtDungeonArchiveError(`${language}/dungeons.xml: inventaire historique inattendu.`);
		if (language !== 'fr') {
			const originals = groupMtDungeonDefinitions(this.definitions('fr'));
			for (const [id, translated] of indexed) {
				// Validation also detects any change to a scenario index or reward payload.
				localizeMtDungeonDefinition(originals.get(id)!, translated, language);
			}
		}
		this.definitionsCache.set(language, definitions);
		return definitions;
	}

	definition(id: string): MtDungeonDefinition {
		const def = this.definitions('fr').find(d => d.id === id);
		if (!def) throw new MtDungeonArchiveError(`Donjon MT inconnu: ${id}`);
		return def;
	}

	localizedDefinition(
		id: string,
		inputLanguage: unknown
	): {
		definition: MtDungeonDefinition;
		languageUsed: MtDungeonLanguage;
	} {
		const language = normalizeMtDungeonLanguage(inputLanguage);
		const canonical = this.definition(id);
		if (language === 'fr') return { definition: canonical, languageUsed: 'fr' };
		const translation = this.definitions(language).find(d => d.id === id);
		return localizeMtDungeonDefinition(canonical, translation, language);
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
