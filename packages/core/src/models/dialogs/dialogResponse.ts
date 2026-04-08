import { DialogPnj } from './dialog.js';

export type DialogResponseLink = {
	id: string;
	text: string;
	confirm: boolean;
};

export type DialogPhaseResponseActions = {
	url?: string;
	startFight?: string;
	popup?: boolean;
	statusKey?: string;
	missionsGroup?: string;
};

export type I18nKey = string;

export type DialogPhaseResponse = {
	dialogId: string;
	phaseId: string;
	name: I18nKey;
	text: I18nKey;
	fast: boolean;
	pnj: DialogPnj;
	links: DialogResponseLink[];
	actions: DialogPhaseResponseActions;
};
