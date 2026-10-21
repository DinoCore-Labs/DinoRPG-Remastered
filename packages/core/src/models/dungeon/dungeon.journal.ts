/**
 * Read-only journal of already completed Motion Twin IScenario cells.
 *
 * Motion Twin's original server-side journal mechanics were not archived.
 * Remastered deliberately uses server-persisted per-stage flags to offer
 * historical messages again, without re-triggering a chest, battle or reward.
 * Never supply the session or flags from an HTTP request.
 */
import { assertMtDungeonTranslationCompatible } from './dungeon.catalog.js';
import type { MtDungeonDefinition } from './dungeon.definition.js';
import { snapshotMtDungeonProgress } from './dungeon.progress.js';
import { getMtFlagIndex } from './dungeon.scene.js';
import { isValidMtDungeonSession, type MtDungeonSession, type MtSessionConfiguration } from './dungeon.session.js';

export interface MtDungeonJournalEntry {
	/** Original map id and scenario index; no item/monster rewards are exposed. */
	mapId: string;
	stage: number;
	level: number;
	scenarioIndex: number;
	icon: string | null;
	text: string;
}

export interface MtDungeonJournal {
	languageUsed: string;
	entries: MtDungeonJournalEntry[];
}

/** Output is limited to exact IScenario flags recorded on the authenticated run. */
export function buildMtDungeonJournal(input: {
	session: MtDungeonSession;
	original: MtDungeonDefinition;
	localized: MtDungeonDefinition;
	languageUsed: string;
	getConfiguration: (mapId: string) => MtSessionConfiguration;
}): MtDungeonJournal {
	const { session, original, localized, languageUsed, getConfiguration } = input;
	const current = getConfiguration(session.mapId);
	if (!isValidMtDungeonSession(session, current)) throw new Error('Invalid authoritative MT dungeon session');
	assertMtDungeonTranslationCompatible(original, localized);
	const result: MtDungeonJournalEntry[] = [];
	const snapshots = snapshotMtDungeonProgress(session);
	for (const [mapId, state] of Object.entries(snapshots)) {
		const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
		if (!match || match[1] !== original.id) throw new Error('Cross-dungeon journal snapshot');
		const stage = Number(match[2]);
		if (!Number.isSafeInteger(stage) || stage >= original.stages.length) throw new Error('Unknown journal stage');
		const cfg = getConfiguration(mapId);
		if (cfg.mapId !== mapId) throw new Error('Inconsistent MT journal map');
		const maxFlag = cfg.map.width * cfg.map.height * cfg.map.levels.length;
		if (!Array.isArray(state.flags) || !state.flags.every(f => Number.isSafeInteger(f) && f >= 0 && f < maxFlag))
			throw new Error('Invalid saved MT journal flags');
		const completed = new Set(state.flags);
		for (const [level, floor] of cfg.map.levels.entries()) {
			for (const room of floor.rooms) {
				const item = room.item;
				if (item?.kind !== 'IScenario') continue;
				const flag = getMtFlagIndex(cfg.map, level, item.x, item.y);
				if (!completed.has(flag)) continue;
				const canonical = original.stages[stage]?.scenarios[item.value];
				const translation = localized.stages[stage]?.scenarios[item.value];
				if (!canonical || !translation || canonical.index !== item.value || translation.index !== item.value)
					throw new Error('Unknown original journal scenario');
				// Empty scenarios have no story to reread (e.g. silent monster encounters).
				if (!translation.text) continue;
				result.push({
					mapId,
					stage,
					level,
					scenarioIndex: item.value,
					icon: canonical.icon,
					text: translation.text
				});
			}
		}
	}
	result.sort((a, b) => a.stage - b.stage || a.level - b.level || a.scenarioIndex - b.scenarioIndex);
	return { languageUsed, entries: result };
}
