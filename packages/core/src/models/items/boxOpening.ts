import { ItemFiche } from './itemFiche.js';

export interface BoxOpening {
	boxType: BoxType;
	items: ItemProbability[];
}

export interface ItemProbability {
	item: ItemFiche;
	odds: number;
	quantity: number;
}

export enum BoxType {
	COMMON = 'box_common',
	RARE = 'box_rare',
	EPIC = 'box_epic',
	LEGENDARY = 'box_legendary'
}
