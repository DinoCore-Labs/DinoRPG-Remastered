import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { randomBytes } from 'crypto';

import { BotStrategy } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { getOrCreateDinozShop } from '../../Shop/Controller/getOrCreateDinozShop.controller.js';
import { purchaseDinoz } from '../../Shop/Controller/purchaseDinoz.controller.js';
import { createPlayerAccount } from '../../User/Service/createPlayerAccount.service.js';

export type CreateBotPlayerInput = {
	name: string;
	strategy?: BotStrategy;
	minDelaySeconds?: number;
	maxDelaySeconds?: number;
};

export async function createBotPlayer({
	name,
	strategy = BotStrategy.BALANCED,
	minDelaySeconds = 60,
	maxDelaySeconds = 600
}: CreateBotPlayerInput) {
	if (minDelaySeconds <= 0 || maxDelaySeconds < minDelaySeconds) {
		throw new ExpectedError('invalidBotDelay');
	}

	const existingUser = await prisma.user.findUnique({
		where: { name },
		select: { id: true }
	});
	if (existingUser) {
		throw new ExpectedError('userAlreadyExists');
	}

	const password = randomBytes(32).toString('base64url');
	const user = await createPlayerAccount({
		name,
		password,
		gameRulesVersion: GAME_RULES_VERSION,
		isBot: true
	});

	const botProfile = await prisma.botProfile.create({
		data: {
			userId: user.id,
			strategy,
			minDelaySeconds,
			maxDelaySeconds,
			nextActionAt: new Date()
		}
	});

	const shop = await getOrCreateDinozShop(user.id);
	if (shop.length === 0) {
		throw new ExpectedError('emptyDinozShop');
	}

	const shopDinoz = shop[Math.floor(Math.random() * shop.length)];
	const dinoz = await purchaseDinoz({
		userId: user.id,
		shopDinozId: Number(shopDinoz.id)
	});

	return {
		user,
		botProfile,
		dinoz
	};
}
