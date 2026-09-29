import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { canChangeSkillState, knowSkillId } from '../../utils/dinoz/dinozFiche.mapper.js';

type Params = { id: string };
type Body = { skillId: string | number; skillState: boolean };

export async function setDinozSkillStateForUser(
	userId: string,
	dinozId: number,
	skillId: number,
	skillState: boolean
) {
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}
	if (!Number.isFinite(skillId)) {
		throw new ExpectedError('invalidSkillId');
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			user: { select: { id: true } },
			skills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}

	const skill = Object.values(skillList).find(entry => entry.id === skillId);
	if (!skill) throw new ExpectedError(`Skill ${skillId} doesn't know exist`);
	if (!skill.activatable) throw new ExpectedError(`Skill ${skillId} cannot be activated`);

	if (!dinoz.user || dinoz.user.id !== userId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId: dinoz.id,
				userId
			}
		});
	}

	if (!canChangeSkillState(dinoz)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't have the right status`);
	}

	if (!knowSkillId(dinoz, skillId)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't know skill : ${skillId}`);
	}

	await prisma.dinozSkills.update({
		where: { skillId_dinozId: { dinozId, skillId } },
		data: { state: skillState }
	});

	return !skillState;
}

/**
 * @summary Activate or desactivate a skill from a dinoz
 * @param req.params.id {string} DinozId
 * @param req.body.skillId {string} SkillId
 * @param req.body.skillState {boolean} State of the skill
 * @return boolean
 */
export async function setSkillStateHandler(req: FastifyRequest<{ Params: Params; Body: Body }>, reply: FastifyReply) {
	const dinozId = Number.parseInt(req.params.id, 10);
	const skillId = typeof req.body.skillId === 'string' ? Number.parseInt(req.body.skillId, 10) : req.body.skillId;
	const skillState = !!req.body.skillState;
	const result = await setDinozSkillStateForUser(req.user.id, dinozId, skillId, skillState);
	return reply.send(result);
}
