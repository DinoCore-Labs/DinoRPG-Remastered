import type { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import type { DinozToRewardFight } from '../../Fight/Service/fight.service.js';
import type { DinozToGetFighter } from '../../utils/fight/fight.mapper.js';
import { processMagnetiteScenarioMoveFight } from '../Controller/magnetiteScenario.controller.js';
import { processStarScenarioMoveFight } from '../Controller/starScenario.controller.js';

/**
 * Données communes transmises aux scénarios déclenchés lors d'un déplacement.
 */
export type ScenarioMoveFightInput = {
	user: {
		id: string;
		cooker: boolean;
		teacher: boolean;
		items: {
			itemId: number;
			quantity: number;
		}[];
	};
	/**
	 * Chef et suiveurs participant au déplacement.
	 */
	team: (DinozToGetFighter & DinozToRewardFight)[];
	/**
	 * Identifiant du chef du groupe.
	 */
	dinozId: number;
	/**
	 * Lieu sur lequel se trouvait le groupe.
	 */
	fromPlace: PlaceEnum;
	/**
	 * Lieu ou passage sélectionné par le joueur.
	 *
	 * Important pour les lieux techniques utilisant gotoPlaceId :
	 * - sband1 ;
	 * - sband2 ;
	 * - sband3 ;
	 * - scampw ;
	 * - gostep ;
	 * - sinto1 ;
	 * - sinto2.
	 */
	triggerPlace: PlaceEnum;
	/**
	 * Destination finale du déplacement après résolution du gotoPlaceId.
	 */
	toPlace: PlaceEnum;
	autoReequip?: boolean;
};

/**
 * Recherche un combat scénarisé correspondant au déplacement.
 *
 * Retourne :
 * - un FightResult lorsqu'un scénario a déclenché un combat ;
 * - false lorsqu'aucun scénario ne correspond.
 */
export async function processScenarioMoveFight(input: ScenarioMoveFightInput): Promise<FightResult | false> {
	const starFight = await processStarScenarioMoveFight(input);
	/**
	 * Ne pas tester starFight.result ici.
	 *
	 * Un combat perdu possède result === false, mais doit tout de même être
	 * retourné au client. Seule la valeur false directement renvoyée par le
	 * service signifie qu'aucun combat Star ne correspond.
	 */
	if (starFight !== false) {
		return starFight;
	}
	const magnetiteFight = await processMagnetiteScenarioMoveFight(input);
	if (magnetiteFight !== false) {
		return magnetiteFight;
	}
	return false;
}
