export const HOUR_MS = 1000 * 60 * 60;

export type RestRegen = { n: number; p: number }; // n = PV/h, p = cap

export type RestHealInfos = {
	regen: number;
	hours: number; // float
	life: number; // PV à ajouter maintenant (sur ticks entiers)
	max: number; // cap de repos (50% ou 65%)
	percent: number; // 50 ou 65
	maxed: boolean;
	now: Date;
	next: Date; // prochaine “heure”
};

export type DinozRestInfos = {
	regen: number; // PV par heure
	next: string; // ISO date (ou timestamp number si tu préfères)
	maxed: boolean;
};
