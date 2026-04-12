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
	textKey: string;
	label: MissionLabelKey;
	condition?: MissionDelayedCondition | null;
};

export type MissionAtGoal = {
	type: 'AT';
	place: PlaceEnum | null;
	hidden: boolean;
	titleKey?: string | null;
};

type MissionTalkGoalBase = {
	type: 'TALK';
	nameKey: string;
	npcKey?: MissionNpcKey;
	avatar?: MissionAvatarKey | null;
	branches?: MissionTalkBranch[] | null;
	frame?: MissionFrameKey | null;
	background?: MissionBackgroundKey | null;
	dialect?: MissionDialectKey | null;
};

export type MissionTalkModalGoal = MissionTalkGoalBase & {
	display?: 'modal';
	textKey: string;
	dialogId?: never;
};

export type MissionTalkDialogGoal = MissionTalkGoalBase & {
	display: 'dialog';
	dialogId: string;
	textKey?: never;
};

export type MissionTalkGoal = MissionTalkModalGoal | MissionTalkDialogGoal;

export type MissionActionGoal = {
	type: 'ACTION';
	nameKey: string;
	actionKey?: MissionActionKey;
	descriptionKey: string;
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
	titleKey: string;
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
	messageKey: string;
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
