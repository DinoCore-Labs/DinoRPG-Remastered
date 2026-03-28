import { ConditionsContext } from '../conditions/conditionsContext.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { evalCondition } from '../utils/conditions/evalConditions.js';
import { PlaceDefinition, PlaceMove } from './placeDefinition.js';

export function isPlaceEnabled(place: PlaceDefinition, context: ConditionsContext): boolean {
	if (place.disabled) {
		return false;
	}

	if (place.activeKey && !context.world.activeFeatures.has(place.activeKey.toLowerCase())) {
		return false;
	}

	if (place.condition && !evalCondition(context, place.condition)) {
		return false;
	}

	return true;
}

export function canUseMove(
	move: PlaceMove,
	context: ConditionsContext,
	places: Record<PlaceEnum, PlaceDefinition>
): boolean {
	if (move.condition && !evalCondition(context, move.condition)) {
		return false;
	}

	const target = places[move.target];
	if (!target) {
		return false;
	}

	return isPlaceEnabled(target, context);
}

export function getAvailableMoves(
	place: PlaceDefinition,
	context: ConditionsContext,
	places: Record<PlaceEnum, PlaceDefinition>
): PlaceMove[] {
	return place.moves.filter(move => canUseMove(move, context, places));
}

export function getBorderPlaces(place: PlaceDefinition): PlaceEnum[] {
	return place.moves.map(move => move.target);
}

export function resolveRealPlaceId(placeId: PlaceEnum, places: Record<PlaceEnum, PlaceDefinition>): PlaceEnum {
	const place = places[placeId];
	return place?.realPlaceId ?? placeId;
}
