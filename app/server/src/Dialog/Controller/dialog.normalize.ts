import {
	DialogDefinition,
	DialogLinkDefinition,
	DialogPhaseDefinition,
	DialogPnj
} from '@dinorpg/core/models/dialogs/dialog.js';
import {
	RuntimeDialog,
	RuntimeDialogInjection,
	RuntimeDialogLink,
	RuntimeDialogPhase
} from '@dinorpg/core/models/dialogs/dialogRuntime.js';

function buildPhasePnj(base: DialogPnj, override?: Partial<DialogPnj> | null): DialogPnj | null {
	if (override === undefined) return null;
	if (override === null) return null;

	return {
		gfx: override.gfx ?? base.gfx,
		image: override.image ?? base.image,
		frame: override.frame ?? base.frame,
		background: override.background ?? base.background
	};
}

function normalizePhase(dialog: DialogDefinition, phase: DialogPhaseDefinition): RuntimeDialogPhase {
	return {
		id: phase.id,
		name: phase.name ?? dialog.name,
		fast: phase.fast ?? false,
		text: phase.text,
		next: phase.next ?? [],
		effects: phase.effects ?? [],
		special: phase.special ?? [],
		pnj: buildPhasePnj(dialog.pnj, phase.pnj),
		needCheck: phase.needCheck ?? true
	};
}

function normalizeLink(link: DialogLinkDefinition): RuntimeDialogLink {
	return {
		id: link.id,
		text: link.text,
		target: link.target ?? link.id,
		cond: link.cond ?? null,
		confirm: link.confirm ?? false
	};
}

function normalizeInject(inject: DialogDefinition['inject']): RuntimeDialogInjection[] {
	if (!inject) return [];

	return inject.map(entry => ({
		dialogId: entry.dialogId,
		phaseId: entry.phaseId,
		linkIds: [...entry.linkIds]
	}));
}

function resolveFirstPhase(dialog: DialogDefinition): string {
	if ('begin' in dialog.phases) {
		return 'begin';
	}
	if (dialog.first) {
		return dialog.first;
	}
	const firstPhase = Object.keys(dialog.phases)[0];
	if (!firstPhase) {
		throw new Error(`Dialog "${dialog.id}" has no phases`);
	}
	return firstPhase;
}

function normalizeDialog(dialog: DialogDefinition): RuntimeDialog {
	const phases = Object.fromEntries(
		Object.entries(dialog.phases).map(([phaseId, phase]) => [phaseId, normalizePhase(dialog, phase)])
	);
	const links = Object.fromEntries(Object.entries(dialog.links).map(([linkId, link]) => [linkId, normalizeLink(link)]));
	return {
		id: dialog.id,
		first: resolveFirstPhase(dialog),
		cond: dialog.cond ?? null,
		place: dialog.place,
		name: dialog.name,
		pnj: structuredClone(dialog.pnj),
		phases,
		links,
		inject: normalizeInject(dialog.inject)
	};
}

export function normalizeDialogs(dialogs: DialogDefinition[]): RuntimeDialog[] {
	return dialogs.map(normalizeDialog);
}
