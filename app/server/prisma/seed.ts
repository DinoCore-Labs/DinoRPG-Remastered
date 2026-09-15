import { appDiscordClient } from '../src/logger/appDiscordClient.js';
import { prisma } from '../src/prisma.js';
import { forcebrutTournamentOpponentsSeed } from './seeds/forcebrutTournamentOpponents.js';
import { FORUM_RULES_AUTHOR, FORUM_RULES_TOPIC_TITLE, forumRulesCategories, forumRulesContent } from './seeds/forumRules.js';
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

async function seedForumRules() {
	for (const category of forumRulesCategories) {
		const existingTopic = await prisma.forumTopic.findFirst({
			where: {
				category,
				title: FORUM_RULES_TOPIC_TITLE,
				authorName: FORUM_RULES_AUTHOR
			},
			include: {
				messages: {
					orderBy: {
						id: 'asc'
					},
					take: 1
				}
			}
		});
		if (existingTopic) {
			await prisma.forumTopic.update({
				where: {
					id: existingTopic.id
				},
				data: {
					isPinned: true,
					isClosed: true,
					authorName: FORUM_RULES_AUTHOR,
					messageCount: 1
				}
			});
			const firstMessage = existingTopic.messages[0];
			if (firstMessage) {
				await prisma.forumMessage.update({
					where: {
						id: firstMessage.id
					},
					data: {
						authorName: FORUM_RULES_AUTHOR,
						content: forumRulesContent
					}
				});
			} else {
				await prisma.forumMessage.create({
					data: {
						topicId: existingTopic.id,
						authorName: FORUM_RULES_AUTHOR,
						content: forumRulesContent
					}
				});
			}
			continue;
		}
		await prisma.forumTopic.create({
			data: {
				category,
				title: FORUM_RULES_TOPIC_TITLE,
				isPinned: true,
				isClosed: true,
				authorName: FORUM_RULES_AUTHOR,
				messageCount: 1,
				messages: {
					create: {
						authorName: FORUM_RULES_AUTHOR,
						content: forumRulesContent
					}
				}
			}
		});
	}
	await logSeedMessage('🌱 Forum rules seeded', {
		scope: 'prisma.seed',
		entity: 'forumTopic',
		count: forumRulesCategories.length,
		categories: [...forumRulesCategories],
		seededAt: new Date().toISOString()
	});
}

async function main() {
	await seedForcebrutTournamentOpponents();
	await seedRoadmap();
	await seedForumRules();
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