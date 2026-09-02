import { Language } from '@dinorpg/core/models/config/language.js';
import type { AdminRoadmapEntry, RoadmapEntry } from '@dinorpg/core/models/roadmap/roadmap.js';

import { prisma } from '../../prisma.js';

interface RoadmapTitleSource {
	titleFr: string;
	titleEn: string;
	titleEs: string;
	titleDe: string;
}

interface RoadmapTextSource {
	textFr: string;
	textEn: string;
	textEs: string;
	textDe: string;
}

const resolveTitle = (roadmap: RoadmapTitleSource, lang: Language): string => {
	switch (lang) {
		case Language.EN:
			return roadmap.titleEn;
		case Language.ES:
			return roadmap.titleEs;
		case Language.DE:
			return roadmap.titleDe;
		case Language.FR:
		default:
			return roadmap.titleFr;
	}
};

const resolveText = (item: RoadmapTextSource, lang: Language): string => {
	switch (lang) {
		case Language.EN:
			return item.textEn;
		case Language.ES:
			return item.textEs;
		case Language.DE:
			return item.textDe;
		case Language.FR:
		default:
			return item.textFr;
	}
};

export async function getRoadmap(lang: Language): Promise<RoadmapEntry[]> {
	const roadmap = await prisma.roadmap.findMany({
		orderBy: {
			position: 'asc'
		},
		include: {
			items: {
				orderBy: {
					position: 'asc'
				}
			}
		}
	});

	return roadmap.map(entry => ({
		position: entry.position,
		title: resolveTitle(entry, lang),
		items: entry.items.map(item => ({
			position: item.position,
			icon: item.icon,
			text: resolveText(item, lang)
		}))
	}));
}

export async function getAdminRoadmap(): Promise<AdminRoadmapEntry[]> {
	const roadmap = await prisma.roadmap.findMany({
		orderBy: {
			position: 'asc'
		},
		include: {
			items: {
				orderBy: {
					position: 'asc'
				}
			}
		}
	});
	return roadmap.map(entry => ({
		position: entry.position,
		titleFr: entry.titleFr,
		titleEn: entry.titleEn,
		titleEs: entry.titleEs,
		titleDe: entry.titleDe,
		items: entry.items.map(item => ({
			position: item.position,
			icon: item.icon,
			textFr: item.textFr,
			textEn: item.textEn,
			textEs: item.textEs,
			textDe: item.textDe
		}))
	}));
}

export async function updateAdminRoadmap(roadmap: AdminRoadmapEntry[]): Promise<AdminRoadmapEntry[]> {
	await prisma.$transaction(async tx => {
		for (const entry of roadmap) {
			await tx.roadmap.upsert({
				where: {
					position: entry.position
				},
				create: {
					position: entry.position,
					titleFr: entry.titleFr,
					titleEn: entry.titleEn,
					titleEs: entry.titleEs,
					titleDe: entry.titleDe
				},
				update: {
					titleFr: entry.titleFr,
					titleEn: entry.titleEn,
					titleEs: entry.titleEs,
					titleDe: entry.titleDe
				}
			});
			await tx.roadmapItem.deleteMany({
				where: {
					roadmapPosition: entry.position
				}
			});
			await tx.roadmapItem.createMany({
				data: entry.items.map(item => ({
					roadmapPosition: entry.position,
					position: item.position,
					icon: item.icon,
					textFr: item.textFr,
					textEn: item.textEn,
					textEs: item.textEs,
					textDe: item.textDe
				}))
			});
		}
	});
	return getAdminRoadmap();
}
