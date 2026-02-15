import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';

import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
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
				await addItemToInventory(userId, Item.DAILY_TICKET, 1);

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
				dinoz: {
					select: {
						id: true,
						//leaderId: true,
						display: true,
						name: true,
						life: true,
						maxLife: true,
						experience: true,
						placeId: true,
						level: true,
						//order: true,
						raceId: true,
						//unavailableReason: true,
						//missions: true,
						nbrUpFire: true,
						nbrUpWood: true,
						nbrUpWater: true,
						nbrUpLightning: true,
						nbrUpAir: true,
						remaining: true,
						//fight: true,
						//gather: true,
						//items: { select: { itemId: true } },
						status: { select: { statusId: true } },
						skills: { select: { skillId: true, state: true } }
						//followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
						//TournamentTeam: { select: { tournamentId: true } },
						//concentration: true,
						//build: true
					}
				},
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
			gold: user.wallets[0]?.amount ?? 0,
			dinoz: user.dinoz
		});
	} catch (err) {
		return reply.status(401).send({ message: 'Invalid token' });
	}
}
