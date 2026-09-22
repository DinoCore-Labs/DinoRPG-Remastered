import { defineScenario } from '../scenario.js';

export const STAR_SCENARIO_KEY = 'star';

export const STAR_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	// Dialogue de l'Être Étrange terminé.
	// Le prochain événement est le Megaloup.
	MEGAWOLF: 1,
	// Première étoile récupérée.
	// Équiper le Burger Nuageux aux Ruines Ashpouk.
	MERGUEZ_SELLER: 2,
	// Deuxième étoile récupérée.
	// Utiliser une tourte au Marais Collant lorsqu'il est inondé.
	MEAT_PIE: 3,
	// Troisième étoile récupérée.
	// Fouiller au Tunnel sous la Branche.
	DIG: 4,
	// Quatrième étoile récupérée.
	// Équiper le Petit Poivre au Cimetière.
	SKULLY: 5,
	// Cinquième étoile récupérée.
	// Parler à Bao Bob entre 5h et 7h.
	BAO_BOB: 6,
	// Sixième étoile récupérée.
	// Mourir dans la Jungle Sauvage puis ressusciter naturellement.
	NATURAL_RESURRECT: 7,
	// Les sept étoiles ont été récupérées.
	// Retour auprès de l'Être Étrange.
	FINAL: 8,
	COMPLETED: 9
} as const;

export const STAR_MAGIC_STAR_COUNT = 7;

export const starScenario = defineScenario({
	key: STAR_SCENARIO_KEY,
	sid: 1,
	nameKey: 'scenarios.star.name',
	maxProgression: STAR_SCENARIO_STEPS.COMPLETED
});
