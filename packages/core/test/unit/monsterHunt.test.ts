import { describe, expect, it } from 'vitest';

import { monsterByKey } from '../../src/models/monster/monsterKeyMap.js';

describe('Monster Hunt monsters', () => {
	it('resolves every Dark World invasion monster', () => {
		expect(monsterByKey.marca2.name).toBe('marca2');
		expect(monsterByKey.megou2.name).toBe('megou2');
		expect(monsterByKey.megaw2.name).toBe('megaw2');
		expect(monsterByKey.pirao3.name).toBe('pirao3');
		expect(monsterByKey.garou2.name).toBe('garou2');
		expect(monsterByKey.amanp3.name).toBe('amanp3');
		expect(monsterByKey.mimic3.name).toBe('mimic3');
	});
});
