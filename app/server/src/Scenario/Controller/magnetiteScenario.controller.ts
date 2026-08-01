import { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { ScenarioMoveFightInput } from '../Service/scenarioMoveFight.service.js';

/**
 * Traite les combats de déplacement du scénario Magnétite.
 *
 * Les rencontres seront ajoutées dans les commits suivants :
 * - embuscade initiale ;
 * - Destructeur ;
 * - Nightmare ;
 * - Tonnerre ;
 * - premier Grobourin ;
 * - embuscade des Goupignons.
 */
export async function processMagnetiteScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	/**
	 * Évite une erreur noUnusedParameters tant que le service
	 * n'implémente encore aucune rencontre.
	 */
	void input;

	return false;
}
