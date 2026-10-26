/** Cosmetic MT key names: only the numeric keyId matters to gameplay. */
export type MtDungeonTranslate = (key: string, params?: Record<string, string | number>) => string;
function seed32(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
export function mtDungeonKeyName(leaderDinozId: number, mapId: string, keyId: number, t: MtDungeonTranslate): string {
	if (
		!Number.isSafeInteger(leaderDinozId) ||
		leaderDinozId <= 0 ||
		!Number.isSafeInteger(keyId) ||
		keyId < 0 ||
		!/^[a-z][a-z0-9]*_[0-9]+$/.test(mapId)
	)
		return t('dungeon.keys.unknown', { id: keyId });
	const dungeonId = mapId.replace(/_[0-9]+$/, '');
	const prefixIndex = seed32(`${leaderDinozId}:${dungeonId}:${keyId}:prefix`) % 8;
	const suffixIndex = seed32(`${leaderDinozId}:${dungeonId}:${keyId}:suffix`) % 8;
	return t('dungeon.keys.name', {
		prefix: t(`dungeon.keys.prefixes.p${prefixIndex}`),
		suffix: t(`dungeon.keys.suffixes.s${suffixIndex}`)
	});
}
export function mtDungeonKeyPickupMessage(
	leaderDinozId: number,
	mapId: string,
	keyId: number,
	t: MtDungeonTranslate
): string {
	return t('dungeon.keys.pickup', { key: mtDungeonKeyName(leaderDinozId, mapId, keyId, t) });
}
export function mtDungeonLockedDoorMessage(
	leaderDinozId: number,
	mapId: string,
	keyId: number,
	t: MtDungeonTranslate
): string {
	return t('dungeon.keys.lockedDoor', { key: mtDungeonKeyName(leaderDinozId, mapId, keyId, t) });
}
