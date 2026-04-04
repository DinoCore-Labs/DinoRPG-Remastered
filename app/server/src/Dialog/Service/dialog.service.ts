import { DialogPhaseResponse, DialogResponseLink } from '@dinorpg/core/models/dialogs/dialogResponse.js';
import { RuntimeDialog, RuntimeDialogLink, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { buildDialogContext } from '../Controller/dialog.context.js';
import { applyDialogPhaseEffects } from '../Controller/dialog.effects.js';
import { getDialogById, getDialogs } from '../Controller/dialog.registry.js';

type DialogTransaction = Prisma.TransactionClient;

type OpenDialogParams = {
	userId: string;
	dinozId: number;
	dialogId: string;
};

type SelectDialogLinkParams = {
	userId: string;
	dinozId: number;
	dialogId: string;
	phaseId: string;
	linkId: string;
};

export type AvailableDialogSummary = {
	id: string;
	name: string;
	place: RuntimeDialog['place'];
	pnj: RuntimeDialog['pnj'];
};

function getDialogPhase(dialog: RuntimeDialog, phaseId: string): RuntimeDialogPhase {
	const phase = dialog.phases[phaseId];

	if (!phase) {
		throw new ExpectedError(`Unknown phase "${phaseId}" in dialog "${dialog.id}"`);
	}

	return phase;
}

function getDialogLink(dialog: RuntimeDialog, linkId: string): RuntimeDialogLink {
	const link = dialog.links[linkId];

	if (!link) {
		throw new ExpectedError(`Unknown link "${linkId}" in dialog "${dialog.id}"`);
	}

	return link;
}

function ensurePhaseContainsLink(phase: RuntimeDialogPhase, linkId: string, dialogId: string) {
	if (!phase.next.includes(linkId)) {
		throw new ExpectedError(`Link "${linkId}" is not available from phase "${phase.id}" in dialog "${dialogId}"`);
	}
}

function resolveVisibleLinks(
	dialog: RuntimeDialog,
	phase: RuntimeDialogPhase,
	context: Awaited<ReturnType<typeof buildDialogContext>>
): DialogResponseLink[] {
	const visibleLinks: DialogResponseLink[] = [];

	for (const linkId of phase.next) {
		const link = getDialogLink(dialog, linkId);

		if (link.cond && !checkDialogCondition(link.cond, context)) {
			continue;
		}
		console.log('COND RAW', link.id, JSON.stringify(link.cond, null, 2));
		visibleLinks.push({
			id: link.id,
			text: link.text,
			confirm: link.confirm
		});
	}

	return visibleLinks;
}

function extractPhaseActions(phase: RuntimeDialogPhase): DialogPhaseResponse['actions'] {
	const actions: DialogPhaseResponse['actions'] = {};

	for (const effect of phase.effects) {
		if (effect.type === 'url') {
			actions.url = effect.url;
		}
	}

	for (const special of phase.special) {
		switch (special.type) {
			case 'startFight':
				actions.startFight = phase.id;
				break;

			case 'popup':
				actions.popup = true;
				break;

			case 'status':
				actions.statusKey = special.status;
				break;

			default:
				break;
		}
	}

	return actions;
}

function resolvePhasePnj(dialog: RuntimeDialog, phase: RuntimeDialogPhase) {
	return phase.pnj ?? dialog.pnj;
}

async function enterDialogPhase(
	tx: DialogTransaction,
	dialog: RuntimeDialog,
	phase: RuntimeDialogPhase,
	userId: string,
	dinozId: number
): Promise<DialogPhaseResponse> {
	const beforeContext = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});

	await applyDialogPhaseEffects(tx, {
		context: beforeContext,
		dialog,
		phase
	});

	const afterContext = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});

	const links = resolveVisibleLinks(dialog, phase, afterContext);

	return {
		dialogId: dialog.id,
		phaseId: phase.id,
		name: phase.name,
		text: phase.text,
		fast: phase.fast,
		pnj: resolvePhasePnj(dialog, phase),
		links,
		actions: extractPhaseActions(phase)
	};
}

async function assertDialogAvailability(tx: DialogTransaction, dialog: RuntimeDialog, userId: string, dinozId: number) {
	const context = await buildDialogContext(tx, {
		userId,
		dinozId,
		dialog
	});

	if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
		throw new ExpectedError(`Dialog "${dialog.id}" is not available`);
	}
}

export async function listAvailableDialogs(params: {
	userId: string;
	dinozId: number;
}): Promise<AvailableDialogSummary[]> {
	return prisma.$transaction(async tx => {
		const availableDialogs: AvailableDialogSummary[] = [];
		console.log(
			'Registered dialogs:',
			getDialogs().map(dialog => dialog.id)
		);
		for (const dialog of getDialogs()) {
			const context = await buildDialogContext(tx, {
				userId: params.userId,
				dinozId: params.dinozId,
				dialog
			});

			if (context.dinoz.placeId !== dialog.place) {
				continue;
			}

			if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
				continue;
			}

			availableDialogs.push({
				id: dialog.id,
				name: dialog.name,
				place: dialog.place,
				pnj: dialog.pnj
			});
		}

		return availableDialogs;
	});
}

export async function startDialog(params: OpenDialogParams): Promise<DialogPhaseResponse> {
	return prisma.$transaction(async tx => {
		const dialog = getDialogById(params.dialogId);

		await assertDialogAvailability(tx, dialog, params.userId, params.dinozId);

		const phase = getDialogPhase(dialog, dialog.first);

		return enterDialogPhase(tx, dialog, phase, params.userId, params.dinozId);
	});
}

export async function selectDialogLink(params: SelectDialogLinkParams): Promise<DialogPhaseResponse> {
	return prisma.$transaction(async tx => {
		const dialog = getDialogById(params.dialogId);

		await assertDialogAvailability(tx, dialog, params.userId, params.dinozId);

		const currentPhase = getDialogPhase(dialog, params.phaseId);
		const selectedLink = getDialogLink(dialog, params.linkId);

		ensurePhaseContainsLink(currentPhase, selectedLink.id, dialog.id);

		const currentContext = await buildDialogContext(tx, {
			userId: params.userId,
			dinozId: params.dinozId,
			dialog
		});

		if (selectedLink.cond && !checkDialogCondition(selectedLink.cond, currentContext)) {
			throw new ExpectedError(`Link "${selectedLink.id}" is not currently available in dialog "${dialog.id}"`);
		}

		const targetPhase = getDialogPhase(dialog, selectedLink.target);

		return enterDialogPhase(tx, dialog, targetPhase, params.userId, params.dinozId);
	});
}
