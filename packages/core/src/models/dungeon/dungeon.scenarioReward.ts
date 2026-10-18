/**
 * Stage 11: scenario resolution intent, derived exclusively from an MT-validated
 * pending encounter and the unmodified canonical (French) definitions.
 *
 * MT source: src/data/Dungeon.hx (DSKNone, DSKObj, DSKCollec,
 * DSKMonsters, DSKBlock) and gfx/dungeon/View.hx (getItem/setFlag).
 *
 * Nothing here awards items. All side effects are committed by the trusted
 * server alongside the MtDungeonRun compare-and-swap in a DB transaction.
 */
import type { MtDungeonDefinition } from './dungeon.definition.js';
import { describeMtDungeonPendingEncounter } from './dungeon.encounter.js';
import type { MtDungeonSession, MtSessionConfiguration } from './dungeon.session.js';

export type MtScenarioRewardEffect =
	| { readonly type: 'none' }
	| { readonly type: 'object'; readonly key: string; readonly count: number }
	| { readonly type: 'collection'; readonly key: string };

export interface MtScenarioRewardIntent {
	readonly mapId: string;
	readonly revision: number;
	readonly scenarioIndex: number;
	readonly effect: MtScenarioRewardEffect;
	readonly text: string | null;
	readonly messageIcon: string | null;
	readonly languageUsed: string;
}

export class MtDungeonScenarioRewardError extends Error {
	constructor(public readonly code: 'not-a-reward-scenario' | 'invalid-scenario' | 'unsupported-kind') {
		super(`MT dungeon scenario: ${code}`);
		this.name = 'MtDungeonScenarioRewardError';
	}
}

/** Server-only; no client-chosen item, index, text, count, or reward. */
export function mtScenarioRewardIntent(input: {
	configuration: MtSessionConfiguration;
	session: MtDungeonSession;
	definition: MtDungeonDefinition;
	localized: MtDungeonDefinition;
	languageUsed: string;
}): MtScenarioRewardIntent {
	// This validates the pending target, the IScenario index, its unconsumed flag,
	// the exact geometry and compatibility of the localized scenario.
	const encounter = describeMtDungeonPendingEncounter(input);
	const { session, definition } = input;
	if (encounter?.kind !== 'scenario' || session.pending?.kind !== 'scenario' || !session.locked)
		throw new MtDungeonScenarioRewardError('not-a-reward-scenario');
	const scenarioIndex = session.pending.itemValue;
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(session.mapId);
	if (
		!match ||
		match[1] !== definition.id ||
		scenarioIndex === null ||
		!Number.isSafeInteger(scenarioIndex) ||
		scenarioIndex < 0
	)
		throw new MtDungeonScenarioRewardError('invalid-scenario');
	const stageIndex = Number(match[2]);
	const scenario = definition.stages[stageIndex]?.scenarios[scenarioIndex];
	if (!scenario || scenario.index !== scenarioIndex) throw new MtDungeonScenarioRewardError('invalid-scenario');
	let effect: MtScenarioRewardEffect;
	switch (scenario.kind.type) {
		case 'none':
			effect = { type: 'none' };
			break;
		case 'object':
			if (
				!/^[a-z][a-z0-9_]*$/.test(scenario.kind.key) ||
				!Number.isSafeInteger(scenario.kind.count) ||
				scenario.kind.count <= 0
			)
				throw new MtDungeonScenarioRewardError('invalid-scenario');
			effect = { type: 'object', key: scenario.kind.key, count: scenario.kind.count };
			break;
		case 'collection':
			if (!/^[a-z][a-z0-9_]*$/.test(scenario.kind.key)) throw new MtDungeonScenarioRewardError('invalid-scenario');
			effect = { type: 'collection', key: scenario.kind.key };
			break;
		// Monster fights must use stage 10's persistent fight attempt. Block
		// scenarios are impassable until their own original unlock logic exists.
		case 'monsters':
		case 'block':
			throw new MtDungeonScenarioRewardError('unsupported-kind');
	}
	return {
		mapId: session.mapId,
		revision: session.revision,
		scenarioIndex,
		effect,
		text: encounter.text,
		messageIcon: encounter.messageIcon,
		languageUsed: encounter.languageUsed
	};
}
