import { describe, expect, it, vi } from 'vitest';

import { getNextBotActionAt } from '../../src/Bot/Service/botSchedule.service.js';

describe('getNextBotActionAt', () => {
	it('uses the minimum delay when random returns zero', () => {
		vi.spyOn(Math, 'random').mockReturnValueOnce(0);
		const now = new Date('2026-09-29T12:00:00.000Z');

		const result = getNextBotActionAt(
			{
				minDelaySeconds: 60,
				maxDelaySeconds: 600
			},
			now
		);

		expect(result.toISOString()).toBe('2026-09-29T12:01:00.000Z');
	});

	it('uses the maximum delay when random approaches one', () => {
		vi.spyOn(Math, 'random').mockReturnValueOnce(0.999999);
		const now = new Date('2026-09-29T12:00:00.000Z');

		const result = getNextBotActionAt(
			{
				minDelaySeconds: 60,
				maxDelaySeconds: 600
			},
			now
		);

		expect(result.toISOString()).toBe('2026-09-29T12:10:00.000Z');
	});

	it('normalizes an invalid range defensively', () => {
		vi.spyOn(Math, 'random').mockReturnValueOnce(0);
		const now = new Date('2026-09-29T12:00:00.000Z');

		const result = getNextBotActionAt(
			{
				minDelaySeconds: 120,
				maxDelaySeconds: 60
			},
			now
		);

		expect(result.toISOString()).toBe('2026-09-29T12:02:00.000Z');
	});
});
