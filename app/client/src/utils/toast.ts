import type { App } from 'vue';
import type { ToastPluginApi, ToastProps } from 'vue-toast-notification';
import ToastPlugin from 'vue-toast-notification';

interface ToastInstance {
	dismiss: () => void;
}

// Le type attendu par l'overload "options"
type ToastPropsWithMessage = ToastProps & { message: string };

// options pour success/error/etc (sans message/type)
type ToastOptions = Omit<ToastProps, 'message' | 'type'>;

const MAX_TOASTS = 4;
const activeToasts: ToastInstance[] = [];

export const createToastPlugin = (options: ToastProps) => {
	return {
		install(app: App) {
			app.use(ToastPlugin, options);

			const originalToast = app.config.globalProperties.$toast as ToastPluginApi;

			const open = (params: string | ToastPropsWithMessage) => {
				if (activeToasts.length >= MAX_TOASTS) {
					activeToasts.shift()?.dismiss();
				}

				// ✅ Narrowing pour satisfaire les overloads TS
				const toastInstance =
					typeof params === 'string'
						? (originalToast.open(params) as ToastInstance)
						: (originalToast.open(params) as ToastInstance);

				activeToasts.push(toastInstance);

				const originalDismiss = toastInstance.dismiss;
				toastInstance.dismiss = () => {
					const i = activeToasts.indexOf(toastInstance);
					if (i !== -1) activeToasts.splice(i, 1);
					originalDismiss.call(toastInstance);
				};

				return toastInstance;
			};

			const wrappedToast: ToastPluginApi = {
				open: open as ToastPluginApi['open'],

				success: (message, opts?: ToastOptions) => open({ message, type: 'success', ...(opts ?? {}) }),

				error: (message, opts?: ToastOptions) => open({ message, type: 'error', ...(opts ?? {}) }),

				info: (message, opts?: ToastOptions) => open({ message, type: 'info', ...(opts ?? {}) }),

				warning: (message, opts?: ToastOptions) => open({ message, type: 'warning', ...(opts ?? {}) }),

				default: (message, opts?: ToastOptions) => open({ message, type: 'default', ...(opts ?? {}) }),

				clear: () => {
					activeToasts.length = 0;
					originalToast.clear();
				}
			};

			Object.defineProperty(app.config.globalProperties, '$toast', {
				get: () => wrappedToast,
				configurable: true
			});
		}
	};
};
