import { CompareMode, Condition, MissionConditionStatus } from '@dinorpg/core/models/conditions/conditions.js';
import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { resolveItemIdFromKey } from '@dinorpg/core/models/items/itemIdByKey.js';
import { UserRole } from '@dinorpg/core/models/user/userRole.js';

import { Role } from '../../../../prisma/index.js';
import {
	DialogContext,
	getScenarioProgress,
	getUserIngredientQuantity,
	hasDinozSkill,
	hasDinozStatus
} from '../../Dialog/Controller/dialog.context.js';

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

function unsupportedCondition(condition: Condition): boolean {
	throw new Error(`Dialog condition "${condition.type}" is not implemented yet`);
}

function isAdminRole(role: UserRole): boolean {
	return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function checkDialogCondition(condition: Condition | null | undefined, context: DialogContext): boolean {
	if (!condition) {
		return true;
	}
	switch (condition.type) {
		case 'true':
			return true;
		case 'false':
			return false;
		case 'not':
			return !checkDialogCondition(condition.condition, context);
		case 'and':
			return checkDialogCondition(condition.left, context) && checkDialogCondition(condition.right, context);
		case 'or':
			return checkDialogCondition(condition.left, context) || checkDialogCondition(condition.right, context);
		case 'scenario':
			return compareNumber(getScenarioProgress(context, condition.key), condition.phase, condition.compare);
		case 'uvar':
			return compareNumber(context.user.userVars.get(condition.key) ?? 0, condition.value, condition.compare);
		case 'life':
			return compareNumber(context.dinoz.life, condition.value, condition.compare);
		case 'status':
			return hasDinozStatus(context, condition.value);
		case 'effect': {
			const statusId = dinozStatusIdByKey[condition.key];
			if (statusId != null) {
				return hasDinozStatus(context, statusId);
			}
			return context.user.effects.has(condition.key);
		}
		case 'collection':
			return context.user.collections.has(condition.key);
		case 'tag':
			return context.user.tags.has(condition.key);
		case 'hasingredient':
			return compareNumber(getUserIngredientQuantity(context, Number(condition.key)), condition.qty, condition.compare);
		case 'level':
			return context.dinoz.level >= condition.value;
		case 'dinoz':
			return context.dinoz.id === condition.value;
		case 'position':
			return String(context.dinoz.placeId) === condition.key;
		case 'equip':
			return context.dinoz.itemIds.has(Number(condition.key));
		case 'skill':
			return hasDinozSkill(context, Number(condition.key));
		case 'hasobject': {
			const itemId = resolveItemIdFromKey(condition.key);
			if (itemId == null) {
				throw new Error(`Unknown item key "${condition.key}" in dialog condition`);
			}
			return (context.user.items.get(itemId) ?? 0) > 0 || context.user.allDinozEquippedItemIds.has(itemId);
		}
		case 'mission': {
			if (condition.status.type === 'done') {
				return context.dinoz.completedMissionKeys.has(condition.key);
			}
			if (condition.status.type === 'current') {
				return context.dinoz.currentMissionKey === condition.key;
			}
			return false;
		}
		case 'admin':
			return isAdminRole(context.user.role);
		case 'date':
		case 'day':
		case 'caushrock':
		case 'time':
		case 'canfight':
		case 'random':
		case 'gvar':
		case 'race':
		case 'hour':
		case 'swait':
		case 'dungeon':
		case 'active':
		case 'clanact':
		case 'friend':
		case 'event':
		case 'promo':
		case 'war':
		case 'config':
		case 'tab':
			return unsupportedCondition(condition);
	}
}
