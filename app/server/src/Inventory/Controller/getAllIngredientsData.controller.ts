import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserIngredientDataRequest } from '../Service/getUserIngredient.service.js';

export async function getAllIngredientsData(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	if (!userId) {
		return reply.status(400).send({ error: 'User ID is required' });
	}

	try {
		const userIngredientData = await getUserIngredientDataRequest(userId);

		if (!userIngredientData) {
			return reply.status(404).send({ error: 'No ingredient data found for user' });
		}

		const ingredientsById = new Map(
			Object.values(ingredientList).map(ingredient => [ingredient.ingredientId, ingredient])
		);

		const dto = userIngredientData.ingredients.map(i => {
			const ingredient = ingredientsById.get(i.ingredientId);

			if (!ingredient) {
				throw new ExpectedError(`Ingredient ${i.ingredientId} does not exist`);
			}

			return {
				id: ingredient.ingredientId,
				quantity: i.quantity,
				maxQuantity: ingredient.maxQuantity
			};
		});

		return reply.status(200).send(dto);
	} catch (error) {
		return reply.status(500).send({ error: 'Failed to retrieve ingredients data' });
	}
}
