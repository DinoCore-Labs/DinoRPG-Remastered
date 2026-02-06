import { type App, createVNode, reactive, render } from 'vue';

import DZConfirmDialog from '../components/utils/DZConfirmDialog.vue';

export interface ConfirmOptions {
	message: string;
	header?: string;
	icon?: string;
	acceptLabel?: string;
	rejectLabel?: string;
}

interface ConfirmationState extends ConfirmOptions {
	visible: boolean;
	acceptCallback: (() => void) | null;
	rejectCallback: (() => void) | null;
}

const confirmationState: ConfirmationState = reactive({
	visible: false,
	message: '',
	header: '',
	icon: 'pi pi-exclamation-triangle',
	acceptLabel: 'Oui',
	rejectLabel: 'Non',
	acceptCallback: null,
	rejectCallback: null
});

export const confirm = (options: ConfirmOptions): Promise<boolean> => {
	return new Promise((resolve: (value: boolean) => void, reject: (reason: boolean) => void) => {
		confirmationState.message = options.message;
		confirmationState.header = options.header ?? 'Confirmation';
		confirmationState.icon = options.icon ?? 'pi pi-exclamation-triangle';
		confirmationState.acceptLabel = options.acceptLabel ?? 'Oui';
		confirmationState.rejectLabel = options.rejectLabel ?? 'Non';

		confirmationState.acceptCallback = () => {
			closeDialog();
			resolve(true);
		};
		confirmationState.rejectCallback = () => {
			closeDialog();
			reject(false);
		};

		confirmationState.visible = true;
	});
};

const closeDialog = (): void => {
	confirmationState.visible = false;
	confirmationState.acceptCallback = null;
	confirmationState.rejectCallback = null;
};

const ConfirmPlugin = {
	install(app: App) {
		const container: HTMLDivElement = document.createElement('div');
		document.body.appendChild(container);

		const wrapper = {
			render() {
				return createVNode(DZConfirmDialog, {
					visible: confirmationState.visible,
					message: confirmationState.message,
					header: confirmationState.header,
					icon: confirmationState.icon,
					acceptLabel: confirmationState.acceptLabel,
					rejectLabel: confirmationState.rejectLabel,
					onConfirm: confirmationState.acceptCallback,
					onReject: confirmationState.rejectCallback,
					'onUpdate:visible': closeDialog
				});
			}
		};

		render(createVNode(wrapper), container);

		app.config.globalProperties.$globalConfirm = confirm;

		app.provide('confirm', confirm);
	}
};

export default ConfirmPlugin;
