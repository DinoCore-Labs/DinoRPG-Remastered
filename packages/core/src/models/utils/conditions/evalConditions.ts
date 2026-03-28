import { CompareMode, Condition, RandomBasis } from '../../conditions/conditions.js';
import { ConditionsContext } from '../../conditions/conditionsContext.js';
import { dinozStatusIdByKey } from '../../dinoz/statusKeyMap.js';

function compare(left: number, right: number, mode: CompareMode): boolean {
	switch (mode) {
		case 'eq':
			return left === right;
		case 'gte':
			return left >= right;
		case 'lte':
			return left <= right;
	}
}

function hashString(value: string | undefined): number {
	if (!value) return 0;

	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

function seededRandom(seed: number, max: number): number {
	if (max <= 0) return 0;

	let state = seed || 1;
	state ^= state << 13;
	state ^= state >>> 17;
	state ^= state << 5;

	return Math.abs(state) % max;
}

function getRandomSeed(context: ConditionsContext, basis: RandomBasis): number {
	switch (basis) {
		case 'day':
			return Math.floor(context.now.getTime() / (1000 * 60 * 60 * 24));
		case 'hour':
			return Math.floor(context.now.getTime() / (1000 * 60 * 60));
		case 'dialog':
			return context.session.dialogSeed;
		case 'dino':
			return context.dinoz.id;
		case 'user':
			return hashString(context.user.id);
	}
}

function normalize(value: string | undefined | null): string | undefined {
	return value?.toLowerCase();
}

export function evalCondition(context: ConditionsContext, condition: Condition): boolean {
	switch (condition.type) {
		case 'true':
			return true;

		case 'false':
			return false;

		case 'not':
			return !evalCondition(context, condition.condition);

		case 'or':
			return evalCondition(context, condition.left) || evalCondition(context, condition.right);

		case 'and':
			return evalCondition(context, condition.left) && evalCondition(context, condition.right);

		case 'date': {
			const now = context.now.getTime();
			const target = new Date(condition.value).getTime();
			return compare(now, target, condition.compare);
		}

		case 'caushrock':
			return compare(context.world.rockDirectionIndex ?? -1, condition.direction, 'eq');

		case 'level':
			return context.dinoz.level >= condition.value;

		case 'effect': {
			const statusId = dinozStatusIdByKey[condition.key];
			if (!statusId) return false;
			return context.dinoz.statusIds.has(statusId);
		}

		case 'collection':
			return context.user.collectionKeys.has(condition.key);

		case 'time': {
			const hourSeed = Math.floor(context.now.getTime() / (1000 * 60 * 60));
			const seed = hourSeed + (condition.user ? hashString(context.user.id) : context.dinoz.id);
			return seededRandom(seed, condition.value) === 0;
		}

		case 'mission':
			if (condition.status.type === 'done') {
				return context.missions.finishedMissionKeys.has(condition.key);
			}

			if (context.missions.currentMissionKey !== condition.key) {
				return false;
			}

			if (condition.status.step === undefined) {
				return true;
			}

			return context.missions.currentMissionStep === condition.status.step;

		case 'skill':
			return context.dinoz.skillKeys.has(condition.key);

		case 'canfight':
			return context.world.canFightMonsterKeys.has(condition.key);

		case 'position':
			return normalize(context.dinoz.placeKey) === normalize(condition.key);

		case 'hasobject':
			return context.user.objectKeys.has(condition.key);

		case 'hasingredient': {
			const qty = context.user.ingredientQuantities[condition.key] ?? 0;
			return compare(qty, condition.qty, condition.compare);
		}

		case 'random': {
			const value = condition.seeded
				? seededRandom(getRandomSeed(context, condition.basis ?? 'dialog'), condition.max)
				: Math.floor(Math.random() * condition.max);

			return compare(value, condition.target, condition.compare);
		}

		case 'admin':
			return context.user.isAdmin;

		case 'scenario': {
			const state = context.user.scenarios[condition.key];
			const step = state?.step ?? 0;
			return compare(step, condition.phase, condition.compare);
		}

		case 'uvar': {
			const value = context.user.uvars[condition.key] ?? 0;
			return compare(value, condition.value, condition.compare);
		}

		case 'gvar': {
			const value = context.user.gvars[condition.key] ?? 0;
			return compare(value, condition.value, condition.compare);
		}

		case 'life':
			return compare(context.dinoz.life, condition.value, condition.compare);

		case 'dinoz':
			return context.user.dinozCount >= condition.value;

		case 'race':
			return normalize(context.dinoz.raceKey) === normalize(condition.key);

		case 'equip':
			return context.dinoz.equipKeys.has(condition.key);

		case 'hour':
			return compare(context.now.getHours(), condition.value, condition.compare);

		case 'swait': {
			const scenario = context.user.scenarios[condition.key];
			const updatedAt = scenario?.updatedAt;
			if (!updatedAt) return false;

			const diff = context.now.getTime() - updatedAt.getTime();
			return diff > condition.hours * 60 * 60 * 1000;
		}

		case 'dungeon':
			return context.world.completedDungeonKeys.has(condition.key);

		case 'active':
			return context.world.activeFeatures.has(condition.key.toLowerCase());

		case 'clanact':
			return context.world.completedClanActionKeys.has(condition.key);

		case 'status':
			return context.dinoz.statusIds.has(condition.value);

		case 'friend':
			if (condition.key === undefined) {
				return !context.dinoz.friendKey;
			}
			return normalize(context.dinoz.friendKey) === normalize(condition.key);

		case 'event':
			return normalize(context.world.activeEvent) === normalize(condition.key);

		case 'promo':
			return normalize(context.world.activePromo) === normalize(condition.key);

		case 'war':
			return normalize(context.world.activeWar) === normalize(condition.key);

		case 'config':
			return (
				context.world.activeConfigs.has(condition.key.toLowerCase()) ||
				normalize(context.world.activeEvent) === normalize(condition.key) ||
				normalize(context.world.activePromo) === normalize(condition.key) ||
				normalize(context.world.activeWar) === normalize(condition.key)
			);

		case 'tag':
			return context.session.tags.has(condition.key);

		case 'tab':
			return normalize(context.session.currentTab) === normalize(condition.key);
	}
}
