import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { describe, expect, it } from 'vitest';

import { chooseBestBotDinozForActivity } from '../../src/Bot/Service/botDinozSelector.service.js';

function makeDinoz(input: Partial<{
	id: number;
	level: number;
	life: number;
	maxLife: number;
	leaderId: number | null;
	followers: { id: number }[];
	skills: { skillId: number }[];
	items: { itemId: number }[];
}> = {}) {
	return {
		id: input.id ?? 1,
		level: input.level ?? 1,
		life: input.life ?? 100,
		maxLife: input.maxLife ?? 100,
		leaderId: input.leaderId ?? null,
		followers: input.followers ?? [],
		skills: input.skills ?? [],
		items: input.items ?? []
	};
}

describe('bot Dinoz selector', () => {
	it('prefers the stronger grouped Dinoz for combat', () => {
		const weak = makeDinoz({
			id: 1,
			level: 3,
			life: 30,
			maxLife: 100
		});
		const strong = makeDinoz({
			id: 2,
			level: 8,
			life: 90,
			maxLife: 100,
			followers: [{ id: 3 }],
			skills: [{ skillId: 1 }, { skillId: 2 }],
			items: [{ itemId: 1 }]
		});

		const selected = chooseBestBotDinozForActivity([weak, strong], Action.FIGHT);

		expect(selected?.id).toBe(2);
	});

	it('penalizes followers for autonomous mission work', () => {
		const leader = makeDinoz({
			id: 1,
			level: 5,
			leaderId: null
		});
		const follower = makeDinoz({
			id: 2,
			level: 5,
			leaderId: 1
		});

		const selected = chooseBestBotDinozForActivity([follower, leader], 'mission');

		expect(selected?.id).toBe(1);
	});
});
