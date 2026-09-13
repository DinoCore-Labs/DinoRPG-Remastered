import { GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import bcrypt from 'bcrypt';

import type { Role } from '../../../../prisma/index.js';
import gameConfig from '../../../src/config/game.config.js';
import { prisma } from '../../../src/prisma.js';

export const TEST_USER_PASSWORD = 'test-password';

const TEST_BCRYPT_ROUNDS = 4;

export interface CreateTestUserOptions {
	name?: string;
	password?: string;
	role?: Role;
	gameRulesAcceptedVersion?: string | null;
	gameRulesAcceptedAt?: Date | null;
	withProfile?: boolean;
	withRanking?: boolean;
	withWallets?: boolean;
	withTutorial?: boolean;
}

let userSequence = 0;

export async function createTestUser(options: CreateTestUserOptions = {}) {
	userSequence += 1;

	const {
		name = `TestPlayer${userSequence}`,
		password = TEST_USER_PASSWORD,
		role = 'PLAYER',
		gameRulesAcceptedVersion = GAME_RULES_VERSION,
		gameRulesAcceptedAt = new Date(),
		withProfile = true,
		withRanking = true,
		withWallets = true,
		withTutorial = true
	} = options;

	const passwordHash = await bcrypt.hash(password, TEST_BCRYPT_ROUNDS);

	return prisma.user.create({
		data: {
			name,
			password: passwordHash,
			role,
			gameRulesAcceptedVersion,
			gameRulesAcceptedAt,
			...(withProfile
				? {
						profile: {
							create: {}
						}
					}
				: {}),
			...(withRanking
				? {
						ranking: {
							create: {}
						}
					}
				: {}),
			...(withWallets
				? {
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
					}
				: {}),
			...(withTutorial
				? {
						scenarios: {
							create: {
								scenarioKey: 'tutorial',
								progression: 0,
								tracking: 0
							}
						}
					}
				: {})
		},
		include: {
			profile: true,
			ranking: true,
			wallets: true,
			scenarios: true
		}
	});
}
