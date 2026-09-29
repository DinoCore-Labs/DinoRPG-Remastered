import type { BotProfile } from '../../../../prisma/index.js';

export function getNextBotActionAt(
	bot: Pick<BotProfile, 'minDelaySeconds' | 'maxDelaySeconds'>,
	now = new Date()
): Date {
	const minDelay = Math.max(1, bot.minDelaySeconds);
	const maxDelay = Math.max(minDelay, bot.maxDelaySeconds);
	const delaySeconds = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
	return new Date(now.getTime() + delaySeconds * 1000);
}
