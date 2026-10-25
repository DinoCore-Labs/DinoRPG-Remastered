import { describe, expect, it } from 'vitest';

import {
	mtDungeonKeyName,
	mtDungeonKeyPickupMessage,
	mtDungeonLockedDoorMessage
} from '../../../src/components/dungeon/mtDungeonKeyNames.js';

describe('MT dungeon cosmetic key names (archived DinoCenter examples)', () => {
	it('generates a stable prefix + suffix across stages and reloads', () => {
		const name = mtDungeonKeyName(42, 'stepp_0', 3);
		expect(name).toMatch(
			/^Clé des .+ (Magiques|Enchantés|Morts|en Plastique|Étincellants|Rouges|Maquillés|en Carton)$/
		);
		expect(mtDungeonKeyName(42, 'stepp_3', 3)).toBe(name);
		expect(mtDungeonKeyName(42, 'stepp_0', 3)).toBe(name);
	});
	it('uses the exact same key name for discovery and locked door', () => {
		const name = mtDungeonKeyName(42, 'stepp_0', 7).replace(/^Clé /, 'clé ');
		expect(mtDungeonKeyPickupMessage(42, 'stepp_0', 7)).toContain(name);
		expect(mtDungeonLockedDoorMessage(42, 'stepp_2', 7)).toContain(name);
	});
	it('falls back on invalid identities rather than creating an untrusted key', () => {
		expect(mtDungeonKeyName(0, 'stepp_0', 2)).toBe('Clé n°2');
		expect(mtDungeonKeyName(42, 'bad', 2)).toBe('Clé n°2');
	});
});
