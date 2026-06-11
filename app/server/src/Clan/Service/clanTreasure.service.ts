import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { isMember } from '../Controller/isMember.controller.js';
import { clanIdParamSchema, giveIngredientBodySchema } from '../Schema/clan.schema.js';

export async function getClanTreasure(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);

	const ingredients = await prisma.clanIngredient.findMany({
		where: { clanId },
		select: {
			ingredientId: true,
			quantity: true
		}
	});

	return reply.send(ingredients);
}

export async function giveIngredient(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const { clanId } = clanIdParamSchema.parse(req.params);
	const { ingredients } = giveIngredientBodySchema.parse(req.body);

	if (!(await isMember(userId, clanId))) {
		throw new ExpectedError('notClanMember');
	}

	let totalDonationValue = 0;
	const validatedIngredients = ingredients.map(({ itemId, quantity }) => {
		const ingredientFiche = ingredientList[itemId as keyof typeof ingredientList];
		if (!ingredientFiche) throw new ExpectedError('ingredientNotFound');
		totalDonationValue += ingredientFiche.price * quantity;
		return { ingredientId: itemId, quantity, price: ingredientFiche.price };
	});

	const userIngredients = await prisma.userIngredients.findMany({
		where: {
			userId,
			ingredientId: { in: validatedIngredients.map(i => i.ingredientId) }
		},
		select: { ingredientId: true, quantity: true }
	});

	const stockMap = new Map(userIngredients.map(i => [i.ingredientId, i.quantity]));
	for (const { ingredientId, quantity } of validatedIngredients) {
		const stock = stockMap.get(ingredientId) ?? 0;
		if (stock < quantity) throw new ExpectedError('insufficientIngredients');
	}

	await prisma.$transaction(async tx => {
		await Promise.all(
			validatedIngredients.map(({ ingredientId, quantity }) =>
				tx.userIngredients.update({
					where: { ingredientId_userId: { ingredientId, userId } },
					data: { quantity: { decrement: quantity } }
				})
			)
		);

		await Promise.all(
			validatedIngredients.map(({ ingredientId, quantity }) =>
				tx.clanIngredient.upsert({
					where: { ingredientId_clanId: { ingredientId, clanId } },
					create: { clanId, ingredientId, quantity },
					update: { quantity: { increment: quantity } }
				})
			)
		);

		await tx.clan.update({
			where: { id: clanId },
			data: { treasureValue: { increment: totalDonationValue } }
		});

		await tx.clanMember.update({
			where: { userId },
			data: { donation: { increment: totalDonationValue } }
		});
	});

	return reply.send({ success: true, donationValue: totalDonationValue });
}
