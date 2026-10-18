/**
 * Read-only MT dungeon pending encounter resolution.
 *
 * Sources: Motion Twin's DungeonCodec.hx, Dungeon.hx and View.hx.
 * IScenario.value indexes the *current stage* <scenario> in dungeons.xml.
 * The original server-side guardian monster selection is not archived: NEVER
 * choose monsters randomly here or use a Remastered overworld encounter table.
 *
 * This function is an inspection boundary, NOT a victory/reward mechanism.
 */
import type { MtDungeonDefinition, MtDungeonScenarioDefinition } from './dungeon.definition.js';
import { getMtFlagIndex } from './dungeon.scene.js';
import { isValidMtDungeonSession, type MtDungeonSession, type MtSessionConfiguration } from './dungeon.session.js';
import type { DungeonPoint } from './dungeon.types.js';

export type MtDungeonPendingEncounterView =
	| { kind: 'guardian'; status: 'original-selection-unavailable'; mapId: string; revision: number }
	| {
			kind: 'scenario-combat';
			status: 'awaiting-combat-integration';
			mapId: string;
			revision: number;
			monsterKeys: readonly string[];
			text: string | null;
			messageIcon: string | null;
			languageUsed: string;
	  }
	| {
			kind: 'scenario';
			status: 'awaiting-scenario-integration';
			mapId: string;
			revision: number;
			text: string | null;
			messageIcon: string | null;
			languageUsed: string;
	  }
	| {
			kind: 'gold' | 'heal' | 'interact' | 'boundary-start' | 'boundary-exit';
			status: 'awaiting-gameplay-integration';
			mapId: string;
			revision: number;
	  };

export class MtDungeonEncounterError extends Error {
	constructor(public readonly code: 'invalid-session' | 'inconsistent-pending' | 'invalid-definition') {
		super(`MT dungeon pending encounter: ${code}`);
		this.name = 'MtDungeonEncounterError';
	}
}

function equalPoint(a: DungeonPoint, b: DungeonPoint): boolean {
	return a.x === b.x && a.y === b.y && a.l === b.l;
}
function inBounds(cfg: MtSessionConfiguration, point: DungeonPoint): boolean {
	return (
		Number.isSafeInteger(point.x) &&
		Number.isSafeInteger(point.y) &&
		Number.isSafeInteger(point.l) &&
		point.l >= 0 &&
		point.l < cfg.map.levels.length &&
		point.x >= 0 &&
		point.x < cfg.map.width &&
		point.y >= 0 &&
		point.y < cfg.map.height
	);
}
function scenarioAt(cfg: MtSessionConfiguration, point: DungeonPoint, value: number): boolean {
	return cfg.map.levels[point.l]!.rooms.some(room => {
		const item = room.item;
		return (
			item !== null && item.kind === 'IScenario' && item.x === point.x && item.y === point.y && item.value === value
		);
	});
}
function itemAt(cfg: MtSessionConfiguration, point: DungeonPoint, kind: 'IGold' | 'IHeal', value: number): boolean {
	return cfg.map.levels[point.l]!.rooms.some(room => {
		const item = room.item;
		return item !== null && item.kind === kind && item.x === point.x && item.y === point.y && item.value === value;
	});
}
function getStageIndex(mapId: string, id: string, stageCount: number): number {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	if (!match || match[1] !== id) throw new MtDungeonEncounterError('invalid-definition');
	const stage = Number(match[2]);
	if (!Number.isSafeInteger(stage) || stage >= stageCount) throw new MtDungeonEncounterError('invalid-definition');
	return stage;
}
function verifyFlag(
	cfg: MtSessionConfiguration,
	session: MtDungeonSession,
	point: DungeonPoint,
	flag: number | null
): void {
	const expected = getMtFlagIndex(cfg.map, point.l, point.x, point.y);
	if (flag !== expected || session.flags.includes(expected)) throw new MtDungeonEncounterError('inconsistent-pending');
}

/**
 * The *canonical French* definition controls scenario classification and rewards.
 * The separately localized definition supplies text ONLY (verified by the archive).
 * No caller-supplied scenario index, monster, outcome or reward is accepted.
 */
export function describeMtDungeonPendingEncounter(input: {
	configuration: MtSessionConfiguration;
	session: MtDungeonSession;
	definition: MtDungeonDefinition;
	localized: MtDungeonDefinition;
	languageUsed: string;
}): MtDungeonPendingEncounterView | null {
	const { configuration: cfg, session, definition, localized, languageUsed } = input;
	if (!isValidMtDungeonSession(session, cfg)) throw new MtDungeonEncounterError('invalid-session');
	const stage = getStageIndex(session.mapId, definition.id, definition.stages.length);
	if (definition.stages.length !== localized.stages.length || localized.id !== definition.id)
		throw new MtDungeonEncounterError('invalid-definition');
	const pending = session.pending;
	if (!pending) return null;
	const { from, to, kind, flag, itemValue } = pending;
	if (
		!equalPoint(from, session.position) ||
		!inBounds(cfg, from) ||
		!inBounds(cfg, to) ||
		!cfg.map.levels[to.l]!.table[to.x]?.[to.y]
	)
		throw new MtDungeonEncounterError('inconsistent-pending');
	const base = { mapId: session.mapId, revision: session.revision };
	if (kind === 'guardian') {
		if (to.l !== from.l || Math.abs(to.x - from.x) + Math.abs(to.y - from.y) !== 1 || itemValue !== null)
			throw new MtDungeonEncounterError('inconsistent-pending');
		if (
			!cfg.map.levels[to.l]!.rooms.some(room =>
				room.doors.some(door => door.x === to.x && door.y === to.y && door.up === null && door.key === null)
			)
		)
			throw new MtDungeonEncounterError('inconsistent-pending');
		verifyFlag(cfg, session, to, flag);
		return { kind, status: 'original-selection-unavailable', ...base };
	}
	if (kind === 'scenario') {
		if (
			to.l !== from.l ||
			Math.abs(to.x - from.x) + Math.abs(to.y - from.y) !== 1 ||
			itemValue === null ||
			!Number.isSafeInteger(itemValue) ||
			itemValue < 0 ||
			!scenarioAt(cfg, to, itemValue)
		)
			throw new MtDungeonEncounterError('inconsistent-pending');
		verifyFlag(cfg, session, to, flag);
		const scenario: MtDungeonScenarioDefinition | undefined = definition.stages[stage]?.scenarios[itemValue];
		const translated: MtDungeonScenarioDefinition | undefined = localized.stages[stage]?.scenarios[itemValue];
		if (
			!scenario ||
			!translated ||
			scenario.index !== itemValue ||
			translated.index !== itemValue ||
			JSON.stringify(scenario.kind) !== JSON.stringify(translated.kind)
		)
			throw new MtDungeonEncounterError('invalid-definition');
		// The original View blocks this type before the player can enter its cell.
		if (scenario.kind.type === 'block') throw new MtDungeonEncounterError('inconsistent-pending');
		const details = { ...base, text: translated.text, messageIcon: scenario.messageIcon, languageUsed };
		if (scenario.kind.type === 'monsters') {
			if (scenario.kind.keys.length === 0 || scenario.kind.keys.some(k => !k || typeof k !== 'string'))
				throw new MtDungeonEncounterError('invalid-definition');
			return {
				kind: 'scenario-combat',
				status: 'awaiting-combat-integration',
				monsterKeys: [...scenario.kind.keys],
				...details
			};
		}
		// Do not send unclaimed object/collection identifiers or quantities to clients.
		return { kind: 'scenario', status: 'awaiting-scenario-integration', ...details };
	}
	if (kind === 'gold' || kind === 'heal') {
		if (
			to.l !== from.l ||
			Math.abs(to.x - from.x) + Math.abs(to.y - from.y) !== 1 ||
			itemValue === null ||
			!itemAt(cfg, to, kind === 'gold' ? 'IGold' : 'IHeal', itemValue)
		)
			throw new MtDungeonEncounterError('inconsistent-pending');
		if (kind === 'gold') verifyFlag(cfg, session, to, flag);
		else if (flag !== null) throw new MtDungeonEncounterError('inconsistent-pending');
		return { kind, status: 'awaiting-gameplay-integration', ...base };
	}
	if (kind === 'boundary-start' || kind === 'boundary-exit') {
		if (
			flag !== null ||
			itemValue !== null ||
			!equalPoint(from, to) ||
			!equalPoint(from, kind === 'boundary-start' ? cfg.map.start : cfg.map.exit)
		)
			throw new MtDungeonEncounterError('inconsistent-pending');
		return { kind, status: 'awaiting-gameplay-integration', ...base };
	}
	if (kind === 'interact') {
		if (!equalPoint(from, to) || flag !== null || itemValue !== null)
			throw new MtDungeonEncounterError('inconsistent-pending');
		return { kind, status: 'awaiting-gameplay-integration', ...base };
	}
	throw new MtDungeonEncounterError('inconsistent-pending');
}
