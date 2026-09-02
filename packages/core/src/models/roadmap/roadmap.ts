export const ROADMAP_SLOT_COUNT = 4;

export interface RoadmapItem {
	position: number;
	icon: string | null;
	text: string;
}

export interface RoadmapEntry {
	position: number;
	title: string;
	items: RoadmapItem[];
}

export interface AdminRoadmapItem {
	position: number;
	icon: string | null;

	textFr: string;
	textEn: string;
	textEs: string;
	textDe: string;
}

export interface AdminRoadmapEntry {
	position: number;

	titleFr: string;
	titleEn: string;
	titleEs: string;
	titleDe: string;

	items: AdminRoadmapItem[];
}

export interface AdminRoadmapPayload {
	roadmap: AdminRoadmapEntry[];
}
