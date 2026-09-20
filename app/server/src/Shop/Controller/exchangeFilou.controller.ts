import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

interface ExchangeFilouParams {
	userId: string;
	ingredientId: number;
	ingredientQuantity: number;
	ticketQuantity: number;
}

export async function exchangeFilouIngredients({
	userId,
	ingredientId,
	ingredientQuantity,
	ticketQuantity
}: ExchangeFilouParams) {
	return prisma.$transaction(async tx => {
		/*
		 * Atomic debit:
		 *
		 * We only decrement when the player still owns enough
		 * ingredients at the exact moment PostgreSQL performs
		 * the UPDATE.
		 *
		 * This also protects against concurrent requests.
		 */
		const ingredientUpdate = await tx.userIngredients.updateMany({
			where: {
				userId,
				ingredientId,
				quantity: {
					gte: ingredientQuantity
				}
			},
			data: {
				quantity: {
					decrement: ingredientQuantity
				}
			}
		});
		if (ingredientUpdate.count !== 1) {
			throw new ExpectedError('notEnoughIngredients');
		}
		/*
		 * Same transaction:
		 * if this operation fails, PostgreSQL rolls back
		 * the ingredient decrement above.
		 */
		const ticketWallet = await tx.userWallet.upsert({
			where: {
				userId_type: {
					userId,
					type: MoneyType.TREASURE_TICKET
				}
			},
			update: {
				amount: {
					increment: ticketQuantity
				}
			},
			create: {
				userId,
				type: MoneyType.TREASURE_TICKET,
				amount: ticketQuantity
			}
		});
		return {
			ingredientQuantityUsed: ingredientQuantity,
			ticketQuantity,
			ticketBefore: ticketWallet.amount - ticketQuantity,
			ticketAfter: ticketWallet.amount
		};
	});
}
