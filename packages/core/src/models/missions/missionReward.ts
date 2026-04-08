import {
	MissionCollectionKey,
	MissionEffectKey,
	MissionGameVarKey,
	MissionIngredientKey,
	MissionItemKey,
	MissionUserVarKey
} from './missionKey.js';

export type MissionXpReward = {
	type: 'XP';
	value: number;
};

export type MissionGoldReward = {
	type: 'GOLD';
	value: number;
};

export type MissionItemReward = {
	type: 'ITEM';
	itemKey: MissionItemKey;
	quantity: number;
};

export type MissionCollectionReward = {
	type: 'COLLECTION';
	collectionKey: MissionCollectionKey;
};

export type MissionEffectReward = {
	type: 'EFFECT';
	effectKey: MissionEffectKey;
};

export type MissionUserVarReward = {
	type: 'USER_VAR';
	userVarKey: MissionUserVarKey;
};

export type MissionGameVarReward = {
	type: 'GAME_VAR';
	gameVarKey: MissionGameVarKey;
};

export type MissionRemoveEffectReward = {
	type: 'REMOVE_EFFECT';
	effectKey: MissionEffectKey;
};

export type MissionIngredientReward = {
	type: 'INGREDIENT';
	ingredientKey: MissionIngredientKey;
	quantity: number;
};

export type MissionReward =
	| MissionXpReward
	| MissionGoldReward
	| MissionItemReward
	| MissionCollectionReward
	| MissionEffectReward
	| MissionUserVarReward
	| MissionGameVarReward
	| MissionRemoveEffectReward
	| MissionIngredientReward;
