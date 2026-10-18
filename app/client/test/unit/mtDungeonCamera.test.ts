import { describe, expect, it } from 'vitest';

import {
	easeMtCameraOffset,
	mtCameraShift,
	type MtCameraViewport
} from '../../src/components/dungeon/mtDungeonCamera.js';

const start: MtCameraViewport = { ix: 10, iy: 20, level: 0, mapId: 'stepp_0' };

describe('MT camera after server-validated viewport change', () => {
	it('starts with no pan for an initial view', () => {
		expect(mtCameraShift(null, start, { x: 0, y: 0 })).toEqual({
			offsetX: 0,
			offsetY: 0,
			deltaX: 0,
			deltaY: 0,
			snap: true
		});
	});
	it('compensates one cell of authorized movement without a visible jump', () => {
		expect(mtCameraShift(start, { ...start, ix: 11, iy: 19 }, { x: 0, y: 0 })).toEqual({
			offsetX: 40,
			offsetY: -40,
			deltaX: 40,
			deltaY: -40,
			snap: false
		});
	});
	it('preserves the ongoing offset across closely spaced steps', () => {
		expect(mtCameraShift(start, { ...start, ix: 11 }, { x: 12, y: 0 }).offsetX).toBe(52);
	});
	it('never pans between different maps, levels or a discontinuous resync', () => {
		for (const target of [
			{ ...start, mapId: 'stepp_1' },
			{ ...start, level: 1 },
			{ ...start, ix: 14 }
		]) {
			expect(mtCameraShift(start, target, { x: 12, y: 7 })).toMatchObject({ snap: true, offsetX: 0, offsetY: 0 });
		}
	});
	it('implements Flash View.hx 10 percent per 60Hz frame independent of refresh rate', () => {
		expect(easeMtCameraOffset(40, 1000 / 60)).toBeCloseTo(36, 4);
		expect(easeMtCameraOffset(40, 1000 / 30)).toBeCloseTo(32.4, 4);
		expect(easeMtCameraOffset(easeMtCameraOffset(40, 1000 / 60), 1000 / 60)).toBeCloseTo(
			easeMtCameraOffset(40, 1000 / 30),
			4
		);
	});
	it('snaps tiny residuals to zero and rejects non-finite inputs', () => {
		expect(easeMtCameraOffset(0.08, 1000 / 60)).toBe(0);
		expect(easeMtCameraOffset(Number.NaN, 16)).toBe(0);
	});
});
