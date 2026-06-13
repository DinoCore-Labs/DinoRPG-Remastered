import { CLAN_CREATE_MONEY } from '@dinorpg/core/models/clan/constants.js';
import { ClanHistoryType } from '@dinorpg/core/models/enums/ClanHistoryType.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';
import sharp from 'sharp';

import { prisma } from '../../prisma.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { memberHasRight } from '../Controller/memberHasRight.controller.js';
import {
	clanIdParamSchema,
	createClanSchema,
	pageParamSchema,
	searchClansSchema,
	updateClanLangsSchema
} from '../Schema/clan.schema.js';

export async function createClan(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = createClanSchema.parse(req.body);

	const existingMember = await prisma.clanMember.findUnique({
		where: { userId: userId }
	});

	if (existingMember) {
		throw new ExpectedError('alreadyInAClan');
	}

	const newClan = await prisma.$transaction(async tx => {
		const existingClan = await tx.clan.findFirst({
			where: { name: body.name }
		});

		if (existingClan) {
			throw new ExpectedError('clanNameTaken');
		}
		removeMoney(userId, CLAN_CREATE_MONEY);

		const clan = await tx.clan.create({
			data: {
				name: body.name,
				leaderId: userId,
				langs: body.languages
			}
		});

		await tx.clanMember.create({
			data: {
				clanId: clan.id,
				userId: userId,
				rights: ['all']
			}
		});

		await tx.user.update({
			where: { id: userId },
			data: { clanId: clan.id }
		});

		await tx.clanHistory.create({
			data: {
				clanId: clan.id,
				authorId: userId,
				type: ClanHistoryType.CLAN_CREATED,
				authorMessage: req.user.name
			}
		});

		await tx.clanPage.create({
			data: {
				clanId: clan.id,
				public: true,
				home: true,
				name: 'Home',
				content: body.description
			}
		});

		return reply.send(clan);
	});

	return reply.status(201).send({
		message: 'clanCreatedSuccessfully',
		clan: newClan
	});
}

export async function getClan(req: FastifyRequest, reply: FastifyReply) {
	try {
		const param = clanIdParamSchema.parse(req.params);

		const clanId = param.clanId;

		const clanData = await prisma.clan.findUnique({
			where: { id: clanId },
			select: {
				id: true,
				name: true,
				treasureValue: true,
				creationDate: true,
				langs: true,
				banner: true,

				members: {
					select: { id: true }
				},

				leader: {
					select: { id: true, name: true }
				},
				ingredients: {
					select: {
						ingredientId: true,
						quantity: true
					}
				}
			}
		});

		if (!clanData) {
			return reply.status(404).send({ error: 'Clan not found' });
		}

		return reply.send({
			id: clanData.id,
			name: clanData.name,
			treasureValue: clanData.treasureValue,
			creationDate: clanData.creationDate,
			languages: clanData.langs,
			members: clanData.members,
			leader: clanData.leader,
			banner: clanData.banner ?? undefined,
			ingredients: clanData.ingredients
		});
	} catch (err) {
		throw new ExpectedError('Invalid Request');
	}
}

export async function updateClanLangs(req: FastifyRequest, reply: FastifyReply) {
	try {
		const { clanId } = clanIdParamSchema.parse(req.params);
		const { languages } = updateClanLangsSchema.parse(req.body);

		if (!(await memberHasRight(req.user.id, clanId, ClanMemberRight.CLAN_EDIT_LANG))) {
			throw new ExpectedError('Permission denied');
		}

		const updatedClan = await prisma.clan.update({
			where: { id: clanId },
			data: { langs: languages }
		});
		return reply.send({
			success: true,
			languages: updatedClan.langs
		});
	} catch (err) {
		throw new ExpectedError('Invalid Request');
	}
}

export async function deleteClan(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	const userId = req.user.id;

	const clan = await prisma.clan.findUnique({
		where: { id: clanId },
		select: { leaderId: true }
	});

	if (!clan) {
		throw new ExpectedError('Clan not found');
	}

	if (clan.leaderId !== userId) {
		throw new ExpectedError('Permission denied');
	}

	await prisma.$transaction([
		prisma.clanJoinRequest.deleteMany({ where: { clanId } }),
		prisma.clanMember.deleteMany({ where: { clanId } }),
		prisma.clanPage.deleteMany({ where: { clanId } }),
		prisma.clanIngredient.deleteMany({ where: { clanId } }),
		prisma.clanHistory.deleteMany({ where: { clanId } }),
		prisma.clanMessage.deleteMany({ where: { clanId } }),
		prisma.user.updateMany({ where: { clanId }, data: { clanId: null } }),
		prisma.clan.delete({ where: { id: clanId } })
	]);

	return reply.send({ success: true });
}

export async function getClanBanner(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);

	const clan = await prisma.clan.findUnique({
		where: { id: clanId },
		select: { banner: true }
	});

	if (!clan || !clan.banner) {
		return reply.status(404).send({ error: 'Banner not found' });
	}

	reply.header('Content-Type', 'image/webp');
	return reply.send(clan.banner);
}

export async function updateClanBanner(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	const userId = req.user.id;

	if (!(await memberHasRight(userId, clanId, ClanMemberRight.CLAN_EDIT_BANNER))) {
		throw new ExpectedError('Permission denied');
	}

	const data = await req.file();
	if (!data) {
		return reply.status(400).send({ error: 'No file uploaded' });
	}

	const buffer = await data.toBuffer();
	if (!buffer || buffer.length === 0) {
		return reply.status(400).send({ error: 'Invalid or empty file buffer' });
	}

	let quality = 70;
	let output: Buffer;

	try {
		output = await sharp(buffer).resize(448, 100, { fit: 'cover' }).webp({ quality }).toBuffer();

		while (output.length > 300 * 1024 && quality > 20) {
			quality -= 10;
			output = await sharp(buffer).resize(800, 150, { fit: 'cover' }).webp({ quality }).toBuffer();
		}
	} catch (sharpError) {
		return reply.status(400).send({ error: 'Failed to process image. Ensure it is a valid PNG/JPG.' });
	}

	const finalArray = new Uint8Array(Buffer.from(output));

	await prisma.clan.update({
		where: { id: clanId },
		data: {
			banner: finalArray
		}
	});

	return reply.send({ success: true });
}
export async function getClansList(req: FastifyRequest, reply: FastifyReply) {
	const { page } = pageParamSchema.parse(req.params);

	const clans = await prisma.clan.findMany({
		skip: (page - 1) * 20,
		take: 20,
		orderBy: {
			creationDate: 'desc'
		},
		select: {
			id: true,
			name: true,
			treasureValue: true,
			creationDate: true,
			leaderId: true,
			langs: true,
			banner: true,
			members: {
				select: { id: true }
			},
			leader: {
				select: { id: true, name: true }
			}
		}
	});

	return reply.send(
		clans.map(c => ({
			id: c.id,
			name: c.name,
			treasureValue: c.treasureValue,
			creationDate: c.creationDate,
			leaderId: c.leaderId,
			languages: c.langs,
			members: c.members,
			leader: c.leader,
			banner: c.banner ? `data:image/webp;base64,${Buffer.from(c.banner).toString('base64')}` : undefined
		}))
	);
}

export async function searchClansByName(req: FastifyRequest, reply: FastifyReply) {
	const { name, page } = searchClansSchema.parse(req.params);

	const clans = await prisma.clan.findMany({
		where: {
			name: {
				contains: name,
				mode: 'insensitive'
			}
		},
		skip: (page - 1) * 20,
		take: 20,
		orderBy: {
			creationDate: 'desc'
		},
		select: {
			id: true,
			name: true,
			treasureValue: true,
			creationDate: true,
			leaderId: true,
			langs: true,
			banner: true,
			members: {
				select: { id: true }
			},
			leader: {
				select: { id: true, name: true }
			}
		}
	});

	return reply.send(
		clans.map(c => ({
			id: c.id,
			name: c.name,
			treasureValue: c.treasureValue,
			creationDate: c.creationDate,
			leaderId: c.leaderId,
			languages: c.langs,
			members: c.members,
			leader: c.leader,
			banner: c.banner ? `data:image/webp;base64,${Buffer.from(c.banner).toString('base64')}` : undefined
		}))
	);
}
