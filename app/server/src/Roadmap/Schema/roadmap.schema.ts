import { Language } from '@dinorpg/core/models/config/language.js';
import { ROADMAP_SLOT_COUNT } from '@dinorpg/core/models/roadmap/roadmap.js';
import { z } from 'zod';

const roadmapPositionSchema = z.number().int().min(1).max(ROADMAP_SLOT_COUNT);

const hasSequentialPositions = (positions: number[]): boolean => {
	const sorted = [...positions].sort((a, b) => a - b);
	return sorted.every((position, index) => position === index + 1);
};

export const roadmapLanguageQuerySchema = z.object({
	lang: z.enum(Language).optional()
});

export const adminRoadmapItemSchema = z.object({
	position: z.number().int().positive(),
	icon: z.string().trim().max(64).nullable(),
	textFr: z.string().trim().min(1).max(2000),
	textEn: z.string().trim().min(1).max(2000),
	textEs: z.string().trim().min(1).max(2000),
	textDe: z.string().trim().min(1).max(2000)
});

export const adminRoadmapEntrySchema = z
	.object({
		position: roadmapPositionSchema,
		titleFr: z.string().trim().min(1).max(255),
		titleEn: z.string().trim().min(1).max(255),
		titleEs: z.string().trim().min(1).max(255),
		titleDe: z.string().trim().min(1).max(255),
		items: z.array(adminRoadmapItemSchema).min(1)
	})
	.superRefine((entry, ctx) => {
		const positions = entry.items.map(item => item.position);
		if (!hasSequentialPositions(positions)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Roadmap item positions must be sequential starting at 1',
				path: ['items']
			});
		}
	});

export const updateRoadmapBodySchema = z
	.object({
		roadmap: z.array(adminRoadmapEntrySchema).length(ROADMAP_SLOT_COUNT)
	})
	.superRefine((payload, ctx) => {
		const positions = payload.roadmap.map(entry => entry.position);
		if (!hasSequentialPositions(positions)) {
			ctx.addIssue({
				code: 'custom',
				message: `Roadmap must contain positions 1 to ${ROADMAP_SLOT_COUNT}`,
				path: ['roadmap']
			});
		}
	});

export type UpdateRoadmapBody = z.infer<typeof updateRoadmapBodySchema>;
