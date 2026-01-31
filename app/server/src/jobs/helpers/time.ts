export function nextDailyAtUtc(hour: number, minute: number) {
	const now = new Date();
	const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, minute, 0, 0));

	if (next.getTime() <= now.getTime()) {
		next.setUTCDate(next.getUTCDate() + 1);
	}

	return next;
}
