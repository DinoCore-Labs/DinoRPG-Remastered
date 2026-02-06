import type { DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';
import mitt from 'mitt';

type ToastEventPayload = {
	message: string;
	type: 'error' | 'success' | 'notif' | 'reward';
	params: Record<string, unknown>;
	value?: string;
	effect?: string;
};

type Events = {
	authMenu: {
		show: boolean;
		mode: string;
	};
	userMenu: boolean;
	leftUserMenu: boolean;
	toast: ToastEventPayload;
	refreshDinoz: boolean;
	refreshDinozStats: boolean;
	refreshInventory: boolean;
	equipItem: Array<DinozItems>;
	unEquipItem: number;
};

const eventBus = mitt<Events>();

export default eventBus;
