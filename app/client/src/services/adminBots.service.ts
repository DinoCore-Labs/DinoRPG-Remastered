import type { BotProfile, BotStrategy } from '../../../prisma/index.js';

import { api } from '../utils/http';

export type AdminBotListItem = BotProfile & {
	user: {
		id: string;
		name: string;
		createdDate: string;
		lastLogin: string | null;
		_count: {
			dinoz: number;
		};
	};
};

export type CreateAdminBotInput = {
	name: string;
	strategy: BotStrategy;
	minDelaySeconds: number;
	maxDelaySeconds: number;
};

export type UpdateAdminBotInput = Partial<
	Pick<BotProfile, 'enabled' | 'strategy' | 'minDelaySeconds' | 'maxDelaySeconds'>
>;

export const AdminBotsService = {
	list(): Promise<AdminBotListItem[]> {
		return api.get<AdminBotListItem[]>('/admin/bots');
	},
	create(input: CreateAdminBotInput) {
		return api.post('/admin/bots', input);
	},
	update(id: string, input: UpdateAdminBotInput): Promise<AdminBotListItem> {
		return api.patch<AdminBotListItem>(`/admin/bots/${encodeURIComponent(id)}`, input);
	}
};
