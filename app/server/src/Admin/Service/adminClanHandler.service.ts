import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { CreateGameLogInput, safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import {
	adminClanParamsSchema,
	kickClanMemberSchema,
	searchClanQuerySchema,
	updateClanIngredientSchema,
	updateClanLeaderSchema,
	updateClanNameSchema,
	updateClanTreasureSchema
} from '../Schema/adminClan.schema.js';

async function logAdminClanAction(
	request: FastifyRequest,
	clanId: number,
	metadata?: CreateGameLogInput['metadata'],
	values: string[] = []
) {
	await safeCreateGameLog(
		{
			type: GameLogType.AdminUpdateClan,
			actorUserId: request.user.id,
			values: [clanId.toString(), ...values],
			...(metadata ? { metadata } : {})
		},
		request.log
	);
}

export async function searchAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const query = searchClanQuerySchema.safeParse(request.query);
	if (!query.success) return reply.status(400).send({ message: 'Invalid query' });

	const clans = await prisma.clan.findMany({
		where: {
			name: {
				contains: query.data.q,
				mode: 'insensitive'
			}
		},
		take: 10,
		select: {
			id: true,
			name: true
		}
	});

	return reply.send(clans);
}

export async function getAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid clan id' });

	const clan = await prisma.clan.findUnique({
		where: { id: params.data.id },
		include: {
			leader: { select: { id: true, name: true } },
			members: { include: { user: { select: { id: true, name: true } } } },
			ingredients: true
		}
	});

	if (!clan) return reply.status(404).send({ message: 'Clan not found' });
	return reply.send(clan);
}

export async function updateAdminClanNameHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanNameSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const updated = await prisma.clan.update({
		where: { id: params.data.id },
		data: { name: body.data.name }
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_NAME', newName: body.data.name });

	return reply.send(updated);
}

export async function updateAdminClanLeaderHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanLeaderSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { members: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const newLeaderIsMember = clan.members.some(m => m.userId === body.data.newLeaderId);
	if (!newLeaderIsMember) return reply.status(400).send({ message: 'New leader must be a member of the clan' });

	const updated = await prisma.$transaction(async tx => {
		// Remove rights from the old leader
		await tx.clanMember.update({
			where: { userId: clan.leaderId },
			data: { rights: [] }
		});

		// Update the clan's leaderId
		await tx.clan.update({
			where: { id: params.data.id },
			data: { leaderId: body.data.newLeaderId }
		});

		// Give all rights to the new leader
		await tx.clanMember.update({
			where: { userId: body.data.newLeaderId },
			data: { rights: Object.values(ClanMemberRight) }
		});

		return await tx.clan.findUnique({
			where: { id: params.data.id },
			include: { leader: { select: { id: true, name: true } } }
		});
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_LEADER', newLeaderId: body.data.newLeaderId });

	return reply.send(updated);
}

export async function kickAdminClanMemberHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = kickClanMemberSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { members: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const isLeader = clan.leaderId === params.data.userId;
	if (clan.members.length === 1) {
		// Only member left, delete clan completely
		const clanId = params.data.id;
		await prisma.$transaction([
			prisma.user.updateMany({ where: { clanId }, data: { clanId: null } }),
			prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
			prisma.clanMember.deleteMany({ where: { clanId } }),
			prisma.clanPage.deleteMany({ where: { clanId } }),
			prisma.clanIngredient.deleteMany({ where: { clanId } }),
			prisma.clanHistory.deleteMany({ where: { clanId } }),
			prisma.clanMessage.deleteMany({ where: { clanId } }),
			prisma.clan.delete({ where: { id: clanId } })
		]);
		await logAdminClanAction(request, clanId, { action: 'DELETE_CLAN' });
		return reply.send({ message: 'Clan deleted as it was empty', deleted: true });
	}

	if (isLeader) {
		return reply
			.status(400)
			.send({ message: 'Cannot kick the leader unless they are the last member. Change leader first.' });
	}

	await prisma.clanMember.delete({ where: { userId: params.data.userId } });
	await prisma.user.update({ where: { id: params.data.userId }, data: { clanId: null } });

	await logAdminClanAction(request, params.data.id, { action: 'KICK_MEMBER', kickedUserId: params.data.userId });

	return reply.send({ message: 'Member kicked successfully', deleted: false });
}

export async function deleteAdminClanHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	if (!params.success) return reply.status(400).send({ message: 'Invalid clan id' });

	const clanId = params.data.id;
	await prisma.$transaction([
		prisma.user.updateMany({ where: { clanId }, data: { clanId: null } }),
		prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
		prisma.clanMember.deleteMany({ where: { clanId } }),
		prisma.clanPage.deleteMany({ where: { clanId } }),
		prisma.clanIngredient.deleteMany({ where: { clanId } }),
		prisma.clanHistory.deleteMany({ where: { clanId } }),
		prisma.clanMessage.deleteMany({ where: { clanId } }),
		prisma.clan.delete({ where: { id: clanId } })
	]);

	await logAdminClanAction(request, clanId, { action: 'DELETE_CLAN' });

	return reply.send({ message: 'Clan deleted' });
}

export async function updateAdminClanTreasureHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanTreasureSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const updated = await prisma.clan.update({
		where: { id: params.data.id },
		data: { treasureValue: body.data.amount }
	});

	await logAdminClanAction(request, params.data.id, { action: 'UPDATE_TREASURE', amount: body.data.amount });

	return reply.send(updated);
}

export async function updateAdminClanIngredientHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminClanParamsSchema.safeParse(request.params);
	const body = updateClanIngredientSchema.safeParse(request.body);
	if (!params.success || !body.success) return reply.status(400).send({ message: 'Invalid payload' });

	const clan = await prisma.clan.findUnique({ where: { id: params.data.id }, include: { ingredients: true } });
	if (!clan) return reply.status(404).send({ message: 'Clan not found' });

	const { ingredientId, amountToAddOrRemove } = body.data;

	// @ts-ignore
	const ingredientData = ingredientList[ingredientId];
	if (!ingredientData) return reply.status(400).send({ message: 'Ingredient not found' });

	const price = ingredientData.price || 0;
	const goldDiff = price * amountToAddOrRemove;

	const existing = clan.ingredients.find(i => i.ingredientId === ingredientId);

	await prisma.$transaction(async tx => {
		if (existing) {
			const newQty = existing.quantity + amountToAddOrRemove;
			if (newQty <= 0) {
				await tx.clanIngredient.delete({ where: { ingredientId_clanId: { ingredientId, clanId: params.data.id } } });
			} else {
				await tx.clanIngredient.update({
					where: { ingredientId_clanId: { ingredientId, clanId: params.data.id } },
					data: { quantity: newQty }
				});
			}
		} else {
			if (amountToAddOrRemove > 0) {
				await tx.clanIngredient.create({
					data: {
						clanId: params.data.id,
						ingredientId,
						quantity: amountToAddOrRemove
					}
				});
			} else {
				// Can't remove if not exists
				return;
			}
		}

		// Update treasure
		const newTreasure = Math.max(0, clan.treasureValue + goldDiff);
		await tx.clan.update({
			where: { id: params.data.id },
			data: { treasureValue: newTreasure }
		});
	});

	await logAdminClanAction(request, params.data.id, {
		action: 'UPDATE_INGREDIENT',
		ingredientId,
		amountToAddOrRemove
	});

	return reply.send({ message: 'Ingredient updated' });
}
