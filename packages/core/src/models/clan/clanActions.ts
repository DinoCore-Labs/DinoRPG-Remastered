import { PlaceEnum } from '../enums/PlaceEnum.js';

/**
 * Actions collectives de DinoRPG (source MT : xml/fr/clanactions.xml).
 * `give="action:1"` consomme une action disponible du Dinoz ;
 * la Potion d'Irma est gérée séparément par le système de renouvellement des actions.
 */
export type ClanActionDefinition = {
	key: string;
	placeId: PlaceEnum;
	scenarioKey: string;
	minimumScenarioProgression: number;
	requiredActions: number;
};

export const clanActionDefinitions = {
	hopita: {
		key: 'hopita',
		placeId: PlaceEnum.CLINIQUE,
		scenarioKey: 'clinik',
		minimumScenarioProgression: 6,
		requiredActions: 600
	},
	tour: {
		key: 'tour',
		placeId: PlaceEnum.GO_TO_KARINBAO_TOWER,
		scenarioKey: 'nimba2',
		minimumScenarioProgression: 42,
		requiredActions: 500
	},
	pompe: {
		key: 'pompe',
		placeId: PlaceEnum.CONFINS_DES_STEPPES,
		scenarioKey: 'caush',
		minimumScenarioProgression: 5,
		requiredActions: 300
	},
	labora: {
		key: 'labora',
		placeId: PlaceEnum.ICEISL,
		scenarioKey: 'smog',
		minimumScenarioProgression: 13,
		requiredActions: 300
	}
} as const satisfies Record<string, ClanActionDefinition>;

export type ClanActionKey = keyof typeof clanActionDefinitions;

export function getClanActionDefinition(actionKey: string): ClanActionDefinition | null {
	return Object.hasOwn(clanActionDefinitions, actionKey) ? clanActionDefinitions[actionKey as ClanActionKey] : null;
}
