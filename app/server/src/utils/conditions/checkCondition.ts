import { Condition } from '@dinorpg/core/models/conditions/conditions.js';
import { ConditionsContext } from '@dinorpg/core/models/conditions/conditionsContext.js';
import { evalCondition } from '@dinorpg/core/models/conditions/evalConditions.js';

export function checkCondition(condition: Condition | undefined, context: ConditionsContext): boolean {
	if (!condition) return true;
	return evalCondition(context, condition);
}
