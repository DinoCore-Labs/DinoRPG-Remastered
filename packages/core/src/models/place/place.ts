import { placeListv2 } from './placeListv2.js';

export type Place = (typeof placeListv2)[keyof typeof placeListv2] & {
	borderPlace: readonly number[];
};
