import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { getClinicDisplayPlaceId } from '@dinorpg/core/models/place/clinicPlace.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

/**
 * Les règles et le lieu du combat utilisent toujours le lieu réel (38).
 * Seul le fond peut provenir de l'alias visuel (129) après la construction.
 * Un décor explicitement fourni par un scénario a toujours priorité.
 */
export function resolveClinicFightBackground(
	actualPlaceId: PlaceEnum,
	completedClanActionKeys: readonly string[],
	existingBackground?: string
): string | undefined {
	if (existingBackground) return existingBackground;
	const displayPlaceId = getClinicDisplayPlaceId(actualPlaceId, completedClanActionKeys);
	return displayPlaceId === actualPlaceId ? undefined : placeListv2[displayPlaceId as PlaceEnum]?.background;
}
