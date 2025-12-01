import axios from 'axios';
import type { ToastPluginApi } from 'vue-toast-notification';

//import eventBus from '../events/index.js';

export const errorHandler = {
	handle(err: unknown, ToastFunction: ToastPluginApi): void {
		if (axios.isAxiosError(err) && err.response) {
			ToastFunction.open({
				message: err.response.data,
				type: 'error'
			});

			//eventBus.emit('isLoading', false);
		}
	}
};
