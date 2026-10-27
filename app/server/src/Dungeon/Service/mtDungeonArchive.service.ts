/**
 * Loads typed Motion Twin definitions and original encoded maps from the core bundle.
 * No runtime download, regenerated map, or invented dungeon metadata.
 * MT sources: xml/{fr,en,es,de}/dungeons.xml; xml/dungeons/<id>_<stage>.xml;
 *              src/data/Dungeon.hx and gfx/dungeon/View.hx.
 */

import { compileMtDungeonBlockRules } from '@dinorpg/core/models/dungeon/dungeon.blocks.js';
import {
	groupMtDungeonDefinitions,
	localizeMtDungeonDefinition,
	MT_DUNGEON_LANGUAGES,
	MT_DUNGEON_MAPS,
	type MtDungeonLanguage,
	normalizeMtDungeonLanguage
} from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { decodeMtDungeon } from '@dinorpg/core/models/dungeon/dungeon.codec.js';
import type { MtDungeonDefinition } from '@dinorpg/core/models/dungeon/dungeon.definition.js';
import { ORIGINAL_MT_DUNGEON_MAP_SHA } from '@dinorpg/core/models/dungeon/dungeon.mapManifest.js';
import { MT_DUNGEON_DEFINITIONS, MT_DUNGEON_MAPS_ENCODED } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';
import type { MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonIcon } from '@dinorpg/core/models/dungeon/dungeon.types.js';

export class MtDungeonArchiveError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MtDungeonArchiveError';
	}
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
	private readonly definitionsCache = new Map<MtDungeonLanguage, readonly MtDungeonDefinition[]>();
	private readonly mapCache = new Map<string, MtSessionConfiguration>();

	/** Loads a typed original MT locale and validates its dungeon inventory/mechanics. */
	definitions(language: MtDungeonLanguage = 'fr'): readonly MtDungeonDefinition[] {
		const cached = this.definitionsCache.get(language);
		if (cached) return cached;
		if (!MT_DUNGEON_LANGUAGES.includes(language)) throw new MtDungeonArchiveError(`Langue MT inconnue: ${language}`);
		const definitions = MT_DUNGEON_DEFINITIONS[language];
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
		const encoded = MT_DUNGEON_MAPS_ENCODED[filename];
		if (encoded === undefined) throw new MtDungeonArchiveError(`Carte originale introuvable: ${filename}`);
		const map = decodeMtDungeon(encoded).structure;
		const scenarioIcons = iconsForStage(def, stageIndex);
		for (const level of map.levels) {
			for (const room of level.rooms) {
				if (room.item?.kind === 'IScenario' && !scenarioIcons[room.item.value])
					throw new MtDungeonArchiveError(`${filename}: IScenario #${room.item.value} hors des définitions MT.`);
			}
		}
		const blockRules = compileMtDungeonBlockRules(map, def.stages[stageIndex]!.scenarios);
		const cfg: MtSessionConfiguration = { map, mapId, tower: def.tower, scenarioIcons, blockRules };
		this.mapCache.set(mapId, cfg);
		return cfg;
	}
}
