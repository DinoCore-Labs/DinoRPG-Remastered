export const DINOZ_STATE = {
	frozen: 'frozen',
	sacrificed: 'sacrificed',
	selling: 'selling',
	superdom: 'superdom',
	resting: 'resting',
	unfreezing: 'unfreezing'
} as const;

export type DinozState = (typeof DINOZ_STATE)[keyof typeof DINOZ_STATE];
