import { PlaceEnum } from '../enums/PlaceEnum.js';

/**
 * Motion Twin map.xml:
 *   clinik = physical location (unbuilt clinic)
 *   clini2 = visual variation, real="clinik", goto="clinik"
 *
 * All Dinoz always keep placeId=CLINIQUE (38) in the database.
 * The current clan's completed hopita construction selects the visual
 * representation (129), independent of the player's dialogue step.
 */
export function getClinicDisplayPlaceId(placeId: number, completedClanActionKeys: readonly string[]): number {
	return placeId === PlaceEnum.CLINIQUE && completedClanActionKeys.includes('hopita') ? PlaceEnum.CLINI2 : placeId;
}
