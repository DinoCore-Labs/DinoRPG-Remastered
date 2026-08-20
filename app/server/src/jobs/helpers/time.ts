export function nextDailyAtUtc(hour: number, minute: number) {
	const now = new Date();
	const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0, 0));

	if (next.getTime() <= now.getTime()) {
		next.setUTCDate(next.getUTCDate() + 1);
	}

	return next;
}

export function nextWeeklyAtUtc(dayOfWeek: number, hour: number, minute: number, from = new Date()): Date {
	const result = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), hour, minute, 0, 0));
	let diff = (dayOfWeek - result.getUTCDay() + 7) % 7;
	if (diff === 0 && result <= from) diff = 7;
	result.setUTCDate(result.getUTCDate() + diff);
	return result;
}
