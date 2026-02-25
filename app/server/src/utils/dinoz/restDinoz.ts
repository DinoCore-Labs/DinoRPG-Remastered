import { HOUR_MS, RestHealInfos, RestRegen } from '@dinorpg/core/models/dinoz/dinozRest.js';

export function calculateRegeneration(params: {
	hasCocon: boolean;
	hasRegen: boolean;
	hasPhoenixHeart: boolean;
	isPriest: boolean;
	hasDivineWater: boolean;
}): RestRegen {
	let reg = 1;
	let p = 0.5;

	if (params.hasCocon) reg += 2;
	if (params.hasRegen) reg += 2;
	if (params.hasPhoenixHeart) p += 0.15;
	if (params.isPriest) reg += 1;
	if (params.hasDivineWater) reg *= 2;

	return { n: reg, p };
}

export function calculateHealInfos(d: {
	life: number;
	maxLife: number;
	timer: Date; // stateTimer
	regen: RestRegen;
}): RestHealInfos {
	const nowDate = new Date();
	const now = nowDate.getTime();

	let hours = (now - d.timer.getTime()) / HOUR_MS;
	if (hours < 0) hours = 0;

	let life = Math.floor(hours) * d.regen.n;
	const max = Math.floor(d.maxLife * d.regen.p);

	let maxed = false;
	if (d.life + life >= max) {
		life = max - d.life;
		if (life < 0) life = 0;
		maxed = true;
	}

	const ms = (1 - (hours - Math.floor(hours))) * HOUR_MS;

	return {
		regen: d.regen.n,
		hours,
		life,
		max,
		percent: Math.floor(d.regen.p * 100),
		maxed,
		now: nowDate,
		next: new Date(now + ms)
	};
}

export function ticksFromHours(hours: number) {
	return Math.floor(hours);
}
