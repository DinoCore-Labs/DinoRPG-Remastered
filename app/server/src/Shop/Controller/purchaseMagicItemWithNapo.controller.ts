import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyBaseLogger } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';

type BuyMagicItemParams = {
	userId: string;
	itemReference: ItemFiche;
	quantityBought: number;
	log?: FastifyBaseLogger;
};

export async function purchaseMagicItemWithNapo({ userId, itemReference, quantityBought, log }: BuyMagicItemParams) {
	const napodinoItemId = itemList[Item.GOLDEN_NAPODINO].itemId;
	const totalCost = itemReference.price * quantityBought;
	const result = await prisma.$transaction(async tx => {
		/*
		 * Atomic payment.
		 *
		 * The update succeeds only if enough Golden Napodinos
		 * still exist when PostgreSQL performs the operation.
		 *
		 * Updating this row also serializes concurrent magical
		 * purchases for the same player.
		 */
		const payment = await tx.userItems.updateMany({
			where: {
				userId,
				itemId: napodinoItemId,
				quantity: {
					gte: totalCost
				}
			},
			data: {
				quantity: {
					decrement: totalCost
				}
			}
		});
		if (payment.count !== 1) {
			throw new ExpectedError('notEnoughItems');
		}
		/*
		 * Re-read the purchased item INSIDE the transaction.
		 *
		 * We must not trust the inventory snapshot loaded
		 * before the transaction.
		 */
		const currentItem = await tx.userItems.findUnique({
			where: {
				itemId_userId: {
					userId,
					itemId: itemReference.itemId
				}
			},
			select: {
				quantity: true
			}
		});
		const currentQuantity = currentItem?.quantity ?? 0;
		if (currentQuantity + quantityBought > itemReference.maxQuantity) {
			throw new ExpectedError('maxQuantityInventory');
		}
		const purchasedItem = await tx.userItems.upsert({
			where: {
				itemId_userId: {
					userId,
					itemId: itemReference.itemId
				}
			},
			create: {
				userId,
				itemId: itemReference.itemId,
				quantity: quantityBought
			},
			update: {
				quantity: {
					increment: quantityBought
				}
			}
		});
		/*
		 * Preserve the previous removeItem() behaviour:
		 * remove the Golden Napodino row when it reaches 0.
		 */
		const remainingNapodinos = await tx.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId,
					itemId: napodinoItemId
				}
			},
			select: {
				quantity: true
			}
		});
		if (remainingNapodinos.quantity === 0) {
			await tx.userItems.delete({
				where: {
					itemId_userId: {
						userId,
						itemId: napodinoItemId
					}
				}
			});
		}
		return {
			purchasedItem,
			totalCost
		};
	});
	/*
	 * Never generate the payment log before COMMIT.
	 *
	 * If inventory validation failed, PostgreSQL rolled back
	 * the Golden Napodino debit and this code is never reached.
	 */
	if (log) {
		void safeCreateGameLog(
			{
				type: GameLogType.ItemUsed,
				userId,
				values: [String(napodinoItemId), String(result.totalCost)],
				metadata: {
					itemId: napodinoItemId,
					quantity: result.totalCost,
					reason: 'MAGICAL_SHOP_PAYMENT',
					boughtItemId: itemReference.itemId,
					boughtQuantity: quantityBought,
					unitPrice: itemReference.price,
					totalCost: result.totalCost
				}
			},
			log
		);
	}
	return result;
}
