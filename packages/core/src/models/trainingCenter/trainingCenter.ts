import { Action } from '../dinoz/dinozActions.js';
import { DinozStatusId } from '../dinoz/statusList.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';

export const TRAINING_CENTER_ACTION = Action.CEF;
export const TRAINING_CENTER_PLACE = PlaceEnum.FOSSELAVE;
export const TRAINING_CENTER_REQUIRED_STATUS = DinozStatusId.MEMBERSHIP_CARD;
export const TRAINING_CENTER_MAX_LEVEL = 30;
export const TRAINING_CENTER_BACKGROUND = 's_cef';

export const trainingCenterProgramKeys = ['easy', 'intermediate', 'advanced'] as const;

export type TrainingCenterProgramKey = (typeof trainingCenterProgramKeys)[number];

export type TrainingCenterProgram = {
	key: TrainingCenterProgramKey;
	price: number;

	/**
	 * Used only to generate the monster pool.
	 * The real Dinoz level and stats are not changed.
	 */
	powerMultiplier: number;

	/**
	 * Remaster choice:
	 * Intermediate and Advanced are more expensive, so they reward more XP.
	 */
	xpMultiplier: number;

	labelKey: string;
	descriptionKey: string;
};

export const trainingCenterPrograms: Record<TrainingCenterProgramKey, TrainingCenterProgram> = {
	easy: {
		key: 'easy',
		price: 500,
		powerMultiplier: 0.9,
		xpMultiplier: 1,
		labelKey: 'trainingCenter.programs.easy.name',
		descriptionKey: 'trainingCenter.programs.easy.description'
	},
	intermediate: {
		key: 'intermediate',
		price: 650,
		powerMultiplier: 1,
		xpMultiplier: 1.15,
		labelKey: 'trainingCenter.programs.intermediate.name',
		descriptionKey: 'trainingCenter.programs.intermediate.description'
	},
	advanced: {
		key: 'advanced',
		price: 800,
		powerMultiplier: 1.15,
		xpMultiplier: 1.35,
		labelKey: 'trainingCenter.programs.advanced.name',
		descriptionKey: 'trainingCenter.programs.advanced.description'
	}
};

export function isTrainingCenterProgramKey(value: string): value is TrainingCenterProgramKey {
	return trainingCenterProgramKeys.includes(value as TrainingCenterProgramKey);
}

export function getTrainingCenterVirtualLevel(dinozLevel: number, program: TrainingCenterProgram) {
	return Math.max(1, Math.min(TRAINING_CENTER_MAX_LEVEL - 1, Math.round(dinozLevel * program.powerMultiplier)));
}
