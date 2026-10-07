import { Language } from '@dinorpg/core/models/config/language.js';
import { GameEvent } from '@dinorpg/core/models/game/gameEvents.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import gameConfig from '../../config/game.config.js';
import { distributeChristmasRewards } from '../../Events/Service/eventChristmasRewards.service.js';
import { getEventEdition } from '../../Events/Service/eventTracking.service.js';
import { getGameEventDateRange } from '../../GameEvent/Service/gameEvent.service.js';
import { newsService } from '../../News/Service/news.service.js';
import { prisma } from '../../prisma.js';

const SUPPORTED_EVENTS = [GameEvent.CHRISTMAS] as const;
type SupportedEvent = (typeof SUPPORTED_EVENTS)[number];

function getEventConfig(eventId: string) {
	const event = gameConfig.events.find(e => e.event === eventId);
	if (!event || !SUPPORTED_EVENTS.includes(eventId as SupportedEvent)) {
		return null;
	}
	return event;
}

export async function adminPublishStartNewsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { eventId } = req.params as { eventId: string };
	const event = getEventConfig(eventId);
	if (!event) return reply.status(404).send({ error: `Event "${eventId}" not found or not supported.` });

	const eventNameLower = event.event.toLowerCase();
	const now = new Date();
	const newsType = (NewsType as any)[`EVENT_${event.event}`] ?? NewsType.ANNOUNCE;
	const titleKey = `news.event.${eventNameLower}.start.title`;
	const excerptKey = `news.event.${eventNameLower}.start.excerpt`;
	const contentKey = `news.event.${eventNameLower}.start.content`;
	const slug = `event-${eventNameLower}-${now.getFullYear()}`;
	const range = getGameEventDateRange(event, now);
	if (!range) {
		return reply.status(500).send({
			error: `Unable to resolve dates for event "${event.event}".`
		});
	}
	const endMonthStr = range.end.month.toString().padStart(2, '0');
	const endDayStr = range.end.day.toString().padStart(2, '0');
	const params = JSON.stringify({
		eventEndDate: `${endDayStr}/${endMonthStr}`
	});
	try {
		await newsService.createAdminNews({
			slug,
			type: newsType,
			isPublished: true,
			publishedAt: now,
			translations: [
				{ lang: Language.FR, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` },
				{ lang: Language.EN, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` }
			]
		});
	} catch (e: any) {
		if (!e?.message?.includes('Unique constraint failed')) throw e;
	}
	return { message: `News de début publiée pour l'événement ${eventId}.` };
}

export async function adminPublishEndNewsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { eventId } = req.params as { eventId: string };
	const event = getEventConfig(eventId);
	if (!event) return reply.status(404).send({ error: `Event "${eventId}" not found or not supported.` });

	const eventNameLower = event.event.toLowerCase();
	const now = new Date();
	const newsType = (NewsType as any)[`EVENT_${event.event}`] ?? NewsType.ANNOUNCE;
	const titleKey = `news.event.${eventNameLower}.end.title`;
	const excerptKey = `news.event.${eventNameLower}.end.excerpt`;
	const contentKey = `news.event.${eventNameLower}.end.content`;
	const slug = `event-end-${eventNameLower}-${now.getFullYear()}`;

	let params = '{}';
	try {
		const { getPlayerEventRanking, getClanEventRanking } =
			await import('../../Ranking/Controller/getEventRanking.controller.js');
		const userRanking = await getPlayerEventRanking(event.event, 1, 3);
		const clanRanking = await getClanEventRanking(event.event, 1, 3);
		const topPlayers = userRanking.ranking
			.map((u: any) => `${u.position}. ${u.user.name} (${u.totalKills} monstres)`)
			.join('\n\n');
		const topClans = clanRanking.ranking
			.map((c: any) => `${c.position}. ${c.clanName} (${c.totalKills} monstres)`)
			.join('\n\n');
		params = JSON.stringify({ topPlayers, topClans });
	} catch {
		// Ranking not available, continue with empty params
	}

	try {
		await newsService.createAdminNews({
			slug,
			type: newsType,
			isPublished: true,
			publishedAt: now,
			translations: [
				{ lang: Language.FR, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` },
				{ lang: Language.EN, title: titleKey, excerpt: excerptKey, content: `${contentKey}|${params}` }
			]
		});
	} catch (e: any) {
		if (!e?.message?.includes('Unique constraint failed')) throw e;
	}

	return { message: `News de fin publiée pour l'événement ${eventId}.` };
}

export async function adminResetScoresHandler(req: FastifyRequest, reply: FastifyReply) {
	const { eventId } = req.params as { eventId: string };
	const event = getEventConfig(eventId);
	if (!event) {
		return reply.status(404).send({
			error: `Event "${eventId}" not found or not supported.`
		});
	}
	const edition = getEventEdition();
	const [userResult, clanResult] = await prisma.$transaction([
		prisma.userEventTracking.deleteMany({
			where: {
				eventId: event.event,
				edition
			}
		}),
		prisma.clanEventTracking.deleteMany({
			where: {
				eventId: event.event,
				edition
			}
		})
	]);
	return {
		message:
			`${userResult.count} progression(s) joueur et ` +
			`${clanResult.count} progression(s) clan supprimée(s) ` +
			`pour ${eventId} ${edition}.`
	};
}

export async function adminDistributeRewardsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { eventId } = req.params as { eventId: string };
	const event = getEventConfig(eventId);
	if (!event) return reply.status(404).send({ error: `Event "${eventId}" not found or not supported.` });
	if (event.event === GameEvent.CHRISTMAS) {
		const edition = getEventEdition();
		await distributeChristmasRewards(edition);
		return {
			message: `Récompenses Noël ${edition} distribuées avec succès.`
		};
	}
	return reply.status(400).send({ error: `Aucun distributeur de récompenses défini pour l'événement ${eventId}.` });
}
