/**
 * Motion Twin dungeon mechanics whose behaviour is directly observable in the
 * archived *client and generator* code, without guessing server-side effects.
 *
 * - View.hx displayLevel(): r.initSeed(d.x * height + d.y) and
 *   DATA._monsters[r.random(DATA._monsters.length)] for a guardian sprite.
 * - View.hx getItem(): IGold sets a one-time flag, IHeal does not.
 * - gen/Gameplay.hx: IGold.v receives a room-distance-dependent raw value,
 *   IHeal.v is generated as zero. Neither defines the server reward amount.
 *
 * These helpers are READ-ONLY. The original server's guardian encounter
 * selection, the gold conversion and healing effect have not been recovered.
 * A displayed guardian sprite MUST NOT be treated as its combat monster.
 */
import type { MtDungeonDefinition } from './dungeon.definition.js';
import { describeMtDungeonPendingEncounter } from './dungeon.encounter.js';
import { MtRand } from './dungeon.rand.js';
import type { MtDungeonSession, MtSessionConfiguration } from './dungeon.session.js';

export class MtDungeonEvidenceError extends Error {
	constructor(public readonly code: 'invalid-sprite-list' | 'invalid-tile' | 'not-applicable') {
		super(`Original MT dungeon evidence: ${code}`);
		this.name = 'MtDungeonEvidenceError';
	}
}

/**
 * Literal View.hx guardian *visual* selection, when supplied the actual
 * server-provided DATA._monsters array, in its original order.
 * Not a battle selector and not a substitute for that server-provided list.
 */
export function selectMtGuardianSprite(input: {
	x: number;
	y: number;
	width: number;
	height: number;
	serverMonsterSprites: readonly string[];
}): { sprite: string; index: number; seed: number } {
	const { x, y, width, height, serverMonsterSprites } = input;
	if (
		![x, y, width, height].every(Number.isSafeInteger) ||
		width <= 0 ||
		height <= 0 ||
		x < 0 ||
		y < 0 ||
		x >= width ||
		y >= height
	)
		throw new MtDungeonEvidenceError('invalid-tile');
	if (
		!Array.isArray(serverMonsterSprites) ||
		!serverMonsterSprites.length ||
		serverMonsterSprites.some(sprite => typeof sprite !== 'string' || sprite.length === 0)
	)
		throw new MtDungeonEvidenceError('invalid-sprite-list');
	const seed = x * height + y;
	if (!Number.isSafeInteger(seed) || seed > 0x7fffffff) throw new MtDungeonEvidenceError('invalid-tile');
	const rng = new MtRand(0);
	rng.initSeed(seed);
	const index = rng.random(serverMonsterSprites.length);
	return { sprite: serverMonsterSprites[index]!, index, seed };
}

export type MtDungeonOriginalEvidence =
	| {
			kind: 'guardian';
			mapId: string;
			revision: number;
			spriteSeed: number;
			originalMonsterSpriteListAvailable: false;
			combatSelectionKnown: false;
	  }
	| {
			kind: 'gold';
			mapId: string;
			revision: number;
			rawMapValue: number;
			oneTimeClientFlag: true;
			conversionToGoldKnown: false;
	  }
	| {
			kind: 'heal';
			mapId: string;
			revision: number;
			rawMapValue: number;
			oneTimeClientFlag: false;
			healingFormulaKnown: false;
	  };

/**
 * Examine ONLY the user's server-validated pending event, never an arbitrary
 * map location. No money, health, flag or monster is awarded here.
 */
export function mtDungeonOriginalPendingEvidence(input: {
	configuration: MtSessionConfiguration;
	session: MtDungeonSession;
	definition: MtDungeonDefinition;
}): MtDungeonOriginalEvidence {
	const { configuration, session, definition } = input;
	const encounter = describeMtDungeonPendingEncounter({
		configuration,
		session,
		definition,
		localized: definition,
		languageUsed: 'fr'
	});
	const pending = session.pending;
	if (!pending || !encounter) throw new MtDungeonEvidenceError('not-applicable');
	const base = { mapId: session.mapId, revision: session.revision };
	if (encounter.kind === 'guardian') {
		return {
			...base,
			kind: 'guardian',
			spriteSeed: pending.to.x * configuration.map.height + pending.to.y,
			originalMonsterSpriteListAvailable: false,
			combatSelectionKnown: false
		};
	}
	if (encounter.kind === 'gold') {
		return {
			...base,
			kind: 'gold',
			rawMapValue: pending.itemValue!,
			oneTimeClientFlag: true,
			conversionToGoldKnown: false
		};
	}
	if (encounter.kind === 'heal') {
		return {
			...base,
			kind: 'heal',
			rawMapValue: pending.itemValue!,
			oneTimeClientFlag: false,
			healingFormulaKnown: false
		};
	}
	throw new MtDungeonEvidenceError('not-applicable');
}
