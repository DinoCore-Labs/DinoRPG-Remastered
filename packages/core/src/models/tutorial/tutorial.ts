import type { Condition } from '../conditions/conditions.js';

export const TUTORIAL_SCENARIO_KEY = 'tutorial';

export const tutorialObjectiveKeys = [
	'dinoz',
	'speak',
	'move',
	'port',
	'pub',
	'baobob',
	'papy',
	'shop',
	'burger',
	'clan',
	'user',
	'end'
] as const;

export type TutorialObjectiveKey = (typeof tutorialObjectiveKeys)[number];

export type TutorialEvent =
	'DINOZ_ADOPTED' | 'GUIDE_MICHEL_SPOKEN' | 'CLAN_PAGE_VISITED' | 'ACCOUNT_PAGE_VISITED' | 'TUTORIAL_FINISHED';

export type TutorialTextBlock = {
	url?: string;
	fast?: boolean;
	visible?: boolean;
};

export type TutorialHelper = {
	id: string;
	selector: string;
	url?: string;
	cond?: Condition;
};

export type TutorialReward =
	| {
			type: 'gold';
			amount: number;
	  }
	| {
			type: 'item';
			key: string;
			quantity: number;
	  }
	| {
			type: 'ingredient';
			key: string;
			quantity: number;
	  }
	| {
			type: 'collection';
			key: string;
	  };

export type TutorialValidation =
	| {
			type: 'event';
			event: TutorialEvent;
	  }
	| {
			type: 'condition';
			condition: Condition;
	  };

export type TutorialObjective = {
	id: TutorialObjectiveKey;
	/**
	 * Condition requise pour que l'objectif soit actif.
	 */
	cond?: Condition;
	/**
	 * Moyen de validation de l'objectif.
	 */
	validation: TutorialValidation;
	begin: TutorialTextBlock;
	end: TutorialTextBlock;
	helpers: TutorialHelper[];
	rewards: TutorialReward[];
	next?: TutorialObjectiveKey;
};

export const TUTORIAL_COMPLETED_PROGRESSION = tutorialObjectiveKeys.length;
