import type { ManageDinozPageData } from '@dinorpg/core/models/dinoz/manageDinoz.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxXp, orderDinozList } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import type { UpdateDinozOrdersInput } from '../Schema/dinoz.schema.js';

type UpdateDinozOrdersRequest = FastifyRequest<{
	Body: UpdateDinozOrdersInput;
}>;

async function assertCanManageDinozOrder(userId: string) {
	const reward = await prisma.userRewards.findFirst({
		where: {
			userId,
			rewardId: Reward.PDA
		},
		select: {
			rewardId: true
		}
	});
	if (!reward) {
		throw new ExpectedError('noPDA');
	}
}

async function getDinozToManage(userId: string): Promise<ManageDinozPageData> {
	await assertCanManageDinozOrder(userId);
	const dinozList = await prisma.dinoz.findMany({
		where: {
			userId
		},
		select: {
			id: true,
			name: true,
			display: true,
			state: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			order: true,
			leaderId: true,
			followers: {
				select: {
					id: true
				}
			},
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
	return orderDinozList(dinozList).map(({ leaderId, followers, ...dinoz }) => ({
		...dinoz,
		maxExperience: getMaxXp(dinoz)
	}));
}

async function updateDinozOrders(userId: string, dinozIds: number[]): Promise<ManageDinozPageData> {
	await assertCanManageDinozOrder(userId);
	const uniqueIds = [...new Set(dinozIds)];
	if (uniqueIds.length !== dinozIds.length) {
		throw new ExpectedError('duplicateDinozIds');
	}
	const ownedDinoz = await prisma.dinoz.findMany({
		where: {
			userId
		},
		select: {
			id: true
		}
	});
	const ownedIds = new Set(ownedDinoz.map(dinoz => dinoz.id));
	if (ownedIds.size !== dinozIds.length || dinozIds.some(id => !ownedIds.has(id))) {
		throw new ExpectedError('invalidDinozOrder');
	}
	await prisma.$transaction(
		dinozIds.map((id, index) =>
			prisma.dinoz.update({
				where: {
					id
				},
				data: {
					order: index
				}
			})
		)
	);
	return getDinozToManage(userId);
}

export async function getDinozToManageHandler(req: FastifyRequest, reply: FastifyReply) {
	const dinozList = await getDinozToManage(req.user.id);
	return reply.send(dinozList);
}

export async function updateDinozOrdersHandler(req: UpdateDinozOrdersRequest, reply: FastifyReply) {
	const dinozList = await updateDinozOrders(req.user.id, req.body.dinozIds);
	return reply.send(dinozList);
}
