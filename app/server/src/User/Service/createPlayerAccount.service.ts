import bcrypt from 'bcrypt';

import gameConfig from '../../config/game.config.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { prisma } from '../../prisma.js';

export const SALT_ROUNDS = 10;

export type CreatePlayerAccountInput = {
	name: string;
	password: string;
	gameRulesVersion: string;
	isBot?: boolean;
};

export async function createPlayerAccount({
	name,
	password,
	gameRulesVersion,
	isBot = false
}: CreatePlayerAccountInput) {
	const hash = await bcrypt.hash(password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			password: hash,
			name,
			isBot,
			gameRulesAcceptedVersion: gameRulesVersion,
			gameRulesAcceptedAt: new Date(),
			wallets: {
				create: [
					{
						type: 'GOLD',
						amount: gameConfig.general.initialMoney
					},
					{
						type: 'TREASURE_TICKET',
						amount: gameConfig.general.initialTreasureTicket
					}
				]
			}
		},
		include: {
			wallets: true
		}
	});

	await prisma.ranking.create({
		data: {
			userId: user.id
		}
	});

	await prisma.userProfile.create({
		data: {
			userId: user.id,
			description: null,
			language: null,
			gender: null,
			age: null,
			avatar: null,
			avatarType: null
		}
	});

	for (const starterItem of gameConfig.general.starterPack) {
		await addItemToInventory(user.id, starterItem.itemId, starterItem.quantity);
	}

	await prisma.userScenario.create({
		data: {
			userId: user.id,
			scenarioKey: 'tutorial',
			progression: 0
		}
	});

	return user;
}
