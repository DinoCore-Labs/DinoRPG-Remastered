import mitt from 'mitt';

type ToastEventPayload = {
	message: string;
	type: 'error' | 'success' | 'notif' | 'reward';
	params?: Record<string, unknown>;
	value?: string;
	effect?: string;
};

type Events = {
	authMenu: {
		show: boolean;
		mode: string;
	};
	userMenu: boolean;
	toast: ToastEventPayload;
};

const eventBus = mitt<Events>();

export default eventBus;
