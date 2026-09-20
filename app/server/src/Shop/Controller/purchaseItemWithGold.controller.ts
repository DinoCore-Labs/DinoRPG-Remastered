import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { GameLogType, MoneyType } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { removeMoneyTx } from '../../User/Controller/money.controller.js';

type PurchaseItemWithGoldParams = {
	userId: string;
	itemId: number;
	quantity: number;
	unitPrice: number;
	maxQuantity: number;
};

export async function purchaseItemWithGold({
	userId,
	itemId,
	quantity,
	unitPrice,
	maxQuantity
}: PurchaseItemWithGoldParams) {
	const totalPrice = unitPrice * quantity;
	const result = await prisma.$transaction(async tx => {
		/*
		 * Gold is debited first.
		 *
		 * This locks the player's GOLD wallet row and therefore
		 * serializes concurrent Gold purchases for this user.
		 */
		const wallet = await removeMoneyTx(tx, userId, totalPrice);
		/*
		 * Re-read the inventory INSIDE the transaction.
		 *
		 * Do not rely on playerShopData here because another
		 * request may have modified the inventory meanwhile.
		 */
		const existingItem = await tx.userItems.findUnique({
			where: {
				itemId_userId: {
					userId,
					itemId
				}
			},
			select: {
				quantity: true
			}
		});
		const currentQuantity = existingItem?.quantity ?? 0;
		if (currentQuantity + quantity > maxQuantity) {
			throw new ExpectedError('maxQuantityInventory');
		}
		const inventoryItem = await tx.userItems.upsert({
			where: {
				itemId_userId: {
					userId,
					itemId
				}
			},
			create: {
				userId,
				itemId,
				quantity
			},
			update: {
				quantity: {
					increment: quantity
				}
			}
		});
		return {
			wallet,
			inventoryItem,
			totalPrice
		};
	});
	/*
	 * Logging stays OUTSIDE the database transaction.
	 *
	 * A failed transaction must never generate GoldLost.
	 */
	safeCreateGameLog({
		type: GameLogType.GoldLost,
		userId,
		values: [String(result.totalPrice)],
		metadata: {
			amount: result.totalPrice,
			wallet: MoneyType.GOLD,
			previousAmount: result.wallet.amount + result.totalPrice,
			newAmount: result.wallet.amount
		}
	});
	return result;
}
