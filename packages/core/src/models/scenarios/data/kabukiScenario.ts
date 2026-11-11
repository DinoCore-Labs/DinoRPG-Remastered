import { Ingredient } from '../../ingredients/ingredientList.js';
import { defineScenario } from '../scenario.js';

/** Source : archives Motion Twin, DinoRPG/xml/fr/dialogs/{yakuzi,igor}.xml. */
export const KABUKI_SCENARIO_KEY = 'kabuki';
export const KABUKI_EGG_SCENARIO_KEY = 'kabegg';

/** Valeurs exactes enregistrées par les dialogues originaux MT. */
export const KABUKI_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	YAKUZI_DEBT: 1,
	YAKUZI_DEBT_PAID: 2,
	YAKUZI_ESCAPED: 3,
	FORGES_FIGHT_WON: 4,
	GORGES_FIGHT_WON: 5,
	IGOR_STUDYING_SCROLL: 10,
	INGREDIENTS_REQUESTED: 11,
	FISH_DELIVERED: 12,
	LEAVES_DELIVERED: 13,
	FUR_DELIVERED: 14,
	FLINT_DELIVERED: 15,
	AIR_DELIVERED: 16,
	ALL_INGREDIENTS_DELIVERED: 17,
	IGOR_STOLE_AURA: 18,
	IGOR_CORAL_FIGHT_WON: 19,
	LOST_ISLAND_COMPLETED: 20,
	IGOR_FINAL_FIGHT_WON: 21,
	FIRST_KABUKI_EGG_RECEIVED: 22,
	REPEAT_EGGS_UNLOCKED: 23
} as const;

export const KABUKI_YAKUZI_FIRST_BET_GOLD = 10_000;
export const KABUKI_YAKUZI_SECOND_BET_GOLD = 100_000; // mise annoncée : non prélevée dans le dialogue MT
export const KABUKI_REPEAT_EGG_PRICE_GOLD = 50_000;
export const KABUKI_MAX_REPEAT_EGGS = 2; // compteur kabegg, distinct du premier œuf gratuit

/** swait(kabuki,N) : délais exprimés en heures dans le XML MT. */
export const KABUKI_WAITS_HOURS = {
	YAKUZI_SECOND_BET: 48,
	IGOR_SCROLL: 35,
	IGOR_AURA: 70
} as const;

/** utime(N) : condition distincte de swait, à implémenter avec la sémantique MT. */
export const KABUKI_REPEAT_EGG_UTIME = 100;

/** Ordre imposé par le dialogue Igor (kabuki:11 à kabuki:17). */
export const KABUKI_AURA_INGREDIENTS = [
	{ ingredientId: Ingredient.MEROU_LUJIDANE, count: 5, progressionAfter: 12 },
	{ ingredientId: Ingredient.FEUILLES_DE_PELINAE, count: 5, progressionAfter: 13 },
	{ ingredientId: Ingredient.TOUFFE_DE_FOURRURE, count: 5, progressionAfter: 14 },
	{ ingredientId: Ingredient.SILEX_TAILLE, count: 2, progressionAfter: 15 },
	{ ingredientId: Ingredient.ENERGIE_AIR, count: 1, progressionAfter: 16 },
	{ ingredientId: Ingredient.ENERGIE_EAU, count: 1, progressionAfter: 17 }
] as const;

export const kabukiScenario = defineScenario({
	key: KABUKI_SCENARIO_KEY,
	sid: 8,
	nameKey: 'scenarios.kabuki.name',
	maxProgression: KABUKI_SCENARIO_STEPS.REPEAT_EGGS_UNLOCKED
});

export const kabukiEggScenario = defineScenario({
	key: KABUKI_EGG_SCENARIO_KEY,
	sid: 9,
	nameKey: 'scenarios.kabukiEgg.name',
	maxProgression: KABUKI_MAX_REPEAT_EGGS
});
