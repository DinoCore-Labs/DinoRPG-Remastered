import { Condition } from '@dinorpg/core/models/conditions/conditions.js';
import { RuntimeDialog, RuntimeDialogLink, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';

function cloneCondition(condition: Condition | null): Condition | null {
	if (!condition) return null;

	return structuredClone(condition);
}

function andConditions(...conditions: Array<Condition | null | undefined>): Condition | null {
	const validConditions = conditions.filter((condition): condition is Condition => condition != null);

	if (validConditions.length === 0) {
		return null;
	}

	const [first, ...rest] = validConditions.map(condition => structuredClone(condition));

	if (!first) {
		return null;
	}

	return rest.reduce<Condition>(
		(left, right) => ({
			type: 'and',
			left,
			right
		}),
		first
	);
}

function orConditions(...conditions: Array<Condition | null | undefined>): Condition | null {
	const validConditions = conditions.filter((condition): condition is Condition => condition != null);

	if (validConditions.length === 0) {
		return null;
	}

	const [first, ...rest] = validConditions.map(condition => structuredClone(condition));

	if (!first) {
		return null;
	}

	return rest.reduce<Condition>(
		(left, right) => ({
			type: 'or',
			left,
			right
		}),
		first
	);
}

function prefixedId(dialogId: string, id: string): string {
	return `${dialogId}_${id}`;
}

function getDialogMap(dialogs: RuntimeDialog[]): Map<string, RuntimeDialog> {
	const dialogMap = new Map<string, RuntimeDialog>();

	for (const dialog of dialogs) {
		if (dialogMap.has(dialog.id)) {
			throw new Error(`Duplicate dialog id "${dialog.id}" while preparing injections`);
		}

		dialogMap.set(dialog.id, dialog);
	}

	return dialogMap;
}

function copyPhase(sourceDialog: RuntimeDialog, destinationDialog: RuntimeDialog, phaseId: string): string {
	const sourcePhase = sourceDialog.phases[phaseId];

	if (!sourcePhase) {
		throw new Error(`Phase "${phaseId}" not found in source dialog "${sourceDialog.id}"`);
	}

	const clonedPhaseId = prefixedId(sourceDialog.id, sourcePhase.id);

	if (destinationDialog.phases[clonedPhaseId]) {
		return clonedPhaseId;
	}

	const clonedNext = sourcePhase.next.map(linkId => prefixedId(sourceDialog.id, linkId));

	const clonedPhase: RuntimeDialogPhase = {
		id: clonedPhaseId,
		name: sourcePhase.name,
		fast: sourcePhase.fast,
		text: sourcePhase.text,
		next: clonedNext,
		effects: structuredClone(sourcePhase.effects),
		special: structuredClone(sourcePhase.special),
		pnj: sourcePhase.pnj ? structuredClone(sourcePhase.pnj) : null,
		needCheck: sourcePhase.needCheck
	};

	destinationDialog.phases[clonedPhaseId] = clonedPhase;

	for (const sourceLinkId of sourcePhase.next) {
		const sourceLink = sourceDialog.links[sourceLinkId];

		if (!sourceLink) {
			throw new Error(
				`Link "${sourceLinkId}" not found in source dialog "${sourceDialog.id}" while copying phase "${phaseId}"`
			);
		}

		const clonedLinkId = prefixedId(sourceDialog.id, sourceLink.id);

		if (!destinationDialog.links[clonedLinkId]) {
			const clonedTargetId = copyPhase(sourceDialog, destinationDialog, sourceLink.target);

			const clonedLink: RuntimeDialogLink = {
				id: clonedLinkId,
				text: sourceLink.text,
				target: clonedTargetId,
				cond: cloneCondition(sourceLink.cond),
				confirm: sourceLink.confirm
			};

			destinationDialog.links[clonedLinkId] = clonedLink;
		}
	}

	return clonedPhaseId;
}

function removePhase(dialog: RuntimeDialog, phaseId: string) {
	const phase = dialog.phases[phaseId];

	if (!phase) {
		return;
	}

	for (const nextLinkId of phase.next) {
		const nextLink = dialog.links[nextLinkId];

		if (nextLink) {
			delete dialog.links[nextLink.id];
			removePhase(dialog, nextLink.target);
		}
	}

	delete dialog.phases[phase.id];
}

function appendLinkToPhase(phase: RuntimeDialogPhase, linkId: string) {
	if (!phase.next.includes(linkId)) {
		phase.next.push(linkId);
	}
}

function applySingleInjection(sourceDialog: RuntimeDialog, dialogsById: Map<string, RuntimeDialog>) {
	for (const injection of sourceDialog.inject) {
		const destinationDialog = dialogsById.get(injection.dialogId);

		if (!destinationDialog) {
			throw new Error(`No dialog "${injection.dialogId}" exists, referenced in "${sourceDialog.id}"`);
		}

		const destinationPhase = destinationDialog.phases[injection.phaseId];

		if (!destinationPhase) {
			throw new Error(
				`No phase "${injection.phaseId}" exists in dialog "${destinationDialog.id}", referenced in "${sourceDialog.id}"`
			);
		}

		for (const sourceLinkId of injection.linkIds) {
			const sourceLink = sourceDialog.links[sourceLinkId];

			if (!sourceLink) {
				throw new Error(`A link "${sourceLinkId}" isn't recognized in dialog "${sourceDialog.id}"`);
			}

			const injectedLinkId = prefixedId(sourceDialog.id, sourceLink.id);
			const injectedTargetId = copyPhase(sourceDialog, destinationDialog, sourceLink.target);

			appendLinkToPhase(destinationPhase, injectedLinkId);

			destinationDialog.links[injectedLinkId] = {
				id: injectedLinkId,
				target: injectedTargetId,
				text: sourceLink.text,
				cond: andConditions(sourceLink.cond, sourceDialog.cond),
				confirm: sourceLink.confirm
			};
		}
	}
}

function cleanupInjectedSourceDialog(sourceDialog: RuntimeDialog) {
	for (const injection of sourceDialog.inject) {
		for (const sourceLinkId of injection.linkIds) {
			const sourceLink = sourceDialog.links[sourceLinkId];

			if (!sourceLink) {
				continue;
			}

			removePhase(sourceDialog, sourceLink.target);
			delete sourceDialog.links[sourceLink.id];
		}
	}
}

export function applyDialogInjections(dialogs: RuntimeDialog[]) {
	const dialogsById = getDialogMap(dialogs);

	for (const dialog of dialogs) {
		if (dialog.inject.length === 0) {
			continue;
		}

		applySingleInjection(dialog, dialogsById);
		cleanupInjectedSourceDialog(dialog);
	}
}
