import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';

export async function meUser(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id; // OK → issu du JWT

		await prisma.$transaction(async tx => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { lastLogin: true }
			});

			const isFirstLoginToday = !user?.lastLogin || !dayjs().isSame(user.lastLogin, 'day');

			if (isFirstLoginToday) {
				await incrementUserStat(StatTracking.P_DAYS, userId, 1);

				await tx.user.update({
					where: { id: userId },
					data: { lastLogin: new Date() }
				});
			}
		});

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				role: true,
				wallets: {
					where: { type: 'GOLD' },
					select: { amount: true }
				}
			}
		});

		if (!user) {
			return reply.status(404).send({ message: 'User not found' });
		}

		return reply.send({
			id: user.id,
			name: user.name,
			role: user.role,
			gold: user.wallets[0]?.amount ?? 0
		});
	} catch (err) {
		return reply.status(401).send({ message: 'Invalid token' });
	}
}
