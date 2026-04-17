import { getImgURL } from '../../../utils/getImgURL';

export enum EmotesElementsEnum {
	ELEMENT_FIRE = 'fire',
	ELEMENT_WATER = 'water',
	ELEMENT_WOOD = 'wood',
	ELEMENT_AIR = 'air',
	ELEMENT_LIGHTNING = 'lightning',
	ELEMENT_VOID = 'void'
}

export const EmotesElementsAliases: { [index: string]: string } = {
	['fire']: EmotesElementsEnum.ELEMENT_FIRE,
	['water']: EmotesElementsEnum.ELEMENT_WATER,
	['wood']: EmotesElementsEnum.ELEMENT_WOOD,
	['air']: EmotesElementsEnum.ELEMENT_AIR,
	['lightning']: EmotesElementsEnum.ELEMENT_LIGHTNING,
	['void']: EmotesElementsEnum.ELEMENT_VOID
};

export const EmotesElementsIcons: { [index: string]: string } = {
	[EmotesElementsEnum.ELEMENT_FIRE]: getImgURL('elements', 'elem_fire'),
	[EmotesElementsEnum.ELEMENT_WATER]: getImgURL('elements', 'elem_water'),
	[EmotesElementsEnum.ELEMENT_WOOD]: getImgURL('elements', 'elem_wood'),
	[EmotesElementsEnum.ELEMENT_AIR]: getImgURL('elements', 'elem_air'),
	[EmotesElementsEnum.ELEMENT_LIGHTNING]: getImgURL('elements', 'elem_lightning'),
	[EmotesElementsEnum.ELEMENT_VOID]: getImgURL('elements', 'elem_void')
};
