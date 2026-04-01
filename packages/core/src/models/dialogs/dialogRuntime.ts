import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { DialogPnj } from './dialog.js';
import { DialogEffect } from './dialogEffect.js';
import { DialogSpecial } from './dialogSpecial.js';

export type RuntimeDialogPhase = {
	id: string;
	name: string;
	fast: boolean;
	text: string;
	next: string[];
	effects: DialogEffect[];
	special: DialogSpecial[];
	pnj: DialogPnj | null;
	needCheck: boolean;
};

export type RuntimeDialogLink = {
	id: string;
	text: string;
	target: string;
	cond: Condition | null;
	confirm: boolean;
};

export type RuntimeDialogInjection = {
	dialogId: string;
	phaseId: string;
	linkIds: string[];
};

export type RuntimeDialog = {
	id: string;
	first: string;
	cond: Condition | null;
	place: PlaceEnum;
	name: string;
	pnj: DialogPnj;
	phases: Record<string, RuntimeDialogPhase>;
	links: Record<string, RuntimeDialogLink>;
	inject: RuntimeDialogInjection[];
};
