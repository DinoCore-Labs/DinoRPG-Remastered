import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { isMember } from '../Controller/isMember.controller.js';
import { memberHasRight } from '../Controller/memberHasRight.controller.js';
import {
	clanIdParamSchema,
	createClanPageSchema,
	pageIdParamSchema,
	updateClanPageSchema
} from '../Schema/clan.schema.js';

export async function getClanPage(req: FastifyRequest, reply: FastifyReply) {
	const params = pageIdParamSchema.parse(req.params);
	const page = await prisma.clanPage.findUnique({
		where: { id: params.pageId },
		select: {
			id: true,
			home: true,
			public: true,
			name: true,
			content: true,
			clanId: true
		}
	});
	if (!page) {
		throw new ExpectedError('Page not found');
	}
	if (!page.public) {
		if (!(await isMember(req.user.id, page.clanId))) {
			throw new ExpectedError('Access denied');
		}
	}
	return reply.send(page);
}

export async function createClanPage(req: FastifyRequest, reply: FastifyReply) {
	const body = createClanPageSchema.parse(req.body);

	if (!(await memberHasRight(req.user.id, body.clanId, ClanMemberRight.PAGE_MANAGE))) {
		throw new ExpectedError('Permission denied');
	}
	const newPage = await prisma.clanPage.create({
		data: {
			name: body.name,
			home: false,
			content: body.content,
			public: body.isPublic,
			clanId: body.clanId
		}
	});
	return reply.send(newPage);
}

export async function updateClanPage(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, pageId } = req.params as { clanId: number; pageId: number };
	const body = updateClanPageSchema.parse(req.body);

	if (!(await memberHasRight(req.user.id, clanId, ClanMemberRight.PAGE_MANAGE))) {
		throw new ExpectedError('Permission denied');
	}
	const updatedPage = await prisma.clanPage.update({
		where: { id: pageId },
		data: {
			name: body.name,
			content: body.content,
			public: body.isPublic,
			clanId: clanId
		}
	});
	return reply.send(updatedPage);
}

export async function deleteClanPage(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, pageId } = req.params as { clanId: number; pageId: number };

	if (!(await memberHasRight(req.user.id, clanId, ClanMemberRight.PAGE_MANAGE))) {
		throw new ExpectedError('Permission denied');
	}
	await prisma.clanPage.delete({
		where: { id: pageId }
	});
	return reply.send({ success: true });
}

export async function getClanPages(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);

	const isUserMember = await isMember(req.user.id, clanId);

	const pages = await prisma.clanPage.findMany({
		where: {
			clanId: clanId,
			...(isUserMember ? {} : { public: true })
		},
		orderBy: {
			id: 'asc'
		}
	});

	return reply.send(pages);
}
