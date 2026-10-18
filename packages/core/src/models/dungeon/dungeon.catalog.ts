import { katakDungeon } from './definitions/katak.js';
import { laboDungeon } from './definitions/labo.js';
import { mbeginDungeon } from './definitions/mbegin.js';
import { mcuzcoDungeon } from './definitions/mcuzco.js';
import { mquetzDungeon } from './definitions/mquetz.js';
import { steppDungeon } from './definitions/stepp.js';
import type { MtDungeonDefinition } from './dungeon.definition.js';

export const MT_DUNGEON_MAPS = {
	stepp: steppDungeon.maps,
	katak: katakDungeon.maps,
	mbegin: mbeginDungeon.maps,
	mquetz: mquetzDungeon.maps,
	mcuzco: mcuzcoDungeon.maps,
	labo: laboDungeon.maps
} as const;

export type MtDungeonId = keyof typeof MT_DUNGEON_MAPS;
export const MT_DUNGEON_LANGUAGES = ['fr', 'en', 'es', 'de'] as const;
export type MtDungeonLanguage = (typeof MT_DUNGEON_LANGUAGES)[number];

// Git blob SHA-1s of the *unmodified*, UTF-8-with-BOM original XML files.
export const MT_DUNGEON_DEFINITIONS_SHA: Readonly<Record<MtDungeonLanguage, string>> = {
	fr: '82f6f047231953c08f4bec923ca8d39f67d847e4',
	en: 'e439fbc1bb0353ff3bf2446b80429e7ef925c4cc',
	es: '76dd00323a7fc43c473ab699e1b3e39b17b97dc3',
	de: 'c7a6b1897f35777c55a7f5dbc8d40eafb2c525c6'
};

export function normalizeMtDungeonLanguage(input: unknown): MtDungeonLanguage {
	if (typeof input !== 'string') return 'fr';
	const lang = input.toLowerCase().split(/[-_]/, 1)[0];
	return MT_DUNGEON_LANGUAGES.find(candidate => candidate === lang) ?? 'fr';
}

export function groupMtDungeonDefinitions(
	definitions: readonly MtDungeonDefinition[]
): ReadonlyMap<MtDungeonId, MtDungeonDefinition> {
	const result = new Map<MtDungeonId, MtDungeonDefinition>();
	for (const definition of definitions) {
		if (!Object.hasOwn(MT_DUNGEON_MAPS, definition.id)) throw new Error(`Unknown MT dungeon: ${definition.id}`);
		const id = definition.id as MtDungeonId;
		if (result.has(id)) throw new Error(`Duplicate MT dungeon: ${id}`);
		if (definition.stages.length !== MT_DUNGEON_MAPS[id].length)
			throw new Error(`Invalid stage count for ${id}: ${definition.stages.length}`);
		result.set(id, definition);
	}
	return result;
}

/** Ensure translated data cannot silently change gameplay mechanics or scenario indexes. */
export function assertMtDungeonTranslationCompatible(
	original: MtDungeonDefinition,
	translated: MtDungeonDefinition
): void {
	if (
		original.id !== translated.id ||
		original.gold !== translated.gold ||
		original.condition !== translated.condition ||
		original.tower !== translated.tower ||
		original.enter.place !== translated.enter.place ||
		original.exit.place !== translated.exit.place ||
		JSON.stringify(original.monsters) !== JSON.stringify(translated.monsters) ||
		original.stages.length !== translated.stages.length
	) {
		throw new Error(`MT translation differs in gameplay metadata: ${original.id}`);
	}
	for (let i = 0; i < original.stages.length; i++) {
		const stage = original.stages[i]!;
		const localized = translated.stages[i]!;
		if (stage.skin !== localized.skin || stage.scenarios.length !== localized.scenarios.length)
			throw new Error(`MT translation differs in stage ${original.id}_${i}`);
		for (let j = 0; j < stage.scenarios.length; j++) {
			const a = stage.scenarios[j]!;
			const b = localized.scenarios[j]!;
			if (
				a.index !== b.index ||
				a.icon !== b.icon ||
				a.messageIcon !== b.messageIcon ||
				a.reload !== b.reload ||
				JSON.stringify(a.kind) !== JSON.stringify(b.kind)
			)
				throw new Error(`MT translation differs in scenario ${original.id}_${i}:${j}`);
		}
	}
}

/**
 * Uses FR mechanics exclusively; exposes the actual language used for each dungeon.
 * In de, the original MT archive has five dungeons, so `labo` is read in French.
 */
export function localizeMtDungeonDefinition(
	canonical: MtDungeonDefinition,
	translated: MtDungeonDefinition | undefined,
	requestedLanguage: MtDungeonLanguage
): { definition: MtDungeonDefinition; languageUsed: MtDungeonLanguage } {
	if (requestedLanguage === 'fr' || !translated) {
		return { definition: canonical, languageUsed: 'fr' };
	}
	assertMtDungeonTranslationCompatible(canonical, translated);
	return {
		languageUsed: requestedLanguage,
		definition: {
			...canonical,
			name: translated.name,
			enter: { ...canonical.enter, text: translated.enter.text },
			exit: { ...canonical.exit, text: translated.exit.text },
			stages: canonical.stages.map((stage, stageIndex) => ({
				...stage,
				scenarios: stage.scenarios.map((scenario, scenarioIndex) => ({
					...scenario,
					text: translated.stages[stageIndex]!.scenarios[scenarioIndex]!.text
				}))
			}))
		}
	};
}
