/**
 * Stage 10 — immutable MT fight intent, derived from a *server-authenticated*
 * pending scenario, never from client-selected opponents/outcome.
 *
 * Original sources: DinoRPG/src/data/Dungeon.hx (DSKMonsters),
 * src/com/DungeonCodec.hx (IScenario index), gfx/dungeon/View.hx (interaction).
 * The original dungeon server combat resolver is NOT in the archive.
 */
import type { MtDungeonPendingEncounterView } from './dungeon.encounter.js';
import type { MtDungeonSession } from './dungeon.session.js';

export interface MtScenarioFightIntent {
	readonly mapId: string;
	readonly revision: number;
	readonly scenarioIndex: number;
	readonly monsterKeys: readonly string[];
	/** A full binding; persisted server side and not accepted over HTTP. */
	readonly pendingJson: string;
}

export class MtDungeonFightIntentError extends Error {
	constructor(public readonly code: 'not-a-scenario-fight' | 'invalid-pending') {
		super(`MT dungeon fight: ${code}`);
	}
}

export function mtScenarioFightIntent(
	session: MtDungeonSession,
	encounter: MtDungeonPendingEncounterView | null
): MtScenarioFightIntent {
	const p = session.pending;
	if (!p || p.kind !== 'scenario' || !encounter || encounter.kind !== 'scenario-combat')
		throw new MtDungeonFightIntentError('not-a-scenario-fight');
	if (
		!session.locked ||
		p.itemValue === null ||
		encounter.mapId !== session.mapId ||
		encounter.revision !== session.revision ||
		!Number.isSafeInteger(p.itemValue) ||
		p.itemValue < 0 ||
		encounter.monsterKeys.length === 0 ||
		encounter.monsterKeys.some(k => !k)
	)
		throw new MtDungeonFightIntentError('invalid-pending');
	return {
		mapId: session.mapId,
		revision: session.revision,
		scenarioIndex: p.itemValue,
		monsterKeys: [...encounter.monsterKeys],
		pendingJson: JSON.stringify(p)
	};
}

/** Called only with the saved original attempt; a stale/altered pending is not payable. */
export function assertMtScenarioFightBinding(session: MtDungeonSession, attempt: MtScenarioFightIntent): void {
	if (
		!session.locked ||
		session.revision !== attempt.revision ||
		session.mapId !== attempt.mapId ||
		session.pending?.kind !== 'scenario' ||
		session.pending.itemValue !== attempt.scenarioIndex ||
		JSON.stringify(session.pending) !== attempt.pendingJson
	)
		throw new MtDungeonFightIntentError('invalid-pending');
}
