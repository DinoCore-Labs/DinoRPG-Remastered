import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';

import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { calculatePlayerCompletion } from '../../utils/user/calculatePlayerCompletion.js';

export async function meUser(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		if (!userId) return reply.code(401).send({ message: 'Authentication required' });

		await prisma.$transaction(async tx => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: {
					lastLogin: true,
					matelasseur: true,
					dinoz: {
						select: {
							id: true,
							life: true,
							maxLife: true,
							remaining: true,
							items: { select: { itemId: true } },
							skills: { select: { skillId: true, state: true } },
							followers: { select: { id: true } }
						}
					}
				}
			});

			const isFirstLoginToday = !user?.lastLogin || !dayjs().isSame(user.lastLogin, 'day');

			if (isFirstLoginToday) {
				// Update completion
				const completion = await calculatePlayerCompletion(userId);

				await tx.ranking.upsert({
					where: { userId },
					update: { completion },
					create: { userId, completion }
				});
				// Update stat
				await incrementUserStat(StatTracking.P_DAYS, userId, 1);
				// Give 1 daily ticket
				await addItemToInventory(userId, Item.DAILY_TICKET, 1);

				// Tik bracelet regen (& alive)
				const dinozWithTikBracelet =
					user?.dinoz.filter(d => d.life > 0 && d.items.some(i => i.itemId === Item.TIK_BRACELET)) ?? [];

				for (const d of dinozWithTikBracelet) {
					const newHp = Math.min(d.life + 10, d.maxLife);
					await tx.dinoz.update({
						where: { id: d.id },
						data: { life: newHp }
					});
				}

				/*const event = currentEvents()[0];
				if (event && event.name === GameEvent.CHRISTMAS) {
					await increaseItemQuantity(userId, Item.CHRISTMAS_TICKET, 1);
				}*/

				// Give 3 action for active dinoz
				const leadersWithVeilleuse = (user?.dinoz ?? []).filter(d =>
					d.skills.some(s => s.skillId === Skill.VEILLEUSE && s.state === true)
				);

				// Reset remaining for each dinoz
				for (const d of user?.dinoz ?? []) {
					let remaining = 3;

					if (user?.matelasseur) remaining++;

					if (d.skills.some(s => s.skillId === Skill.GROS_DORMEUR && s.state === true)) {
						remaining++;
					}

					// if this dinoz is a follower of a leader with veilleuse
					const hasLeaderVeilleuse = leadersWithVeilleuse.some(leader => leader.followers.some(f => f.id === d.id));
					if (hasLeaderVeilleuse) remaining++;

					await tx.dinoz.update({
						where: { id: d.id },
						data: { remaining }
					});
				}

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
						leaderId: true,
						display: true,
						name: true,
						life: true,
						maxLife: true,
						experience: true,
						placeId: true,
						level: true,
						order: true,
						raceId: true,
						//unavailableReason: true,
						//missions: true,
						nbrUpFire: true,
						nbrUpWood: true,
						nbrUpWater: true,
						nbrUpLightning: true,
						nbrUpAir: true,
						remaining: true,
						fight: true,
						gather: true,
						items: { select: { itemId: true } },
						status: { select: { statusId: true } },
						skills: { select: { skillId: true, state: true } },
						followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } }
						//TournamentTeam: { select: { tournamentId: true } },
						//concentration: true,
						//build: true
					}
				},
				wallets: {
					where: { type: { in: ['GOLD', 'TREASURE_TICKET'] } },
					select: { type: true, amount: true }
				}
			}
		});

		if (!user) {
			return reply.status(404).send({ message: 'User not found' });
		}

		const gold = user.wallets.find(w => w.type === 'GOLD')?.amount ?? 0;
		const treasureTicket = user.wallets.find(w => w.type === 'TREASURE_TICKET')?.amount ?? 0;

		return reply.send({
			id: user.id,
			name: user.name,
			role: user.role,
			gold,
			treasureTicket,
			dinoz: user.dinoz
		});
	} catch (err) {
		req.log.error(err);
		return reply.code(500).send({ message: 'Internal Server Error' });
	}
}
