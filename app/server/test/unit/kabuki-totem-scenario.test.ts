import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Boss } from '@dinorpg/core/models/monster/bossList.js';
import { describe, expect, it } from 'vitest';

import {
	getKabukiMovePhase,
	KABUKI_TOTEM_ALLIES,
	KABUKI_TOTEM_OPPONENTS
} from '../../src/Scenario/Controller/kabukiScenario.controller.js';

describe('Kabuki MT: route to Totem Island', () => {
	it('stage 19 lost route returns to Coral Mines', () => {
		expect(getKabukiMovePhase(19, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITLOST, PlaceEnum.MINES_DE_CORAIL)).toBe('lost');
		expect(getKabukiMovePhase(19, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBeNull();
	});
	it('stage 20 final encounter only occurs on the Totem route', () => {
		expect(getKabukiMovePhase(20, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBe('final');
		expect(getKabukiMovePhase(21, PlaceEnum.MINES_DE_CORAIL, PlaceEnum.ITOTEM, PlaceEnum.ITOTEM)).toBeNull();
	});
	it('final encounter starts with Igor and his three companions', () => {
		expect(KABUKI_TOTEM_OPPONENTS.map(m => m.id)).toEqual([
			Boss.PR_IGOR,
			Boss.IGOR_BARBARA,
			Boss.IGOR_CHOUPETTE,
			Boss.IGOR_POUPOULE
		]);
	});
	it('Yakuzi brings two different Kabuki allies', () => {
		expect(KABUKI_TOTEM_ALLIES.map(m => m.name)).toEqual(['yakuzi', 'Ninjutsu', 'Kage']);
		expect(KABUKI_TOTEM_ALLIES[1]?.display).not.toBe(KABUKI_TOTEM_ALLIES[2]?.display);
	});
});
