import { Action, ActionFiche, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { gatherList } from '@dinorpg/core/models/gather/gatherList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace, getFollowableDinoz } from '@dinorpg/core/utils/dinozUtils.js';

import { Dinoz, DinozSkills, DinozState, DinozStatus } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { prisma } from '../../prisma.js';
import { checkCondition } from '../../utils/checkCondition.js';
import { canLevelUp, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { PlayerForConditionCheck } from '../../utils/user/userConditionCheck.js';

/**
 * @summary Get available action from dinoz
 */
export async function getAvailableActions(
	dinoz: Pick<
		Dinoz,
		| 'level'
		| 'id'
		| 'experience'
		| 'leaderId'
		| 'fight'
		| 'gather'
		| 'remaining'
		| 'maxLife'
		| 'state'
		| 'placeId'
		| 'life'
	> & {
		//missions: DinozMission[];
		//concentration: Concentration | null;
		followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
	},
	user: PlayerForConditionCheck
) {
	const availableActions: ActionFiche[] = [];

	const dinozPlace = actualPlace(dinoz);

	if (dinoz.state === DinozState.unfreezing) {
		return [];
	}

	// Nothing else if dinoz is being sold
	if (dinoz.state === DinozState.selling) {
		return [actionList[Action.MARKET]];
	}

	// Stop congel
	if (dinoz.state === DinozState.frozen) {
		return [actionList[Action.STOP_CONGEL]];
	}

	// Stop rest
	if (dinoz.state === DinozState.resting) {
		return [actionList[Action.STOP_REST]];
	}

	// Leaders actions
	if (dinoz.leaderId) {
		availableActions.push(actionList[Action.UNFOLLOW]);
		availableActions.push(actionList[Action.CHANGE_LEADER]);
	} else {
		// Check if there is a dinoz to follow
		const potentialDinozToFollow = await prisma.dinoz.findMany({
			where: {
				id: { not: dinoz.id },
				userId: user.id,
				state: null
			},
			select: {
				id: true,
				placeId: true,
				leaderId: true,
				state: true,
				life: true,
				followers: { select: { id: true, fight: true, remaining: true, gather: true, name: true } },
				skills: { select: { skillId: true, state: true } }
			}
		});
		const dinozToFollow = getFollowableDinoz(
			potentialDinozToFollow.map(dinoz => ({
				...dinoz,
				skills: dinoz.skills,
				followers: dinoz.followers
			})),
			dinoz
		);
		if (dinozToFollow.length > 0 && isAlive(dinoz) && dinoz.followers.length === 0) {
			availableActions.push(actionList[Action.FOLLOW]);
		}
	}
	if (dinoz.followers.length > 0) {
		availableActions.push(actionList[Action.DISBAND]);

		for (const follower of dinoz.followers) {
			// Follower gather
			if (
				follower.gather &&
				dinozPlace.gather !== undefined &&
				checkCondition(
					Object.values(gatherList).find(grid => grid.type === dinozPlace.gather)?.condition,
					user,
					follower.id
				)
			) {
				const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.gather);
				if (!gatherFound) {
					throw new ExpectedError(`Gather ${dinozPlace.gather} doesn't exist.`);
				}
				availableActions.push({ ...actionList[gatherFound.action], forDinoz: follower.id });
			}
		}
	}

	// Death related actions
	if (!isAlive(dinoz)) {
		availableActions.push(actionList[Action.RESURRECT]);
		// REINCARNATION
		if (
			dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) &&
			dinoz.level >= 40 &&
			!dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
		) {
			availableActions.push(actionList[Action.REINCARNATION]);
		}
		return availableActions;
	}

	// Rest
	if (dinoz.life < Math.round(dinoz.maxLife / 2) && dinoz.fight) {
		availableActions.push(actionList[Action.REST]);
	}

	// Concentration
	/*if (dinoz.concentration) {
		availableActions.push(actionList[Action.CONCENTRATE]);
		return availableActions;
	}*/

	// Refresh action
	if ((!dinoz.leaderId && !dinoz.fight) || !dinoz.gather) {
		if (dinoz.remaining > 0) {
			availableActions.push(actionList[Action.ACTION]);
		} else {
			availableActions.push(actionList[Action.IRMA]);
		}
	}

	// Refresh actions in party
	if (
		dinoz.followers.length > 0 &&
		(!dinoz.fight || !dinoz.gather || dinoz.followers.filter(f => !f.fight).length > 0)
	) {
		let index = availableActions.indexOf(actionList[Action.IRMA]);
		if (index >= 0) {
			availableActions.splice(index, 1);
		}
		if (dinoz.remaining <= 0 || dinoz.followers.filter(f => !f.fight).length > 0) {
			index = availableActions.indexOf(actionList[Action.ACTION]);
			if (index >= 0) {
				availableActions.splice(index, 1);
			}
			if (dinoz.followers.some(d => d.remaining > 0)) {
				availableActions.push(actionList[Action.ACTION]);
			} else {
				availableActions.push(actionList[Action.IRMAS]);
			}
		}
	}

	// Fight
	if (!dinoz.leaderId && dinoz.fight && dinoz.followers.filter(f => !f.fight).length <= 0) {
		availableActions.push(actionList[Action.FIGHT]);
	}

	//Gather
	if (
		dinoz.gather &&
		dinozPlace.gather !== undefined &&
		checkCondition(Object.values(gatherList).find(grid => grid.type === dinozPlace.gather)?.condition, user, dinoz.id)
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.gather);
		if (!gatherFound) {
			throw new ExpectedError(`Gather ${dinozPlace.gather} doesn't exist.`);
		}
		availableActions.push(actionList[gatherFound.action]);
	}

	// Special Gather
	if (
		dinozPlace.specialGather !== undefined &&
		checkCondition(
			Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather)?.condition,
			user,
			dinoz.id
		)
	) {
		const gatherFound = Object.values(gatherList).find(grid => grid.type === dinozPlace.specialGather);
		if (!gatherFound) {
			throw new ExpectedError(`Gather ${dinozPlace.specialGather} doesn't exist.`);
		}
		availableActions.push({
			name: gatherFound.action,
			imgName: 'act_gather'
		});
	}

	// Forcebrute Tournament
	if (dinoz.placeId === PlaceEnum.FORCEBRUT && dinoz.status.some(s => s.statusId === DinozStatusId.TOURNA)) {
		availableActions.push(actionList[Action.FB_TOURNAMENT]);
	}

	// Dig with the shovel
	if (
		dinoz.status.some(
			status => status.statusId === DinozStatusId.SHOVEL || status.statusId === DinozStatusId.ENHANCED_SHOVEL
		)
	) {
		availableActions.push(actionList[Action.DIG]);
	}

	// Shop action: check if a shop is available where the dinoz is
	/*const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);
	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinoz.id));

	if (itinerantShop && +itinerant.value === dinoz.placeId) {
		availableActions.push({
			name: actionList[Action.ITINERANTSHOP].name,
			imgName: actionList[Action.ITINERANTSHOP].imgName,
			prop: itinerantShop.shopId
		});
	}
	const shopAvailable = Object.values(shopList).filter(
		shop =>
			shop.placeId === dinoz.placeId &&
			shop.placeId !== PlaceEnum.NOWHERE &&
			checkCondition(shop.condition, player, dinoz.id)
	);
	if (shopAvailable.length > 0) {
		// Add all the shop id to the action
		availableActions.push(
			...shopAvailable.map(s => {
				return {
					name: actionList[Action.SHOP].name,
					imgName: actionList[Action.SHOP].imgName,
					prop: s.shopId
				};
			})
		);
	}

	// Hack to remove FRETURN so dinoz can still be redirected to NPC but cannot talk to them explicitly
	dinoz.status = dinoz.status.filter(s => s.statusId !== DinozStatusId.FRETURN);
	const npcAvailable = Object.values(npcList).filter(npc => npc.placeId === dinoz.placeId);
	npcAvailable.forEach(npc => {
		if (!npc.condition || checkCondition(npc.condition, player, dinoz.id)) {
			availableActions.push({
				name: actionList[Action.NPC].name,
				imgName: actionList[Action.NPC].imgName,
				prop: npc.id
			});
		}
	});

	const missionAvailable = getMissionAction(dinoz);
	if (missionAvailable) {
		availableActions.push({
			name: actionList[Action.MISSION].name,
			imgName: actionList[Action.MISSION].imgName,
			prop: missionAvailable
		});
	}*/

	if (canLevelUp(dinoz, gameConfig)) {
		//const tournament = await TournamentManager.getCurrentTournamentState(prisma);
		//const dinozTournament = await isDinozInTournament(dinoz.id);

		//const canLevelUp = !tournament || !dinozTournament || dinoz.level + 1 <= tournament.levelLimit;

		//if (canLevelUp) {
		availableActions.push(actionList[Action.LEVEL_UP]);
		//}
	}

	// Market if dinoz is in market
	if (dinoz.placeId === PlaceEnum.PLACE_DU_MARCHE) {
		availableActions.push(actionList[Action.MARKET]);
	}

	if (
		dinoz.placeId === PlaceEnum.GORGES_PROFONDES &&
		dinoz.status.some(status => status.statusId === DinozStatusId.FSPELE)
	) {
		availableActions.push(actionList[Action.CONGEL]);
	}

	return availableActions;
}
