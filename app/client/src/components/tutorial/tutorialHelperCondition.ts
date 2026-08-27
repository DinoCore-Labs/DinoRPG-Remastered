import type { CompareMode, Condition } from '@dinorpg/core/models/conditions/conditions.js';

export type TutorialHelperConditionContext = {
	tab: string | null;
	life: number | null;
};

function compareNumber(left: number, right: number, compare: CompareMode): boolean {
	switch (compare) {
		case 'eq':
			return left === right;
		case 'gte':
			return left >= right;
		case 'lte':
			return left <= right;
	}
}

export function checkTutorialHelperCondition(
	condition: Condition | undefined,
	context: TutorialHelperConditionContext
): boolean {
	if (!condition) {
		return true;
	}
	switch (condition.type) {
		case 'true':
			return true;
		case 'false':
			return false;
		case 'not':
			return !checkTutorialHelperCondition(condition.condition, context);
		case 'and':
			return (
				checkTutorialHelperCondition(condition.left, context) && checkTutorialHelperCondition(condition.right, context)
			);
		case 'or':
			return (
				checkTutorialHelperCondition(condition.left, context) || checkTutorialHelperCondition(condition.right, context)
			);
		case 'tab':
			return context.tab === condition.key;
		case 'life':
			return context.life !== null && compareNumber(context.life, condition.value, condition.compare);
		default:
			/*
			 * Les conditions serveur ne doivent pas être évaluées
			 * approximativement dans le navigateur.
			 */
			return false;
	}
}
