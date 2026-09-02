import { appDiscordClient } from '../src/logger/appDiscordClient.js';
import { prisma } from '../src/prisma.js';
import { forcebrutTournamentOpponentsSeed } from './seeds/forcebrutTournamentOpponents.js';
import { roadmapSeed } from './seeds/roadmap.js';

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

async function seedRoadmap() {
	for (const entry of roadmapSeed) {
		await prisma.roadmap.upsert({
			where: {
				position: entry.position
			},
			update: {},
			create: {
				position: entry.position,
				titleFr: entry.titleFr,
				titleEn: entry.titleEn,
				titleEs: entry.titleEs,
				titleDe: entry.titleDe,
				items: {
					create: entry.items.map(item => ({
						position: item.position,
						icon: item.icon,
						textFr: item.textFr,
						textEn: item.textEn,
						textEs: item.textEs,
						textDe: item.textDe
					}))
				}
			}
		});
	}
	await logSeedMessage('🌱 Roadmap seeded', {
		scope: 'prisma.seed',
		entity: 'roadmap',
		count: roadmapSeed.length,
		seededAt: new Date().toISOString()
	});
}

async function main() {
	await seedForcebrutTournamentOpponents();
	await seedRoadmap();
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