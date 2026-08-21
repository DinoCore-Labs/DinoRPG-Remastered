import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieBaseOptions } from '../../config/cookie.js';
import { cleanMarketForAccountDeletionTx } from '../../Market/Helpers/cleanMarketForAccountDeletion.helper.js';
import { prisma } from '../../prisma.js';

export async function deleteUser(req: FastifyRequest<{ Body: { password: string } }>, reply: FastifyReply) {
	const userId = req.user.id;
	const password = req.body?.password;

	if (!password) {
		throw new ExpectedError('invalidConfirmation');
	}

	await prisma.$transaction(async tx => {
		const user = await tx.user.findUnique({
			where: { id: userId },
			include: { ClanMember: true, leaderOf: true }
		});

		if (!user) {
			throw new ExpectedError('userNotFound');
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new ExpectedError('invalidConfirmation');
		}

		if (user.ClanMember || user.leaderOf) {
			throw new ExpectedError('userInClan');
		}

		// 1. Nettoyer le marché
		await cleanMarketForAccountDeletionTx(tx, userId);

		// 2. Nettoyage manuel des tables sans onDelete: Cascade
		await tx.userWallet.deleteMany({ where: { userId } });
		await tx.userProfile.deleteMany({ where: { userId } });
		await tx.ranking.deleteMany({ where: { userId } });
		await tx.devourerControl.deleteMany({ where: { userId } });
		await tx.clanJoinRequest.deleteMany({ where: { userId } });

		// 3. Anonymiser les traces du joueur (conversations, clan, marché)
		await tx.message.updateMany({
			where: { senderId: userId },
			data: { senderNameSnapshot: 'inconnu' }
		});
		await tx.participant.updateMany({
			where: { userId: userId },
			data: { userNameSnapshot: 'inconnu' }
		});
		await tx.clanMessage.updateMany({
			where: { authorId: userId },
			data: { authorName: 'inconnu' }
		});
		await tx.offer.updateMany({
			where: { sellerId: userId },
			data: { sellerName: 'inconnu' }
		});
		await tx.offerBid.updateMany({
			where: { userId: userId },
			data: { userName: 'inconnu' }
		});

		// 4. Supprimer le User (ce qui supprimera le reste en cascade ou mettra SetNull selon les relations)
		await tx.user.delete({
			where: { id: userId }
		});
	});

	// Déconnexion
	reply.clearCookie(ACCESS_TOKEN_COOKIE, authCookieBaseOptions);
	return reply.send({ ok: true });
}
