import { appDiscordClient } from '../src/logger/appDiscordClient.js';
import { prisma } from '../src/prisma.js';
import { forcebrutTournamentOpponentsSeed } from './seeds/forcebrutTournamentOpponents.js';

async function logSeedMessage(message: string, data: Record<string, unknown>) {
	try {
		await appDiscordClient.sendMessage(message, [data]);
	} catch (error) {
		console.error('[seed.discord] Failed to send seed log', error);
	}
}

async function seedForcebrutTournamentOpponents() {
	for (const opponent of forcebrutTournamentOpponentsSeed) {
		await prisma.forcebrutTournamentOpponent.upsert({
			where: {
				step: opponent.step
			},
			create: {
				...opponent,
				skillIds: [...opponent.skillIds]
			},
			update: {
				...opponent,
				skillIds: [...opponent.skillIds]
			}
		});
	}

	await logSeedMessage('🌱 Forcebrut tournament opponents seeded', {
		scope: 'prisma.seed',
		entity: 'forcebrutTournamentOpponent',
		count: forcebrutTournamentOpponentsSeed.length,
		steps: forcebrutTournamentOpponentsSeed.map(opponent => opponent.step),
		seededAt: new Date().toISOString()
	});
}

async function main() {
	await seedForcebrutTournamentOpponents();
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async error => {
		appDiscordClient.sendError(error, {
			scope: 'prisma.seed',
			data: {
				entity: 'forcebrutTournamentOpponent'
			}
		});
		await prisma.$disconnect();
		process.exit(1);
	});