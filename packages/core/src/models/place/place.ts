import { placeList } from './placeList.js';

export type Place = (typeof placeList)[keyof typeof placeList] & {
	borderPlace: readonly number[];
};
