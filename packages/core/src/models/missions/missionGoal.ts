import { PlaceEnum } from '../enums/PlaceEnum.js';
import { MissionDelayedCondition } from './missionCondition.js';
import { MissionFightAction, MissionKillInfos } from './missionFight.js';
import {
	MissionActionKey,
	MissionAvatarKey,
	MissionBackgroundKey,
	MissionDialectKey,
	MissionEffectKey,
	MissionFrameKey,
	MissionGroupKey,
	MissionIngredientKey,
	MissionItemKey,
	MissionLabelKey,
	MissionMonsterKey,
	MissionNpcKey
} from './missionKey.js';

export type MissionTalkBranch = {
	text: string;
	label: MissionLabelKey;
	condition?: MissionDelayedCondition | null;
};

export type MissionAtGoal = {
	type: 'AT';
	place: PlaceEnum | null;
	hidden: boolean;
	title?: string | null;
};

export type MissionTalkGoal = {
	type: 'TALK';
	name: string;
	npcKey?: MissionNpcKey;
	text: string;
	avatar?: MissionAvatarKey | null;
	branches?: MissionTalkBranch[] | null;
	frame?: MissionFrameKey | null;
	background?: MissionBackgroundKey | null;
	dialect?: MissionDialectKey | null;
};

export type MissionActionGoal = {
	type: 'ACTION';
	name: string;
	actionKey?: MissionActionKey;
	description: string;
	waitSeconds?: number | null;
};

export type MissionKillGoal = {
	type: 'KILL';
	kill: MissionKillInfos;
};

export type MissionCompleteGroupGoal = {
	type: 'COMPLETE_GROUP';
	group: MissionGroupKey;
};

export type MissionRequireEffectGoal = {
	type: 'REQUIRE_EFFECT';
	effectKey: MissionEffectKey;
	title: string;
};

export type MissionFightGoal = {
	type: 'FIGHT';
	monsterKeys: MissionMonsterKey[];
};

export type MissionFightActionGoal = {
	type: 'FIGHT_ACTION';
	fightAction: MissionFightAction;
};

export type MissionUseItemGoal = {
	type: 'USE_ITEM';
	itemKey: MissionItemKey;
	quantity: number;
};

export type MissionLockGoal = {
	type: 'LOCK';
};

export type MissionUseIngredientGoal = {
	type: 'USE_INGREDIENT';
	ingredientKey: MissionIngredientKey;
	quantity: number;
};

export type MissionBranchGoal = {
	type: 'BRANCH';
	label: MissionLabelKey;
	condition?: MissionDelayedCondition | null;
};

export type MissionDigGoal = {
	type: 'DIG';
	message: string;
};

export type MissionGoal =
	| MissionAtGoal
	| MissionTalkGoal
	| MissionActionGoal
	| MissionKillGoal
	| MissionCompleteGroupGoal
	| MissionRequireEffectGoal
	| MissionFightGoal
	| MissionFightActionGoal
	| MissionUseItemGoal
	| MissionLockGoal
	| MissionUseIngredientGoal
	| MissionBranchGoal
	| MissionDigGoal;
