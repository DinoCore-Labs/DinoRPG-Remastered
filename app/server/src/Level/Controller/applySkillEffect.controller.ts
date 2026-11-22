import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';

import { Dinoz } from '../../../../prisma/index.js';
import { getAllDinozFromAccount } from '../../Dinoz/Controller/getAllDinozFromAccount.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { getUserUniqueSkills } from '../../User/Controller/getUserUniqueSkills.controller.js';
import { setUser } from '../../User/Controller/setUser.controller.js';
import { getRandomUpElement } from '../../utils/dinoz/getRandomUpElement.js';
import { applySkillToDinoz, applyUSkillEffect, computeUSkillEffects } from '../../utils/dinoz/skillParser.js';

export async function applySkillEffect(
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'> & {
		raceId?: number;
	},
	skill: SkillDetails,
	userId: string
) {
	let transeNocturneElements: { fire: number; wood: number; water: number; lightning: number; air: number } | undefined;
	if (skill.effects) {
		const updates = applySkillToDinoz(skill.effects, dinoz);
		await updateDinoz(dinoz.id, updates);
	}
	if (skill.id === Skill.TRANSE_NOCTURNE) {
		let raceId = dinoz.raceId;
		if (raceId === undefined) {
			const dbDinoz = await prisma.dinoz.findUnique({
				where: { id: dinoz.id },
				select: { raceId: true }
			});
			raceId = dbDinoz?.raceId;
		}
		if (raceId !== undefined) {
			const race = getRace(raceId);
			if (race) {
				const pointsCount = Math.floor(Math.random() * 4) + 1;
				let fire = 0;
				let wood = 0;
				let water = 0;
				let lightning = 0;
				let air = 0;

				for (let i = 0; i < pointsCount; i++) {
					const element = getRandomUpElement(race.upChance);
					switch (element) {
						case 1:
							fire++;
							break;
						case 2:
							wood++;
							break;
						case 3:
							water++;
							break;
						case 4:
							lightning++;
							break;
						case 5:
							air++;
							break;
					}
				}

				dinoz.nbrUpFire += fire;
				dinoz.nbrUpWood += wood;
				dinoz.nbrUpWater += water;
				dinoz.nbrUpLightning += lightning;
				dinoz.nbrUpAir += air;

				await updateDinoz(dinoz.id, {
					nbrUpFire: dinoz.nbrUpFire,
					nbrUpWood: dinoz.nbrUpWood,
					nbrUpWater: dinoz.nbrUpWater,
					nbrUpLightning: dinoz.nbrUpLightning,
					nbrUpAir: dinoz.nbrUpAir
				});

				transeNocturneElements = { fire, wood, water, lightning, air };
			}
		}
	}
	if (userId && skill.type === SkillType.U /*&& !event*/) {
		const user = await getUserUniqueSkills(userId);
		if (!user) {
			throw new ExpectedError('userNotFound', {
				params: {
					userId
				}
			});
		}
		applyUSkillEffect(user, skill);
		await setUser(userId, user);
	}
	return { transeNocturneElements };
}

export async function computeUSkillsForUser(userId: string) {
	// Get player with its U skills
	const user = await getUserUniqueSkills(userId);
	if (!user) {
		throw new ExpectedError('userNotFound', {
			params: {
				userId
			}
		});
	}
	// Get player dinoz list
	const dinozList = await getAllDinozFromAccount(userId);
	const skills = dinozList.flatMap(dinoz => dinoz.skills).map(skill => skill.skillId);
	// Compute player U skills using dinoz skills
	computeUSkillEffects(user, skills);
	await setUser(userId, user);
}
