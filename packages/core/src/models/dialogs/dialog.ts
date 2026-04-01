import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { DialogEffect } from './dialogEffect.js';
import { DialogSpecial } from './dialogSpecial.js';

export type DialogPnj = {
	gfx: string;
	image: boolean;
	frame: string;
	background: string;
};

export type DialogPhaseDefinition = {
	id: string;
	name?: string;
	fast?: boolean;
	text: string;
	next?: string[];
	effects?: DialogEffect[];
	special?: DialogSpecial[];
	pnj?: Partial<DialogPnj> | null;
	needCheck?: boolean;
};

export type DialogLinkDefinition = {
	id: string;
	text: string;
	target?: string;
	cond?: Condition;
	confirm?: boolean;
};

export type DialogInjectionDefinition = {
	dialogId: string;
	phaseId: string;
	linkIds: string[];
};

export type DialogDefinition = {
	id: string;
	first?: string;
	cond?: Condition;
	place: PlaceEnum;
	name: string;
	pnj: DialogPnj;
	phases: Record<string, DialogPhaseDefinition>;
	links: Record<string, DialogLinkDefinition>;
	inject?: DialogInjectionDefinition[];
};
