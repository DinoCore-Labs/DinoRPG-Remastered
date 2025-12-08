import type { App } from 'vue';
import type { ToastPluginApi, ToastProps } from 'vue-toast-notification';
import ToastPlugin from 'vue-toast-notification';

interface ToastInstance {
	dismiss: () => void;
}

const MAX_TOASTS = 4;
const activeToasts: ToastInstance[] = [];

export const createToastPlugin = (options: ToastProps) => {
	return {
		install(app: App) {
			// Install the original toast plugin
			app.use(ToastPlugin, options);

			// Get the original toast instance
			const originalToast = app.config.globalProperties.$toast;

			// Create a wrapper that tracks toasts
			const wrappedToast: ToastPluginApi = {
				open: params => {
					// If we have 4 toasts, dismiss the oldest one
					if (activeToasts.length >= MAX_TOASTS) {
						const oldestToast = activeToasts.shift();
						oldestToast?.dismiss();
					}

					// Open the new toast
					const toastInstance = originalToast.open(params);
					activeToasts.push(toastInstance);

					// Remove from tracking when dismissed
					const originalDismiss = toastInstance.dismiss;
					toastInstance.dismiss = () => {
						const index = activeToasts.indexOf(toastInstance);
						if (index > -1) {
							activeToasts.splice(index, 1);
						}
						originalDismiss.call(toastInstance);
					};

					return toastInstance;
				},
				success: (message, options) => {
					return wrappedToast.open({ message, type: 'success', ...options });
				},
				error: (message, options) => {
					return wrappedToast.open({ message, type: 'error', ...options });
				},
				info: (message, options) => {
					return wrappedToast.open({ message, type: 'info', ...options });
				},
				warning: (message, options) => {
					return wrappedToast.open({ message, type: 'warning', ...options });
				},
				default: (message, options) => {
					return wrappedToast.open({ message, type: 'default', ...options });
				},
				clear: () => {
					activeToasts.length = 0;
					originalToast.clear();
				}
			};

			// Replace the original $toast with our wrapper using defineProperty
			Object.defineProperty(app.config.globalProperties, '$toast', {
				get: () => wrappedToast,
				configurable: true
			});
		}
	};
};
