import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

import gameConfig from '../../config/game.config.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { prisma } from '../../prisma.js';
import { CreateUserInput } from '../Schema/user.schema.js';
import { enforceSignupLimits } from '../Service/signupLimiter.service.js';

const SALT_ROUNDS = 10;

export async function createUser(
	req: FastifyRequest<{
		Body: CreateUserInput;
	}>,
	reply: FastifyReply
) {
	const { password, name } = req.body;

	// 1) Anti multi-signup protection
	try {
		await enforceSignupLimits(req);
	} catch (e: any) {
		if (e instanceof ExpectedError) {
			return reply.code(e.statusCode ?? 400).send({ message: e.message });
		}
		req.log.error(e);
		return reply.code(500).send({ message: 'Internal Server Error' });
	}

	// 2) Vérifier que le user n'existe pas déjà
	const user = await prisma.user.findUnique({
		where: {
			name: name
		}
	});
	if (user) {
		return reply.code(401).send({
			message: 'User already exists with this name'
		});
	}

	try {
		const hash = await bcrypt.hash(password, SALT_ROUNDS);
		// ➜ 1. Créer le user
		const user = await prisma.user.create({
			data: {
				password: hash,
				name,
				wallets: {
					create: [
						{
							type: 'GOLD',
							amount: gameConfig.general.initialMoney
						},
						{
							type: 'TREASURE_TICKET',
							amount: gameConfig.general.initialTreasureTicket
						}
					]
				}
			},
			include: {
				wallets: true
			}
		});

		// ➜ 2. Créer automatiquement le ranking associé
		await prisma.ranking.create({
			data: {
				userId: user.id
			}
		});

		// 3) Créer automatiquement le userProfile associé
		await prisma.userProfile.create({
			data: {
				userId: user.id,
				description: null,
				language: null,
				gender: null,
				age: null,
				avatar: null,
				avatarType: null
			}
		});

		// 4) Ajouter les items de départ dans l'inventaire
		for (const starterItem of gameConfig.general.starterPack) {
			await addItemToInventory(user.id, starterItem.itemId, starterItem.quantity);
		}

		return reply.code(201).send(user);
	} catch (e) {
		return reply.code(500).send(e);
	}
}
