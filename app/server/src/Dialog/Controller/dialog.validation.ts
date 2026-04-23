import { RuntimeDialog, RuntimeDialogLink, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';

function getDialogPhases(dialog: RuntimeDialog): RuntimeDialogPhase[] {
	return Object.values(dialog.phases);
}

function getDialogLinks(dialog: RuntimeDialog): RuntimeDialogLink[] {
	return Object.values(dialog.links);
}

function validateDialogIds(dialogs: RuntimeDialog[]) {
	const seen = new Set<string>();
	for (const dialog of dialogs) {
		if (seen.has(dialog.id)) {
			throw new Error(`Duplicate dialog id "${dialog.id}"`);
		}
		seen.add(dialog.id);
	}
}

function validatePhaseIds(dialog: RuntimeDialog) {
	for (const [phaseKey, phase] of Object.entries(dialog.phases)) {
		if (phase.id !== phaseKey) {
			throw new Error(`Phase key/id mismatch in dialog "${dialog.id}": key="${phaseKey}" id="${phase.id}"`);
		}
	}
}

function validateLinkIds(dialog: RuntimeDialog) {
	for (const [linkKey, link] of Object.entries(dialog.links)) {
		if (link.id !== linkKey) {
			throw new Error(`Link key/id mismatch in dialog "${dialog.id}": key="${linkKey}" id="${link.id}"`);
		}
	}
}

function validateBeginOrInjection(dialog: RuntimeDialog) {
	const hasBegin = 'begin' in dialog.phases;
	const hasInjection = dialog.inject.length > 0;

	if (!hasBegin && !hasInjection) {
		throw new Error(`No begin phase or injection in dialog "${dialog.id}"`);
	}
}

function validateFirstPhase(dialog: RuntimeDialog) {
	if (!(dialog.first in dialog.phases)) {
		throw new Error(`First phase "${dialog.first}" does not exist in dialog "${dialog.id}"`);
	}
}

function validatePhaseLinks(dialog: RuntimeDialog) {
	for (const phase of getDialogPhases(dialog)) {
		for (const linkId of phase.next) {
			if (!(linkId in dialog.links)) {
				throw new Error(`Dialog next does not exist: "${linkId}" in phase "${phase.id}" in dialog "${dialog.id}"`);
			}
		}
	}
}

function validateLinkTargets(dialog: RuntimeDialog) {
	for (const link of getDialogLinks(dialog)) {
		if (!(link.target in dialog.phases)) {
			throw new Error(`Dialog phase not found: "${link.target}" for link "${link.id}" in dialog "${dialog.id}"`);
		}
	}
}

function validateLinkUsage(dialog: RuntimeDialog) {
	for (const link of getDialogLinks(dialog)) {
		let found = false;
		for (const phase of getDialogPhases(dialog)) {
			if (phase.next.includes(link.id)) {
				found = true;
				break;
			}
		}
		if (!found) {
			throw new Error(`A link isn't used anywhere: "${link.id}" in dialog "${dialog.id}"`);
		}
	}
}

function validatePnjOverrides(dialog: RuntimeDialog) {
	for (const phase of getDialogPhases(dialog)) {
		if (!phase.pnj) continue;
		if (phase.name === dialog.name && phase.pnj.gfx !== dialog.pnj.gfx) {
			throw new Error(
				`The GFX change must be followed by a name attribution in phase "${phase.id}" of dialog "${dialog.id}"`
			);
		}
	}
}

function validateDangerousGivePatterns(dialog: RuntimeDialog) {
	for (const phase of getDialogPhases(dialog)) {
		if (phase.needCheck === false) {
			continue;
		}
		let hasGive = false;
		let hasTest = false;
		for (const effect of phase.effects) {
			switch (effect.type) {
				case 'scenario':
				case 'scenarioDelta':
				case 'effect':
				case 'noEffect':
					hasTest = true;
					break;
				case 'giveItem':
				case 'giveIngredient':
				case 'giveRandomItem':
					hasGive = true;
					break;

				default:
					break;
			}
		}
		for (const special of phase.special) {
			switch (special.type) {
				case 'useItem':
				case 'useIngredient':
					hasGive = true;
					break;
				default:
					break;
			}
		}
		if (hasGive && !hasTest) {
			throw new Error(
				`Giving/using an item or ingredient without scenario increment/test is dangerous in phase "${phase.id}" of dialog "${dialog.id}"`
			);
		}
	}
}

function validateDialog(dialog: RuntimeDialog) {
	validatePhaseIds(dialog);
	validateLinkIds(dialog);
	validateBeginOrInjection(dialog);

	// Proche du comportement MT :
	// les dialogues injecteurs sont ignorés pour les checks de graphe.
	if (dialog.inject.length > 0) {
		return;
	}

	validateFirstPhase(dialog);
	validatePhaseLinks(dialog);
	validateLinkTargets(dialog);
	validateLinkUsage(dialog);
	validatePnjOverrides(dialog);
	validateDangerousGivePatterns(dialog);
}

export function validateDialogs(dialogs: RuntimeDialog[]) {
	validateDialogIds(dialogs);

	for (const dialog of dialogs) {
		validateDialog(dialog);
	}
}
