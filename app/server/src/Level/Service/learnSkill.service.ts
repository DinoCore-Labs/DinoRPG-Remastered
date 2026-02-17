import { levelList } from '@dinorpg/core/models/dinoz/dinozLevel.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import type { LearnSkillData } from '@dinorpg/core/models/skills/learnSkillData.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import gameConfig from '../../config/game.config.js';
import { addMultipleUnlockableSkills } from '../../Dinoz/Controller/addMultipleSkill.controller.js';
import { addSkillToDinoz } from '../../Dinoz/Controller/addSkillToDinoz.controller.js';
import { getFollowingDinoz } from '../../Dinoz/Controller/getFollowingDinoz.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { updatePoints } from '../../Ranking/Controller/updatePoints.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { applySkillEffect } from '../Controller/applySkillEffect.controller.js';
import { getDinozForLevelUp } from '../Controller/getDinozForLevelUp.controller.js';
import { removeUnlockableSkillsFromDinoz } from '../Controller/removeUnlockableSkillsFromDinoz.js';
import { getDinozLearnableSkills } from './getDinozLearnableSkills.service.js';
import { getNewDinozDataFromLevelUp } from './getNewDinozDataFromLevelUp.service.js';

type LearnSkillReq = FastifyRequest<{
	Params: { id: string };
	Body: {
		skillIdList: number[];
		tryNumber: number; // si tu valides via schema → number direct
	};
}>;

/**
 * @summary Learn one not spherical skill
 *
 * @param req.params.id Dinoz id
 * @body req.body.skillIdList {Array<number>} -> Id of skills that dinoz wants to learn
 * @body req.body.tryNumber {number} -> Number of level up try (From 1 to 2)
 *
 * @returns LearnSkillData
 */
export async function learnSkill(
	req: LearnSkillReq,
	_reply: FastifyReply
	//event?: GameDinozUsage
): Promise<LearnSkillData> {
	const authed = req.user;
	const dinozId = Number(req.params.id);

	const skillIdList = req.body.skillIdList ?? [];
	const tryNumber = Number(req.body.tryNumber);

	const result: LearnSkillData = {
		newMaxExperience: 0
		//discoveredSkill: 0
	};

	// --- Fetch dinoz for level up ---
	const dinozSkills = /*event ? await getEventDinozForLevelUp(dinozId) : */ await getDinozForLevelUp(dinozId);

	if (!dinozSkills) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	// ownership
	if (!dinozSkills.user || dinozSkills.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authed.id}`, { statusCode: 403 });
	}

	// --- Tournament / canLevelUp ---
	let canLevelUp = false;

	/*if (event) {
		const dinoz = await tournamentDinoz(dinozId);
		if (!dinoz.FBTournament) {
			throw new Error(`No FBTournament found`);
		}
		canLevelUp = dinoz.level < dinoz.FBTournament.levelLimit;
	} else {
	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	const dinozTournament = await isDinozInTournament(dinozId);
	canLevelUp = !tournament || !dinozTournament || dinozSkills.level + 1 <= tournament.levelLimit;
	}*/
	canLevelUp = dinozSkills.level < gameConfig.dinoz.maxLevel; /*+ 1 <= tournament.levelLimit*/

	if (!canLevelUp) {
		throw new ExpectedError('dinozCannotLvlUp', { params: { id: dinozId } });
	}

	// must be named
	if (dinozSkills.canRename) {
		throw new ExpectedError(`Dinoz has to be named.`, { statusCode: 400 });
	}

	// race
	const dinozRace = Object.values(raceList).find(r => r.raceId === dinozSkills.raceId);
	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`, { statusCode: 500 });
	}

	// --- compute learnables/unlockables for this tryNumber ---
	const skills = getDinozLearnableSkills(
		req,
		dinozSkills,
		dinozRace,
		dinozId,
		tryNumber
		// event
	);

	const isLearnableSkills =
		skillIdList.length === 1 && skillIdList.every(skillId => skills.learnableSkills.some(s => s.skillId === skillId));

	const isUnlockableSkills =
		skillIdList.length === skills.unlockableSkills.length &&
		skillIdList.every(skillId => skills.unlockableSkills.some(s => s.skillId === skillId));

	if (!isLearnableSkills && !isUnlockableSkills) {
		throw new ExpectedError(`Dinoz ${dinozId} can't learn this`, { statusCode: 400 });
	}

	// --- Apply learn ---
	if (isUnlockableSkills) {
		await removeUnlockableSkillsFromDinoz(dinozId, skillIdList /*event*/);
	} else {
		const wantedSkillId = skillIdList[0];

		const skill = Object.values(skillList).find(s => s.id === wantedSkillId);
		if (!skill) {
			throw new ExpectedError(`Skill ${wantedSkillId} doesn't exist.`, { statusCode: 404 });
		}

		await applySkillEffect(dinozSkills, skill, authed.id /*event*/);
		await addSkillToDinoz(dinozId, wantedSkillId /*event*/);

		// Leave party if the skill is Brave (hors event)
		if (skill.id === Skill.BRAVE /*&& !event*/) {
			const dinoz = await getFollowingDinoz(dinozId);

			if (dinoz && dinoz.followers.length > 0) {
				for (const d of dinoz.followers) {
					await updateDinoz(d.id, { leader: { disconnect: true } });
				}
			} else if (dinoz && dinoz.leaderId) {
				await updateDinoz(dinozId, { leader: { disconnect: true } });
			}
		}

		// Discover skill for player
		// (chez toi: dinozSkills.user.discoveredSkills ? adapte si différent)
		/*if (!dinozSkills.user.discoveredSkills.includes(skill.id)) {
			await setPlayer(dinozSkills.user.id, {
				discoveredSkills: [...dinozSkills.user.discoveredSkills, skill.id]
			});
			result.discoveredSkill = skill.id;
		}*/

		// Compute new unlockable skills
		const newUnlockableSkills = Object.values(skillList)
			.filter(s => s.unlockedFrom?.some(id => skillIdList.includes(id)))
			.filter(s =>
				s.unlockedFrom?.every(id => skillIdList.includes(id) || dinozSkills.skills.some(ds => ds.skillId === id))
			)
			.filter(s => !s.raceId || s.raceId.includes(dinozSkills.raceId))
			.map(s => /*event ? { skillId: s.id, gameDinozId: dinozId } : */ ({ skillId: s.id, dinozId }));

		// Keep local data in sync
		dinozSkills.skills.push({ skillId: wantedSkillId });

		await addMultipleUnlockableSkills(newUnlockableSkills);
	}

	// --- Update dinoz data (level up resolution) ---
	const newDinozData = getNewDinozDataFromLevelUp(dinozId, tryNumber, dinozSkills, dinozRace);

	/*if (event) {
		await updateEventDinoz(newDinozData.id, newDinozData);
		result.newMaxExperience = 1;
		return result;
	}*/

	await updateDinoz(newDinozData.id, newDinozData);

	/*if (newDinozData.level % 10 === 0) {
		checkAnnounce(PantheonMotif.race, newDinozData.id.toString(), newDinozData.display);
	}*/

	// Update player points + logs
	await updatePoints(dinozSkills.user.id, 1);
	//await createLog(LogType.LevelUp, dinozSkills.user.id, dinozSkills.id, newDinozData.level.toString());

	result.newMaxExperience = levelList.find(l => l.id === dinozSkills.level + 1)?.experience ?? 0;

	// Stats
	await incrementUserStat(StatTracking.LVL_UP, dinozSkills.user.id, 1);
	switch (skills.element) {
		case ElementType.FIRE:
			await incrementUserStat(StatTracking.UP_FIRE, dinozSkills.user.id, 1);
			break;
		case ElementType.WATER:
			await incrementUserStat(StatTracking.UP_WATER, dinozSkills.user.id, 1);
			break;
		case ElementType.WOOD:
			await incrementUserStat(StatTracking.UP_WOOD, dinozSkills.user.id, 1);
			break;
		case ElementType.LIGHTNING:
			await incrementUserStat(StatTracking.UP_LIGHTNING, dinozSkills.user.id, 1);
			break;
		case ElementType.AIR:
			await incrementUserStat(StatTracking.UP_AIR, dinozSkills.user.id, 1);
			break;
		default:
			break;
	}

	//await checkFBCreation(dinozSkills.level + 1);

	return result;
}
