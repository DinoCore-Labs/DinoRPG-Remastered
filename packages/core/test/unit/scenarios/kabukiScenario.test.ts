import { describe, expect, it } from 'vitest';

import {
	KABUKI_AURA_INGREDIENTS,
	KABUKI_EGG_SCENARIO_KEY,
	KABUKI_MAX_REPEAT_EGGS,
	KABUKI_REPEAT_EGG_PRICE_GOLD,
	KABUKI_SCENARIO_KEY,
	KABUKI_SCENARIO_STEPS,
	KABUKI_WAITS_HOURS
} from '../../../src/models/scenarios/data/kabukiScenario.js';
import { getScenarioDefinition } from '../../../src/models/scenarios/scenarioList.js';

describe('Kabuki — données originales Motion Twin', () => {
	it('déclare séparément les scénarios kabuki et kabegg', () => {
		expect(getScenarioDefinition(KABUKI_SCENARIO_KEY).maxProgression).toBe(23);
		expect(getScenarioDefinition(KABUKI_EGG_SCENARIO_KEY).maxProgression).toBe(2);
		expect(getScenarioDefinition('kabuki').sid).not.toBe(getScenarioDefinition('kabegg').sid);
	});

	it('préserve les valeurs des étapes MT, y compris les sauts volontaires', () => {
		expect(KABUKI_SCENARIO_STEPS.YAKUZI_DEBT).toBe(1);
		expect(KABUKI_SCENARIO_STEPS.GORGES_FIGHT_WON).toBe(5);
		expect(KABUKI_SCENARIO_STEPS.IGOR_STUDYING_SCROLL).toBe(10);
		expect(KABUKI_SCENARIO_STEPS.FIRST_KABUKI_EGG_RECEIVED).toBe(22);
		expect(KABUKI_SCENARIO_STEPS.REPEAT_EGGS_UNLOCKED).toBe(23);
	});

	it('reproduit la liste des six remises d’ingrédients dans l’ordre original', () => {
		expect(KABUKI_AURA_INGREDIENTS.map(entry => entry.count)).toEqual([5, 5, 5, 2, 1, 1]);
		expect(KABUKI_AURA_INGREDIENTS.map(entry => entry.progressionAfter)).toEqual([12, 13, 14, 15, 16, 17]);
	});

	it('conserve les délais, le prix et le plafond MT des oeufs supplémentaires', () => {
		expect(KABUKI_WAITS_HOURS).toEqual({ YAKUZI_SECOND_BET: 48, IGOR_SCROLL: 35, IGOR_AURA: 70 });
		expect(KABUKI_REPEAT_EGG_PRICE_GOLD).toBe(50_000);
		expect(KABUKI_MAX_REPEAT_EGGS).toBe(2);
	});
});
