/**
 * Validate only the two real external MT dungeon boundaries.
 * Original View.hx leaves the party at the external staircase and sends a
 * server command. The original MT server handler is not archived.
 * The transactional overworld transition is therefore a Remastered adapter.
 */
import type { MtDungeonDefinition } from './dungeon.definition.js';
import { isValidMtDungeonSession, type MtDungeonSession, type MtSessionConfiguration } from './dungeon.session.js';

export type MtDungeonWorldExitKind = 'return' | 'complete';
export type MtDungeonWorldExitPlan = {
	kind: MtDungeonWorldExitKind;
	dungeonId: string;
	destinationPlaceKey: string;
};

export class MtDungeonWorldExitError extends Error {
	constructor(public readonly code: 'invalid-run' | 'wrong-boundary') {
		super(`MT dungeon world exit: ${code}`);
		this.name = 'MtDungeonWorldExitError';
	}
}

function samePoint(a: { x: number; y: number; l: number }, b: { x: number; y: number; l: number }): boolean {
	return a.x === b.x && a.y === b.y && a.l === b.l;
}

/** No client-provided destination or outcome; all facts come from an authenticated run. */
export function planMtDungeonWorldExit(
	definition: MtDungeonDefinition,
	configuration: MtSessionConfiguration,
	session: MtDungeonSession
): MtDungeonWorldExitPlan {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(session.mapId);
	if (
		!match ||
		match[1] !== definition.id ||
		session.mapId !== configuration.mapId ||
		!Number.isSafeInteger(Number(match[2])) ||
		Number(match[2]) >= definition.stages.length ||
		!isValidMtDungeonSession(session, configuration)
	)
		throw new MtDungeonWorldExitError('invalid-run');

	const stage = Number(match[2]);
	const pending = session.pending;
	let kind: MtDungeonWorldExitKind;
	let expected: { x: number; y: number; l: number };
	if (stage === 0 && pending?.kind === 'boundary-start') {
		kind = 'return';
		expected = configuration.map.start;
	} else if (stage === definition.stages.length - 1 && pending?.kind === 'boundary-exit') {
		kind = 'complete';
		expected = configuration.map.exit;
	} else {
		throw new MtDungeonWorldExitError('wrong-boundary');
	}
	if (
		!session.locked ||
		!pending ||
		!samePoint(session.position, expected) ||
		!samePoint(pending.from, expected) ||
		!samePoint(pending.to, expected) ||
		pending.flag !== null ||
		pending.itemValue !== null
	)
		throw new MtDungeonWorldExitError('wrong-boundary');

	return {
		kind,
		dungeonId: definition.id,
		destinationPlaceKey: kind === 'return' ? definition.enter.place : definition.exit.place
	};
}
