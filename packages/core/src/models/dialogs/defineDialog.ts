import { DialogDefinition } from './dialog.js';

export function defineDialog<T extends DialogDefinition>(dialog: T): T {
	return dialog;
}
