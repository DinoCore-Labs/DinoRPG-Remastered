/** Visual history only. The server owns the actual party position and collisions. */
export interface MtTrailPoint {
	mapId: string;
	x: number;
	y: number;
	l: number;
}

export function advanceMtTrail(
	history: readonly MtTrailPoint[],
	previous: MtTrailPoint,
	current: MtTrailPoint,
	maxFollowers: number
): MtTrailPoint[] {
	if (previous.mapId !== current.mapId || previous.l !== current.l) return [];
	const distance = Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y);
	// Only a server-confirmed one-tile move extends the visual follower trail.
	if (distance === 0) return [...history];
	if (distance !== 1) return [];
	return [{ ...previous }, ...history].slice(0, Math.max(0, maxFollowers));
}

export function mtFollowerPositions(
	history: readonly MtTrailPoint[],
	current: MtTrailPoint,
	count: number
): MtTrailPoint[] {
	return Array.from({ length: Math.max(0, count) }, (_, i) => history[i] ?? history.at(-1) ?? current);
}
