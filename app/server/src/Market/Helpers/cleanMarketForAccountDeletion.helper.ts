import { MoneyType, Prisma } from '../../../../prisma/index.js';

export async function cleanMarketForAccountDeletionTx(tx: Prisma.TransactionClient, userId: string) {
	// 1. Gérer les offres dont l'utilisateur est le vendeur
	const userOffers = await tx.offer.findMany({
		where: {
			sellerId: userId,
			status: 'ONGOING'
		},
		include: {
			bids: true
		}
	});

	for (const offer of userOffers) {
		// Rembourser les enchérisseurs (s'ils existent)
		for (const bid of offer.bids) {
			if (bid.userId) {
				await tx.userWallet.updateMany({
					where: {
						userId: bid.userId,
						type: MoneyType.TREASURE_TICKET
					},
					data: {
						amount: { increment: bid.value }
					}
				});
			}
		}

		// Supprimer l'offre (ce qui supprimera aussi les bids associés via onDelete: Cascade)
		await tx.offer.delete({
			where: { id: offer.id }
		});
	}

	// 2. Gérer les enchères placées par l'utilisateur sur d'autres offres
	// Le simple fait de supprimer ses enchères rend la main à l'enchérisseur précédent.
	// Son argent investi est détruit (car son compte est supprimé/réinitialisé).
	await tx.offerBid.deleteMany({
		where: {
			userId: userId,
			offer: {
				status: 'ONGOING'
			}
		}
	});
}
