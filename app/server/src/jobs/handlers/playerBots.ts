import { applyRestIfNeeded } from '../../Dinoz/Controller/getRestDinoz.controller.js';
import { applyUnfreezeIfNeeded } from '../../Dinoz/Controller/getUnfreezeDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { executeBotDecision } from '../../Bot/Service/botAction.service.js';
import { chooseBotDecision } from '../../Bot/Service/botDecision.service.js';
import { getNextBotActionAt } from '../../Bot/Service/botSchedule.service.js';

const BOT_BATCH_SIZE = 20;

type BotJobLogger = {
	info: Function;
	error: Function;
};

async function applyTimedDinozStates(userId: string) {
	const dinoz = await prisma.dinoz.findMany({
		where: { userId },
		select: { id: true }
	});

	await prisma.$transaction(async tx => {
		for (const entry of dinoz) {
			await applyUnfreezeIfNeeded(tx, entry.id);
			await applyRestIfNeeded(tx, entry.id);
		}
	});
}

export async function playerBotsJob(log: BotJobLogger) {
	const now = new Date();
	const bots = await prisma.botProfile.findMany({
		where: {
			enabled: true,
			OR: [{ nextActionAt: null }, { nextActionAt: { lte: now } }]
		},
		orderBy: [{ nextActionAt: 'asc' }, { createdAt: 'asc' }],
		take: BOT_BATCH_SIZE
	});

	let executed = 0;
	let idle = 0;
	let failed = 0;

	for (const bot of bots) {
		try {
			await applyTimedDinozStates(bot.userId);
			const decision = await chooseBotDecision(bot.userId, bot.strategy);

			if (decision) {
				await executeBotDecision(bot.userId, bot.strategy, decision);
				executed++;
				log.info(
					{
						botProfileId: bot.id,
						userId: bot.userId,
						dinozId: decision.dinozId,
						action: decision.action
					},
					'[bots] action executed'
				);
			} else {
				idle++;
			}

			await prisma.botProfile.update({
				where: { id: bot.id },
				data: {
					lastActionAt: decision ? new Date() : bot.lastActionAt,
					nextActionAt: getNextBotActionAt(bot)
				}
			});
		} catch (error) {
			failed++;
			log.error(
				{
					error,
					botProfileId: bot.id,
					userId: bot.userId
				},
				'[bots] action failed'
			);

			await prisma.botProfile.update({
				where: { id: bot.id },
				data: {
					nextActionAt: getNextBotActionAt(bot)
				}
			});
		}
	}

	return {
		processed: bots.length,
		executed,
		idle,
		failed
	};
}
