import { describe, expect, it } from 'vitest';

import {
	mtDungeonKeyName,
	mtDungeonKeyPickupMessage,
	mtDungeonLockedDoorMessage,
	type MtDungeonTranslate
} from '../../../src/components/dungeon/mtDungeonKeyNames.js';
import fr from '../../../src/i18n/locales/FR.json';

const t: MtDungeonTranslate = (path, params = {}) => {
	const value = path
		.split('.')
		.reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), fr);
	if (typeof value !== 'string') throw Error('Missing ' + path);
	return value.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''));
};
describe('localized MT key names', () => {
	it('keeps a stable localized name across stages', () => {
		const name = mtDungeonKeyName(42, 'stepp_0', 3, t);
		expect(name).toMatch(/^Clé des /);
		expect(mtDungeonKeyName(42, 'stepp_3', 3, t)).toBe(name);
	});
	it('keeps names identical in pickup and locked door', () => {
		const name = mtDungeonKeyName(42, 'stepp_0', 7, t);
		expect(mtDungeonKeyPickupMessage(42, 'stepp_0', 7, t)).toContain(name);
		expect(mtDungeonLockedDoorMessage(42, 'stepp_2', 7, t)).toContain(name);
	});
	it('uses localized invalid key name', () => expect(mtDungeonKeyName(0, 'stepp_0', 2, t)).toBe('Clé n°2'));
});
