import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { ACCESS_TOKEN_COOKIE, authCookieBaseOptions } from '../../config/cookie.js';
import gameConfig from '../../config/game.config.js';
import { cleanMarketForAccountDeletionTx } from '../../Market/Helpers/cleanMarketForAccountDeletion.helper.js';
import { prisma } from '../../prisma.js';

export async function resetUser(req: FastifyRequest<{ Body: { password: string } }>, reply: FastifyReply) {
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

		// 2. Supprimer manuellement l'inventaire complet, les dinoz, la boutique, etc.
		// Attention : L'ordre est important si certaines contraintes existent.
		await tx.dinoz.deleteMany({ where: { userId } });
		await tx.userItems.deleteMany({ where: { userId } });
		await tx.userIngredients.deleteMany({ where: { userId } });
		await tx.userGather.deleteMany({ where: { userId } });
		await tx.userRewards.deleteMany({ where: { userId } });
		await tx.userScenario.deleteMany({ where: { userId } });
		await tx.userTracking.deleteMany({ where: { userId } });
		await tx.userDinozShop.deleteMany({ where: { userId } });
		await tx.clanJoinRequest.deleteMany({ where: { userId } });
		await tx.devourerControl.deleteMany({ where: { userId } });
		await tx.bankSaving.deleteMany({ where: { userId } });

		// 3. Réinitialiser les compteurs et compétences uniques du User
		await tx.user.update({
			where: { id: userId },
			data: {
				devourerAttacksLeft: 3,
				leader: false,
				engineer: false,
				cooker: false,
				shopKeeper: false,
				merchant: false,
				priest: false,
				teacher: false,
				matelasseur: false,
				messie: false,
				discoveredSkills: [],
				keepSeedReincarnationCount: 0
			}
		});
		await tx.ranking.update({
			where: { userId },
			data: {
				dinozCount: 0,
				points: 0,
				average: 0,
				completion: 0,
				dojo: 0
			}
		});

		// 4. Réinitialiser les portefeuilles (seulement de l'or pour le reset)
		await tx.userWallet.deleteMany({ where: { userId } });
		await tx.userWallet.createMany({
			data: [
				{
					userId,
					type: 'GOLD',
					amount: 100000
				},
				{
					userId,
					type: 'TREASURE_TICKET',
					amount: 0
				}
			]
		});
	});

	// Déconnexion
	reply.clearCookie(ACCESS_TOKEN_COOKIE, authCookieBaseOptions);
	return reply.send({ ok: true });
}
