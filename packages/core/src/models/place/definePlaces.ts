import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { parseCondition } from '../utils/conditions/parseConditions.js';
import { PlaceDefinition, PlaceDefinitionInput, PlaceMove, PlaceMoveInput } from './placeDefinition.js';

function normalizeCondition(source?: string | Condition): {
	condition?: Condition;
	rawCondition?: string;
} {
	if (!source) {
		return {};
	}
	if (typeof source === 'string') {
		return {
			condition: parseCondition(source),
			rawCondition: source
		};
	}
	return {
		condition: source
	};
}

function normalizeMove(move: PlaceMoveInput): PlaceMove {
	const normalizedCondition = normalizeCondition(move.condition);
	return {
		target: move.target,
		difficulty: move.difficulty ?? 1,
		condition: normalizedCondition.condition,
		rawCondition: normalizedCondition.rawCondition
	};
}

export function definePlaces(input: Record<PlaceEnum, PlaceDefinitionInput>): Record<PlaceEnum, PlaceDefinition> {
	return Object.fromEntries(
		Object.values(input).map(place => {
			const normalizedCondition = normalizeCondition(place.condition);
			return [
				place.placeId,
				{
					...place,
					condition: normalizedCondition.condition,
					rawCondition: normalizedCondition.rawCondition,
					moves: (place.moves ?? []).map(normalizeMove)
				} satisfies PlaceDefinition
			];
		})
	) as Record<PlaceEnum, PlaceDefinition>;
}
