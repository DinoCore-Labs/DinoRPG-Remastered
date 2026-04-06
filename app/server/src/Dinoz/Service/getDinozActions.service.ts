import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { Action, ActionFiche, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace, getFollowableDinoz } from '@dinorpg/core/utils/dinozUtils.js';

import { Dinoz, DinozSkills, DinozState, DinozStatus } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { listAvailableDialogs } from '../../Dialog/Service/dialog.service.js';
import { getSpecificSecret } from '../../jobs/controller/getSpecificSecret.js';
import { prisma } from '../../prisma.js';
import { buildConditionContext, BuildConditionContextOptions } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';
import { canFreezeDinozAction } from '../../utils/dinoz/canFreezeDinozAction.js';
import { canLevelUp, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { type CompiledGatherData, getCompiledGather } from '../../utils/gather/gather.compiler.js';
import { UserForConditionCheck } from '../../utils/user/userConditionCheck.js';

type GatherEntry = CompiledGatherData;

function getPlaceGatherEntries(place: { gathers?: number[] }): GatherEntry[] {
	return (place.gathers ?? []).map(type => getCompiledGather(type));
}

function pushUniqueAction(actions: ActionFiche[], action: ActionFiche) {
	const exists = actions.some(
		existing =>
			existing.name === action.name &&
			existing.imgName === action.imgName &&
			existing.prop === action.prop &&
			existing.forDinoz === action.forDinoz
	);

	if (!exists) {
		actions.push(action);
	}
}

function getGatherActionFiche(gather: GatherEntry): ActionFiche {
	const fiche = actionList[gather.action];

	if (fiche) {
		return fiche;
	}

	return {
		name: gather.action,
		imgName: 'act_gather'
	} as ActionFiche;
}

function getDialogActionFiche(dialog: { id: string; name: string }): ActionFiche {
	return {
		...actionList[Action.NPC],
		prop: dialog.id,
		label: dialog.name
	};
}

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
		followers: Pick<Dinoz, 'id' | 'fight' | 'remaining' | 'gather'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
	},
	user: UserForConditionCheck,
	conditionOptions: BuildConditionContextOptions = {}
) {
	const availableActions: ActionFiche[] = [];

	const dinozPlace = actualPlace(dinoz);
	const placeGatherEntries = getPlaceGatherEntries(dinozPlace);
	const normalGatherEntries = placeGatherEntries.filter(gather => !gather.cost);
	const specialGatherEntries = placeGatherEntries.filter(gather => Boolean(gather.cost));

	const contextCache = new Map<number, ReturnType<typeof buildConditionContext>>();

	function getContext(activeDinozId: number) {
		const cached = contextCache.get(activeDinozId);
		if (cached) return cached;

		const context = buildConditionContext(user, activeDinozId, defaultConditionKeyMaps, conditionOptions);
		contextCache.set(activeDinozId, context);
		return context;
	}

	if (dinoz.state === DinozState.unfreezing) {
		return [];
	}

	if (dinoz.state === DinozState.selling) {
		return [actionList[Action.MARKET]];
	}

	if (dinoz.state === DinozState.frozen) {
		return [actionList[Action.STOP_CONGEL]];
	}

	if (dinoz.state === DinozState.resting) {
		return [actionList[Action.STOP_REST]];
	}

	if (dinoz.leaderId) {
		availableActions.push(actionList[Action.UNFOLLOW]);
		availableActions.push(actionList[Action.CHANGE_LEADER]);
	} else {
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
			potentialDinozToFollow.map(candidate => ({
				...candidate,
				skills: candidate.skills,
				followers: candidate.followers
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
			if (!follower.gather) {
				continue;
			}

			const followerContext = getContext(follower.id);

			for (const gatherFound of normalGatherEntries) {
				if (checkCondition(gatherFound.condition, followerContext)) {
					pushUniqueAction(availableActions, {
						...getGatherActionFiche(gatherFound),
						forDinoz: follower.id
					});
				}
			}
		}
	}

	if (!isAlive(dinoz)) {
		availableActions.push(actionList[Action.RESURRECT]);

		if (
			dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) &&
			dinoz.level >= 40 &&
			!dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
		) {
			availableActions.push(actionList[Action.REINCARNATION]);
		}

		return availableActions;
	}

	if (dinoz.life < Math.round(dinoz.maxLife / 2) && dinoz.fight) {
		availableActions.push(actionList[Action.REST]);
	}

	if ((!dinoz.leaderId && !dinoz.fight) || !dinoz.gather) {
		if (dinoz.remaining > 0) {
			availableActions.push(actionList[Action.ACTION]);
		} else {
			availableActions.push(actionList[Action.IRMA]);
		}
	}

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

			if (dinoz.followers.some(follower => follower.remaining > 0)) {
				availableActions.push(actionList[Action.ACTION]);
			} else {
				availableActions.push(actionList[Action.IRMAS]);
			}
		}
	}

	if (!dinoz.leaderId && dinoz.fight && dinoz.followers.filter(f => !f.fight).length <= 0) {
		availableActions.push(actionList[Action.FIGHT]);
	}

	const currentContext = getContext(dinoz.id);

	// Normal gather
	if (dinoz.gather) {
		for (const gatherFound of normalGatherEntries) {
			if (checkCondition(gatherFound.condition, currentContext)) {
				pushUniqueAction(availableActions, getGatherActionFiche(gatherFound));
			}
		}
	}

	// Special gather
	for (const gatherFound of specialGatherEntries) {
		const passes = checkCondition(gatherFound.condition, currentContext);

		if (passes) {
			pushUniqueAction(availableActions, getGatherActionFiche(gatherFound));
		}
	}

	if (dinoz.placeId === PlaceEnum.FORCEBRUT && dinoz.status.some(s => s.statusId === DinozStatusId.TOURNA)) {
		availableActions.push(actionList[Action.FB_TOURNAMENT]);
	}

	// Dig action
	if (
		dinoz.status.some(
			status => status.statusId === DinozStatusId.SHOVEL || status.statusId === DinozStatusId.ENHANCED_SHOVEL
		)
	) {
		availableActions.push(actionList[Action.DIG]);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopListV2)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(shop => checkCondition(shop.condition, currentContext));

	if (itinerantShop && +itinerant.value === dinoz.placeId) {
		availableActions.push({
			name: actionList[Action.ITINERANTSHOP].name,
			imgName: actionList[Action.ITINERANTSHOP].imgName,
			prop: itinerantShop.shopId
		});
	}

	const shopAvailable = Object.values(shopListV2).filter(
		shop =>
			shop.placeId === dinoz.placeId &&
			shop.placeId !== PlaceEnum.NOWHERE &&
			checkCondition(shop.condition, currentContext)
	);

	if (shopAvailable.length > 0) {
		availableActions.push(
			...shopAvailable.map(shop => ({
				name: actionList[Action.SHOP].name,
				imgName: actionList[Action.SHOP].imgName,
				prop: shop.shopId
			}))
		);
	}

	if (canLevelUp(dinoz, gameConfig)) {
		availableActions.push(actionList[Action.LEVEL_UP]);
	}

	if (dinoz.placeId === PlaceEnum.PLACE_DU_MARCHE) {
		availableActions.push(actionList[Action.MARKET]);
	}

	if (canFreezeDinozAction(dinoz)) {
		availableActions.push(actionList[Action.CONGEL]);
	}

	const availableDialogs = await listAvailableDialogs({
		userId: user.id,
		dinozId: dinoz.id
	});

	for (const dialog of availableDialogs) {
		pushUniqueAction(availableActions, getDialogActionFiche(dialog));
	}

	return availableActions;
}
