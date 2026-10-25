/**
 * Dungeon key display names, reconstructed from archived DinoCenter screenshots.
 * These are cosmetic, deterministic pseudo-random combinations, NOT a verified
 * reproduction of the complete MT server-side adjective/noun dictionaries.
 * MT keyId remains the only gameplay-authoritative door/key identifier.
 */
const PREFIXES = [
	'des Arbres',
	'des Calmars',
	'des Dragons',
	'des Kabukis',
	'des Roméo',
	'des Gobelins',
	'des Anges',
	'des Roncivores'
] as const;
const SUFFIXES = [
	'Magiques',
	'Enchantés',
	'Morts',
	'en Plastique',
	'Étincellants',
	'Rouges',
	'Maquillés',
	'en Carton'
] as const;

/** FNV-1a 32-bit; stable across sessions, browser reloads and platforms. */
function seed32(value: string): number {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
/**
 * A deterministic name per leader, dungeon and key identifier. Stage suffix is
 * stripped so the same key remains named consistently across dungeon stages.
 * Name never enters server game logic or the command payload.
 */
export function mtDungeonKeyName(leaderDinozId: number, mapId: string, keyId: number): string {
	if (
		!Number.isSafeInteger(leaderDinozId) ||
		leaderDinozId <= 0 ||
		!Number.isSafeInteger(keyId) ||
		keyId < 0 ||
		!/^[a-z][a-z0-9]*_[0-9]+$/.test(mapId)
	) {
		return `Clé n°${keyId}`;
	}
	const dungeonId = mapId.replace(/_[0-9]+$/, '');
	const prefixIndex = seed32(`${leaderDinozId}:${dungeonId}:${keyId}:prefix`) % PREFIXES.length;
	const suffixIndex = seed32(`${leaderDinozId}:${dungeonId}:${keyId}:suffix`) % SUFFIXES.length;
	return `Clé ${PREFIXES[prefixIndex]} ${SUFFIXES[suffixIndex]}`;
}

export function mtDungeonKeyPickupMessage(leaderDinozId: number, mapId: string, keyId: number): string {
	return `Vous avez trouvé la ${mtDungeonKeyName(leaderDinozId, mapId, keyId).replace(/^Clé /, 'clé ')} !`;
}

export function mtDungeonLockedDoorMessage(leaderDinozId: number, mapId: string, keyId: number): string {
	return `Cette porte est verrouillée. Il vous faut la ${mtDungeonKeyName(leaderDinozId, mapId, keyId).replace(/^Clé /, 'clé ')}.`;
}
