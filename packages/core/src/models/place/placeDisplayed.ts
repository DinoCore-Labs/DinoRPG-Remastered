import { MapZone } from '../enums/MapZone.js';
import { PlaceIcon } from '../enums/PlaceIcon.js';

export interface PlaceDisplayed {
	placeId: number;
	name: string;
	posLeft: number;
	posTop: number;
	icon: PlaceIcon;
	map: MapZone;
	hidden: boolean;
	alias?: number;
	xFactor: number;
	yFactor: number;
}
