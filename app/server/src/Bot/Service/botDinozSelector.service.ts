import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';

export type BotDinozActivityScoreInput = {
	id: number;
	level: number;
	life: number;
	maxLife: number;
	leaderId: number | null;
	followers: { id: number }[];
	skills: { skillId: number }[];
	items: { itemId: number }[];
};

export function getBotDinozActivityScore(
	dinoz: BotDinozActivityScoreInput,
	action: Action | 'mission'
): number {
	const lifeRatio = dinoz.maxLife > 0 ? dinoz.life / dinoz.maxLife : 0;
	let score = dinoz.level * 10 + lifeRatio * 20;

	if (dinoz.leaderId !== null) {
		score -= 15;
	}
	if (dinoz.followers.length > 0) {
		score += action === Action.FIGHT ? 25 : 5;
	}

	if (action === Action.FIGHT) {
		score += dinoz.skills.length * 1.5;
		score += dinoz.items.length * 2;
	}

	if (
		action === Action.FISH ||
		action === Action.CUEILLE ||
		action === Action.ENERGY ||
		action === Action.HUNT ||
		action === Action.SEEK
	) {
		score += dinoz.skills.length;
		score += lifeRatio * 10;
	}

	if (action === 'mission') {
		score += dinoz.leaderId === null ? 10 : 0;
	}

	return score;
}

export function chooseBestBotDinozForActivity<T extends BotDinozActivityScoreInput>(
	dinozList: T[],
	action: Action | 'mission'
): T | null {
	if (dinozList.length === 0) return null;

	return [...dinozList].sort(
		(a, b) => getBotDinozActivityScore(b, action) - getBotDinozActivityScore(a, action)
	)[0];
}
