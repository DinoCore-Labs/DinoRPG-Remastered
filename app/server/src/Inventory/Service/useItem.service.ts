import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
//import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ItemFeedBack } from '@dinorpg/core/models/items/itemFeedback.js';
import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
//import { SWAMP_FLOODED_DAYS } from '@dinorpg/core/models/place/placeList.js';
import { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { Dinoz, DinozSkills, DinozSkillsUnlockable, DinozStatus, User, UserItems } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { addMultipleSkillToDinoz } from '../../Dinoz/Controller/addMultipleSkill.controller.js';
import { addSkillToDinoz } from '../../Dinoz/Controller/addSkillToDinoz.controller.js';
import { createDinoz } from '../../Dinoz/Controller/createDinoz.controller.js';
import { removeStatusFromDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { getActiveDinoz } from '../../Dinoz/Controller/getActiveDinoz.js';
import { getDinozFicheItemRequest } from '../../Dinoz/Controller/getDinozFicheItem.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { applySkillEffect } from '../../Level/Controller/applySkillEffect.controller.js';
import { updateDinozCount } from '../../Ranking/Controller/updateDinozCount.js';
import { updatePoints } from '../../Ranking/Controller/updatePoints.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addMoney } from '../../User/Controller/money.controller.js';
import { generateDinozDisplay, getLetter, getRandomLetter, getRandomNumber } from '../../utils/dinoz/displayDinoz.js';
import { initializeDinoz } from '../../utils/dinoz/initializeDinoz.js';
import { learnNextSphereSkill, useRice } from '../../utils/dinoz/level.mapper.js';
import { boxOpening } from '../../utils/gather/boxOpening.js';
import { addItemToInventory } from '../Controller/addItem.controller.js';
import { removeItem } from '../Controller/removeItem.controller.js';

type Params = {
	dinozId: number;
	itemId: number;
};

export async function useItemHandler(
	req: FastifyRequest<{ Params: Params }>,
	_reply: FastifyReply
): Promise<ItemFeedBack> {
	const authed = req.user;

	const dinozId = req.params.dinozId;
	const itemId = req.params.itemId;

	const dinoz = await getDinozFicheItemRequest(dinozId);
	if (!dinoz || !dinoz.user) {
		throw new ExpectedError(`Player ${dinozId} doesn't exist.`, { statusCode: 404 });
	}

	// ownership
	if (dinoz.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player.`, { statusCode: 403 });
	}

	const item = Object.values(itemList).find(i => i.itemId === itemId);
	if (!item) {
		throw new ExpectedError(`This item didn't exist`, { statusCode: 404 });
	}

	const itemData = dinoz.user.items.find(i => i.itemId === itemId);
	if (!itemData || itemData.quantity <= 0) {
		throw new ExpectedError(`notEnoughItem`, { params: { id: itemData?.id } });
	}

	// --- Star quest (identique à ta logique) ---
	//const starQuest = dinoz.user.quests.find(q => q.questId === Scenario.STAR && q.progression === 3);
	/*if (starQuest) {
		const dayOfWeek = new Date().getDate();
		if (
			SWAMP_FLOODED_DAYS.includes(dayOfWeek) &&
			dinoz.placeId === PlaceEnum.MARAIS_COLLANT &&
			itemId === itemList[Item.MEAT_PIE].itemId
		) {
			//await updateQuest(dinoz.user.id, Scenario.STAR, 4);
			//await addItemToInventory(dinoz.user.id, itemList[Item.MAGIC_STAR].itemId, 1);

			const initialLife = dinoz.life;
			await updateDinoz(dinoz.id, heal(dinoz, 30 * (dinoz.user.cooker ? 1.1 : 1)));

			// ⚠️ note: ton code original calcule lifeHealed avec dinoz.life après update,
			// mais dinoz n'est pas rechargé. Ici on fait “best effort” :
			const refreshed = await getDinozFicheItemRequest(dinozId);
			const newLife = refreshed?.life ?? initialLife;
			const lifeHealed = Math.max(0, newLife - initialLife);

			await incrementUserStat(StatTracking.HEAL_PV, dinoz.user.id, lifeHealed);

			await removeItem(dinoz.user.id, itemData.itemId, 1);
			//await createLog(LogType.ItemUsed, dinoz.player.id, dinoz.id, itemData.itemId.toString(), '1');

			return { category: ItemEffect.QUEST, value: 'eat_star_found' };
		}
	}*/

	let feedback: ItemFeedBack;

	switch (item.effect?.category) {
		case ItemEffect.ACTION: {
			await updateDinoz(dinoz.id, { fight: true, gather: true });
			feedback = { category: ItemEffect.ACTION, value: 1 };
			break;
		}

		case ItemEffect.HEAL: {
			const initialLife = dinoz.life;
			await updateDinoz(dinoz.id, heal(dinoz, item.effect.value * /*(dinoz.user.cooker ? 1.1 :*/ 1 /*)*/));

			const refreshed = await getDinozFicheItemRequest(dinozId);
			const newLife = refreshed?.life ?? initialLife;
			const lifeHealed = Math.max(0, newLife - initialLife);

			feedback = { category: ItemEffect.HEAL, value: lifeHealed };
			await incrementUserStat(StatTracking.HEAL_PV, dinoz.user.id, lifeHealed);
			break;
		}

		case ItemEffect.RESURRECT: {
			await updateDinoz(dinoz.id, resurrect(dinoz));
			feedback = { category: ItemEffect.RESURRECT };

			await incrementUserStat(StatTracking.DEATHS, dinoz.user.id, 1);
			//await createLog(LogType.Revive, dinoz.user.id, dinoz.id, itemData.itemId.toString(), '1');
			break;
		}

		case ItemEffect.EGG: {
			const race = await hatchEgg(item, authed);
			feedback = { category: ItemEffect.EGG, value: raceList[race].name };
			break;
		}

		case ItemEffect.SPHERE: {
			const skillToLearn = learnNextSphereSkill(dinoz, item.effect.value);
			const skill = Object.values(skillList).find(s => s.id === skillToLearn);
			if (!skill) throw new ExpectedError(`Skill ${skillToLearn} doesn't exist.`, { statusCode: 404 });

			await applySkillEffect(dinoz, skill, dinoz.user.id);
			await addSkillToDinoz(dinozId, skillToLearn);

			feedback = { category: ItemEffect.SPHERE, value: skill.name };
			break;
		}

		case ItemEffect.GOLD: {
			await addMoney(dinoz.user.id, item.effect.value);
			feedback = { category: ItemEffect.GOLD, value: item.effect.value };
			break;
		}

		case ItemEffect.SPECIAL: {
			const itemWon = await useSpecialItem(dinoz, item);
			const itemName = itemList[item.itemId as Item];

			feedback = {
				category: ItemEffect.SPECIAL,
				value: itemName.name.toLowerCase(),
				effect: itemWon?.name ?? '',
				quantity: itemWon?.quantity ?? 1
			};
			break;
		}

		default:
			throw new ExpectedError('Unsupported item effect', { statusCode: 400 });
	}

	await removeItem(dinoz.user.id, itemData.itemId, 1);
	//await createLog(LogType.ItemUsed, dinoz.player.id, dinoz.id, itemData.itemId.toString(), '1');

	return feedback;
}

async function hatchEgg(item: ItemFiche, authed: Pick<User, 'id' /*| 'lang'*/>) {
	if (!item || !item.effect || item.effect.category != ItemEffect.EGG) {
		throw new ExpectedError('Missing item, egg effect or item is not an egg');
	}
	let race = item.effect.race;

	//Check if player can hatch dinoz
	const dinozActive = await getActiveDinoz(authed.id);

	const player = dinozActive[0].user;

	if (!player) {
		throw new ExpectedError(`Player missing`);
	}

	if (dinozActive.length > 0) {
		const maxDinoz = gameConfig.dinoz.maxQuantity; /*+ (player.leader ? 3 : 0) + (player.messie ? 3 : 0)*/
		if (dinozActive.length >= maxDinoz) {
			throw new ExpectedError('tooManyActiveDinoz');
		}
	}

	let randomDisplay = '0';

	// Each rare egg has a different hatching
	switch (item.itemId) {
		case itemList[Item.MOUEFFE_EGG_RARE].itemId:
			// Suit
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.PIGMOU_EGG_RARE].itemId:
			// Body tatoo
			randomDisplay = generateDinozDisplay(raceList[race], getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.WINKS_EGG_RARE].itemId:
			// Fore-head horn thingy
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.PLANAILLE_EGG_RARE].itemId:
			// More hair and big eyes
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.CASTIVORE_EGG_RARE].itemId:
			// Bow-tie
			randomDisplay = generateDinozDisplay(raceList[race], '1', getLetter(1 + getRandomNumber(0, 2)), '0');
			break;
		case itemList[Item.ROCKY_EGG_RARE].itemId:
			// Just color palette, no other graphical rare stuff in swf
			randomDisplay = generateDinozDisplay(raceList[race], '1', '0', '0');
			break;
		case itemList[Item.PTEROZ_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or remove. Currently placeholder.
			// Note: there does not seem to be a rare thingy for the pteroz in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.NUAGOZ_EGG_RARE].itemId:
			// Just color palette
			randomDisplay = generateDinozDisplay(raceList[race], '1', '0', '0');
			break;
		case itemList[Item.SIRAIN_EGG_RARE].itemId:
			// Scarf & tatoo
			randomDisplay = generateDinozDisplay(raceList[race], getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.HIPPOCLAMP_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or remove. Currently placeholder.
			// Note: there does not seem to be a rare thingy for the hippoclamp in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.GORILLOZ_EGG_RARE].itemId:
			// Elvis Presley hairstyle
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.WANWAN_EGG_RARE].itemId:
			// TODO does not exist in MT's code: invent or just use the baby rare. Currently placeholder
			// Note: there does not seem to be another rare thingy for the wanwan in the swf
			// Note 2: Could go for color palette 1 and rare 1, instead of 2,1
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.WANWAN_BABY_RARE].itemId:
			// Naruto 9-tail style
			randomDisplay = generateDinozDisplay(raceList[race], '2', '1', '0');
			break;
		case itemList[Item.SANTAZ_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.FEROSS_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.FEROSS_EGG_CHRISTMAS].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '2', '2', '0');
			break;
		case itemList[Item.RARE_KABUKI_EGG].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], getRandomNumber(0, 5) === 0 ? '1' : '0', '1', '0');
			break;
		case itemList[Item.RARE_MAHAMUTI_EGG].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.SOUFFLET_EGG_RARE].itemId:
			// TODO: does not exist in MT's code: remove or check swf. Currently a placeholder
			// Note: there does not seem to be a rare thingy for the hippoclamp in the swf
			// Color palette has no effect
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.TOUFUFU_BABY_RARE].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '0', '1', '0');
			break;
		case itemList[Item.QUETZU_EGG_RARE].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		// Classic smog egg can get color palette to 0 or 1
		case itemList[Item.SMOG_EGG].itemId:
			randomDisplay = generateDinozDisplay(raceList[race], getRandomNumber(0, 2) === 0 ? '1' : '0', '0', '0');
			break;
		case itemList[Item.SMOG_EGG_RARE].itemId:
			// TODO: does not exist in MT's code: invent or just use the anniversary format. Currently placeholder
			randomDisplay = generateDinozDisplay(raceList[race], '0', '2', '0');
			break;
		case itemList[Item.SMOG_EGG_ANNIVERSARY].itemId:
			// Wings and goggles
			randomDisplay = generateDinozDisplay(raceList[race], '0', '2', '0');
			break;
		case itemList[Item.SMOG_EGG_CHRISTMAS_BLUE].itemId:
			// Elf-like boots
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.SMOG_EGG_CHRISTMAS_GREEN].itemId:
			// Ear-warmer
			randomDisplay = generateDinozDisplay(raceList[race], '1', '3', '0');
			break;
		case itemList[Item.TRICERAGNON_EGG_BABY].itemId:
			// Note: does not exist in MT's code, but does in the swf
			// Saddle and motorbike handles
			randomDisplay = generateDinozDisplay(raceList[race], '1', '1', '0');
			break;
		case itemList[Item.CHRISTMAS_EGG].itemId:
			// MT is [0,3], we switched to [0,10] to increase trice rarity
			if (getRandomNumber(0, 10) === 0) {
				race = RaceEnum.TRICERAGNON;
				randomDisplay = generateDinozDisplay(raceList[race], '0', '0', '0');
			} else {
				race = RaceEnum.SANTAZ;
				randomDisplay = generateDinozDisplay(raceList[race], '0', getRandomLetter('1'), '0');
			}
			break;
		default:
			// Same hatching for non rare eggs that just uses the race
			// We know it's an egg at this point and not any item
			randomDisplay = generateDinozDisplay(raceList[race], '0', '0', '0');
			break;
	}

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(initializeDinoz(raceList[race], authed.id, randomDisplay));

	const skillsToAdd: SkillDetails[] = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === raceList[race].raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		dinozCreated.id,
		skillsToAdd.map(skill => skill.id)
	);
	await updateDinozCount(authed.id, 1);
	await updatePoints(authed.id, 1);
	return race;
}

async function useSpecialItem(
	dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife' | 'level' | 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
		user:
			| (Pick<User, 'id' /*| 'cooker' | 'lang' | 'shopKeeper'*/> & {
					items: Pick<UserItems, 'itemId' | 'quantity'>[];
			  })
			| null;
	},
	item: ItemFiche
): Promise<{ name: string; quantity?: number } | undefined> {
	if (!dinoz.user) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to a player.`);
	}

	if (item.effect?.category !== ItemEffect.SPECIAL) return;
	switch (item.effect.value) {
		case 'ointment':
			if (!dinoz.status.some(status => status.statusId === DinozStatusId.CURSED)) {
				throw new ExpectedError(`NotCursed`, { params: { id: dinoz.user } });
			}
			await removeStatusFromDinoz(dinoz.id, DinozStatusId.CURSED);
			return { name: 'ointment' };
		case 'rice': {
			await useRice(dinoz);
			return { name: 'rice' };
		}
		case 'pampleboum':
			const initialLife = dinoz.life;
			const healed = heal(dinoz, 15 * /*(dinoz.player.cooker ? 1.1 :*/ 1 /*)*/);
			const lifeHealed = Math.max(0, healed.life - initialLife);
			await updateDinoz(dinoz.id, healed);
			const pamp = dinoz.user.items.find(item => item.itemId === itemList[Item.PAMPLEBOUM_PIT].itemId);
			if (!pamp) await addItemToInventory(dinoz.user.id, itemList[Item.PAMPLEBOUM_PIT].itemId, 1);
			else if (
				pamp.quantity <
				//(dinoz.player.shopKeeper
				//? Math.round(1.5 * itemList[Item.PAMPLEBOUM_PIT].maxQuantity)
				/*:*/ itemList[Item.PAMPLEBOUM_PIT].maxQuantity /*)*/
			) {
				await addItemToInventory(dinoz.user.id, itemList[Item.PAMPLEBOUM_PIT].itemId, 1);
			}

			//Update stats
			await incrementUserStat(StatTracking.HEAL_PV, dinoz.user.id, lifeHealed);
			return { name: 'pampleboum' };
		case 'box':
			if (!item.name) {
				throw new ExpectedError(`Special item with ${item.effect.value} value is not implemented`);
			}
			const boxOpened = boxOpening(item);
			await addItemToInventory(dinoz.user.id, boxOpened.item.itemId, boxOpened.quantity);
			// const newItem = dinoz.player.items.find(item => item.itemId === boxOpened.item.itemId);
			// if (!newItem) await insertItem(dinoz.player.id, { itemId: boxOpened.item.itemId, quantity: boxOpened.quantity });
			// // TODO: check for max quantity ?
			// else await increaseItemQuantity(dinoz.player.id, boxOpened.item.itemId, boxOpened.quantity);
			const wonItem = itemList[boxOpened.item.itemId as Item];
			return { name: wonItem.name.toLowerCase(), quantity: boxOpened.quantity };
		default:
			throw new ExpectedError(`Special item with ${item.effect.value} value is not implemented`);
	}
}

export const heal = (
	dinoz: Pick<Dinoz, 'id' | 'life' | 'maxLife'> & {
		user: Pick<User, 'id' /*| 'lang'*/> | null;
	},
	lifeToAdd: number
) => {
	const lifeMissing = dinoz.maxLife - dinoz.life; // Calculer la quantité de points de vie manquants
	const lifeHealed = Math.min(lifeToAdd, lifeMissing); // Utiliser le plus petit des deux nombres
	if (lifeHealed === 0) throw new ExpectedError('AlreadyAtMaxHealth', { params: { id: dinoz.user } });
	if (dinoz.life === 0) throw new ExpectedError('DinozIsDead', { params: { id: dinoz.user } });
	dinoz.life += Math.round(lifeHealed);
	return {
		id: dinoz.id,
		life: dinoz.life
	};
};

export const resurrect = (
	dinoz: Pick<Dinoz, 'life' | 'id'> & {
		user: Pick<User, 'id' /*| 'lang'*/> | null;
	}
) => {
	if (dinoz.life > 0) {
		throw new ExpectedError('DinozIsDead', { params: { id: dinoz.user } });
	}
	dinoz.life = 1;
	return {
		id: dinoz.id,
		life: dinoz.life
	};
};
