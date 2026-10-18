import { describe, expect, it } from 'vitest';

import { advanceMtTrail, mtFollowerPositions } from '../../src/components/dungeon/dungeonPartyTrail.js';

const p = (x: number, y: number, mapId = 'stepp_0', l = 0) => ({ mapId, x, y, l });

describe('MT dungeon client-only follower trail', () => {
	it('keeps accepted positions in reverse chronological order', () => {
		const first = advanceMtTrail([], p(4, 4), p(5, 4), 2);
		const second = advanceMtTrail(first, p(5, 4), p(5, 5), 2);
		expect(second).toEqual([p(5, 4), p(4, 4)]);
		expect(mtFollowerPositions(second, p(5, 5), 2)).toEqual([p(5, 4), p(4, 4)]);
	});
	it('does not move followers on server refusal or a blocked command', () => {
		expect(advanceMtTrail([p(4, 4)], p(5, 4), p(5, 4), 2)).toEqual([p(4, 4)]);
	});
	it('does not bridge stage changes, teleports or different levels', () => {
		expect(advanceMtTrail([p(4, 4)], p(5, 4), p(5, 4, 'stepp_1'), 2)).toEqual([]);
		expect(advanceMtTrail([p(4, 4)], p(5, 4), p(5, 4, 'stepp_0', 1), 2)).toEqual([]);
		expect(advanceMtTrail([p(4, 4)], p(5, 4), p(8, 4), 2)).toEqual([]);
	});
});
