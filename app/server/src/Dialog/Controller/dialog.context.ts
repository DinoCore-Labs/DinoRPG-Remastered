import { RuntimeDialog } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/client.js';

type DialogTransaction = Prisma.TransactionClient;

export type DialogScenarioState = {
	progression: number;
	tracking: number;
};

export type DialogContext = {
	user: {
		id: string;
		lang: string;
		gold: number;
		scenarios: Map<string, DialogScenarioState>;
		items: Map<number, number>;
		ingredients: Map<number, number>;
		effects: Set<string>;
		tags: Set<string>;
		collections: Set<string>;
		userVars: Map<string, number>;
	};
	dinoz: {
		id: number;
		userId: string;
		placeId: number;
		level: number;
		life: number;
		maxLife: number;
		statusIds: Set<number>;
		skillIds: Set<number>;
		itemIds: Set<number>;
	};
	dialog: {
		id: string;
		place: RuntimeDialog['place'];
	};
};

type BuildDialogContextParams = {
	userId: string;
	dinozId: number;
	dialog: Pick<RuntimeDialog, 'id' | 'place'>;
};

function buildQuantityMap<T>(
	entries: T[],
	getId: (entry: T) => number,
	getQuantity: (entry: T) => number
): Map<number, number> {
	const map = new Map<number, number>();

	for (const entry of entries) {
		map.set(getId(entry), getQuantity(entry));
	}

	return map;
}

function buildNumberSet<T>(entries: T[], getValue: (entry: T) => number): Set<number> {
	const set = new Set<number>();

	for (const entry of entries) {
		set.add(getValue(entry));
	}

	return set;
}

function buildEmptyScenarioMap(): Map<string, DialogScenarioState> {
	return new Map<string, DialogScenarioState>();
}

function buildEmptyStringSet(): Set<string> {
	return new Set<string>();
}

function buildEmptyNumberMap(): Map<string, number> {
	return new Map<string, number>();
}

export function getScenarioProgress(context: DialogContext, scenarioKey: string): number {
	return context.user.scenarios.get(scenarioKey)?.progression ?? 0;
}

export function getScenarioTracking(context: DialogContext, scenarioKey: string): number {
	return context.user.scenarios.get(scenarioKey)?.tracking ?? 0;
}

export function getUserItemQuantity(context: DialogContext, itemId: number): number {
	return context.user.items.get(itemId) ?? 0;
}

export function getUserIngredientQuantity(context: DialogContext, ingredientId: number): number {
	return context.user.ingredients.get(ingredientId) ?? 0;
}

export function hasDinozStatus(context: DialogContext, statusId: number): boolean {
	return context.dinoz.statusIds.has(statusId);
}

export function hasDinozSkill(context: DialogContext, skillId: number): boolean {
	return context.dinoz.skillIds.has(skillId);
}

export async function buildDialogContext(
	tx: DialogTransaction,
	params: BuildDialogContextParams
): Promise<DialogContext> {
	const [user, userItems, userIngredients, dinoz] = await Promise.all([
		tx.user.findUnique({
			where: { id: params.userId },
			select: {
				id: true,
				profile: {
					select: {
						language: true
					}
				},
				wallets: {
					where: {
						type: 'GOLD'
					},
					select: {
						amount: true
					},
					take: 1
				}
			}
		}),

		tx.userItems.findMany({
			where: { userId: params.userId },
			select: {
				itemId: true,
				quantity: true
			}
		}),

		tx.userIngredients.findMany({
			where: { userId: params.userId },
			select: {
				ingredientId: true,
				quantity: true
			}
		}),

		tx.dinoz.findUnique({
			where: { id: params.dinozId },
			select: {
				id: true,
				userId: true,
				placeId: true,
				level: true,
				life: true,
				maxLife: true,
				status: {
					select: {
						statusId: true
					}
				},
				skills: {
					select: {
						skillId: true
					}
				},
				items: {
					select: {
						itemId: true
					}
				}
			}
		})
	]);

	if (!user) {
		throw new ExpectedError(`User "${params.userId}" not found`);
	}

	if (!dinoz) {
		throw new ExpectedError(`Dinoz "${params.dinozId}" not found`);
	}

	if (dinoz.userId !== params.userId) {
		throw new ExpectedError(`Dinoz "${params.dinozId}" does not belong to user "${params.userId}"`);
	}

	return {
		user: {
			id: user.id,
			lang: user.profile?.language ?? 'fr',
			gold: user.wallets[0]?.amount ?? 0,
			scenarios: buildEmptyScenarioMap(),
			items: buildQuantityMap(
				userItems,
				entry => entry.itemId,
				entry => entry.quantity
			),
			ingredients: buildQuantityMap(
				userIngredients,
				entry => entry.ingredientId,
				entry => entry.quantity
			),
			effects: buildEmptyStringSet(),
			tags: buildEmptyStringSet(),
			collections: buildEmptyStringSet(),
			userVars: buildEmptyNumberMap()
		},

		dinoz: {
			id: dinoz.id,
			userId: dinoz.userId,
			placeId: dinoz.placeId,
			level: dinoz.level,
			life: dinoz.life,
			maxLife: dinoz.maxLife,
			statusIds: buildNumberSet(dinoz.status, entry => entry.statusId),
			skillIds: buildNumberSet(dinoz.skills, entry => entry.skillId),
			itemIds: buildNumberSet(dinoz.items, entry => entry.itemId)
		},

		dialog: {
			id: params.dialog.id,
			place: params.dialog.place
		}
	};
}
