import { Condition } from '@dinorpg/core/models/enums/ConditionType.js';
import { Operator } from '@dinorpg/core/models/enums/Parser.js';

import { conditionParser } from './conditionParser.js';
import { PlayerForConditionCheck } from './user/userConditionCheck.js';

export function checkCondition(
	condition: Condition | undefined,
	user: PlayerForConditionCheck,
	activeDinoz: number
): boolean {
	if (!condition) return true;
	let conditionResult = true;

	if (condition[Operator.AND]) {
		for (const subCondition of condition[Operator.AND]) {
			conditionResult = conditionResult && checkCondition(subCondition, user, activeDinoz);
		}
	} else if (condition[Operator.OR]) {
		conditionResult = false;
		for (const subCondition of condition[Operator.OR]) {
			conditionResult = checkCondition(subCondition, user, activeDinoz) || conditionResult;
		}
	} else if (condition[Operator.NOT]) {
		conditionResult = !checkCondition(condition[Operator.NOT], user, activeDinoz);
	}

	if (condition[Operator.AND] || condition[Operator.OR] || condition[Operator.NOT]) {
		return conditionResult;
	}

	return conditionParser(condition, user, activeDinoz);
}
