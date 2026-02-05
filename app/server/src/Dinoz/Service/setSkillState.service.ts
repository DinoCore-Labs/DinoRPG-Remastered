import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { canChangeSkillState, knowSkillId } from '../../utils/dinoz/dinozFiche.mapper.js';

type Params = { id: string };
type Body = { skillId: string | number; skillState: boolean };

/**
 * @summary Activate or desactivate a skill from a dinoz
 * @param req.params.id {string} DinozId
 * @param req.body.skillId {string} SkillId
 * @param req.body.skillState {boolean} State of the skill
 * @return boolean
 */
export async function setSkillStateHandler(req: FastifyRequest<{ Params: Params; Body: Body }>, reply: FastifyReply) {
	const authed = req.user;
	const dinozId = Number.parseInt(req.params.id, 10);
	const skillToUpdate = typeof req.body.skillId === 'string' ? Number.parseInt(req.body.skillId, 10) : req.body.skillId;
	const skillStateToUpdate = !!req.body.skillState;

	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}
	if (!Number.isFinite(skillToUpdate)) {
		throw new ExpectedError('invalidSkillId');
	}

	// 1) Fetch minimal dinoz state (ownership + skills known + status)
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
		throw new ExpectedError('dinozNotFound', dinozId);
	}

	// 2) Skill exists + activatable
	const skill = Object.values(skillList).find(s => s.id === skillToUpdate);
	if (!skill) throw new ExpectedError(`Skill ${skillToUpdate} doesn't know exist`);
	if (!skill.activatable) throw new ExpectedError(`Skill ${skillToUpdate} cannot be activated`);

	// 3) Ownership
	if (!dinoz.user || dinoz.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	// 4) Status allows changing skill state
	if (!canChangeSkillState(dinoz)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't have the right status`);
	}

	// 5) Dinoz knows the skill
	if (!knowSkillId(dinoz, skillToUpdate)) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't know skill : ${skillToUpdate}`);
	}

	// 6) Update state
	await prisma.dinozSkills.update({
		where: { skillId_dinozId: { dinozId, skillId: skillToUpdate } },
		data: { state: skillStateToUpdate }
	});

	return !skillStateToUpdate;
}
