import { describe, expect, it } from 'vitest';

import type { MtDungeonDefinition } from '../../../src/models/dungeon/dungeon.definition.js';
import { MtDungeonEncounterError } from '../../../src/models/dungeon/dungeon.encounter.js';
import {
	MtDungeonEvidenceError,
	mtDungeonOriginalPendingEvidence,
	selectMtGuardianSprite
} from '../../../src/models/dungeon/dungeon.originalEvidence.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { MtDungeonSession, MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';
import { applyMtDungeonCommandBatch, createMtDungeonSession } from '../../../src/models/dungeon/dungeon.session.js';

const original: MtDungeonDefinition = {
	id: 'katak',
	name: 'Katatombes',
	gold: 1000,
	condition: null,
	monsters: ['worm'],
	tower: false,
	enter: { place: 'skull', text: '' },
	exit: { place: 'skull', text: '' },
	stages: [{ skin: 'sewer', scenarios: [] }]
};
function fixture(): MtSessionConfiguration {
	return {
		mapId: 'katak_0',
		map: {
			width: 6,
			height: 6,
			start: { x: 0, y: 0, l: 0 },
			exit: { x: 5, y: 5, l: 0 },
			levels: [
				{
					table: Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => true)),
					rooms: [
						{ id: 0, x: 0, y: 0, w: 6, h: 6, item: null, doors: [{ x: 2, y: 1, up: null, key: null }] },
						{ id: 1, x: 3, y: 2, w: 1, h: 1, doors: [], item: { kind: 'IGold', x: 3, y: 2, value: 31 } },
						{ id: 2, x: 3, y: 3, w: 1, h: 1, doors: [], item: { kind: 'IHeal', x: 3, y: 3, value: 0 } }
					]
				}
			]
		}
	};
}
function enter(cfg: MtSessionConfiguration, x: number, y: number, dx: number, dy: number): MtDungeonSession {
	const session = { ...createMtDungeonSession(cfg), position: { x, y, l: 0 } };
	const result = applyMtDungeonCommandBatch(cfg, session, [{ x, y, l: 0, dx, dy, dl: 0 }]);
	if (!result.ok) throw new Error(result.reason);
	return result.session;
}

describe('Original MT guardian appearance and unclaimed pickups (read-only)', () => {
	it('uses x * mapHeight + y, not x * width + y or nondeterministic Math.random', () => {
		const pool = ['worm', 'goupi', 'coq', 'borg', 'grdien'];
		const result = selectMtGuardianSprite({ x: 0, y: 0, width: 10, height: 12, serverMonsterSprites: pool });
		// Seed 0, first MT random(5) = 1 (reference MT vectors, stage 4).
		expect(result).toEqual({ sprite: 'goupi', index: 1, seed: 0 });
		const different = selectMtGuardianSprite({ x: 3, y: 2, width: 10, height: 12, serverMonsterSprites: pool });
		expect(different.seed).toBe(38);
		expect(selectMtGuardianSprite({ x: 3, y: 2, width: 10, height: 12, serverMonsterSprites: pool })).toEqual(
			different
		);
	});
	it('refuses invalid sprites or coordinates without supplying an improvised fallback', () => {
		expect(() => selectMtGuardianSprite({ x: 2, y: 1, width: 6, height: 6, serverMonsterSprites: [] })).toThrow(
			MtDungeonEvidenceError
		);
		expect(() => selectMtGuardianSprite({ x: 6, y: 1, width: 6, height: 6, serverMonsterSprites: ['worm'] })).toThrow(
			MtDungeonEvidenceError
		);
		expect(() => selectMtGuardianSprite({ x: 0, y: 0, width: 6, height: 6, serverMonsterSprites: [''] })).toThrow(
			MtDungeonEvidenceError
		);
	});
	it('does not mistake a guard visual seed for combat selection, flag or a fight reward', () => {
		const cfg = fixture();
		const session = enter(cfg, 1, 1, 1, 0);
		const before = JSON.stringify(session);
		expect(mtDungeonOriginalPendingEvidence({ configuration: cfg, session, definition: original })).toEqual({
			kind: 'guardian',
			mapId: 'katak_0',
			revision: 1,
			spriteSeed: 13,
			originalMonsterSpriteListAvailable: false,
			combatSelectionKnown: false
		});
		expect(JSON.stringify(session)).toBe(before);
		expect(session.flags).toEqual([]);
	});
	it('records the original IGold map value, not an invented number of gold pieces', () => {
		const cfg = fixture();
		const session = enter(cfg, 2, 2, 1, 0);
		expect(mtDungeonOriginalPendingEvidence({ configuration: cfg, session, definition: original })).toEqual({
			kind: 'gold',
			mapId: 'katak_0',
			revision: 1,
			rawMapValue: 31,
			oneTimeClientFlag: true,
			conversionToGoldKnown: false
		});
		expect(session.flags).toEqual([]);
	});
	it('does not create pending heal evidence and consumes IHeal only on departure', () => {
		const cfg = fixture();
		const session = enter(cfg, 2, 3, 1, 0);
		const flag = getMtFlagIndex(cfg.map, 0, 3, 3);

		// MT View.getItem does not mark IHeal. In 20K, entry stays unlocked.
		expect(session.pending).toBeNull();
		expect(session.position).toEqual({ x: 3, y: 3, l: 0 });
		expect(session.flags).not.toContain(flag);
		expect(() => mtDungeonOriginalPendingEvidence({ configuration: cfg, session, definition: original })).toThrow(
			MtDungeonEvidenceError
		);

		// Remastered's one-use policy persists its flag on a successful departure.
		const departure = applyMtDungeonCommandBatch(cfg, session, [{ x: 3, y: 3, l: 0, dx: -1, dy: 0, dl: 0 }]);
		expect(departure.ok).toBe(true);
		if (!departure.ok) return;
		expect(departure.session.position).toEqual({ x: 2, y: 3, l: 0 });
		expect(departure.session.flags).toContain(flag);
	});
	it('refuses stale, already-claimed or forged pending values', () => {
		const cfg = fixture();
		const session = enter(cfg, 2, 2, 1, 0);
		expect(() =>
			mtDungeonOriginalPendingEvidence({
				configuration: cfg,
				session: { ...session, pending: { ...session.pending!, itemValue: 400 } },
				definition: original
			})
		).toThrow(MtDungeonEncounterError);
		const flag = getMtFlagIndex(cfg.map, 0, 3, 2);
		expect(() =>
			mtDungeonOriginalPendingEvidence({
				configuration: cfg,
				session: { ...session, flags: [flag] },
				definition: original
			})
		).toThrow(MtDungeonEncounterError);
		expect(() =>
			mtDungeonOriginalPendingEvidence({
				configuration: cfg,
				session: createMtDungeonSession(cfg),
				definition: original
			})
		).toThrow(MtDungeonEvidenceError);
	});
});
