/**
 * DEV ONLY: inspect a validated MT door guardian and select a ONE-monster
 * trial adversary from the canonical XML roster. This is NOT the original
 * guardian battle-team algorithm (its server source is not archived).
 *
 * The *visual* seed follows View.hx: x * dungeonHeight + y, mt.Rand(0).
 * The XML roster is NOT proven identical to DATA._monsters: never describe
 * this as an authentic _smonster frame or historical combat composition.
 */
import type { MtDungeonDefinition } from './dungeon.definition.js';
import { describeMtDungeonPendingEncounter } from './dungeon.encounter.js';
import { selectMtGuardianSprite } from './dungeon.originalEvidence.js';
import type { MtDungeonSession, MtSessionConfiguration } from './dungeon.session.js';

export const MT_GUARDIAN_TRIAL_INDEX = -1; // reserved in MtDungeonFightAttempt.scenarioIndex
export interface MtGuardianTrialIntent {
	mapId: string;
	revision: number;
	pendingJson: string;
	scenarioIndex: typeof MT_GUARDIAN_TRIAL_INDEX;
	monsterKeys: [string];
	visualSeed: number;
	experimental: true;
}

export function createMtGuardianTrialIntent(input: {
	session: MtDungeonSession;
	configuration: MtSessionConfiguration;
	definition: MtDungeonDefinition;
}): MtGuardianTrialIntent {
	const { session, configuration, definition } = input;
	const encounter = describeMtDungeonPendingEncounter({
		session,
		configuration,
		definition,
		localized: definition,
		languageUsed: 'fr'
	});
	if (encounter?.kind !== 'guardian' || session.pending?.kind !== 'guardian' || !session.locked)
		throw new Error('No validated MT guardian pending for this session.');
	const stage = Number(session.mapId.slice(definition.id.length + 1));
	if (
		!session.mapId.startsWith(`${definition.id}_`) ||
		!Number.isSafeInteger(stage) ||
		stage < 0 ||
		stage >= definition.stages.length ||
		configuration.mapId !== session.mapId ||
		!definition.monsters.length
	)
		throw new Error('Invalid original MT guardian map, stage or monster roster.');
	const pos = session.pending.to;
	// Reuse MT's deterministic VISUAL draw, but the available canonical XML
	// roster is only a practical test pool — the archived server _monsters list
	// and fight-team policy are not documented.
	const selection = selectMtGuardianSprite({
		x: pos.x,
		y: pos.y,
		width: configuration.map.width,
		height: configuration.map.height,
		serverMonsterSprites: definition.monsters
	});
	return {
		mapId: session.mapId,
		revision: session.revision,
		scenarioIndex: MT_GUARDIAN_TRIAL_INDEX,
		pendingJson: JSON.stringify(session.pending),
		monsterKeys: [selection.sprite],
		visualSeed: selection.seed,
		experimental: true
	};
}

export function assertMtGuardianTrialBinding(session: MtDungeonSession, attempt: MtGuardianTrialIntent): void {
	if (
		!session.locked ||
		session.revision !== attempt.revision ||
		session.mapId !== attempt.mapId ||
		session.pending?.kind !== 'guardian' ||
		JSON.stringify(session.pending) !== attempt.pendingJson ||
		attempt.scenarioIndex !== MT_GUARDIAN_TRIAL_INDEX
	)
		throw new Error('Guardian trial attempt no longer matches pending interaction.');
}
