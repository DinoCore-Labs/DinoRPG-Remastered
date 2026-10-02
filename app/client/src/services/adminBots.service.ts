import { api } from '../utils/http';

export const BOT_STRATEGIES = ['BALANCED', 'FIGHTER', 'GATHERER', 'EXPLORER'] as const;
export type BotStrategyValue = (typeof BOT_STRATEGIES)[number];

export type AdminBotListItem = {
	id: string;
	enabled: boolean;
	strategy: BotStrategyValue;
	minDelaySeconds: number;
	maxDelaySeconds: number;
	lastActionAt: string | null;
	nextActionAt: string | null;
	createdAt: string;
	updatedAt: string;
	userId: string;
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
	strategy: BotStrategyValue;
	minDelaySeconds: number;
	maxDelaySeconds: number;
};

export type UpdateAdminBotInput = Partial<
	Pick<AdminBotListItem, 'enabled' | 'strategy' | 'minDelaySeconds' | 'maxDelaySeconds'>
>;

export type AdminBotActionLog = {
	id: number;
	botProfileId: string;
	dinozId: number | null;
	action: string;
	success: boolean;
	error: string | null;
	createdAt: string;
};

export const AdminBotsService = {
	list(): Promise<AdminBotListItem[]> {
		return api.get<AdminBotListItem[]>('/admin/bots');
	},
	create(input: CreateAdminBotInput) {
		return api.post('/admin/bots', input);
	},
	update(id: string, input: UpdateAdminBotInput): Promise<AdminBotListItem> {
		return api.patch<AdminBotListItem>(`/admin/bots/${encodeURIComponent(id)}`, input);
	},
	history(id: string): Promise<AdminBotActionLog[]> {
		return api.get<AdminBotActionLog[]>(`/admin/bots/${encodeURIComponent(id)}/history`);
	}
};
