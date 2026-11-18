import { describe, expect, it } from 'vitest';

import { formatText } from '../../src/utils/formatText.js';

describe('formatText elemental spheres', () => {
	it('replaces sphere tags with the corresponding item icon', () => {
		const input = 'Obtenu : :fire_sphere: Sphère de Feu';
		const output = formatText(input);
		expect(output).toContain('item_fire_sphere');
		expect(output).toContain('alt="fire_sphere"');
	});

	it('supports all elemental spheres', () => {
		const spheres = ['fire_sphere', 'wood_sphere', 'water_sphere', 'lightning_sphere', 'air_sphere', 'void_sphere'];
		for (const sphere of spheres) {
			const formatted = formatText(`:${sphere}:`);
			expect(formatted).toContain(`item_${sphere}`);
			expect(formatted).toContain(`alt="${sphere}"`);
		}
	});

	it('formats pv and xp tags with consistent height', () => {
		const formattedPv = formatText('Perdu : :pv:');
		expect(formattedPv).toContain('alt="pv"');
		expect(formattedPv).toContain('height: 10px');

		const formattedXp = formatText('Gagné : :xp:');
		expect(formattedXp).toContain('alt="xp"');
		expect(formattedXp).toContain('height: 10px');
	});
});
