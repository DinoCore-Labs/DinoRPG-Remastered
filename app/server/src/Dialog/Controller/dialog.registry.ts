import { dialogDefinitions } from '@dinorpg/core/models/dialogs/data/index.js';
import { RuntimeDialog } from '@dinorpg/core/models/dialogs/dialogRuntime.js';

import { applyDialogInjections } from './dialog.injection.js';
import { normalizeDialogs } from './dialog.normalize.js';
import { validateDialogs } from './dialog.validation.js';

const dialogRegistry = new Map<string, RuntimeDialog>();

export function loadDialogs() {
	dialogRegistry.clear();

	const dialogs = normalizeDialogs(dialogDefinitions);

	applyDialogInjections(dialogs);
	validateDialogs(dialogs);

	for (const dialog of dialogs) {
		if (dialogRegistry.has(dialog.id)) {
			throw new Error(`Duplicate dialog id "${dialog.id}"`);
		}

		dialogRegistry.set(dialog.id, dialog);
	}
}

export function getDialogById(dialogId: string): RuntimeDialog {
	const dialog = dialogRegistry.get(dialogId);

	if (!dialog) {
		throw new Error(`Unknown dialog "${dialogId}"`);
	}

	return dialog;
}

export function getDialogs(): RuntimeDialog[] {
	return [...dialogRegistry.values()];
}
